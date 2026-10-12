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
  duplicateTarget,
  inspectPage,
  listTargets,
  navigationStep,
  openWeb,
  openWechat,
} from '../wechat-page/wechat-page.service'
import {
  executionPhases,
  type TransferRepository,
  type TransferTask,
} from './wechat-transfer.model'
import {
  readRepository,
  receiveTask,
  synchronize,
  writeRepository,
} from './wechat-transfer.repository'

let queue: Promise<unknown> = Promise.resolve()
let startup: Promise<void>
let startupFailed = false
let activeAttempt: string | undefined
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
      throw new TransferError(errors.RESULT_UNCERTAIN, '执行租约已失效，已停止后续操作')
    task.phase = next
    task.message = message
    if (binding) Object.assign(task, binding)
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
): Promise<void> {
  let applying = false
  let sideEffects = false
  let noticeTab = selectedTab
  try {
    sideEffects = true
    let tabId = await duplicateTarget(selectedTab, account)
    noticeTab = tabId
    await phase(id, attempt, 'creating', '独立后台标签已打开，正在进入草稿箱', { tabId, account })
    const deadline = Date.now() + 30000
    let drafts = false
    let create = false
    let article = false
    let creationDocumentId = ''
    let binding: { tabId: number; documentId: string; account: string } | undefined
    while (Date.now() < deadline) {
      await phase(id, attempt, 'waiting_editor', '正在等待新的空图文编辑器')
      const child = await childTab(tabId)
      if (child !== undefined) {
        tabId = child
        noticeTab = tabId
        await phase(id, attempt, 'waiting_editor', '新建页面已打开', { tabId, account })
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
        throw new TransferError(errors.STEP_TIMEOUT, '等待新建编辑器超时，请检查后台')
      if (page.account && page.account !== account)
        throw new TransferError(errors.TARGET_REQUIRED, '公众号账号已变化，已停止')
      if (!page.account) {
        await wait(500)
        continue
      }
      if (page.editor) {
        if (!create || !creationDocumentId || inspected.documentId === creationDocumentId)
          throw new TransferError(
            errors.PAGE_UNSUPPORTED,
            '没有本次新建操作的证据，禁止使用已有编辑页',
          )
        if (!page.ready) {
          await wait(500)
          continue
        }
        if (!page.empty || !page.titleSupported)
          throw new TransferError(errors.EDITOR_NOT_EMPTY, page.message)
        binding = { tabId, documentId: inspected.documentId, account }
        break
      }
      if (!drafts) {
        const step = await navigationStep(tabId, 'drafts', account)
        // A drafts page can lack its own navigation link; try the unique create entry.
        if (!step.clicked) {
          const next = await navigationStep(tabId, 'create', account)
          if (next.clicked) {
            drafts = true
            create = true
            creationDocumentId = inspected.documentId
          } else throw new TransferError(errors.PAGE_UNSUPPORTED, step.message)
        } else drafts = true
      } else if (!create) {
        const step = await navigationStep(tabId, 'create', account)
        if (step.clicked) {
          create = true
          creationDocumentId = inspected.documentId
        }
      } else if (!article) {
        const step = await navigationStep(tabId, 'article', account)
        if (step.clicked) article = true
      }
      await wait(600)
    }
    if (!binding)
      throw new TransferError(
        errors.STEP_TIMEOUT,
        '新建或编辑器就绪超时，请检查后台，不自动重放新建操作',
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
function articleInfo(task: TransferTask | null) {
  return task ? { title: task.title, receivedAt: task.receivedAt } : null
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
  const execution = await serialized(async function acquire() {
    const state = await repository()
    const task = state.task
    if (activeAttempt || !task?.payload || task.phase !== 'pending') return
    const target = chooseTarget(targets, state.selected)
    if (!target) {
      openLogin = openWhenUnavailable
      return
    }
    state.selected = { tabId: target.tabId, account: target.account }
    task.phase = 'creating'
    task.message = '即将独立新建图文'
    task.attemptId = crypto.randomUUID()
    task.tabId = target.tabId
    task.account = target.account
    synchronize(state)
    await writeRepository(state)
    activeAttempt = task.attemptId
    return { id: task.id, attempt: task.attemptId, tabId: target.tabId, account: target.account }
  })
  if (execution) await runTask(execution.id, execution.attempt, execution.tabId, execution.account)
  else if (openLogin) await openWechat()
}
async function external(request: ExternalRequest) {
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
  if (request.kind === 'ARTICLE') return { article: articleInfo(state.task) }
  if (request.kind === 'COPY_ARTICLE') {
    const payload = state.task?.payload
    return {
      article:
        payload && state.task
          ? {
              title: payload.title,
              html: payload.html,
              plainText: payload.plainText,
              receivedAt: state.task.receivedAt,
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
