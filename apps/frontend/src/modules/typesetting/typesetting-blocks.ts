import type { TypesettingConfig } from './typesetting.model'

const blockTags = new Set([
  'P',
  'SECTION',
  'UL',
  'OL',
  'BLOCKQUOTE',
  'PRE',
  'TABLE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
])

function preserveHeadingWeight(root: HTMLElement): void {
  for (const heading of root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')) {
    const weight = document.createElement('strong')
    weight.style.cssText = 'color:inherit;font-size:inherit;line-height:inherit;'
    weight.style.fontWeight = heading.style.fontWeight || '700'
    weight.append(...heading.childNodes)
    heading.append(weight)
  }
}

function preserveTextWeight(root: HTMLElement): void {
  for (const text of root.querySelectorAll<HTMLElement>('[data-text-start]')) {
    let parent = text.parentElement
    while (parent && parent !== root) {
      if (parent.style.fontWeight && parent.style.fontWeight !== 'inherit') break
      parent = parent.parentElement
    }
    const inherited = parent?.style.fontWeight || '400'
    text.style.fontWeight =
      inherited === 'bold' ? '700' : inherited === 'normal' ? '400' : inherited
    text.style.fontSize = 'inherit'
    text.style.lineHeight = 'inherit'
  }
}

function preserveCodeLines(code: HTMLElement): void {
  const source = code.textContent || ''
  code.replaceChildren()
  for (const [index, line] of source.split('\n').entries()) {
    if (index) code.append(document.createElement('br'))
    const pieces = line.split(/([ \t]+)/)
    for (const piece of pieces) {
      if (!piece) continue
      if (/^[ \t]+$/.test(piece)) {
        const space = document.createElement('span')
        space.dataset.codeSpace = piece
        space.textContent = piece.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0'.repeat(4))
        code.append(space)
      } else {
        code.append(piece)
      }
    }
  }
}

function styleCodeWindows(root: HTMLElement, config: TypesettingConfig): void {
  for (const pre of root.querySelectorAll<HTMLElement>('pre')) {
    const window = document.createElement('section')
    window.style.cssText = pre.style.cssText
    window.style.padding = '0'
    window.style.maxWidth = '100%'
    window.style.boxSizing = 'border-box'
    const toolbar = document.createElement('section')
    toolbar.dataset.decoration = 'true'
    toolbar.style.cssText =
      'display:block;padding:12px 16px 10px;margin:0;text-align:left;font-size:0;line-height:16px;letter-spacing:0;'
    for (const color of ['#ff5f57', '#febc2e', '#28c840']) {
      const dot = document.createElement('span')
      dot.textContent = '●'
      dot.style.cssText = `display:inline-block;margin-right:6px;color:${color};font-family:Arial,sans-serif;font-size:16px;font-weight:normal;line-height:16px;vertical-align:middle;`
      toolbar.append(dot)
    }
    const code = pre.querySelector('code')
    if (code) {
      preserveCodeLines(code)
      code.style.fontFamily = 'Consolas,Menlo,monospace'
      code.style.whiteSpace = 'normal'
      code.style.fontWeight = '400'
    }
    const language = [...(code?.classList || [])].find((name) => name.startsWith('language-'))
    if (language) {
      const label = document.createElement('span')
      label.textContent = language.slice('language-'.length)
      label.style.cssText = `margin-left:6px;color:${config.colors.muted};font-family:monospace;font-size:11px;font-weight:normal;line-height:16px;vertical-align:middle;`
      toolbar.append(label)
    }
    pre.style.margin = '0'
    pre.style.border = '0'
    pre.style.borderRadius = '0'
    pre.style.padding = '0 16px 16px'
    pre.style.fontWeight = 'normal'
    pre.style.whiteSpace = 'normal'
    pre.style.letterSpacing = '0'
    pre.style.boxSizing = 'border-box'
    pre.before(window)
    window.append(toolbar, pre)
  }
}

function centerTables(root: HTMLElement): void {
  for (const table of root.querySelectorAll<HTMLElement>('table')) {
    const frame = document.createElement('section')
    frame.style.cssText = 'max-width:100%;margin:20px 0;padding:0;text-align:center;'
    table.style.margin = '0 auto'
    table.style.maxWidth = '100%'
    table.before(frame)
    frame.append(table)
    for (const cell of table.querySelectorAll<HTMLElement>('th,td')) {
      const paragraph = document.createElement('p')
      paragraph.style.cssText = `margin:0;padding:0;text-align:${cell.style.textAlign || 'center'};font-size:inherit;line-height:inherit;font-weight:inherit;`
      paragraph.append(...cell.childNodes)
      if (cell.tagName === 'TH') {
        const weight = document.createElement('strong')
        weight.style.cssText = 'font-weight:inherit;color:inherit;'
        weight.append(...paragraph.childNodes)
        paragraph.append(weight)
      }
      cell.style.verticalAlign = 'middle'
      cell.append(paragraph)
    }
  }
}

