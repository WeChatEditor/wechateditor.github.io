import assert from 'node:assert/strict'
import { test } from 'node:test'
import { errors, TransferError } from '../src/modules/wechat-transfer/wechat-transfer.schema.ts'
import {
  inspectWechatHtml,
  validateTextHtml,
  wechatHtmlDiagnosticSchema,
  articleTitleSchema,
} from '../src/modules/wechat-transfer/wechat-transfer.content.ts'

// Regression sample uses Chrome-serialized styles from the reported article, without user content.
const serializedArticle = `<section style="font-size:16px;line-height:30.4px;">
  <section style="box-shadow:rgba(231,202,193,0.333) 0px 4px 16px;"><h1>封面</h1></section>
  <hr style="border-width:1px 0px 0px;border-style:solid none none;border-color:rgb(176,68,50) currentcolor currentcolor;border-image:none;margin:28px 0px;">
  <pre style="border-width:2px 1px 1px;border-style:solid;border-image:none;white-space:pre-wrap;overflow-wrap:anywhere;"><code>代码\n缩进</code></pre>
  <section style="background-image:linear-gradient(rgb(247,240,233),rgb(255,255,255));">
    <ul style="list-style:none;"><li style="list-style:none;display:flex;"><span>✓</span><section>总结</section></li></ul>
  </section>
</section>`

test('Chrome-serialized cover, separator, code and summary pass the shared text profile', function () {
  assert.doesNotThrow(function serialized() {
    validateTextHtml(serializedArticle)
  })
  const diagnostics = inspectWechatHtml(serializedArticle)
  assert.deepEqual(
    diagnostics.map((item) => item.rule),
    ['wechat-text-bg-gradient'],
  )
  for (const diagnostic of diagnostics) wechatHtmlDiagnosticSchema.parse(diagnostic)
})

test('gradient backgrounds are recommendations with a text-free exception', function () {
  for (const property of ['background', 'background-image']) {
    const style = `${property}:linear-gradient(#ffffff,#eeeeee)`
    assert.equal(inspectWechatHtml(`<section style="${style}"><br></section>`).length, 0)
    const diagnostic = inspectWechatHtml(`<section style="${style}"><p>文字</p></section>`)[0]
    assert.equal(diagnostic.rule, 'wechat-text-bg-gradient')
    assert.equal(diagnostic.level, 'warning')
    assert.doesNotThrow(function recommended() {
      validateTextHtml(`<section style="${style}">文字</section>`)
    })
  }
  assert.deepEqual(
    inspectWechatHtml('<section style="background-color:#f7f0e9">总结</section>'),
    [],
  )
})

test('new style support preserves media and executable-CSS rejection', function () {
  for (const property of ['background-image', 'list-style', 'border-image', 'box-shadow'])
    assert.throws(
      function media() {
        validateTextHtml(`<p style="${property}:&#117;rl(https://example.com/a.png)">正文</p>`)
      },
      function image(error: unknown) {
        return error instanceof TransferError && error.code === errors.IMAGE_UNSUPPORTED
      },
    )
  for (const style of [
    'box-shadow:var(--shadow)',
    'list-style:expression(alert(1))',
    'border-image:linear-gradient(red,blue) 1',
  ])
    assert.throws(function unsafe() {
      validateTextHtml(`<p style="${style}">正文</p>`)
    }, TransferError)
  for (const value of [
    'image("https://example.com/a.png")',
    '-webkit-image-set(url(a.png) 1x)',
    'cross-fade(url(a.png),url(b.png),50%)',
  ])
    assert.throws(function resource() {
      validateTextHtml(`<p style='background-image:${value}'>正文</p>`)
    }, TransferError)
  assert.throws(function paint() {
    validateTextHtml('<p style="background-image:paint(custom)">正文</p>')
  }, TransferError)
  assert.throws(function unknownProperty() {
    validateTextHtml('<p style="unknown-property:value">正文</p>')
  }, /unknown-property.*<p>/)
})

test('declaration parsing handles quoted semicolons without hiding unsafe properties', function () {
  validateTextHtml('<p style="font-family:&#39;A;B&#39;,serif;color:#333">正文</p>')
  for (const style of [
    'color',
    'color:',
    'color:rgb(1,2,3',
    'color:red);',
    'color:red;unknown-property:value',
  ])
    assert.throws(function malformed() {
      validateTextHtml(`<p style="${style}">正文</p>`)
    }, TransferError)
})

