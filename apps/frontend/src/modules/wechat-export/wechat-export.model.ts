import type { ArticleDocument } from '../article/article.model'
import type { TypesettingConfig } from '../typesetting/typesetting.model'
import type { FixedEnding } from '../ending/ending.model'
import type { PreparedAsset } from '../assets/assets.model'

export interface ExportSnapshot {
  article: ArticleDocument
  config: TypesettingConfig
  ending: FixedEnding
  assets: PreparedAsset[]
}

export interface Diagnostic {
  rule: string
  level: 'warning' | 'error'
  message: string
}

export interface ExportResult {
  html: string
  plainText: string
  revision: number
  profile: string
  diagnostics: Diagnostic[]
  bytes: number
}
