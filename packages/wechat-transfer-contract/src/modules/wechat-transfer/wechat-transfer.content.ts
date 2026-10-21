import { z } from 'zod'
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5'
import { errors, TransferError } from './wechat-transfer.schema.ts'
import { inlineDeclarations, inspectWechatHtml } from './wechat-content-rules.ts'
export { inspectWechatHtml, wechatHtmlDiagnosticSchema } from './wechat-content-rules.ts'
export type { WechatHtmlDiagnostic } from './wechat-content-rules.ts'

// Web output policy. The extension treats this label as opaque transport metadata.
export const profile = 'wechat-editor-text@1-candidate' as const
export const articleTitleSchema = z
  .string()
  .trim()
  .min(1)
  .refine(function titleLength(value) {
    return [...value].length <= 64
  }, '标题不能超过64个字符')

const tags = new Set(
  'section p span br strong em h1 h2 h3 h4 h5 h6 blockquote ul ol li pre code table thead tbody tr th td a hr s'.split(
    ' ',
  ),
)
const attributes = new Set(['style', 'href', 'start', 'width', 'height'])
// Values are validated too: no URL, escapes, comments, at-rules or executable CSS.
const properties = new Set(
  'color background background-color font-size font-family font-weight font-style line-height letter-spacing text-align text-decoration white-space word-break word-wrap overflow-wrap padding padding-top padding-right padding-bottom padding-left margin margin-top margin-right margin-bottom margin-left border border-top border-right border-bottom border-left border-color border-width border-style border-radius border-collapse border-spacing table-layout width min-width max-width height min-height max-height display vertical-align box-sizing opacity position top right bottom left transform flex flex-shrink align-items justify-content gap overflow text-indent'.split(
    ' ',
  ),
)
// Project safety profile, not an official WeChat CSS whitelist.
for (const property of [
  'box-shadow',
  'background-image',
  'list-style',
  'border-image',
  'caret-color',
  'overflow-x',
  'overflow-y',
])
  properties.add(property)
export function validateTextHtml(html: string): void {
  const tree = parseFragment(html)
  function visit(node: DefaultTreeAdapterMap['node']): void {
    if ('tagName' in node) {
      if (node.tagName === 'img' || node.tagName === 'svg' || node.tagName === 'video')
        throw new TransferError(
          errors.IMAGE_UNSUPPORTED,
          '这篇文章含图片，请使用“复制到公众号”，在后台粘贴并检查图片',
        )
      if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !tags.has(node.tagName))
        throw new TransferError(errors.PAYLOAD_INVALID, '文章包含不支持的HTML结构')
      for (const attr of node.attrs) {
        if (!attributes.has(attr.name) || attr.namespace)
          throw new TransferError(errors.PAYLOAD_INVALID, '文章包含不支持的HTML属性')
        if (attr.name === 'href' && !/^https:\/\/mp\.weixin\.qq\.com\//i.test(attr.value))
          throw new TransferError(errors.PAYLOAD_INVALID, '文章链接不符合文字传稿规则')
        if (attr.name === 'style') {
          if (/url\s*\(|(?:-webkit-)?image-set\s*\(|(?:cross-fade|image)\s*\(/i.test(attr.value))
            throw new TransferError(errors.IMAGE_UNSUPPORTED, '排版包含图片，请使用“复制到公众号”')
          if (
            /[\\@<>]|\/\*|expression\s*\(|var\s*\(|attr\s*\(/i.test(attr.value) ||
            [...attr.value].some(function control(value) {
              return value.charCodeAt(0) < 32
            })
          )
            throw new TransferError(errors.PAYLOAD_INVALID, '文章包含不支持的样式')
          const declarations = inlineDeclarations(attr.value)
          if (!declarations)
            throw new TransferError(
              errors.PAYLOAD_INVALID,
              `传稿安全校验：<${node.tagName}>的样式声明格式不合法`,
            )
          for (const declaration of declarations) {
            if (!properties.has(declaration.property))
              throw new TransferError(
                errors.PAYLOAD_INVALID,
                `传稿安全规则不允许样式属性：${declaration.property}（<${node.tagName}>）`,
              )
            if (
              declaration.property === 'border-image' &&
              declaration.value.toLowerCase() !== 'none'
            )
              throw new TransferError(
                errors.PAYLOAD_INVALID,
                '文字传稿仅允许border-image:none，请使用普通边框',
              )
            if (
              declaration.property === 'background-image' &&
              declaration.value.toLowerCase() !== 'none' &&
              !/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(declaration.value)
            )
              throw new TransferError(
                errors.PAYLOAD_INVALID,
                '文字传稿的background-image仅允许无资源的CSS渐变或none',
              )
          }
        }
        if (
          ['start', 'width', 'height'].includes(attr.name) &&
          !/^\d{1,6}(?:px|%)?$/.test(attr.value)
        )
          throw new TransferError(errors.PAYLOAD_INVALID, '文章尺寸属性不合法')
      }
    }
    if ('childNodes' in node) for (const child of node.childNodes) visit(child)
  }
  visit(tree)
  if (!htmlVisibleText(html)) throw new TransferError(errors.PAYLOAD_INVALID, '正文为空，无法传稿')
  const violation = inspectWechatHtml(html).find(function blocking(diagnostic) {
    return diagnostic.level === 'error'
  })
  if (violation) throw new TransferError(errors.PAYLOAD_INVALID, violation.message)
}
export function htmlVisibleText(html: string): string {
  let text = ''
  function visit(node: DefaultTreeAdapterMap['node']): void {
    if ('value' in node && node.nodeName === '#text') text += node.value
    if ('childNodes' in node) for (const child of node.childNodes) visit(child)
  }
  visit(parseFragment(html))
  return text.replace(/[\s\u200b\ufeff]+/g, '')
}
