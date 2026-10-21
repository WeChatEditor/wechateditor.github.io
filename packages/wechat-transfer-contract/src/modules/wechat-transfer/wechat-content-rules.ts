import { z } from 'zod'
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5'

export const wechatHtmlDiagnosticSchema = z.strictObject({
  rule: z.string(),
  level: z.enum(['error', 'warning']),
  message: z.string(),
})
export type WechatHtmlDiagnostic = z.infer<typeof wechatHtmlDiagnosticSchema>
type Node = DefaultTreeAdapterMap['node']
type Element = DefaultTreeAdapterMap['element']

// Split declarations outside quoted strings and functions; a font name may contain a semicolon.
export function inlineDeclarations(
  style: string,
): { property: string; value: string; important: boolean }[] | undefined {
  const parts: string[] = []
  let start = 0
  let quote = ''
  let depth = 0
  for (let index = 0; index < style.length; index++) {
    const char = style[index]
    if (char === '\\') {
      index++
    } else if (quote) {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '(') {
      depth++
    } else if (char === ')') {
      if (--depth < 0) return
    } else if (char === ';' && depth === 0) {
      parts.push(style.slice(start, index))
      start = index + 1
    }
  }
  if (quote || depth) return
  parts.push(style.slice(start))
  const result = []
  for (const part of parts) {
    if (!part.trim()) continue
    const colon = part.indexOf(':')
    const property = part.slice(0, colon).trim().toLowerCase()
    const important = /!\s*important\s*$/i.test(part)
    const value = part
      .slice(colon + 1)
      .replace(/!\s*important\s*$/i, '')
      .trim()
    if (colon < 1 || !/^-?[a-z][a-z\d-]*$/.test(property) || !value) return
    result.push({ property, value, important })
  }
  return result
}

function styles(element: Element): Map<string, string> {
  const declarations = inlineDeclarations(attribute(element, 'style') || '') || []
  const result = new Map<string, string>()
  const important = new Set<string>()
  for (const declaration of declarations) {
    if (important.has(declaration.property) && !declaration.important) continue
    result.set(declaration.property, declaration.value.toLowerCase())
    if (declaration.important) important.add(declaration.property)
  }
  return result
}

function attribute(element: Element, name: string): string | undefined {
  return element.attrs.find(function named(attr) {
    return attr.name === name
  })?.value
}

function textContent(node: Node): string {
  if (node.nodeName === '#text' && 'value' in node) return node.value
  if ('tagName' in node && ['script', 'style'].includes(node.tagName)) return ''
  return 'childNodes' in node ? node.childNodes.map(textContent).join('') : ''
}

