import { z } from 'zod'
import { payloadSchema, taskSummarySchema } from '@jlab-wechat-editor/wechat-transfer-contract'

export const taskSchema = taskSummarySchema.extend({
  payload: payloadSchema.optional(),
  attemptId: z.uuid().optional(),
  tabId: z.number().int().nonnegative().optional(),
  documentId: z.string().optional(),
  account: z.string().max(200).optional(),
})
export type TransferTask = z.infer<typeof taskSchema>
export const receiptSchema = z.strictObject({
  requestId: z.uuid(),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.number().int().nonnegative(),
  task: taskSummarySchema,
})
export const repositorySchema = z.strictObject({
  schemaVersion: z.literal(1),
  task: taskSchema.nullable(),
  receipts: z.array(receiptSchema).max(100),
})
export type TransferRepository = z.infer<typeof repositorySchema>
export const executionPhases = new Set(['creating', 'waiting_editor', 'applying'])
export function summary(task: TransferTask) {
  return taskSummarySchema.parse({
    id: task.id,
    requestId: task.requestId,
    title: task.title,
    receivedAt: task.receivedAt,
    phase: task.phase,
    message: task.message,
  })
}
