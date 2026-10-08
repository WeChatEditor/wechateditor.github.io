import DOMPurify from 'dompurify'
import { renderMarkdown } from '../article/article.service'
import { styleArticle } from '../typesetting/typesetting.service'
import { renderEnding, renderOpening } from '../ending/ending.service'
import { prepareExportImages, resolvePreviewImages } from '../assets/assets.service'
import type { ExportSnapshot, ExportResult, Diagnostic } from './wechat-export.model'

const tags = [
  'section',
  'p',
  'span',
  'br',
  'strong',
  'em',
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'ul',
  'ol',
  'li',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'a',
  'hr',
  's',
]

function articleDom(snapshot: ExportSnapshot): HTMLElement {
  const root = document.createElement('section')
  root.innerHTML = renderMarkdown(snapshot.article.markdown, snapshot.article.annotations).html
  styleArticle(root, snapshot.config)
  const openingHtml = renderOpening(snapshot.ending)
  if (openingHtml) {
    const opening = document.createElement('section')
    opening.dataset.opening = 'true'
    opening.innerHTML = openingHtml
    styleArticle(opening, snapshot.config, false)
    root.prepend(opening)
  }
  const endingHtml = renderEnding(snapshot.ending)
  if (endingHtml) {
    const ending = document.createElement('section')
    ending.dataset.ending = 'true'
    ending.innerHTML = endingHtml
    styleArticle(ending, snapshot.config, false)
    root.append(ending)
  }
  return root
}

export function previewArticle(
  snapshot: ExportSnapshot,
  urls: Map<string, string>,
): { html: string; diagnostics: Diagnostic[] } {
  const root = articleDom(snapshot)
  const diagnostics = resolvePreviewImages(root, urls).map((d) => ({
    rule: 'image-source',
    level: 'warning' as const,
    message: d.message,
  }))
  const html = DOMPurify.sanitize(root.outerHTML, {
    ALLOWED_TAGS: tags,
    ALLOWED_ATTR: [
      'style',
      'href',
      'src',
      'alt',
      'start',
      'target',
      'rel',
      'loading',
      'referrerpolicy',
    ],
    ALLOW_DATA_ATTR: true,
    ALLOWED_URI_REGEXP: /^(?:https?:\/\/|blob:https?:\/\/)/i,
  })
  return { html, diagnostics }
}

function readableText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement
  for (const decoration of clone.querySelectorAll('[data-decoration]')) {
    decoration.remove()
  }
  for (const item of clone.querySelectorAll('li')) {
    const parent = item.parentElement
    const position = parent ? [...parent.children].indexOf(item) : 0
    const marker =
      parent?.tagName === 'OL'
        ? `${Number(parent.getAttribute('start') || '1') + position}. `
        : '• '
    item.prepend(marker)
  }
  for (const br of clone.querySelectorAll('br')) {
    br.replaceWith('\n')
  }
  for (const block of clone.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li,pre,blockquote,tr,hr')) {
    block.append('\n')
  }
  for (const cell of clone.querySelectorAll('td,th')) {
    cell.append('\t')
  }
  for (const image of clone.querySelectorAll('img')) {
    image.replaceWith(image.alt ? `［${image.alt}］` : '［图片］')
  }
  return (clone.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

export async function exportArticle(snapshot: ExportSnapshot): Promise<ExportResult> {
  const root = articleDom(snapshot)
  const diagnostics: Diagnostic[] = []
  const images = await prepareExportImages(root, snapshot.assets)
  diagnostics.push(
    ...images.map((d) => ({ rule: 'image-export', level: 'error' as const, message: d.message })),
  )
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a')) {
    const url = link.getAttribute('href') || ''
    if (!/^https:\/\/mp\.weixin\.qq\.com\//i.test(url)) {
      const span = document.createElement('span')
      span.style.cssText = link.style.cssText
      span.append(...link.childNodes)
      if (url && span.textContent !== url) {
        span.append(`（${url}）`)
      }
      link.replaceWith(span)
      if (url) {
        diagnostics.push({
          rule: 'external-link',
          level: 'warning',
          message: '站外链接已转为可见网址；公众号后台可按账号能力重新添加链接。',
        })
      }
    }
  }
  if (root.querySelector('table')) {
    diagnostics.push({
      rule: 'table-candidate',
      level: 'warning',
      message: '表格已设为换行显示，请在公众号后台检查长单元格和列宽。',
    })
  }
  if (snapshot.config.font !== 'default') {
    diagnostics.push({
      rule: 'font-candidate',
      level: 'warning',
      message: '自定义字体取决于阅读设备，粘贴后请核对显示。',
    })
  }
  if (root.querySelector('img')) {
    diagnostics.push({
      rule: 'image-hosting',
      level: 'warning',
      message: '图片已转换为剪贴板内容；请确认公众号接收并保存后仍可显示。',
    })
  }
  const plainText = readableText(root)
  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const attr of [...element.attributes]) {
      if (
        !['style', 'href', 'src', 'alt', 'start', 'data-w', 'width', 'height'].includes(attr.name)
      ) {
        element.removeAttribute(attr.name)
      }
    }
  }
  const html = DOMPurify.sanitize(root.outerHTML, {
    ALLOWED_TAGS: tags,
    ALLOWED_ATTR: ['style', 'href', 'src', 'alt', 'start', 'data-w', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  })
  const bytes = new TextEncoder().encode(html).length
  if (bytes > 20 * 1024 * 1024) {
    diagnostics.push({
      rule: 'clipboard-size',
      level: 'error',
      message: '内容超过应用的 20 MB 复制保护上限，请减少图片或拆分文章。',
    })
  }
  return {
    html,
    plainText,
    revision: snapshot.article.revision,
    profile: 'wechat-clipboard@0.1-candidate',
    diagnostics,
    bytes,
  }
}

export async function copyRichText(result: ExportResult): Promise<void> {
  if (result.diagnostics.some((d) => d.level === 'error')) {
    throw new Error('请先处理图片或内容问题，再复制。')
  }
  if (
    !window.isSecureContext ||
    !navigator.clipboard?.write ||
    typeof ClipboardItem === 'undefined'
  ) {
    throw new Error('富文本复制需要 HTTPS 或本机 localhost，以及支持剪贴板的桌面浏览器。')
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([result.html], { type: 'text/html' }),
      'text/plain': new Blob([result.plainText], { type: 'text/plain' }),
    }),
  ])
}
