import type { ArticleDocument } from '../article/article.model'
import type { TypesettingConfig } from '../typesetting/typesetting.model'
import type { FixedEnding } from '../ending/ending.model'
import type { PreparedAsset } from '../assets/assets.model'

/** 仅用于兼容迁移；新文章记录不包含设置。 */
export interface LegacyWorkspaceDraft {
  schemaVersion: 1
  article: ArticleDocument
  config: TypesettingConfig
  ending: FixedEnding
  assets: PreparedAsset[]
  ratio: number
  previewMode: 'phone' | 'desktop'
}

export interface WorkspaceSettings {
  schemaVersion: 1
  config: TypesettingConfig
  ending: FixedEnding
  ratio: number
  previewMode: 'phone' | 'desktop'
  localColor: string
}

export interface WorkspaceDraft {
  schemaVersion: 2
  article: ArticleDocument
  assets: PreparedAsset[]
}

export interface StoredDraft extends WorkspaceDraft {
  writeId: string
}

export interface ArticleVersion {
  timestamp: number
  draft: WorkspaceDraft
}

export interface VersionSummary {
  timestamp: number
  title: string
  characters: number
}

export interface DraftStorage {
  load(): Promise<unknown>
  save(
    draft: WorkspaceDraft,
    expectedWriteId: string | undefined,
    version?: boolean,
  ): Promise<{
    writeId: string
    timestamp?: number
  }>
  listVersions(): Promise<VersionSummary[]>
  loadVersion(timestamp: number): Promise<unknown>
  deleteVersion(timestamp: number): Promise<void>
  close(): void
}
