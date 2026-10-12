import {
  payloadSchema,
  errors,
  taskTtl,
  TransferError,
  type TransferPayload,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import {
  executionPhases,
  repositorySchema,
  summary,
  taskSchema,
  type TransferRepository,
  type TransferTask,
} from './wechat-transfer.model'
import { z } from 'zod'

const legacyRepositorySchema = repositorySchema
  .omit({ schemaVersion: true, selected: true })
  .extend({
    schemaVersion: z.literal(1),
    task: taskSchema
      .extend({
        payload: payloadSchema.extend({ replaceTaskId: z.uuid().optional() }).optional(),
      })
      .nullable(),
  })

const key = 'wechat-transfer:repository:v1'
export async function readRepository(): Promise<TransferRepository> {
  const value = (await chrome.storage.local.get(key))[key]
  if (value === undefined) return { schemaVersion: 2, selected: null, task: null, receipts: [] }
  // Retain old receipts, but never execute a snapshot sent under the previous interaction.
  const legacy = legacyRepositorySchema.safeParse(value)
  const migrated = legacy.success
    ? {
        ...legacy.data,
        schemaVersion: 2,
        selected: null,
        task: legacy.data.task
          ? {
              ...legacy.data.task,
              payload: undefined,
              attemptId: undefined,
              tabId: undefined,
              documentId: undefined,
              account: undefined,
              phase: 'blocked',
              message: '插件已更新，请从编辑器重新发送当前内容',
            }
          : null,
      }
    : value
  const parsed = repositorySchema.safeParse(migrated)
  if (!parsed.success)
    throw new TransferError(
      errors.STORAGE_UNAVAILABLE,
      '插件存储格式无法识别，请重新安装插件后从编辑器发送；Web原稿仍保留',
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
    repository.task = null
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
  if (current && executionPhases.has(current.phase))
    throw new TransferError(errors.TASK_BUSY, '正在插入上一份内容，请稍后再发送')
  if (repository.receipts.length >= 100)
    throw new TransferError(errors.TASK_BUSY, '24小时内任务数量已达保护上限，请稍后再试')
  if (current?.payload) {
    if (current.phase === 'pending') {
      current.phase = 'cancelled'
      current.message = '已被本次发送替换'
    }
    delete current.payload
    synchronize(repository)
  }
  const task: TransferTask = {
    id: crypto.randomUUID(),
    requestId,
    title: payload.title,
    receivedAt: Date.now(),
    phase: 'pending',
    message: '当前内容已接收，将自动新建并插入',
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