test('official definite text violations block with a useful rule and element', function () {
  for (const color of ['transparent', 'rgba(0,0,0,0)', 'rgb(0 0 0 / 0%)', '#1230', '#12345600'])
    assert.throws(function invisibleCaret() {
      validateTextHtml(`<p style="caret-color:${color}">正文</p>`)
    }, /1\.2.*<p>/)
  validateTextHtml('<p style="caret-color:rgb(0,0,0)">正文</p>')
  for (const style of ['text-align:start', 'text-align:end', 'height:0', 'height:0.0px'])
    assert.throws(function definite() {
      validateTextHtml(`<section style="${style}"><p>正文</p></section>`)
    }, TransferError)
  assert.throws(function invalidInlineStructure() {
    validateTextHtml('<section><span><section>正文</section></span></section>')
  }, /<span>/)
})

test('decorations, single-line risks and scrolling are not mistaken for measured failures', function () {
  validateTextHtml('<section><span style="height:0;line-height:0"></span><p>正文</p></section>')
  validateTextHtml('<p style="line-height:0">单行</p>')
  validateTextHtml('<p><span style="height:0">行内文字</span></p>')
  validateTextHtml('<section style="height:0%">父高度不确定时不能判定为零高度</section>')
  assert.throws(function inlineBox() {
    validateTextHtml('<span style="display:inline-block;height:0">文字</span>')
  }, /1\.5\.1/)
  assert.equal(inspectWechatHtml('<p style="line-height:0">单行</p>')[0].level, 'warning')
  assert.deepEqual(inspectWechatHtml('<section style="line-height:0;height:0"><br></section>'), [])
  assert.equal(
    inspectWechatHtml('<pre style="white-space:pre-wrap"><code>代码</code></pre>').length,
    0,
  )
  assert.equal(inspectWechatHtml('<pre style="overflow-x:auto"><code>代码</code></pre>').length, 0)
  assert.equal(inspectWechatHtml('<pre>普通文字</pre>')[0].rule, 'wechat-pre-wrap')
  const risks = inspectWechatHtml(
    '<section style="width:500px;height:1px;overflow:hidden;font-size:16px;line-height:1px">文字</section>',
  )
  assert.deepEqual(
    new Set(risks.map((item) => item.rule)),
    new Set(['wechat-fixed-width', 'wechat-fixed-height', 'wechat-line-height']),
  )
  assert.ok(risks.every((item) => item.level === 'warning'))
  assert.equal(
    inspectWechatHtml('<section style="height:100px;overflow-y:auto">文字</section>').length,
    0,
  )
})

test('font and important recommendations are deduplicated and honor the CSS cascade', function () {
  const html =
    '<section style="font-family:serif;text-align:center!important;text-align:start"><p style="font-family:sans-serif;color:red!important">文字</p></section>'
  const diagnostics = inspectWechatHtml(html)
  assert.deepEqual(
    new Set(diagnostics.map((item) => item.rule)),
    new Set(['wechat-font-family', 'wechat-important']),
  )
  assert.equal(diagnostics.length, 2)
  assert.doesNotThrow(function recommendations() {
    validateTextHtml(html)
  })
})

test('redundant nesting follows the current authoritative threshold without a universal depth ban', function () {
  function nested(count: number, unique = false): string {
    return (
      Array.from(
        { length: count },
        (_, i) => `<section${unique ? ` style="padding-left:${i}px"` : ''}>`,
      ).join('') +
      '正文' +
      '</section>'.repeat(count)
    )
  }
  assert.equal(inspectWechatHtml(nested(15)).length, 0)
  assert.equal(inspectWechatHtml(nested(16))[0].rule, 'wechat-redundant-nesting')
  assert.equal(inspectWechatHtml(nested(20, true)).length, 0)
})

test('Web title policy retains Unicode, trimming and the current product limit', function () {
  assert.equal(articleTitleSchema.parse(' ' + '😀'.repeat(64) + ' '), '😀'.repeat(64))
  assert.equal(articleTitleSchema.safeParse('😀'.repeat(65)).success, false)
  assert.equal(articleTitleSchema.safeParse('  ').success, false)
})
