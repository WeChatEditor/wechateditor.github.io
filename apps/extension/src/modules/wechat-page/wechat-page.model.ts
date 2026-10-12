export interface PageProbe {
  account: string
  ready: boolean
  editor: boolean
  empty: boolean
  titleSupported: boolean
  message: string
}
export interface PageTarget extends PageProbe {
  tabId: number
}
export interface PageBinding {
  tabId: number
  documentId: string
  account: string
}
export interface PageResult extends PageProbe {
  drafts?: boolean
  clicked?: boolean
  applied?: boolean
  matches?: boolean
}
export type PageOperation = 'probe' | 'drafts' | 'create' | 'article' | 'apply'
export interface PageCommand {
  operation: PageOperation
  account?: string
  title?: string
  html?: string
}
