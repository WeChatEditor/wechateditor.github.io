import {
  allowedSource,
  assertMessageSize,
  contentDigest,
  contentRequestAllowed,
  errors,
  externalRequestSchema,
  internalRequestSchema,
  protocolVersion,
  TransferError,
  validateTextHtml,
  type ExternalRequest,
  type InternalRequest,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import {
  applyArticle,
  childTab,
  childTabs,
  duplicateTarget,
  inspectPage,
  listTargets,
  navigationStep,
  openWeb,
  openWechat,
} from '../wechat-page/wechat-page.service'
import type { PageBinding } from '../wechat-page/wechat-page.model'
import {
  executionPhases,
  type TransferRepository,
  type TransferTask,
} from './wechat-transfer.model'
import {
  readRepository,
  receiveClipboard,
  receiveTask,
  synchronize,
  writeRepository,
} from './wechat-transfer.repository'

let queue: Promise<unknown> = Promise.resolve()
let startup: Promise<void>
let startupFailed = false
let activeAttempt: string | undefined
let openingLogin: string | undefined
const resumingTabs = new Set<number>()
function serialized<T>(action: () => Promise<T>): Promise<T> {
  const next = queue.then(action, action)
  queue = next.catch(function ignore() {})
  return next
}
async function repository(): Promise<TransferRepository> {
  await startup
  if (startupFailed)
    throw new TransferError(
      errors.STORAGE_UNAVAILABLE,
      '插件存储初始化失败，请重新安装插件后从编辑器发送，Web原稿仍保留',
    )
  const state = await readRepository()
  synchronize(state)
  await writeRepository(state)
  return state
}
function requireTask(state: TransferRepository, id: string): TransferTask {
  if (!state.task || state.task.id !== id)
    throw new TransferError(errors.REQUEST_CONFLICT, '任务已经变化，请重新发送当前内容')
  return state.task
}
async function phase(
  id: string,
  attempt: string,
  next: TransferTask['phase'],
  message: string,
  binding?: { tabId: number; documentId?: string; account?: string },
): Promise<TransferTask> {
  return serialized(async function change() {
    const state = await repository()
    const task = requireTask(state, id)
    if (task.attemptId !== attempt || !executionPhases.has(task.phase))
      throw new TransferError(errors.RESULT_UNCERTAIN, task.message || '自动插入已中止，请检查后台')
    task.phase = next
    task.message = message
    if (binding) {
      if (task.tabId !== binding.tabId) delete task.documentId
      Object.assign(task, binding)
    }
    if (next === 'inserted') {
      delete task.account
      delete task.documentId
      delete task.tabId
      delete task.attemptId
    }
    synchronize(state)
    await writeRepository(state)
    return task
  })
}
async function wait(ms: number): Promise<void> {
  await new Promise(function delay(resolve) {
    setTimeout(resolve, ms)
  })
}
async function runTask(
  id: string,
  attempt: string,
  selectedTab: number,
  account: string,
  ownedTab = false,
): Promise<void> {
  let applying = false
  let sideEffects = false
  let noticeTab = selectedTab
  try {
    sideEffects = true
    let tabId = ownedTab ? selectedTab : await duplicateTarget(selectedTab, account)
    const navigationTab = tabId
    noticeTab = tabId
    await phase(id, attempt, 'creating', '独立后台标签已打开，正在进入草稿箱')
    const deadline = Date.now() + 30000
    let step: 'drafts' | 'create' | 'article' | 'editor' = 'drafts'
    let previousChildren: number[] = []
    let creationDocumentId = ''
    let menuExpansionRequested = false
    let navigationMessage = '新建或编辑器尚未就绪'
    let binding: PageBinding | undefined
    while (Date.now() < deadline) {
      await phase(id, attempt, 'waiting_editor', '正在等待新的文章编辑器')
      if (step === 'editor') {
        const child = await childTab(navigationTab, previousChildren)
        if (child === undefined) {
          navigationMessage = '“文章”入口已点击，尚未找到本次新开的编辑标签页'
          await wait(500)
          continue
        }
        if (tabId !== child) {
          tabId = child
          noticeTab = tabId
          await phase(id, attempt, 'waiting_editor', '文章新标签页已打开', { tabId, account })
          await chrome.tabs.update(tabId, { active: true })
        }
      }
      let inspected
      try {
        inspected = await inspectPage(tabId)
      } catch {
        await wait(500)
        continue
      }
      const page = inspected.page
      if (Date.now() >= deadline)
        throw new TransferError(errors.STEP_TIMEOUT, `等待公众号页面超时：${navigationMessage}`)
      if (page.account && page.account !== account)
        throw new TransferError(errors.TARGET_REQUIRED, '公众号账号已变化，已停止')
      if (!page.account) {
        navigationMessage = page.message
        await wait(500)
        continue
      }
      const current = { tabId, documentId: inspected.documentId, account }
      await phase(id, attempt, 'waiting_editor', '正在准备新的文章', current)
      if (page.editor) {
        if (
          step !== 'editor' ||
          tabId === navigationTab ||
          !creationDocumentId ||
          inspected.documentId === creationDocumentId
        )
          throw new TransferError(
            errors.PAGE_UNSUPPORTED,
            '没有本次新建操作的证据，禁止使用已有编辑页',
          )
        if (!page.ready) {
          navigationMessage = page.message
          await wait(500)
          continue
        }
        if (!page.empty || !page.titleSupported)
          throw new TransferError(errors.EDITOR_NOT_EMPTY, page.message)
        binding = current
        break
      }
      if (step === 'drafts') {
        const result = await navigationStep(current, 'drafts', !menuExpansionRequested)
        if (result.menuExpansionRequested) menuExpansionRequested = true
        navigationMessage = result.message
        if (!result.clicked && !result.drafts && !result.retryNavigation)
          throw new TransferError(errors.PAGE_UNSUPPORTED, result.message)
        if (result.clicked || result.drafts) step = 'create'
      } else if (step === 'create') {
        const result = await navigationStep(current, 'create')
        navigationMessage = result.message
        if (!result.clicked && !result.retryNavigation)
          throw new TransferError(errors.PAGE_UNSUPPORTED, result.message)
        if (result.clicked) step = 'article'
      } else if (step === 'article') {
        previousChildren = await childTabs(navigationTab)
        await phase(id, attempt, 'waiting_editor', '正在打开文章新标签页', current)
        const result = await navigationStep(current, 'article')
        navigationMessage = result.message
        if (!result.clicked && !result.retryNavigation)
          throw new TransferError(errors.PAGE_UNSUPPORTED, result.message)
        if (result.clicked) {
          creationDocumentId = inspected.documentId
          step = 'editor'
        }
      }
      await wait(600)
    }
    if (!binding)
      throw new TransferError(
        errors.STEP_TIMEOUT,
        `等待公众号页面超时：${navigationMessage}。请检查后台，不自动重放新建操作`,
      )
    const task = await phase(id, attempt, 'applying', '正在插入，请暂时不要编辑此页面', binding)
    if (!task.payload) throw new TransferError(errors.TASK_EXPIRED, '任务载荷已过期')
    applying = true
    const result = await applyArticle(binding, task.payload.title, task.payload.html)
    if (!result.applied || !result.matches)
      throw new TransferError(errors.RESULT_UNCERTAIN, result.message)
    await phase(id, attempt, 'inserted', '已插入，请检查排版并手动保存')
    await chrome.tabs
      .sendMessage(noticeTab, {
        kind: 'TRANSFER_NOTICE',
        message: '已插入，请检查排版并手动保存',
      })
      .catch(function pageClosed() {})
  } catch (error) {
    try {
      await phase(
        id,
        attempt,
        applying || sideEffects ? 'uncertain' : 'blocked',
        applying
          ? '可能已经写入，请检查后台，禁止自动重试'
          : error instanceof TransferError
            ? error.message
            : '后台页面操作中断，请检查新建页面，没有自动重试',
      )
    } catch {
      /* A cancelled or recovered attempt must never mutate its successor. */
    }
    await chrome.tabs
      .sendMessage(noticeTab, {
        kind: 'TRANSFER_NOTICE',
        message: applying
          ? '可能已经写入，请检查当前页面；没有自动重试'
          : error instanceof TransferError
            ? error.message
            : '自动插入已停止，请检查后台',
      })
      .catch(function pageClosed() {})
  } finally {
    if (activeAttempt === attempt) activeAttempt = undefined
  }
}
function articleInfo(article: { title: string; receivedAt: number } | null) {
  return article ? { title: article.title, receivedAt: article.receivedAt } : null
}
function clipboardInfo(state: TransferRepository) {
  return state.clipboard
    ? { title: state.clipboard.payload.title, receivedAt: state.clipboard.receivedAt }
    : null
}
function chooseTarget(
  targets: Awaited<ReturnType<typeof listTargets>>,
  selected: TransferRepository['selected'],
) {
  const available = targets.filter(function available(target) {
    return Boolean(target.account) && !target.editor
  })
  return (
    available.find(function previous(target) {
      return target.tabId === selected?.tabId && target.account === selected.account
    }) || available[0]
  )
}
async function openPanel(): Promise<void> {
  try {
    await chrome.action.openPopup()
  } catch {
    await chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') })
  }
}
function schedulePending(
  targets?: Awaited<ReturnType<typeof listTargets>>,
  openWhenUnavailable = false,
): void {
  setTimeout(function dispatch() {
    void startPending(targets, openWhenUnavailable).catch(function unavailable() {
      // No page writes have started; the received snapshot remains available after login/refresh.
    })
  }, 0)
}
async function startPending(
  knownTargets?: Awaited<ReturnType<typeof listTargets>>,
  openWhenUnavailable = false,
): Promise<void> {
  const targets = knownTargets || (await listTargets())
  let openLogin = false
  let pendingId: string | undefined
  const execution = await serialized(async function acquire() {
    const state = await repository()
    const task = state.task
    if (activeAttempt || !task?.payload || task.phase !== 'pending') return
    const target = chooseTarget(targets, state.selected)
    if (!target) {
      openLogin = openWhenUnavailable && task.tabId === undefined && openingLogin !== task.id
      pendingId = task.id
      if (openLogin) openingLogin = task.id
      return
    }
    const ownedTab = task.tabId === target.tabId
    state.selected = { tabId: target.tabId, account: target.account }
    task.phase = 'creating'
    task.message = '即将进入草稿箱并新建文章'
    task.attemptId = crypto.randomUUID()
    delete task.tabId
    delete task.documentId
    task.account = target.account
    synchronize(state)
    await writeRepository(state)
    activeAttempt = task.attemptId
    return {
      id: task.id,
      attempt: task.attemptId,
      tabId: target.tabId,
      account: target.account,
      ownedTab,
    }
  })
  if (execution)
    await runTask(
      execution.id,
      execution.attempt,
      execution.tabId,
      execution.account,
      execution.ownedTab,
    )
  else if (openLogin && pendingId) {
    try {
      const tabId = await openWechat()
      await serialized(async function bindLogin() {
        const state = await repository()
        const task = state.task
        if (!task || task.id !== pendingId || task.phase !== 'pending') return
        task.tabId = tabId
        task.message = '请登录公众号，页面就绪后将自动进入草稿箱并新建文章'
        await writeRepository(state)
      })
      // Covers a page that completed loading before its task binding was persisted.
      await resumePendingTab(tabId)
    } finally {
      if (openingLogin === pendingId) openingLogin = undefined
    }
  }
}
async function resumePendingTab(tabId: number): Promise<void> {
  if (resumingTabs.has(tabId)) return
  resumingTabs.add(tabId)
  try {
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      const pending = await serialized(async function waitingLogin() {
        const state = await repository()
        return Boolean(
          !activeAttempt &&
          state.task?.payload &&
          state.task.phase === 'pending' &&
          state.task.tabId === tabId,
        )
      })
      if (!pending) return
      const tab = await chrome.tabs.get(tabId)
      if (tab.status === 'complete') {
        try {
          const inspected = await inspectPage(tabId)
          if (inspected.page.account && !inspected.page.editor) {
            await startPending([{ tabId, ...inspected.page }])
            return
          }
        } catch {
          // Login redirects can replace the document while its account is being inspected.
        }
      }
      await wait(500)
    }
  } finally {
    resumingTabs.delete(tabId)
  }
}
async function external(request: ExternalRequest) {
  if (request.kind === 'PING') return { extensionVersion: chrome.runtime.getManifest().version }
  if (request.kind === 'OPEN_PANEL') {
    await openPanel()
    return {}
  }
  if (request.kind === 'OPEN_WECHAT') {
    await openWechat()
    return {}
  }
  validateTextHtml(request.payload.html)
  if ((await contentDigest(request.payload)) !== request.payload.digest)
    throw new TransferError(errors.PAYLOAD_INVALID, '内容摘要不匹配，请重新点击发送')
  const state = await repository()
  if (request.kind === 'SAVE_ARTICLE') {
    receiveClipboard(state, request.payload)
    await writeRepository(state)
    return { article: clipboardInfo(state) }
  }
  const duplicate = state.receipts.some(function received(receipt) {
    return receipt.requestId === request.requestId
  })
  if (activeAttempt && !duplicate)
    throw new TransferError(errors.TASK_BUSY, '正在插入上一份内容，请稍后再发送')
  const task = receiveTask(state, request.requestId, request.payload)
  await writeRepository(state)
  if (!duplicate) schedulePending(undefined, true)
  return { article: articleInfo(task) }
}
async function internal(request: InternalRequest, sender: chrome.runtime.MessageSender) {
  if (request.kind === 'PING') return { extensionVersion: chrome.runtime.getManifest().version }
  if (request.kind === 'PAGE_ACTIVITY') {
    const state = await repository()
    if (
      state.task &&
      executionPhases.has(state.task.phase) &&
      state.task.tabId === sender.tab?.id &&
      (!state.task.documentId || state.task.documentId === sender.documentId)
    ) {
      state.task.phase = 'uncertain'
      state.task.message = '检测到后台编辑，已停止自动插入，请检查当前页面'
      delete state.task.attemptId
      synchronize(state)
      await writeRepository(state)
    }
    return {}
  }
  if (request.kind === 'OPEN_PANEL') {
    await openPanel()
    return {}
  }
  if (request.kind === 'OPEN_WEB') {
    await openWeb()
    return {}
  }
  if (request.kind === 'OPEN_WECHAT') {
    await openWechat()
    return {}
  }
  const state = await repository()
  if (request.kind === 'ARTICLE') return { article: clipboardInfo(state) }
  if (request.kind === 'COPY_ARTICLE') {
    const payload = state.clipboard?.payload
    return {
      article:
        payload && state.clipboard
          ? {
              title: payload.title,
              html: payload.html,
              plainText: payload.plainText,
              receivedAt: state.clipboard.receivedAt,
            }
          : null,
    }
  }
  if (request.kind === 'TARGETS') {
    const targets = await listTargets()
    const target = chooseTarget(targets, state.selected)
    state.selected = target ? { tabId: target.tabId, account: target.account } : null
    await writeRepository(state)
    schedulePending(targets)
    return { targets, selected: state.selected }
  }
  const target = await inspectPage(request.tabId)
  if (!target.page.account || target.page.account !== request.account || target.page.editor)
    throw new TransferError(errors.TARGET_REQUIRED, '公众号页面已变化，请刷新后选择可用账号')
  state.selected = { tabId: request.tabId, account: request.account }
  await writeRepository(state)
  schedulePending()
  return {}
}
function extensionUi(sender: chrome.runtime.MessageSender): boolean {
  return sender.id === chrome.runtime.id && sender.url === chrome.runtime.getURL('popup.html')
}
export function registerTransferWorker(): void {
  startup = (async function recover() {
    await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
    const state = await readRepository()
    if (state.task && executionPhases.has(state.task.phase)) {
      state.task.phase = 'uncertain'
      state.task.message = '插件执行被中断，请检查后台；禁止自动重试'
      delete state.task.attemptId
      delete state.task.account
      delete state.task.documentId
      delete state.task.tabId
    }
    synchronize(state)
    await writeRepository(state)
  })().catch(function damaged() {
    startupFailed = true
  })
  chrome.tabs.onUpdated.addListener(function loginPageLoaded(tabId, change, tab) {
    if (change.status !== 'complete' && !(change.url && tab.status === 'complete')) return
    void resumePendingTab(tabId).catch(function unavailable() {
      // Only a still-pending login tab can resume; popup refresh remains available.
    })
  })
  chrome.runtime.onMessageExternal.addListener(function receive(raw: unknown, sender, respond) {
    const id =
      raw && typeof raw === 'object' && 'requestId' in raw && typeof raw.requestId === 'string'
        ? raw.requestId
        : crypto.randomUUID()
    void serialized(async function handle() {
      try {
        if (
          !sender.url ||
          !allowedSource(
            sender.url,
            __DEVELOPMENT__ ? ['http://127.0.0.1:5175', 'http://127.0.0.1:4175'] : [],
          ) ||
          sender.frameId !== 0 ||
          !sender.tab ||
          sender.origin !== new URL(sender.url).origin
        )
          throw new TransferError(errors.SOURCE_REJECTED, '消息来源不在允许的Web工作台内')
        assertMessageSize(raw)
        if (
          raw &&
          typeof raw === 'object' &&
          'protocolVersion' in raw &&
          raw.protocolVersion !== protocolVersion
        )
          throw new TransferError(
            errors.PROTOCOL_UNSUPPORTED,
            '传稿协议版本不支持，请同时更新Web和插件',
          )
        const parsed = externalRequestSchema.safeParse(raw)
        if (!parsed.success)
          throw new TransferError(errors.PAYLOAD_INVALID, '传稿协议格式不支持，请更新Web和插件')
        respond({ protocolVersion, requestId: id, status: 0, data: await external(parsed.data) })
      } catch (error) {
        respond({
          protocolVersion,
          requestId: id,
          status: error instanceof TransferError ? error.code : errors.STORAGE_UNAVAILABLE,
          err:
            error instanceof TransferError ? error.message : '插件暂时无法处理任务，请检查插件状态',
        })
      }
    })
    return true
  })
  chrome.runtime.onMessage.addListener(function receive(raw: unknown, sender, respond) {
    void serialized(async function handle() {
      try {
        const parsed = internalRequestSchema.safeParse(raw)
        const content =
          sender.id === chrome.runtime.id &&
          sender.tab &&
          sender.frameId === 0 &&
          sender.url?.startsWith('https://mp.weixin.qq.com/')
        if (
          !parsed.success ||
          (!extensionUi(sender) && !(content && contentRequestAllowed(parsed.data)))
        )
          throw new TransferError(errors.SOURCE_REJECTED, '此操作仅允许从插件面板发起')
        respond({ status: 0, data: await internal(parsed.data, sender) })
      } catch (error) {
        respond({
          status: error instanceof TransferError ? error.code : errors.STORAGE_UNAVAILABLE,
          err:
            error instanceof TransferError
              ? error.message
              : '插件暂时无法处理任务，请检查存储或重新加载插件',
        })
      }
    })
    return true
  })
}
