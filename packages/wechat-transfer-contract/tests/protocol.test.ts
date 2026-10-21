import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  allowedSource,
  assertMessageSize,
  contentDigest,
  errors,
  externalRequestSchema,
  extensionId,
  developmentExtensionId,
  extensionStoreUrl,
  extensionIdForOrigin,
  htmlVisibleText,
  internalRequestSchema,
  maxMessageBytes,
  payloadSchema,
  profile,
  protocolVersion,
  articleResponseSchema,
  clipboardResponseSchema,
  contentRequestAllowed,
  connectionInfoSchema,
  titleSchema,
  TransferError,
  responseSchema,
  validateTextHtml,
} from '../src/modules/wechat-transfer/wechat-transfer.schema.ts'

test('published extension identity is used except on the two local development origins', function () {
  assert.equal(extensionId, 'neeljhohndegbhaaaclmcdeenlebhicj')
  assert.equal(extensionStoreUrl, `https://chromewebstore.google.com/detail/${extensionId}`)
  assert.notEqual(developmentExtensionId, extensionId)
  assert.equal(extensionIdForOrigin('http://127.0.0.1:5175'), developmentExtensionId)
  assert.equal(extensionIdForOrigin('http://127.0.0.1:4175'), developmentExtensionId)
  for (const origin of [
    'https://wechateditor.github.io',
    'https://wechateditor.github.io.evil',
    'https://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://localhost:5175',
    'http://127.0.0.1.evil:5175',
    'invalid',
  ])
    assert.equal(extensionIdForOrigin(origin), extensionId)
})

function payload() {
  return {
    sourceArticleId: crypto.randomUUID(),
    sourceRevision: 0,
    sourceGeneration: 3,
    createdAt: Date.now(),
    title: '测试标题',
    html: '<section><p style="color: rgb(2, 3, 4);">正文</p></section>',
    plainText: '正文',
    profile,
    digest: '0'.repeat(64),
  }
}
test('only explicit project path and development origins can connect', function () {
  assert.equal(allowedSource('https://tanghaojie.github.io/JLabWeChatEditor/'), false)
  assert.ok(allowedSource('https://wechateditor.github.io/'))
  assert.ok(allowedSource('https://wechateditor.github.io/index.html'))
  assert.equal(allowedSource('https://wechateditor.github.io/other/'), false)
  for (const url of [
    'https://tanghaojie.github.io/Other/',
    'https://tanghaojie.github.io/JLabWeChatEditor.evil/',
    'https://tanghaojie.github.io.evil/JLabWeChatEditor/',
    'http://tanghaojie.github.io/JLabWeChatEditor/',
    'http://127.0.0.1:5175/',
  ])
    assert.equal(allowedSource(url), false)
  assert.ok(allowedSource('http://127.0.0.1:5175/', ['http://127.0.0.1:5175']))
  assert.equal(allowedSource('http://127.0.0.1:5176/', ['http://127.0.0.1:5175']), false)
})
test('schemas reject unknown fields and external write commands', function () {
  const message = {
    protocolVersion,
    requestId: crypto.randomUUID(),
    kind: 'SUBMIT_TASK',
    payload: payload(),
  }
  assert.ok(externalRequestSchema.safeParse(message).success)
  assert.equal(externalRequestSchema.safeParse({ ...message, kind: 'START_INSERT' }).success, false)
  assert.equal(externalRequestSchema.safeParse({ ...message, arbitraryCode: 'x' }).success, false)
  assert.equal(payloadSchema.safeParse({ ...payload(), sourceGeneration: -1 }).success, false)
  assert.equal(
    internalRequestSchema.safeParse({ kind: 'CLEAR_STORAGE', inspected: false }).success,
    false,
  )
  for (const kind of ['GET_STATUS', 'CANCEL_TASK'])
    assert.equal(
      externalRequestSchema.safeParse({ protocolVersion, requestId: crypto.randomUUID(), kind })
        .success,
      false,
    )
  for (const kind of ['STATUS', 'START_INSERT', 'CANCEL_TASK', 'CLEAR_STORAGE'])
    assert.equal(internalRequestSchema.safeParse({ kind }).success, false)
  assert.ok(
    internalRequestSchema.safeParse({ kind: 'SELECT_TARGET', tabId: 3, account: '公众号' }).success,
  )
  assert.equal(
    internalRequestSchema.safeParse({ kind: 'SELECT_TARGET', tabId: -1, account: '' }).success,
    false,
  )
  assert.equal(externalRequestSchema.safeParse({ ...message, protocolVersion: 1 }).success, false)
})
test('connection probe carries no content or commands and returns only a version', function () {
  const probe = { protocolVersion, requestId: crypto.randomUUID(), kind: 'PING' }
  assert.ok(externalRequestSchema.safeParse(probe).success)
  for (const extra of [{ payload: payload() }, { tabId: 3 }, { start: true }])
    assert.equal(externalRequestSchema.safeParse({ ...probe, ...extra }).success, false)
  assert.ok(contentRequestAllowed(internalRequestSchema.parse({ kind: 'PING' })))
  assert.ok(contentRequestAllowed(internalRequestSchema.parse({ kind: 'OPEN_WECHAT' })))
  assert.ok(connectionInfoSchema.safeParse({ extensionVersion: '0.1.6' }).success)
  for (const extra of [{ article: null }, { phase: 'inserted' }, { account: '公众号' }])
    assert.equal(
      connectionInfoSchema.safeParse({ extensionVersion: '0.1.6', ...extra }).success,
      false,
    )
})
test('responses distinguish success and failure without mixed fields', function () {
  const envelope = { protocolVersion, requestId: crypto.randomUUID() }
  assert.ok(responseSchema.safeParse({ ...envelope, status: 0, data: { task: null } }).success)
  assert.ok(responseSchema.safeParse({ ...envelope, status: 4103, err: '无效内容' }).success)
  for (const response of [
    { ...envelope, status: 0, err: '失败' },
    { ...envelope, status: 4103 },
    { ...envelope, status: 4103, err: '失败', data: {} },
    { ...envelope, protocolVersion: 1, status: 0 },
  ])
    assert.equal(responseSchema.safeParse(response).success, false)
  assert.ok(
    articleResponseSchema.safeParse({ article: { title: '当前文章', receivedAt: Date.now() } })
      .success,
  )
  assert.equal(
    articleResponseSchema.safeParse({
      article: { title: '文章', receivedAt: Date.now(), phase: 'inserted' },
    }).success,
    false,
  )
})

