import { reactive } from 'vue'
import {
  assertMessageSize,
  articleResponseSchema,
  contentDigest,
  connectionInfoSchema,
  extensionIdForOrigin,
  payloadSchema,
  protocolVersion,
  responseSchema,
  supportsHtmlRelay,
  type ExternalRequest,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import {
  profile,
  articleTitleSchema,
  validateTextHtml,
} from '@jlab-wechat-editor/wechat-transfer-contract/content'
import type { PreparedText, TransferConnection } from './wechat-transfer.model'

interface ChromeRuntime {
  sendMessage: (id: string, message: ExternalRequest, callback: (response: unknown) => void) => void
  lastError?: { message?: string }
}
function runtime(): ChromeRuntime | undefined {
  return (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime
}
class ConnectionError extends Error {
  availability: 'unavailable' | 'incompatible'
  constructor(availability: 'unavailable' | 'incompatible', message: string) {
    super(message)
    this.availability = availability
  }
}
async function request(message: ExternalRequest): Promise<unknown> {
  assertMessageSize(message)
  const chrome = runtime()
  if (!chrome?.sendMessage)
    throw new ConnectionError('unavailable', '未检测到插件，请安装或启用Chrome传稿插件')
  const targetExtensionId = extensionIdForOrigin(window.location.origin)
  return new Promise(function transmit(resolve, reject) {
    const timer = setTimeout(function late() {
      reject(
        new ConnectionError(
          'unavailable',
          message.kind === 'SAVE_ARTICLE'
            ? '插件保存应答超时，请检查插件；本机草稿不受影响'
            : message.kind === 'PING'
              ? '未能连接插件，请安装或启用插件后重新检测'
              : '插件应答超时，请检查后台；没有自动重试此次发送',
        ),
      )
    }, 5000)
    try {
      chrome.sendMessage(targetExtensionId, message, function received(raw) {
        const connectionError = chrome.lastError
        clearTimeout(timer)
        if (connectionError) {
          reject(
            new ConnectionError(
              'unavailable',
              '插件未连接，请安装或启用插件，并允许访问当前工作台',
            ),
          )
          return
        }
        const parsed = responseSchema.safeParse(raw)
        if (!parsed.success || parsed.data.requestId !== message.requestId) {
          reject(
            new ConnectionError('incompatible', '插件版本不兼容，请同时更新Web和插件至最新版本'),
          )
          return
        }
        if (parsed.data.status !== 0) {
          reject(
            message.kind === 'PING'
              ? new ConnectionError('incompatible', '当前插件不支持连接检测，请更新传稿插件')
              : new Error(parsed.data.err || '插件未能接收文章'),
          )
          return
        }
        resolve(parsed.data.data)
      })
    } catch {
      clearTimeout(timer)
      reject(
        new ConnectionError('unavailable', '插件连接失败，请安装或启用插件，并检查站点访问权限'),
      )
    }
  })
}
export function createTransferConnection() {
  const state = reactive<TransferConnection>({
    availability: 'checking',
    connectionMessage: '正在检测传稿插件…',
    busy: false,
    sendStatus: 'idle',
    clipboardStatus: 'idle',
    clipboardMessage: '',
    panelBusy: false,
    actionMessage: '',
    message: '',
    cacheStatus: 'idle',
    cacheMessage: '排版尚未同步插件',
  })
  let queue = Promise.resolve()
  let detection: Promise<void> | undefined
  function connectionFailure(error: unknown): void {
    if (error instanceof ConnectionError) {
      state.availability = error.availability
      state.connectionMessage = error.message
    }
  }
  function detect(): Promise<void> {
    if (detection) return detection
    state.availability = 'checking'
    state.connectionMessage = '正在检测传稿插件…'
    detection = (async function probe() {
      try {
        const info = connectionInfoSchema.safeParse(
          await request({
            protocolVersion,
            requestId: crypto.randomUUID(),
            kind: 'PING',
          }),
        )
        if (!info.success)
          throw new ConnectionError('incompatible', '插件连接应答不兼容，请更新Web和插件')
        if (!supportsHtmlRelay(info.data))
          throw new ConnectionError(
            'incompatible',
            `当前插件${info.data.extensionVersion}仍有旧格式校验，请更新为支持HTML转发的插件（0.1.15起）`,
          )
        state.availability = 'available'
        state.connectionMessage = `传稿插件已连接 · ${info.data.extensionVersion}`
      } catch (error) {
        state.availability = error instanceof ConnectionError ? error.availability : 'incompatible'
        state.connectionMessage = error instanceof Error ? error.message : '请安装或更新传稿插件'
      } finally {
        detection = undefined
      }
    })()
    return detection
  }
  async function openPanel(): Promise<void> {
    if (state.availability !== 'available' || state.panelBusy) return
    state.panelBusy = true
    state.actionMessage = ''
    try {
      await request({ protocolVersion, requestId: crypto.randomUUID(), kind: 'OPEN_PANEL' })
    } catch (error) {
      connectionFailure(error)
      state.actionMessage = error instanceof Error ? error.message : '无法打开传稿面板'
    } finally {
      state.panelBusy = false
    }
  }
  function transmit(
    kind: 'SUBMIT_TASK' | 'SAVE_ARTICLE',
    prepared: PreparedText,
    isCurrent: () => boolean,
  ): Promise<void> {
    const operation = queue.then(async function sendSnapshot() {
      if (!isCurrent()) throw new Error('排版或正文已变化，请重新点击发送')
      if (state.availability === 'checking') await detect()
      if (state.availability === 'incompatible')
        throw new ConnectionError('incompatible', state.connectionMessage)
      validateTextHtml(prepared.html)
      const title = articleTitleSchema.safeParse(prepared.title)
      if (!title.success) throw new Error('公众号标题不能超过64个字符，请调整正文中的一级标题')
      const base = { ...prepared, title: title.data, createdAt: Date.now(), profile }
      const payload = payloadSchema.parse({ ...base, digest: await contentDigest(base) })
      if (!isCurrent()) throw new Error('排版或正文已变化，请重新点击发送')
      articleResponseSchema.parse(
        await request({
          protocolVersion,
          requestId: crypto.randomUUID(),
          kind,
          payload,
        }),
      )
    })
    queue = operation.catch(function failed() {})
    return operation
  }
  async function save(prepared: PreparedText, isCurrent: () => boolean): Promise<void> {
    if (!isCurrent()) return
    state.cacheStatus = 'saving'
    state.cacheMessage = '正在同步排版到插件…'
    try {
      await transmit('SAVE_ARTICLE', prepared, isCurrent)
      if (!isCurrent()) return
      state.cacheStatus = 'saved'
      state.cacheMessage = '排版已保存到插件，可在插件面板复制'
    } catch (error) {
      if (!isCurrent()) return
      connectionFailure(error)
      state.cacheStatus = 'error'
      state.cacheMessage = `插件未同步，已有快照未更新：${error instanceof Error ? error.message : '请检查插件'}`
    }
  }
  async function submit(prepared: PreparedText, isCurrent: () => boolean): Promise<void> {
    state.sendStatus = 'sending'
    state.message = '正在发送当前内容…'
    try {
      await transmit('SUBMIT_TASK', prepared, isCurrent)
      if (!isCurrent()) return
      state.sendStatus = 'sent'
      if (isCurrent()) {
        state.cacheStatus = 'saved'
        state.cacheMessage = '排版已保存到插件，可在插件面板复制'
      }
      state.message =
        '当前内容已传给插件，将打开公众号后台尝试新建并插入。如未完成，请打开插件面板“复制到公众号”，在后台粘贴并检查后手动保存。'
    } catch (error) {
      if (!isCurrent()) return
      connectionFailure(error)
      state.sendStatus = 'error'
      state.message = error instanceof Error ? error.message : '传稿失败，请使用复制流程'
    }
  }
  return { state, submit, save, detect, openPanel }
}
