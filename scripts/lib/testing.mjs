import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { git } from './project.mjs'

export function put(root, path, text) {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, text)
}

export function putJson(root, path, value) {
  put(root, path, `${JSON.stringify(value, null, 2)}\n`)
}

export function document(title, status = 'accepted', extra = '') {
  return `---\ntitle: ${title}\nstatus: ${status}\ncreated: 2026-10-07\nupdated: 2026-10-07\nowner: project maintainers\n${extra}---\n\n# ${title}\n`
}

export function temporaryProject() {
  const root = mkdtempSync(join(tmpdir(), 'coaiforge-test-'))
  for (const path of [
    'README.md',
    'design/README.md',
    'decisions/README.md',
    'plans/active/README.md',
    'ai-logs/README.md',
    'guides/README.md',
    'reference/README.md',
    'templates/README.md',
    'archive/README.md',
  ])
    put(root, `docs/${path}`, '# Index\n')
  putJson(root, 'docs/archive/archive-policy.json', {
    schemaVersion: 1,
    thresholds: { effectiveCommits: 20, acceptedAdrs: 3, completedPlans: 3, days: 30 },
    immediatePaths: ['.module-boundaries.json'],
  })
  putJson(root, 'docs/archive/archive-ledger.json', { schemaVersion: 1, baseline: null })
  putJson(root, 'docs/archive/archive-triggers.json', { schemaVersion: 1, triggers: [] })
  putJson(root, '.module-boundaries.json', { schemaVersion: 1, assembly: [], modules: [] })
  return root
}

export function removeTemporary(root) {
  const absolute = resolve(root)
  if (
    dirname(absolute).toLowerCase() !== resolve(tmpdir()).toLowerCase() ||
    !basename(absolute).startsWith('coaiforge-')
  )
    throw new Error('Refusing cleanup outside a task temporary directory')
  rmSync(absolute, { recursive: true, force: true })
}

export function initializeGit(root) {
  git(root, ['init', '--initial-branch=main'])
  git(root, ['config', 'user.name', 'Test Maintainer'])
  git(root, ['config', 'user.email', 'test@example.test'])
}

export function commit(root, message = 'chore: test fixture') {
  git(root, ['add', '.'])
  git(root, ['commit', '-m', message])
  return git(root, ['rev-parse', 'HEAD'])
}
