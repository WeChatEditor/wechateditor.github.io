import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkDocs } from './check.mjs'
import { document, put, temporaryProject, removeTemporary } from '../lib/testing.mjs'

test('document checker validates links, dates, lifecycle and removed fields', function (t) {
  const root = temporaryProject()
  t.after(function cleanup() {
    removeTemporary(root)
  })
  assert.deepEqual(checkDocs(root), [])
  put(root, 'docs/design/module.md', document('Module') + '\n[bad](missing.md)\n')
  assert.ok(checkDocs(root).some((error) => error.includes('Broken')))
  put(
    root,
    'docs/design/module.md',
    document('Module', 'accepted', 'scope: removed\n').replaceAll('2026-10-07', '2026-02-30'),
  )
  assert.ok(checkDocs(root).some((error) => error.includes('scope')))
  assert.ok(checkDocs(root).some((error) => error.includes('created')))
  put(root, 'docs/plans/active/2026-10-07-task.md', document('Task', 'completed'))
  assert.ok(checkDocs(root).some((error) => error.includes('lifecycle')))
})

test('ADR and AI log paths must match their metadata', function (t) {
  const root = temporaryProject()
  t.after(function cleanup() {
    removeTemporary(root)
  })
  put(root, 'docs/decisions/wrong.md', document('Decision'))
  put(
    root,
    'docs/ai-logs/fix/2026/09/2026-10-07-log.md',
    document('Log', 'in_progress', 'change_type: feat\n'),
  )
  const errors = checkDocs(root)
  assert.ok(errors.some((error) => error.includes('ADR filename')))
  assert.ok(errors.some((error) => error.includes('AI log')))
})