function listParagraphs(item: HTMLElement, lineHeight: number): HTMLElement {
  const content = document.createElement('section')
  content.style.cssText = 'min-width:0;overflow-wrap:anywhere;'
  let inline: Node[] = []
  function flushInline(): void {
    if (
      inline.some(
        (node) => node.textContent?.trim() || (node instanceof Element && node.matches('br,img')),
      )
    ) {
      const paragraph = document.createElement('p')
      paragraph.append(...inline)
      content.append(paragraph)
    }
    inline = []
  }
  for (const node of [...item.childNodes]) {
    if (node instanceof HTMLElement && blockTags.has(node.tagName)) {
      flushInline()
      content.append(node)
    } else {
      inline.push(node)
    }
  }
  flushInline()
  for (const paragraph of content.querySelectorAll<HTMLElement>(':scope > p')) {
    paragraph.style.cssText = `margin:0 0 6px;padding:0;font-size:inherit;line-height:${lineHeight}px;text-align:left;`
  }
  if (content.firstElementChild?.tagName !== 'P') {
    const paragraph = document.createElement('p')
    paragraph.style.cssText = `margin:0;padding:0;line-height:${lineHeight}px;text-align:left;`
    content.prepend(paragraph)
  }
  const last = content.lastElementChild as HTMLElement | null
  if (last) last.style.marginBottom = '0'
  return content
}

function replaceList(list: HTMLElement, config: TypesettingConfig): void {
  const summary = list.parentElement?.dataset.card === 'summary'
  const nested = list.parentElement?.tagName === 'LI'
  const container = document.createElement('section')
  container.dataset.list = list.tagName.toLowerCase()
  container.setAttribute('role', 'list')
  if (list.dataset.sourceLine !== undefined) container.dataset.sourceLine = list.dataset.sourceLine
  container.style.cssText = `margin:${summary ? '8px 0 0' : nested ? '6px 0 0' : '16px 0'};padding:0;text-align:left;`
  const start = Number(list.getAttribute('start') || '1')
  const lineHeight =
    config.fontSize * (summary ? Math.min(config.lineHeight, 1.65) : config.lineHeight)
  const items = [...list.children].filter(
    (item): item is HTMLElement => item instanceof HTMLElement && item.tagName === 'LI',
  )
  for (const [index, original] of items.entries()) {
    const item = document.createElement('section')
    item.setAttribute('role', 'listitem')
    item.style.cssText = original.style.cssText
    item.style.display = 'block'
    item.style.margin = index === items.length - 1 ? '0' : '0 0 6px'
    if (original.dataset.sourceLine !== undefined)
      item.dataset.sourceLine = original.dataset.sourceLine
    const content = listParagraphs(original, lineHeight)
    const ordered = list.tagName === 'OL'
    const plainMarker = ordered ? `${start + index}. ` : '• '
    const gutter = Math.max(
      summary ? 1.9 : 1.5,
      ordered ? String(start + index).length * 0.65 + 0.8 : 0,
    )
    content.style.paddingLeft = `${gutter}em`
    const first = content.firstElementChild as HTMLElement
    first.style.textIndent = `-${gutter}em`
    const marker = document.createElement('span')
    marker.dataset.decoration = 'true'
    marker.dataset.listMarker = plainMarker
    marker.style.cssText = `display:inline-block;min-width:${gutter}em;text-indent:0;font-weight:normal;text-align:left;`
    if (summary) {
      const badge = document.createElement('span')
      badge.textContent = ordered ? String(start + index) : '✓'
      badge.style.cssText = `display:inline-block;min-width:20px;padding:0 3px;box-sizing:border-box;text-align:center;border-radius:12px;background-color:${config.colors.accent};color:${list.dataset.markerInk};font-size:12px;line-height:20px;font-weight:bold;`
      marker.append(badge)
    } else {
      marker.textContent = plainMarker.replace(/ $/, '\u00a0')
    }
    first.prepend(marker)
    item.append(content)
    container.append(item)
  }
  list.replaceWith(container)
}

export function styleCompatibleBlocks(root: HTMLElement, config: TypesettingConfig): void {
  preserveHeadingWeight(root)
  styleCodeWindows(root, config)
  centerTables(root)
  // Children first: retain the original parent when deciding nested/summary layout.
  for (const list of [...root.querySelectorAll<HTMLElement>('ul,ol')].reverse()) {
    replaceList(list, config)
  }
  preserveTextWeight(root)
}
