import { reactive } from 'vue'
import {
  assertMessageSize,
  contentDigest,
  extensionId,
  handshakeSchema,
  payloadSchema,
  profile,
  protocolVersion,
  responseSchema,
  statusSchema,
  titleSchema,
  validateTextHtml,
  type ExternalRequest,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import type { PreparedText, TransferConnection } from './wechat-transfer.model'

interface ChromeRuntime {
  sendMessage: (id: string, message: ExternalRequest, callback: (response: unknown) => void) => void
  lastError?: { message?: string }
}
class RequestRejected extends Error {}
function runtime(): ChromeRuntime | undefined {
  return (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime
}
async function request(message: ExternalRequest, timeout = 5000): Promise<unknown> {
  assertMessageSize(message)
  const chrome = runtime()
  if (!chrome?.sendMessage)
    throw new Error('插件未连接，请安装或启用Chrome插件；也可以使用“复制到公众号”')
  return new Promise(function transmit(resolve, reject) {
    const timer = setTimeout(function late() {
      reject(new Error('插件应答超时，接收结果尚未确认'))
    }, timeout)
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
          reject(new RequestRejected(parsed.data.err || '插件拒绝任务'))
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
  const state = reactive<TransferConnection>({ busy: false, message: '', task: null, retry: null })
  async function refresh(): Promise<void> {
    state.task = statusSchema.parse(
      await request({ protocolVersion, requestId: crypto.randomUUID(), kind: 'GET_STATUS' }),
    ).task
  }
  async function connect(): Promise<void> {
    handshakeSchema.parse(
      await request({ protocolVersion, requestId: crypto.randomUUID(), kind: 'PING' }, 1500),
    )
    await refresh()
    state.message = '插件已连接，接收后请在插件确认公众号'
  }
  async function submit(
    prepared: PreparedText,
    isCurrent: () => boolean,
    replaceTaskId?: string,
  ): Promise<void> {
    if (state.busy || state.retry) return
    state.busy = true
    state.message = '正在准备文字快照'
    try {
      await connect()
      if (!isCurrent()) throw new Error('排版或正文已变化，请重新准备传稿')
      validateTextHtml(prepared.html)
      const base = {
        ...prepared,
        title: titleSchema.parse(prepared.title),
        createdAt: Date.now(),
        profile,
        ...(replaceTaskId ? { replaceTaskId } : {}),
      }
      const payload = payloadSchema.parse({ ...base, digest: await contentDigest(base) })
      const message: ExternalRequest = {
        protocolVersion,
        requestId: crypto.randomUUID(),
        kind: 'SUBMIT_TASK',
        payload,
      }
      assertMessageSize(message)
      if (!isCurrent()) throw new Error('排版或正文已变化，请重新准备传稿')
      state.retry = message
      state.task = statusSchema.parse(await request(message)).task
      state.retry = null
      state.message = '插件已接收此快照。请打开插件面板，选择公众号并开始插入；后续改稿需重新发送'
      await request({ protocolVersion, requestId: crypto.randomUUID(), kind: 'OPEN_WECHAT' }).catch(
        function keepReceipt() {
          state.message += '。后台未打开，请从插件打开公众号'
        },
      )
    } catch (error) {
      if (error instanceof RequestRejected) state.retry = null
      state.message = error instanceof Error ? error.message : '传稿失败，请使用复制流程'
    } finally {
      state.busy = false
    }
  }
  async function retryReceipt(): Promise<void> {
    if (!state.retry || state.busy) return
    state.busy = true
    try {
      // Same request ID and digest, even if the editor has since changed.
      state.task = statusSchema.parse(await request(state.retry)).task
      state.retry = null
      state.message = '原快照接收已确认，请在插件继续操作'
    } catch (error) {
      if (error instanceof RequestRejected) state.retry = null
      state.message = error instanceof Error ? error.message : '原快照结果仍未确认'
    } finally {
      state.busy = false
    }
  }
  async function cancel(): Promise<void> {
    if (!state.task || state.busy) return
    state.busy = true
    try {
      state.task = statusSchema.parse(
        await request({
          protocolVersion,
          requestId: crypto.randomUUID(),
          kind: 'CANCEL_TASK',
          taskId: state.task.id,
        }),
      ).task
      state.message = '任务已取消'
      state.retry = null
    } catch (error) {
      state.message = error instanceof Error ? error.message : '取消失败，请在插件检查'
    } finally {
      state.busy = false
    }
  }
  return { state, connect, refresh, submit, retryReceipt, cancel }
}
