import { z } from 'zod'
z.config({ jitless: true })
export const extensionId = 'neeljhohndegbhaaaclmcdeenlebhicj'
export const developmentExtensionId = 'imiclghaaoleoggfhfdbanmaehamnpmg'
export const extensionStoreUrl = `https://chromewebstore.google.com/detail/${extensionId}`

export function extensionIdForOrigin(origin: string): string {
  return ['http://127.0.0.1:5175', 'http://127.0.0.1:4175'].includes(origin)
    ? developmentExtensionId
    : extensionId
}

export const protocolVersion = 2 as const
export const htmlRelayCapability = 'html-relay@1' as const
export const maxMessageBytes = 2 * 1024 * 1024
export const taskTtl = 24 * 60 * 60 * 1000
export const productionWebUrl = 'https://wechateditor.github.io/'
export const wechatUrl = 'https://mp.weixin.qq.com/'
// Only active during a synchronous browser-native title edit; not an authorization token.
export const nativeTitleEditAttribute = 'data-jlab-native-title-edit' as const
export const errors = {
  SOURCE_REJECTED: 4101,
  PROTOCOL_UNSUPPORTED: 4102,
  PAYLOAD_INVALID: 4103,
  IMAGE_UNSUPPORTED: 4104,
  STORAGE_UNAVAILABLE: 4105,
  TASK_BUSY: 4106,
  TASK_EXPIRED: 4107,
  TARGET_REQUIRED: 4108,
  PAGE_UNSUPPORTED: 4109,
  EDITOR_NOT_EMPTY: 4110,
  STEP_TIMEOUT: 4111,
  RESULT_UNCERTAIN: 4112,
  SOURCE_CHANGED: 4113,
  REQUEST_CONFLICT: 4114,
} as const
export class TransferError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
// Transport bounds only; product title rules belong to the Web content entry.
export const titleSchema = z.string().min(1).max(maxMessageBytes)
export const payloadSchema = z.strictObject({
  sourceArticleId: z.uuid(),
  sourceRevision: integer,
  sourceGeneration: integer,
  createdAt: integer,
  title: titleSchema,
  html: z.string().min(1).max(maxMessageBytes),
  plainText: z.string().min(1).max(maxMessageBytes),
  profile: z.string().min(1).max(200),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
})
export type TransferPayload = z.infer<typeof payloadSchema>
const envelope = { protocolVersion: z.literal(protocolVersion), requestId: z.uuid() }
export const externalRequestSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...envelope, kind: z.literal('PING') }),
  z.strictObject({ ...envelope, kind: z.literal('SUBMIT_TASK'), payload: payloadSchema }),
  z.strictObject({ ...envelope, kind: z.literal('SAVE_ARTICLE'), payload: payloadSchema }),
  z.strictObject({ ...envelope, kind: z.literal('OPEN_PANEL') }),
  z.strictObject({ ...envelope, kind: z.literal('OPEN_WECHAT') }),
])
export type ExternalRequest = z.infer<typeof externalRequestSchema>
export const internalRequestSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('PING') }),
  z.strictObject({ kind: z.literal('ARTICLE') }),
  z.strictObject({ kind: z.literal('COPY_ARTICLE') }),
  z.strictObject({ kind: z.literal('TARGETS') }),
  z.strictObject({ kind: z.literal('OPEN_WEB') }),
  z.strictObject({ kind: z.literal('OPEN_PANEL') }),
  z.strictObject({ kind: z.literal('PAGE_ACTIVITY') }),
  z.strictObject({ kind: z.literal('OPEN_WECHAT') }),
  z.strictObject({
    kind: z.literal('SELECT_TARGET'),
    tabId: integer,
    account: z.string().min(1).max(200),
  }),
])
export type InternalRequest = z.infer<typeof internalRequestSchema>
export function contentRequestAllowed(request: InternalRequest): boolean {
  return ['PING', 'ARTICLE', 'OPEN_WEB', 'OPEN_WECHAT', 'OPEN_PANEL', 'PAGE_ACTIVITY'].includes(
    request.kind,
  )
}
export const phaseSchema = z.enum([
  'pending',
  'waiting_login',
  'waiting_target',
  'creating',
  'waiting_editor',
  'applying',
  'inserted',
  'blocked',
  'uncertain',
  'cancelled',
  'expired',
])
export const taskSummarySchema = z.strictObject({
  id: z.uuid(),
  requestId: z.uuid(),
  title: titleSchema,
  receivedAt: integer,
  phase: phaseSchema,
  message: z.string().max(500),
})
export type TaskSummary = z.infer<typeof taskSummarySchema>
export const responseSchema = z
  .strictObject({
    protocolVersion: z.literal(protocolVersion),
    requestId: z.uuid(),
    status: integer,
    err: z.string().optional(),
    data: z.unknown().optional(),
  })
  .superRefine(function responseShape(value, context) {
    if (value.status === 0 ? value.err !== undefined : !value.err || value.data !== undefined)
      context.addIssue({ code: 'custom', message: '响应成功/失败字段不一致' })
  })
