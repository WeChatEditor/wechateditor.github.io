export interface Annotation {
  id: string
  start: number
  end: number
  color: string
  revision: number
  invalid: boolean
}

export interface ArticleDocument {
  schemaVersion: 1
  id: string
  markdown: string
  revision: number
  updatedAt: number
  annotations: Annotation[]
}

export interface RenderedArticle {
  html: string
  text: string
}

export interface TextSelection {
  start: number
  end: number
  revision: number
}
