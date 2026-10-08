import type {
  WorkspaceDraft,
  LegacyWorkspaceDraft,
  WorkspaceSettings,
  ArticleVersion,
} from './draft-storage.port'
import { isColor } from '../article/article.service'
import { normalizeTypesetting, maxPalettes } from '../typesetting/typesetting.service'
import { chapterStyles } from '../typesetting/typesetting.model'
import { maxMarkdownLength } from '../../app.config'
import { normalizeEnding } from '../ending/ending.service'

function validArticle(value: unknown): boolean {
  const draft = value as WorkspaceDraft | undefined
  const valid =
    draft &&
    draft.article?.schemaVersion === 1 &&
    typeof draft.article.id === 'string' &&
    typeof draft.article.markdown === 'string' &&
    draft.article.markdown.length <= maxMarkdownLength &&
    Number.isInteger(draft.article.revision) &&
    draft.article.revision >= 0 &&
    Number.isFinite(draft.article.updatedAt) &&
    Array.isArray(draft.article.annotations) &&
    draft.article.annotations.length <= 10_000 &&
    draft.article.annotations.every(
      (a) =>
        a &&
        typeof a.id === 'string' &&
        Number.isInteger(a.revision) &&
        a.revision >= 0 &&
        Number.isInteger(a.start) &&
        a.start >= 0 &&
        Number.isInteger(a.end) &&
        a.end > a.start &&
        a.end <= maxMarkdownLength * 2 &&
        isColor(a.color) &&
        typeof a.invalid === 'boolean',
    ) &&
    Array.isArray(draft.assets) &&
    draft.assets.length <= 100 &&
    draft.assets.every(
      (a) =>
        a &&
        /^[\da-f-]+$/i.test(a.id) &&
        a.blob instanceof Blob &&
        ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(a.blob.type) &&
        a.blob.size <= 10 * 1024 * 1024,
    )
  return Boolean(valid)
}

export function validateSettings(value: unknown, allowLegacyPalettes = false): WorkspaceSettings {
  const draft = value as WorkspaceSettings | undefined
  const valid =
    draft &&
    draft.schemaVersion === 1 &&
    isColor(draft.localColor) &&
    draft.config &&
    typeof draft.config.preset === 'string' &&
    ['body', 'heading', 'accent', 'muted', 'background'].every((role) =>
      isColor(draft.config.colors?.[role as keyof typeof draft.config.colors]),
    ) &&
    (draft.config.chapterNumberEnabled === undefined ||
      typeof draft.config.chapterNumberEnabled === 'boolean') &&
    (draft.config.palettes === undefined ||
      (Array.isArray(draft.config.palettes) &&
        draft.config.palettes.length >= 1 &&
        draft.config.palettes.length <= (allowLegacyPalettes ? 15 : maxPalettes) &&
        new Set(draft.config.palettes.map((p) => p?.id)).size === draft.config.palettes.length &&
        draft.config.palettes.every(
          (p) =>
            p &&
            typeof p.id === 'string' &&
            p.id.length > 0 &&
            typeof p.name === 'string' &&
            p.name.trim().length > 0 &&
            p.name.length <= 30 &&
            typeof p.custom === 'boolean' &&
            ['body', 'heading', 'accent', 'muted', 'background'].every((role) =>
              isColor(p.colors?.[role as keyof typeof p.colors]),
            ),
        ))) &&
    chapterStyles.some(([id]) => id === draft.config.chapterStyle) &&
    [
      draft.config.fontSize,
      draft.config.lineHeight,
      draft.config.paragraphGap,
      draft.config.letterSpacing,
    ].every(Number.isFinite) &&
    draft.config.fontSize >= 14 &&
    draft.config.fontSize <= 18 &&
    draft.config.lineHeight >= 1.6 &&
    draft.config.lineHeight <= 2.2 &&
    draft.config.paragraphGap >= 8 &&
    draft.config.paragraphGap <= 40 &&
    draft.config.letterSpacing >= 0 &&
    draft.config.letterSpacing <= 3 &&
    ['default', 'sans', 'serif'].includes(draft.config.font) &&
    typeof draft.config.backgroundEnabled === 'boolean' &&
    draft.ending?.schemaVersion === 1 &&
    typeof draft.ending.enabled === 'boolean' &&
    typeof draft.ending.markdown === 'string' &&
    draft.ending.markdown.length <= maxMarkdownLength &&
    (draft.ending.opening === undefined ||
      (draft.ending.opening !== null &&
        typeof draft.ending.opening.enabled === 'boolean' &&
        typeof draft.ending.opening.markdown === 'string' &&
        draft.ending.opening.markdown.length <= maxMarkdownLength)) &&
    Number.isFinite(draft.ratio) &&
    draft.ratio > 0 &&
    draft.ratio < 1 &&
    ['phone', 'desktop'].includes(draft.previewMode)
  if (!valid) {
    if (
      Array.isArray(draft?.config?.palettes) &&
      draft.config.palettes.length > maxPalettes &&
      !allowLegacyPalettes
    ) {
      throw new Error('配色最多九个，请删除多余配色或重置所有配色后保存。')
    }
    throw new Error('本地配置版本或数据异常，已暂停配置保存，原记录保留。请备份后处理。')
  }
  return {
    ...draft,
    config: normalizeTypesetting(draft.config),
    ending: normalizeEnding(draft.ending),
  }
}

export function validateDraft(value: unknown): WorkspaceDraft {
  const draft = value as WorkspaceDraft | undefined
  if (!draft || draft.schemaVersion !== 2 || !validArticle(value)) {
    throw new Error('本地文章版本或数据异常，已暂停文章保存，原记录保留。请备份后处理。')
  }
  return { schemaVersion: 2, article: draft.article, assets: draft.assets }
}

export function validateLegacyDraft(value: unknown): LegacyWorkspaceDraft {
  const draft = value as LegacyWorkspaceDraft | undefined
  if (!draft || draft.schemaVersion !== 1 || !validArticle(value)) {
    throw new Error('旧草稿版本或数据异常，原记录已保留。')
  }
  validateSettings({ ...draft, localColor: '#c44b77' })
  return draft
}

export function draftWriteId(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value && typeof value === 'object' && 'schemaVersion' in value && value.schemaVersion === 1) {
    return 'legacy'
  }
  if (
    value &&
    typeof value === 'object' &&
    'writeId' in value &&
    typeof value.writeId === 'string'
  ) {
    return value.writeId
  }
  throw new Error('当前文章的写入标识异常，原记录已保留。')
}

export function validateVersion(value: unknown, timestamp: number): ArticleVersion {
  const version = value as ArticleVersion | undefined
  if (
    !version ||
    !Number.isSafeInteger(timestamp) ||
    timestamp <= 0 ||
    timestamp > 8_640_000_000_000_000 ||
    version.timestamp !== timestamp
  ) {
    throw new Error('历史版本时间戳或数据异常，原记录已保留。')
  }
  return { timestamp, draft: validateDraft(version.draft) }
}

export function splitBounds(width: number): { min: number; max: number } {
  const available = Math.max(600, width)
  return { min: 280 / available, max: 1 - 320 / available }
}

export function clampRatio(ratio: number, width: number): number {
  const { min, max } = splitBounds(width)
  return Math.max(min, Math.min(max, ratio))
}
