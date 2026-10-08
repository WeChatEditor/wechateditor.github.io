import MarkdownIt from 'markdown-it'
import type { Annotation, RenderedArticle, TextSelection } from './article.model'

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, function entity(char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!
  })
}

export function isColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
}

export function renderMarkdown(markdown: string, annotations: Annotation[] = []): RenderedArticle {
  const md = new MarkdownIt({ html: false, breaks: true, linkify: true })
  const validate = md.validateLink
  md.validateLink = function validateUrl(url) {
    return /^asset:[\da-f-]+$/i.test(url) || validate(url)
  }
  let text = ''
  md.renderer.rules.image = function controlledImage(tokens, idx) {
    const token = tokens[idx]
    const source = String(token.attrGet('src') || '')
    const alt = token.content
    return `<img data-image-source="${escapeHtml(source)}" alt="${escapeHtml(alt)}" />`
  }
  md.renderer.rules.link_open = function controlledLink(tokens, idx) {
    const href = String(tokens[idx].attrGet('href') || '')
    return /^https?:\/\//i.test(href) ? `<a href="${escapeHtml(href)}">` : '<a>'
  }
  md.renderer.rules.text = function mappedText(tokens, idx) {
    const content = tokens[idx].content
    const start = text.length
    text += content
    const end = text.length
    const boundaries = new Set([start, end])
    const valid = annotations.filter(function overlaps(a) {
      return !a.invalid && isColor(a.color) && a.start < end && a.end > start
    })
    for (const a of valid) {
      boundaries.add(Math.max(start, a.start))
      boundaries.add(Math.min(end, a.end))
    }
    const points = [...boundaries].sort((a, b) => a - b)
    const pieces = points.slice(0, -1).map(function piece(from, i) {
      const to = points[i + 1]
      const color = [...valid].reverse().find((a) => a.start <= from && a.end >= to)?.color
      const value = escapeHtml(content.slice(from - start, to - start))
      return color ? `<span style="color:${color}">${value}</span>` : value
    })
    return `<span data-text-start="${start}" data-text-end="${end}">${pieces.join('')}</span>`
  }
  return { html: md.render(markdown), text }
}

export function articleStatistics(markdown: string): {
  characters: number
  readingMinutes: number
} {
  const root = document.createElement('div')
  root.innerHTML = renderMarkdown(markdown).html
  const characters = Array.from((root.textContent || '').replace(/\s/g, '')).length
  return { characters, readingMinutes: Math.ceil(characters / 600) }
}

export function migrateAnnotations(
  before: string,
  after: string,
  annotations: Annotation[],
  revision: number,
): Annotation[] {
  if (before === after) {
    return annotations.map((a) => ({ ...a, revision }))
  }
  let prefix = 0
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) {
    prefix++
  }
  let suffix = 0
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - suffix - 1] === after[after.length - suffix - 1]
  ) {
    suffix++
  }
  const delta = after.length - before.length
  return annotations.map(function migrate(a) {
    if (a.invalid) {
      return { ...a, revision }
    }
    const anchor = before.slice(a.start, a.end)
    if (
      !anchor ||
      before.indexOf(anchor) !== before.lastIndexOf(anchor) ||
      after.indexOf(anchor) !== after.lastIndexOf(anchor)
    ) {
      return { ...a, invalid: true, revision }
    }
    if (a.end <= prefix) {
      return { ...a, revision }
    }
    if (a.start >= before.length - suffix) {
      return { ...a, start: a.start + delta, end: a.end + delta, revision }
    }
    return { ...a, invalid: true, revision }
  })
}

export function addAnnotation(
  annotations: Annotation[],
  selection: TextSelection,
  color: string,
): Annotation[] {
  if (!isColor(color) || selection.start >= selection.end) {
    throw new Error('请先选中正文文字，再选择颜色。')
  }
  const next: Annotation[] = []
  for (const a of annotations) {
    if (a.invalid || a.end <= selection.start || a.start >= selection.end) {
      next.push(a)
      continue
    }
    if (a.start < selection.start) {
      next.push({ ...a, end: selection.start })
    }
    if (a.end > selection.end) {
      next.push({ ...a, id: crypto.randomUUID(), start: selection.end })
    }
  }
  next.push({ id: crypto.randomUUID(), ...selection, color, invalid: false })
  next.sort((a, b) => a.start - b.start)
  return next.reduce<Annotation[]>(function merge(result, current) {
    const previous = result.at(-1)
    if (
      previous &&
      !previous.invalid &&
      !current.invalid &&
      previous.end === current.start &&
      previous.color === current.color
    ) {
      previous.end = current.end
    } else {
      result.push({ ...current })
    }
    return result
  }, [])
}

export function removeAnnotations(
  annotations: Annotation[],
  selection: TextSelection,
): Annotation[] {
  if (selection.start >= selection.end) {
    throw new Error('请先选择需要清除颜色的文字。')
  }
  const next: Annotation[] = []
  for (const annotation of annotations) {
    if (
      annotation.invalid ||
      annotation.end <= selection.start ||
      annotation.start >= selection.end
    ) {
      next.push({ ...annotation })
      continue
    }
    if (annotation.start < selection.start) {
      next.push({ ...annotation, end: selection.start })
    }
    if (annotation.end > selection.end) {
      next.push({ ...annotation, id: crypto.randomUUID(), start: selection.end })
    }
  }
  return next
}

export function readSelection(root: HTMLElement, revision: number): TextSelection | undefined {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return undefined
  }
  const range = selection.getRangeAt(0)
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return undefined
  }
  for (const forbidden of root.querySelectorAll(
    'code, pre, img, [data-decoration], [data-opening], [data-ending]',
  )) {
    if (range.intersectsNode(forbidden)) {
      throw new Error('选区包含代码、图片或章节装饰，请只选择正文文字。')
    }
  }
  function offset(node: Node, position: number): number {
    const element = (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>(
      '[data-text-start]',
    )
    if (!element || !root.contains(element)) {
      throw new Error('请选择文字内部的起点和终点。')
    }
    const prefix = document.createRange()
    prefix.selectNodeContents(element)
    prefix.setEnd(node, position)
    return Number(element.dataset.textStart) + prefix.toString().length
  }
  return {
    start: offset(range.startContainer, range.startOffset),
    end: offset(range.endContainer, range.endOffset),
    revision,
  }
}
