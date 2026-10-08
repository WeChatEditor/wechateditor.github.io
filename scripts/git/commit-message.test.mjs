import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkCommitMessage } from './commit-message.mjs'

test('accepts human conventions and actual AI model trailers', function () {
  assert.deepEqual(checkCommitMessage('feat(health): add process check'), [])
  assert.deepEqual(
    checkCommitMessage('docs!: update rules\n\nCo-Authored-By: -AI- GPT-6 <ai@scaffold-proj.com>', {
      requireAi: true,
    }),
    [],
  )
  assert.deepEqual(checkCommitMessage('revert: remove example'), [])
})

test('rejects invalid type, missing AI trailer, placeholders, malformed or misplaced trailers', function () {
  for (const message of ['Merge upstream', 'feat: ', 'unknown: change'])
    assert.ok(checkCommitMessage(message).length)
  assert.ok(checkCommitMessage('feat: change', { requireAi: true }).length)
  for (const model of ['[AI model name]', 'Codex', 'unknown'])
    assert.ok(
      checkCommitMessage(`feat: change\n\nCo-Authored-By: -AI- ${model} <ai@scaffold-proj.com>`)
        .length,
    )
  assert.ok(
    checkCommitMessage('feat: change\nCo-Authored-By: -AI- GPT-6 <ai@scaffold-proj.com>').length,
  )
  assert.ok(
    checkCommitMessage('feat: change\n\nCo-Authored-By: -AI- GPT-6 <ai@scaffold-proj.com>\nextra')
      .length,
  )
})