test('autosave accepts a complete snapshot without execution or clipboard read commands', function () {
  const message = {
    protocolVersion,
    requestId: crypto.randomUUID(),
    kind: 'SAVE_ARTICLE',
    payload: payload(),
  }
  assert.ok(externalRequestSchema.safeParse(message).success)
  for (const invalid of [
    { ...message, payload: undefined },
    { ...message, payload: { ...message.payload, digest: '' } },
    { ...message, start: true },
    { ...message, payload: { ...message.payload, replaceTaskId: crypto.randomUUID() } },
  ])
    assert.equal(externalRequestSchema.safeParse(invalid).success, false)
  assert.equal(internalRequestSchema.safeParse(message).success, false)
})

test('title uses Unicode codepoints, trim, nonempty and 64 guard', function () {
  assert.equal(titleSchema.parse(` ${'😀'.repeat(64)} `), '😀'.repeat(64))
  assert.equal(titleSchema.safeParse('😀'.repeat(65)).success, false)
  assert.equal(titleSchema.safeParse('  ').success, false)
})

test('copy payload retains formatted text and is limited to the trusted panel', function () {
  const article = {
    title: '文章标题',
    receivedAt: Date.now(),
    html: '<section><p style="color:#247267"><strong>排版正文</strong></p></section>',
    plainText: '排版正文',
  }
  assert.deepEqual(clipboardResponseSchema.parse({ article }).article, article)
  assert.ok(clipboardResponseSchema.safeParse({ article: null }).success)
  assert.equal(
    clipboardResponseSchema.safeParse({ article: { ...article, html: '' } }).success,
    false,
  )
  assert.equal(
    clipboardResponseSchema.safeParse({ article: { ...article, phase: 'inserted' } }).success,
    false,
  )
  const copy = internalRequestSchema.parse({ kind: 'COPY_ARTICLE' })
  assert.equal(contentRequestAllowed(copy), false)
  assert.ok(contentRequestAllowed(internalRequestSchema.parse({ kind: 'ARTICLE' })))
  assert.equal(contentRequestAllowed(internalRequestSchema.parse({ kind: 'TARGETS' })), false)
  assert.equal(
    externalRequestSchema.safeParse({
      protocolVersion,
      requestId: crypto.randomUUID(),
      kind: 'COPY_ARTICLE',
    }).success,
    false,
  )
})
test('digest binds current content and output generation', async function () {
  const source = payload()
  const original = await contentDigest(source)
  assert.equal(original, await contentDigest(source))
  for (const other of [
    { ...source, title: '更改标题' },
    { ...source, html: '<p>更改正文</p>' },
    { ...source, sourceGeneration: 4 },
    { ...source, createdAt: source.createdAt + 1 },
  ])
    assert.notEqual(original, await contentDigest(other))
})
test('UTF8 protection applies to entire envelope without truncation', function () {
  assert.doesNotThrow(function small() {
    assertMessageSize({ data: '中' })
  })
  assert.throws(function large() {
    assertMessageSize({ data: '中'.repeat(maxMessageBytes / 2) })
  }, TransferError)
})
test('controlled text HTML permits formatting and rejects executable attributes', function () {
  validateTextHtml(payload().html)
  validateTextHtml(
    '<section><h1>标题</h1><ol start="2"><li>内容</li></ol><table style="table-layout:fixed;word-wrap:break-word"><tbody><tr><td>格</td></tr></tbody></table></section>',
  )
  for (const html of [
    '<p onclick="alert(1)">正文</p>',
    '<script>alert(1)</script>',
    '<a href="javascript:alert(1)">链接</a>',
    '<a href="https://mp.weixin.qq.com.evil/">链接</a>',
    '<p style="color:expression(alert(1))">正文</p>',
    '<p style="background:u\\72l(test)">正文</p>',
    '<math><mtext>正文</mtext></math>',
  ])
    assert.throws(function unsafe() {
      validateTextHtml(html)
    }, TransferError)
})
test('encoded image styles and image/media elements fail as whole articles', function () {
  for (const html of [
    '<p>正文<img src="https://example.com/a.png"></p>',
    '<p style="background:&#117;rl(https://example.com/a.png)">正文</p>',
    '<svg><text>图</text></svg>',
    '<video>正文</video>',
  ])
    assert.throws(
      function image() {
        validateTextHtml(html)
      },
      function imageError(error: unknown) {
        return error instanceof TransferError && error.code === errors.IMAGE_UNSUPPORTED
      },
    )
})
test('visible text comparison decodes entities and empty bodies fail', function () {
  assert.equal(htmlVisibleText('<section>A&nbsp;<strong>中</strong>文</section>'), 'A中文')
  assert.throws(function empty() {
    validateTextHtml('<section><p><br></p></section>')
  }, TransferError)
})
