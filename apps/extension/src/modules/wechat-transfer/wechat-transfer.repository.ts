import {
  errors,
  taskTtl,
  TransferError,
  type TransferPayload,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import {
  executionPhases,
  repositorySchema,
  summary,
  type TransferRepository,
  type TransferTask,
} from './wechat-transfer.model'

const key = 'wechat-transfer:repository:v1'
export async function readRepository(): Promise<TransferRepository> {
  const value = (await chrome.storage.local.get(key))[key]
  if (value === undefined) return { schemaVersion: 1, task: null, receipts: [] }
  const parsed = repositorySchema.safeParse(value)
  if (!parsed.success)
    throw new TransferError(
      errors.STORAGE_UNAVAILABLE,
      '任务存储格式无法识别，请检查后台后在插件中清空任务',
    )
  return parsed.data
}
export async function writeRepository(repository: TransferRepository): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: repositorySchema.parse(repository) })
  } catch {
    throw new TransferError(errors.STORAGE_UNAVAILABLE, '任务无法保存，请检查扩展存储空间后重试')
  }
}
export function synchronize(repository: TransferRepository): void {
  const now = Date.now()
  repository.receipts = repository.receipts.filter(function unexpired(receipt) {
    return receipt.expiresAt > now
  })
  if (repository.task && now - repository.task.receivedAt >= taskTtl) {
    if (executionPhases.has(repository.task.phase) || repository.task.phase === 'uncertain') {
      repository.task.phase = 'uncertain'
      repository.task.message = '任务执行记录已过期，请检查后台并明确丢弃；禁止自动重试'
      repository.task.title = '过期任务（请检查后台）'
      delete repository.task.payload
      delete repository.task.account
      delete repository.task.documentId
      delete repository.task.tabId
      delete repository.task.attemptId
    } else {
      repository.task = null
    }
  }
  const task = repository.task
  if (task) {
    const receipt = repository.receipts.find(function matching(item) {
      return item.requestId === task.requestId
    })
    if (receipt) receipt.task = summary(task)
  }
}
export function receiveTask(
  repository: TransferRepository,
  requestId: string,
  payload: TransferPayload,
): TransferTask | ReturnType<typeof summary> {
  synchronize(repository)
  const receipt = repository.receipts.find(function matching(item) {
    return item.requestId === requestId
  })
  if (receipt) {
    if (receipt.digest !== payload.digest)
      throw new TransferError(errors.REQUEST_CONFLICT, '同一请求ID对应不同内容，请重新准备传稿')
    return receipt.task
  }
  if (Date.now() - payload.createdAt > taskTtl || payload.createdAt > Date.now() + 60000)
    throw new TransferError(errors.TASK_EXPIRED, '快照时间无效或已过期，请重新准备')
  const current = repository.task
  if (current && (executionPhases.has(current.phase) || current.phase === 'uncertain'))
    throw new TransferError(errors.TASK_BUSY, '当前任务执行中或结果不确定，请先在插件检查后台')
  if (current?.payload && payload.replaceTaskId !== current.id)
    throw new TransferError(errors.TASK_BUSY, '已有待传快照，请明确替换或先取消')
  if (payload.replaceTaskId && current?.id !== payload.replaceTaskId)
    throw new TransferError(errors.REQUEST_CONFLICT, '待替换任务已变化，请刷新状态')
  if (repository.receipts.length >= 100)
    throw new TransferError(errors.TASK_BUSY, '24小时内任务数量已达保护上限，请稍后再试')
  if (current?.payload) {
    current.phase = 'cancelled'
    current.message = '已被用户明确替换'
    synchronize(repository)
  }
  const task: TransferTask = {
    id: crypto.randomUUID(),
    requestId,
    title: payload.title,
    receivedAt: Date.now(),
    phase: 'pending',
    message: '快照已接收，请在插件选择公众号并开始插入',
    payload,
  }
  repository.task = task
  repository.receipts.push({
    requestId,
    digest: payload.digest,
    expiresAt: task.receivedAt + taskTtl,
    task: summary(task),
  })
  return task
}
export async function clearRepository(): Promise<void> {
  await chrome.storage.local.remove(key)
}
