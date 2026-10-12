export interface PreparedText {
  sourceArticleId: string
  sourceRevision: number
  sourceGeneration: number
  title: string
  html: string
  plainText: string
}
export interface TransferConnection {
  availability: 'checking' | 'available' | 'unavailable' | 'incompatible'
  connectionMessage: string
  busy: boolean
  sendStatus: 'idle' | 'sending' | 'sent' | 'error'
  clipboardStatus: 'idle' | 'copying' | 'copied' | 'error'
  clipboardMessage: string
  panelBusy: boolean
  actionMessage: string
  message: string
  cacheStatus: 'idle' | 'saving' | 'saved' | 'error'
  cacheMessage: string
}
