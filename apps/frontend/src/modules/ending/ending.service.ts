import { renderMarkdown } from '../article/article.service'
import type { FixedEnding } from './ending.model'

export function defaultEnding(): FixedEnding {
  return { schemaVersion: 1, enabled: false, markdown: '---\n\n感谢阅读。\n\n**桀士 AI 实验室**' }
}

export function renderEnding(ending: FixedEnding): string {
  return ending.enabled && ending.markdown.trim() ? renderMarkdown(ending.markdown).html : ''
}
