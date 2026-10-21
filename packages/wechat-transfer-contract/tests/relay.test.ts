import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  connectionInfoSchema,
  htmlRelayCapability,
  supportsHtmlRelay,
  externalRequestSchema,
  payloadSchema,
  clipboardResponseSchema,
  contentDigest,
  protocolVersion,
} from '../src/modules/wechat-transfer/wechat-transfer.schema.ts'
import {
  articleTitleSchema,
  validateTextHtml,
} from '../src/modules/wechat-transfer/wechat-transfer.content.ts'

test('relay capability is independent of release numbers and preserves legacy detection', function () {
  for (const extensionVersion of ['0.1.15', '0.2.0', '20.0.0']) {
    const info = connectionInfoSchema.parse({
      extensionVersion,
      capabilities: [htmlRelayCapability, 'future-capability@9'],
    })
    assert.ok(supportsHtmlRelay(info))
  }
  assert.equal(supportsHtmlRelay(connectionInfoSchema.parse({ extensionVersion: '99.0.0' })), false)
  assert.equal(
    supportsHtmlRelay(
      connectionInfoSchema.parse({ extensionVersion: '0.1.15', capabilities: ['unrelated'] }),
    ),
    false,
  )
  assert.equal(
    connectionInfoSchema.safeParse({
      extensionVersion: '0.1.15',
      capabilities: htmlRelayCapability,
    }).success,
    false,
  )
  assert.equal(
    connectionInfoSchema.safeParse({
      extensionVersion: '0.1.15',
      capabilities: Array(33).fill('cap'),
    }).success,
    false,
  )
})

function futurePayload() {
  return {
    sourceArticleId: '90cb393c-f631-4cb5-aa42-4353210b0ed2',
    sourceRevision: 0,
    sourceGeneration: 1,
    createdAt: 1792540800000,
    title: ' ' + '未来标题'.repeat(30) + ' ',
    html: '<aside data-future="yes" style="new-style:future"><mark>未来输出</mark><img src="https://example.com/a.png"></aside>',
    plainText: '  未来输出\n  缩进  ',
    profile: 'future-renderer@27',
    digest: '0'.repeat(64),
  }
}

test('transport and copy Schema preserve future HTML, profile and titles without interpreting formatting', function () {
  const payload = futurePayload()
  assert.deepEqual(payloadSchema.parse(payload), payload)
  for (const kind of ['SAVE_ARTICLE', 'SUBMIT_TASK']) {
    const request = { protocolVersion, requestId: crypto.randomUUID(), kind, payload }
    assert.deepEqual(externalRequestSchema.parse(request), request)
  }
  const article = {
    title: payload.title,
    html: payload.html,
    plainText: payload.plainText,
    receivedAt: payload.createdAt,
  }
  assert.deepEqual(clipboardResponseSchema.parse({ article }).article, article)
  assert.throws(function webStillControlsContent() {
    validateTextHtml(payload.html)
  })
  assert.equal(articleTitleSchema.safeParse(payload.title).success, false)
})

test('opaque content is still bound by its digest and strict transport fields', async function () {
  const payload = futurePayload()
  const digest = await contentDigest(payload)
  assert.notEqual(digest, await contentDigest({ ...payload, profile: 'another-renderer@1' }))
  assert.notEqual(digest, await contentDigest({ ...payload, html: payload.html + '<br>' }))
  assert.equal(payloadSchema.safeParse({ ...payload, profile: '' }).success, false)
  assert.equal(payloadSchema.safeParse({ ...payload, profile: 'x'.repeat(201) }).success, false)
  assert.equal(payloadSchema.safeParse({ ...payload, runScript: 'not allowed' }).success, false)
})