export type TransferResponse = z.infer<typeof responseSchema>
export const connectionInfoSchema = z.strictObject({
  extensionVersion: z.string().min(1).max(40),
  capabilities: z.array(z.string().min(1).max(80)).max(32).optional(),
})
export function supportsHtmlRelay(info: z.infer<typeof connectionInfoSchema>): boolean {
  return info.capabilities?.includes(htmlRelayCapability) === true
}
export const articleInfoSchema = z.strictObject({ title: titleSchema, receivedAt: integer })
export const articleResponseSchema = z.strictObject({ article: articleInfoSchema.nullable() })
export const clipboardArticleSchema = articleInfoSchema.extend({
  html: z.string().min(1).max(maxMessageBytes),
  plainText: z.string().min(1).max(maxMessageBytes),
})
export const clipboardResponseSchema = z.strictObject({
  article: clipboardArticleSchema.nullable(),
})
export const targetSelectionSchema = z.strictObject({
  tabId: integer,
  account: z.string().min(1).max(200),
})
export const targetsSchema = z.strictObject({
  selected: targetSelectionSchema.nullable(),
  targets: z.array(
    z.strictObject({
      tabId: integer,
      account: z.string().max(200),
      ready: z.boolean(),
      editor: z.boolean(),
      empty: z.boolean(),
      titleSupported: z.boolean(),
      message: z.string(),
    }),
  ),
})
export const internalResponseSchema = z.strictObject({
  status: integer,
  data: z.unknown().optional(),
  err: z.string().optional(),
})
export const transferNoticeSchema = z.strictObject({
  kind: z.literal('TRANSFER_NOTICE'),
  message: z.string().max(500),
})

export function utf8Bytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length
}
export function assertMessageSize(value: unknown): void {
  if (utf8Bytes(value) > maxMessageBytes)
    throw new TransferError(errors.PAYLOAD_INVALID, '传稿消息超过2 MiB，请拆分文章')
}
export async function contentDigest(payload: Omit<TransferPayload, 'digest'>): Promise<string> {
  const canonical = JSON.stringify([
    protocolVersion,
    payload.profile,
    payload.title,
    payload.html,
    payload.plainText,
    payload.sourceArticleId,
    payload.sourceRevision,
    payload.sourceGeneration,
    payload.createdAt,
  ])
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return Array.from(new Uint8Array(buffer), function hex(byte) {
    return byte.toString(16).padStart(2, '0')
  }).join('')
}
export function allowedSource(url: string, developmentOrigins: readonly string[] = []): boolean {
  try {
    const source = new URL(url)
    return (
      (source.origin === new URL(productionWebUrl).origin &&
        ['/', '/index.html'].includes(source.pathname)) ||
      developmentOrigins.includes(source.origin)
    )
  } catch {
    return false
  }
}
