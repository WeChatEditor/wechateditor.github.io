import { renderMarkdown } from '../article/article.service'
import type { FixedEnding, FixedOpening } from './ending.model'

export function defaultOpening(): FixedOpening {
  return { enabled: false, markdown: '' }
}

export function normalizeEnding(ending: FixedEnding): FixedEnding {
  return { ...ending, opening: { ...(ending.opening ?? defaultOpening()) } }
}

export function defaultEnding(): FixedEnding {
  return {
    schemaVersion: 1,
    enabled: false,
    markdown: '---\n\n感谢阅读。\n\n**桀士 AI 实验室**',
    opening: defaultOpening(),
  }
}

export function renderOpening(ending: FixedEnding): string {
  const opening = ending.opening
  return opening?.enabled && opening.markdown.trim() ? renderMarkdown(opening.markdown).html : ''
}

export function renderEnding(ending: FixedEnding): string {
  return ending.enabled && ending.markdown.trim() ? renderMarkdown(ending.markdown).html : ''
}
