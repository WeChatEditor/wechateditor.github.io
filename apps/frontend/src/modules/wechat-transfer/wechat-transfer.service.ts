import { reactive } from 'vue'
import {
  assertMessageSize,
  articleResponseSchema,
  contentDigest,
  extensionId,
  payloadSchema,
  profile,
  protocolVersion,
  responseSchema,
  titleSchema,
  validateTextHtml,
  type ExternalRequest,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import type { PreparedText, TransferConnection } from './wechat-transfer.model'

interface ChromeRuntime {
  sendMessage: (id: string, message: ExternalRequest, callback: (response: unknown) => void) => void
  lastError?: { message?: string }
}
function runtime(): ChromeRuntime | undefined {
  return (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime
}
async function request(message: ExternalRequest): Promise<unknown> {
  assertMessageSize(message)
  const chrome = runtime()
  if (!chrome?.sendMessage)
    throw new Error('插件未连接，请安装或启用Chrome插件；也可以使用“复制到公众号”')
  return new Promise(function transmit(resolve, reject) {
    const timer = setTimeout(function late() {
      reject(new Error('插件应答超时，请检查后台；没有自动重试此次发送'))
    }, 5000)
    try {
      chrome.sendMessage(extensionId, message, function received(raw) {
        const connectionError = chrome.lastError
        clearTimeout(timer)
        if (connectionError) {
          reject(new Error('插件未连接或未获工作台访问权限，请检查插件安装和权限'))
          return
        }
        const parsed = responseSchema.safeParse(raw)
        if (!parsed.success || parsed.data.requestId !== message.requestId) {
          reject(new Error('插件协议不兼容，请同时更新Web和插件'))
          return
        }
        if (parsed.data.status !== 0) {
          reject(new Error(parsed.data.err || '插件未能接收文章'))
          return
        }
        resolve(parsed.data.data)
      })
    } catch {
      clearTimeout(timer)
      reject(new Error('插件连接失败，请检查插件和来源权限'))
    }
  })
}
export function createTransferConnection() {
  const state = reactive<TransferConnection>({ busy: false, message: '' })
  async function submit(prepared: PreparedText, isCurrent: () => boolean): Promise<void> {
    if (state.busy) return
    state.busy = true
    state.message = '正在发送当前内容…'
    try {
      validateTextHtml(prepared.html)
      const title = titleSchema.safeParse(prepared.title)
      if (!title.success)
        throw new Error('公众号标题不能超过64个字符，请调整正文中的一级标题后再发送')
      const base = {
        ...prepared,
        title: title.data,
        createdAt: Date.now(),
        profile,
      }
      const payload = payloadSchema.parse({ ...base, digest: await contentDigest(base) })
      if (!isCurrent()) throw new Error('排版或正文已变化，请重新点击发送')
      articleResponseSchema.parse(
        await request({
          protocolVersion,
          requestId: crypto.randomUUID(),
          kind: 'SUBMIT_TASK',
          payload,
        }),
      )
      state.message =
        '当前内容已传给插件，将打开公众号后台尝试新建并插入。如未完成，请打开插件面板“复制到公众号”，在后台粘贴并检查后手动保存。'
    } catch (error) {
      state.message = error instanceof Error ? error.message : '传稿失败，请使用复制流程'
    } finally {
      state.busy = false
    }
  }
  return { state, submit }
}
