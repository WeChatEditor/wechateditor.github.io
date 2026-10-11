import {
  allowedSource,
  assertMessageSize,
  contentDigest,
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
  summary,
  type TransferRepository,
  type TransferTask,
} from './wechat-transfer.model'
import {
  clearRepository,
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
      '插件存储初始化失败，请检查后台后在插件清空任务存储',
    )
  const state = await readRepository()
  synchronize(state)
  await writeRepository(state)
  return state
}
function requireTask(state: TransferRepository, id: string): TransferTask {
  if (!state.task || state.task.id !== id)
    throw new TransferError(errors.REQUEST_CONFLICT, '任务已经变化，请刷新状态')
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
      delete task.payload
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
  try {
    sideEffects = true
    let tabId = await duplicateTarget(selectedTab, account)
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
        throw new TransferError(errors.STEP_TIMEOUT, '等待新建编辑器超时，请检查后台后明确丢弃')
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
  } catch (error) {
    try {
      await phase(
        id,
        attempt,
        applying || sideEffects ? 'uncertain' : 'blocked',
        applying
          ? '可能已经写入，请检查后台后明确丢弃，禁止自动重试'
          : error instanceof TransferError
            ? error.message
            : '后台页面操作中断，请检查新建页面后明确丢弃，禁止自动重试',
      )
    } catch {
      /* A cancelled or recovered attempt must never mutate its successor. */
    }
  } finally {
    if (activeAttempt === attempt) activeAttempt = undefined
  }
}
async function cancel(state: TransferRepository, id: string, inspected: boolean): Promise<void> {
  const task = requireTask(state, id)
  if (activeAttempt)
    throw new TransferError(errors.TASK_BUSY, '正在执行，请等待完成或关闭后台标签后检查结果')
  if ((executionPhases.has(task.phase) || task.phase === 'uncertain') && !inspected)
    throw new TransferError(errors.RESULT_UNCERTAIN, '请先在插件确认已检查后台，再明确丢弃')
  task.phase = 'cancelled'
  task.message = '任务已取消'
  delete task.payload
  delete task.attemptId
  delete task.account
  delete task.documentId
  delete task.tabId
  synchronize(state)
  await writeRepository(state)
}
async function external(request: ExternalRequest) {
  if (request.kind === 'PING')
    return {
      extensionVersion: chrome.runtime.getManifest().version,
      supportedProtocolVersions: [1],
      capabilities: ['text-transfer'],
    }
  const state = await repository()
  if (request.kind === 'GET_STATUS') {
    const receipt = request.receiptRequestId
      ? state.receipts.find(function matching(item) {
          return item.requestId === request.receiptRequestId
        })
      : undefined
    const task =
      receipt?.task ??
      (state.task && (!request.taskId || state.task.id === request.taskId)
        ? summary(state.task)
        : null)
    return { task }
  }
  if (request.kind === 'OPEN_WECHAT') {
    await openWechat()
    return {}
  }
  if (request.kind === 'CANCEL_TASK') {
    await cancel(state, request.taskId, false)
    return { task: state.task && summary(state.task) }
  }
  validateTextHtml(request.payload.html)
  if ((await contentDigest(request.payload)) !== request.payload.digest)
    throw new TransferError(errors.PAYLOAD_INVALID, '内容摘要不匹配，请重新准备传稿')
  const task = receiveTask(state, request.requestId, request.payload)
  await writeRepository(state)
  return { task: summary(task) }
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
      state.task.message = '检测到用户操作后台页面，已停止后续自动操作，请检查后台'
      delete state.task.attemptId
      synchronize(state)
      await writeRepository(state)
    }
    return {}
  }
  if (request.kind === 'OPEN_PANEL') {
    await chrome.action.openPopup()
    return {}
  }
  if (request.kind === 'TARGETS') return { targets: await listTargets() }
  if (request.kind === 'OPEN_WEB') {
    await openWeb()
    return {}
  }
  if (request.kind === 'OPEN_WECHAT') {
    await openWechat()
    return {}
  }
  if (request.kind === 'CLEAR_STORAGE') {
    if (activeAttempt) throw new TransferError(errors.TASK_BUSY, '执行中无法清空，请先等待任务结束')
    await startup
    await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
    await clearRepository()
    startupFailed = false
    return { task: null }
  }
  const state = await repository()
  if (request.kind === 'STATUS') return { task: state.task && summary(state.task) }
  if (request.kind === 'CANCEL_TASK') {
    await cancel(state, request.taskId, request.inspected)
    return { task: state.task && summary(state.task) }
  }
  const task = requireTask(state, request.taskId)
  if (
    !task.payload ||
    !['pending', 'waiting_login', 'waiting_target'].includes(task.phase) ||
    activeAttempt
  )
    throw new TransferError(errors.TASK_BUSY, '此任务不能再次自动执行，请检查后台后丢弃并重新发送')
  const target = await inspectPage(request.tabId)
  if (!target.page.account || target.page.account !== request.account || target.page.editor)
    throw new TransferError(
      errors.TARGET_REQUIRED,
      '请选择已登录的后台首页或草稿箱，并确认显示的账号',
    )
  task.phase = 'creating'
  task.message = '即将独立新建图文'
  task.attemptId = crypto.randomUUID()
  task.tabId = request.tabId
  task.account = request.account
  synchronize(state)
  await writeRepository(state)
  activeAttempt = task.attemptId
  const attempt = task.attemptId
  // Dispatch after durable acknowledgement. All mutations still use the single queue.
  setTimeout(function execute() {
    void runTask(task.id, attempt, request.tabId, request.account)
  }, 0)
  return { task: summary(task) }
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
          (!extensionUi(sender) &&
            !(
              content &&
              ['STATUS', 'OPEN_WEB', 'OPEN_PANEL', 'PAGE_ACTIVITY'].includes(parsed.data.kind)
            ))
        )
          throw new TransferError(errors.SOURCE_REJECTED, '只允许插件面板启动或清理任务')
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
