export interface PreparedText {
  sourceArticleId: string
  sourceRevision: number
  sourceGeneration: number
  title: string
  html: string
  plainText: string
}
export interface TransferConnection {
  busy: boolean
  message: string
}
