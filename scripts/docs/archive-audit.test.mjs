import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { test } from 'node:test'
import { audit, recordBaseline } from './archive-audit.mjs'
import { readJson } from '../lib/project.mjs'
import {
  commit,
  document,
  initializeGit,
  put,
  putJson,
  temporaryProject,
  removeTemporary,
} from '../lib/testing.mjs'
import { join } from 'node:path'

const reviewedAt = new Date('2026-10-07T00:00:00.000Z')

function fixture(t, baseline = true) {
  const root = temporaryProject()
  t.after(function cleanup() {
    removeTemporary(root)
  })
  if (baseline) {
    initializeGit(root)
    const sha = commit(root)
    recordBaseline(root, sha, { now: reviewedAt })
    commit(root, 'docs: record initial baseline')
  }
  return root
}

test('no Git and unborn repository have explicit bootstrap states', function (t) {
  const root = fixture(t, false)
  assert.equal(audit(root).lifecycle, 'no_git')
  assert.equal(audit(root, { bootstrap: true }).bootstrapPassed, true)
  initializeGit(root)
  assert.equal(audit(root).lifecycle, 'unborn')
  assert.equal(audit(root, { bootstrap: true }).bootstrapPassed, true)
})

test('existing history cannot bypass missing baseline using bootstrap', function (t) {
  const root = fixture(t, false)
  initializeGit(root)
  commit(root)
  const result = audit(root, { bootstrap: true })
  assert.equal(result.lifecycle, 'missing_baseline')
  assert.equal(result.bootstrapPassed, false)
})

test('init records a full real commit, rejecting dirty, fake and duplicate baselines', function (t) {
  const root = fixture(t, false)
  initializeGit(root)
  const sha = commit(root)
  assert.throws(function fake() {
    recordBaseline(root, 'HEAD')
  }, /full real/)
  assert.throws(function fake() {
    recordBaseline(root, 'a'.repeat(40))
  }, /current HEAD/)
  put(root, 'dirty.txt', 'dirty')
  assert.throws(function dirty() {
    recordBaseline(root, sha)
  }, /clean worktree/)
  rmSync(join(root, 'dirty.txt'))
  const ledger = recordBaseline(root, sha, { now: reviewedAt })
  assert.equal(ledger.baseline.commit, sha)
  commit(root)
  assert.throws(function duplicate() {
    recordBaseline(root, sha)
  }, /current HEAD|already exists/)
})

test('clean baseline is NOT_DUE; time threshold triggers at the boundary', function (t) {
  const root = fixture(t)
  assert.equal(audit(root, { now: reviewedAt }).status, 'NOT_DUE')
  assert.equal(audit(root, { now: new Date('2026-11-05T00:00:00Z') }).status, 'NOT_DUE')
  assert.equal(audit(root, { now: new Date('2026-11-06T00:00:00Z') }).status, 'DUE')
})

test('effective source commits trigger while archive-only bookkeeping does not', function (t) {
  const root = fixture(t)
  const policy = readJson(join(root, 'docs/archive/archive-policy.json'))
  policy.thresholds.effectiveCommits = 1
  putJson(root, 'docs/archive/archive-policy.json', policy)
  commit(root)
  assert.equal(audit(root, { now: reviewedAt }).counts.effectiveCommits, 0)
  put(root, 'scripts/feature.mjs', 'export const changed = true\n')
  commit(root)
  assert.equal(audit(root, { now: reviewedAt }).status, 'DUE')
})

test('accepted ADR and completed plan thresholds independently trigger', function (t) {
  for (const kind of ['acceptedAdrs', 'completedPlans']) {
    const root = fixture(t)
    const policy = readJson(join(root, 'docs/archive/archive-policy.json'))
    policy.thresholds[kind] = 1
    putJson(root, 'docs/archive/archive-policy.json', policy)
    const path =
      kind === 'acceptedAdrs'
        ? 'docs/decisions/ADR-20261007-new.md'
        : 'docs/archive/plans/2026-10-07-completed.md'
    put(root, path, document(kind, kind === 'acceptedAdrs' ? 'accepted' : 'completed'))
    assert.equal(audit(root, { now: reviewedAt }).status, 'DUE')
  }
})

test('active review remains IN_PROGRESS even if thresholds are not reached', function (t) {
  const root = fixture(t)
  put(
    root,
    'docs/plans/active/2026-10-07-review.md',
    document('Review', 'in_progress', 'type: documentation-archive-review\n'),
  )
  assert.equal(audit(root, { now: reviewedAt }).status, 'IN_PROGRESS')
  put(
    root,
    'docs/plans/active/2026-10-07-review.md',
    document('Review', 'pending_human_acceptance', 'type: documentation-archive-review\n'),
  )
  assert.equal(audit(root, { now: reviewedAt }).status, 'IN_PROGRESS')
})

test('explicit triggers and architecture changes are immediate evidence', function (t) {
  const root = fixture(t)
  putJson(root, 'docs/archive/archive-triggers.json', {
    schemaVersion: 1,
    triggers: [{ id: 'architecture', reason: 'Module boundary changed' }],
  })
  assert.equal(audit(root, { now: reviewedAt }).status, 'DUE')
  putJson(root, '.module-boundaries.json', { schemaVersion: 1, assembly: ['changed'], modules: [] })
  assert.ok(
    audit(root, { now: reviewedAt }).reasons.some((reason) => reason.includes('Architecture')),
  )
})

test('malformed configuration, nonexistent SHA, future date and broken links are BLOCKED', function (t) {
  const root = fixture(t)
  const ledger = readJson(join(root, 'docs/archive/archive-ledger.json'))
  putJson(root, 'docs/archive/archive-ledger.json', {
    ...ledger,
    baseline: { ...ledger.baseline, commit: 'a'.repeat(40) },
  })
  assert.equal(audit(root, { now: reviewedAt }).status, 'BLOCKED')
  putJson(root, 'docs/archive/archive-ledger.json', {
    ...ledger,
    baseline: { ...ledger.baseline, reviewedAt: '2027-01-01T00:00:00Z' },
  })
  assert.equal(audit(root, { now: reviewedAt }).status, 'BLOCKED')
  putJson(root, 'docs/archive/archive-ledger.json', ledger)
  put(root, 'docs/README.md', '[missing](missing.md)\n')
  assert.equal(audit(root, { now: reviewedAt }).status, 'BLOCKED')
  put(root, 'docs/README.md', '# Valid\n')
  put(root, 'docs/archive/archive-policy.json', '{broken')
  assert.equal(audit(root, { now: reviewedAt }).status, 'BLOCKED')
})

test('review completion requires a committed archived review and clears reviewed evidence', function (t) {
  const root = fixture(t)
  put(root, 'docs/archive/review-evidence.txt', 'Reviewed current design\n')
  const sha = commit(root, 'docs: additional committed evidence')
  assert.throws(function unfinished() {
    recordBaseline(root, sha, { complete: true, now: reviewedAt })
  }, /completed, archived review/)
  put(
    root,
    'docs/archive/plans/2026-10-07-review.md',
    document('Review', 'completed', 'type: documentation-archive-review\n'),
  )
  const reviewed = commit(root, 'docs: complete archive review')
  recordBaseline(root, reviewed, { complete: true, now: reviewedAt })
  commit(root, 'docs: save review ledger')
  assert.equal(audit(root, { now: reviewedAt }).status, 'NOT_DUE')
})