function transparentColor(value: string): boolean {
  if (value === 'transparent' || /^#[\da-f]{3}0$|^#[\da-f]{6}00$/i.test(value)) return true
  if (!/^(?:rgba?|hsla?)\(/i.test(value)) return false
  const alpha = value.includes('/')
    ? value.slice(value.lastIndexOf('/') + 1, -1).trim()
    : value.split(',').length === 4
      ? value.slice(value.lastIndexOf(',') + 1, -1).trim()
      : undefined
  return alpha !== undefined && /^0(?:\.0+)?%?$/.test(alpha)
}

function zeroLength(value: string): boolean {
  return /^[+-]?0(?:\.0+)?(?:[a-z]+)?$/.test(value)
}

function fixedLength(value: string): boolean {
  return /^\d*\.?\d+(?:px|pt|pc|in|cm|mm|q)$/.test(value) && !zeroLength(value)
}

const blocks = new Set(
  'section div p h1 h2 h3 h4 h5 h6 blockquote ul ol li pre table thead tbody tr th td hr'.split(
    ' ',
  ),
)

function containsBlock(node: Node): boolean {
  return (
    'childNodes' in node &&
    node.childNodes.some(function block(child) {
      return ('tagName' in child && blocks.has(child.tagName)) || containsBlock(child)
    })
  )
}

function redundant(element: Element): boolean {
  const parent = element.parentNode
  if (!parent || !('tagName' in parent) || parent.tagName !== element.tagName) return false
  if (
    [element, parent].some(function hasInformation(node) {
      return node.attrs.some(function otherAttribute(attr) {
        return attr.name !== 'style'
      })
    })
  )
    return false
  const children = parent.childNodes.filter(function meaningful(node) {
    return node.nodeName !== '#comment' && (node.nodeName !== '#text' || textContent(node).trim())
  })
  function signature(node: Element): string {
    return JSON.stringify([...styles(node)].sort(([a], [b]) => a.localeCompare(b)))
  }
  return (
    children.length === 1 && children[0] === element && signature(parent) === signature(element)
  )
}

// Official recommendations are warnings. Layout-dependent risks are never reported as measured failures.
// Source: wechatjs/verify-article-structure-spec, verify_article_structure.md @ ab0a16a0 (2026-10-19).
export function inspectWechatHtml(html: string): WechatHtmlDiagnostic[] {
  const diagnostics: WechatHtmlDiagnostic[] = []
  const reported = new Set<string>()
  function report(rule: string, level: 'error' | 'warning', message: string): void {
    if (reported.has(rule)) return
    reported.add(rule)
    diagnostics.push({ rule, level, message })
  }
  function visit(node: Node, depth: number, svg = false): void {
    if ('tagName' in node) {
      svg ||=
        node.tagName === 'svg' ||
        (attribute(node, 'data-role') === 'absolute-layout' &&
          attribute(node, 'data-mode') === 'svg')
      const css = styles(node)
      const text = textContent(node).replace(/[\s\u200b\ufeff]+/g, '')
      const tag = `<${node.tagName}>`
      const heightBox =
        blocks.has(node.tagName) ||
        ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid'].includes(
          css.get('display') || '',
        )
      if (transparentColor(css.get('caret-color') || ''))
        report('wechat-caret-color', 'error', `微信规范1.2：${tag}不能使用完全透明的输入光标。`)
      if (['start', 'end'].includes(css.get('text-align') || ''))
        report(
          'wechat-text-align',
          'error',
          `微信规范1.6：${tag}请使用left/right/center替代text-align:start/end。`,
        )
      if (!svg && text && heightBox && zeroLength(css.get('height') || ''))
        report('wechat-height-zero', 'error', `微信规范1.5.1：${tag}包含文字，不能设置height:0。`)
      if (depth >= 15 && redundant(node))
        report(
          'wechat-redundant-nesting',
          'warning',
          `微信规范2.1：${tag}在第15层及更深处存在重复嵌套，平台可能精简结构。`,
        )
      if (node.tagName === 'span' && containsBlock(node))
        report('wechat-inline-block', 'error', '文章行内结构错误：<span>内部不能包含块级元素。')
      if (
        text &&
        /(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(
          `${css.get('background-image')} ${css.get('background')}`,
        )
      )
        report(
          'wechat-text-bg-gradient',
          'warning',
          '微信规范4.1.2：文字背景建议使用纯色；渐变在深色模式会被混合为纯色，请检查可读性。',
        )
      if (css.has('font-family'))
        report(
          'wechat-font-family',
          'warning',
          '微信规范3：建议沿用公众号默认字体；自定义font-family需核对手机和电脑的字形、字号及间距。',
        )
      if (inlineDeclarations(attribute(node, 'style') || '')?.some((entry) => entry.important))
        report(
          'wechat-important',
          'warning',
          '微信规范4.5.2：不建议使用!important，可能影响平台公共样式和深色模式转换。',
        )
      if (!svg && text) {
        const lineHeight = css.get('line-height') || ''
        const fontSize = css.get('font-size') || ''
        if (
          (/^\d*\.?\d+(?:em|%)?$/.test(lineHeight) &&
            Number.parseFloat(lineHeight) < (lineHeight.endsWith('%') ? 100 : 1)) ||
          (lineHeight.endsWith('px') &&
            fontSize.endsWith('px') &&
            Number.parseFloat(lineHeight) < Number.parseFloat(fontSize))
        )
          report(
            'wechat-line-height',
            'warning',
            `微信规范1.3：${tag}行高较小，多行时可能叠字；单行及无文字装饰不因此阻断，请检查实际换行。`,
          )
        if (blocks.has(node.tagName) && fixedLength(css.get('width') || ''))
          report(
            'wechat-fixed-width',
            'warning',
            `微信规范1.4：${tag}文字容器使用固定宽度，请在手机与电脑核对居中、宽度比例和水平溢出。`,
          )
        const scrollable = ['overflow', 'overflow-y'].some((property) =>
          /^(auto|scroll)$/.test(css.get(property) || ''),
        )
        if (fixedLength(css.get('height') || '') && !scrollable)
          report(
            'wechat-fixed-height',
            'warning',
            `微信规范1.5.2：${tag}文字容器使用固定高度，请检查内容是否被裁剪。`,
          )
        if (
          ['absolute', 'fixed'].includes(css.get('position') || '') ||
          (css.has('transform') && css.get('transform') !== 'none')
        )
          report(
            'wechat-visual-order',
            'warning',
            `微信规范4.2.2：${tag}文字使用定位或变形，请确认视觉顺序、DOM顺序及背景从属关系一致。`,
          )
        if (
          node.tagName === 'pre' &&
          !['pre-wrap', 'break-spaces', 'normal', 'pre-line'].includes(
            css.get('white-space') || '',
          ) &&
          !['overflow', 'overflow-x'].some((property) =>
            /^(auto|scroll)$/.test(css.get(property) || ''),
          )
        )
          report(
            'wechat-pre-wrap',
            'warning',
            '微信规范1.8：<pre>应提供自动换行或横向滚动；请在窄屏核对长行是否被截断。',
          )
      }
    }
    if ('childNodes' in node)
      for (const child of node.childNodes) visit(child, 'tagName' in child ? depth + 1 : depth, svg)
  }
  visit(parseFragment(html), -1)
  return diagnostics
}
