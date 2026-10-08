import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  argument,
  filesUnder,
  git,
  isMain,
  projectRoot,
  readJson,
  relativePath,
  samePath,
} from '../lib/project.mjs'
import { checkDocs, frontmatter } from './check.mjs'

function documents(root, prefix, status) {
  const directory = join(root, 'docs', prefix)
  if (!existsSync(directory)) return []
  return filesUnder(directory)
    .filter((path) => path.endsWith('.md') && !path.endsWith('README.md'))
    .filter((path) => frontmatter(readFileSync(path, 'utf8'))?.status === status)
    .map((path) => relativePath(join(root, 'docs'), path))
    .sort()
}

function validateConfig(policy, ledger, triggers) {
  if (policy.schemaVersion !== 1 || ledger.schemaVersion !== 1 || triggers.schemaVersion !== 1)
    throw new Error('Unsupported audit schemaVersion')
  for (const key of ['effectiveCommits', 'acceptedAdrs', 'completedPlans', 'days']) {
    if (!Number.isInteger(policy.thresholds?.[key]) || policy.thresholds[key] < 1)
      throw new Error(`Invalid threshold ${key}`)
  }
  if (
    !Array.isArray(policy.immediatePaths) ||
    !policy.immediatePaths.every((path) => typeof path === 'string' && path.length)
  )
    throw new Error('Invalid immediatePaths')
  if (
    !Array.isArray(triggers.triggers) ||
    new Set(triggers.triggers.map((item) => item.id)).size !== triggers.triggers.length ||
    !triggers.triggers.every(
      (item) =>
        typeof item.id === 'string' && item.id && typeof item.reason === 'string' && item.reason,
    )
  )
    throw new Error('Invalid immediate trigger evidence')
  if (ledger.baseline !== null) {
    if (
      !/^[a-f0-9]{40,64}$/.test(ledger.baseline?.commit ?? '') ||
      !Number.isFinite(Date.parse(ledger.baseline.reviewedAt))
    )
      throw new Error('Invalid baseline commit or reviewedAt')
    for (const key of ['acceptedAdrIds', 'completedPlanIds', 'acknowledgedTriggerIds'])
      if (
        !Array.isArray(ledger.baseline[key]) ||
        !ledger.baseline[key].every((value) => typeof value === 'string')
      )
        throw new Error(`Invalid baseline ${key}`)
  }
}

export function audit(root, { bootstrap = false, now = new Date() } = {}) {
  try {
    const structure = checkDocs(root)
    if (structure.length) return { status: 'BLOCKED', reasons: structure }
    const policy = readJson(join(root, 'docs/archive/archive-policy.json'))
    const ledger = readJson(join(root, 'docs/archive/archive-ledger.json'))
    const triggers = readJson(join(root, 'docs/archive/archive-triggers.json'))
    validateConfig(policy, ledger, triggers)
    let head
    try {
      if (!samePath(git(root, ['rev-parse', '--show-toplevel']), root))
        return {
          status: 'INITIALIZATION_REQUIRED',
          lifecycle: 'no_git',
          bootstrapPassed: bootstrap,
          reasons: ['No project Git repository; run git init'],
        }
      head = git(root, ['rev-parse', '--verify', 'HEAD'])
    } catch {
      let lifecycle = 'no_git'
      try {
        git(root, ['rev-parse', '--git-dir'])
        lifecycle = 'unborn'
      } catch {
        /* No repository */
      }
      return {
        status: 'INITIALIZATION_REQUIRED',
        lifecycle,
        bootstrapPassed: bootstrap,
        reasons: ['Create the first real commit after bootstrap validation'],
      }
    }
    if (!ledger.baseline)
      return {
        status: 'INITIALIZATION_REQUIRED',
        head,
        lifecycle: 'missing_baseline',
        bootstrapPassed: false,
        reasons: [
          'Register a real baseline with docs:archive:init; bootstrap cannot bypass existing history',
        ],
      }
    const base = ledger.baseline
    git(root, ['cat-file', '-e', `${base.commit}^{commit}`])
    git(root, ['merge-base', '--is-ancestor', base.commit, head])
    const commits = git(root, ['rev-list', `${base.commit}..${head}`])
      .split('\n')
      .filter(Boolean)
    const effective = commits.filter((sha) =>
      git(root, ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '-m', sha])
        .split('\n')
        .some(
          (path) =>
            path &&
            !/^docs\/(?:archive|ai-logs|plans)\//.test(path) &&
            !path.endsWith('/README.md'),
        ),
    ).length
    const accepted = documents(root, 'decisions', 'accepted')
    const completed = documents(root, 'archive/plans', 'completed')
    const newAdrs = accepted.filter((id) => !base.acceptedAdrIds.includes(id)).length
    const newPlans = completed.filter((id) => !base.completedPlanIds.includes(id)).length
    const days = Math.floor((now.getTime() - Date.parse(base.reviewedAt)) / 86400000)
    if (days < 0) throw new Error('Baseline reviewedAt is in the future')
    const reasons = []
    const counts = {
      effectiveCommits: effective,
      acceptedAdrs: newAdrs,
      completedPlans: newPlans,
      days,
    }
    for (const key of Object.keys(counts))
      if (counts[key] >= policy.thresholds[key])
        reasons.push(`${key}: ${counts[key]} >= ${policy.thresholds[key]}`)
    for (const item of triggers.triggers)
      if (!base.acknowledgedTriggerIds.includes(item.id))
        reasons.push(`Immediate trigger ${item.id}: ${item.reason}`)
    for (const id of base.acceptedAdrIds)
      if (!accepted.includes(id)) reasons.push(`Accepted ADR replaced or removed: ${id}`)
    const changed = [
      ...git(root, ['diff', '--name-only', base.commit, head]).split('\n'),
      ...git(root, ['diff', '--name-only', 'HEAD']).split('\n'),
      ...git(root, ['ls-files', '--others', '--exclude-standard']).split('\n'),
    ]
    for (const path of policy.immediatePaths)
      if (changed.includes(path)) reasons.push(`Architecture evidence changed: ${path}`)
    const active = documents(root, 'plans/active', 'in_progress')
      .concat(
        documents(root, 'plans/active', 'draft'),
        documents(root, 'plans/active', 'pending_human_acceptance'),
      )
      .filter(
        (id) =>
          frontmatter(readFileSync(join(root, 'docs', id), 'utf8'))?.type ===
          'documentation-archive-review',
      )
    return {
      status: active.length ? 'IN_PROGRESS' : reasons.length ? 'DUE' : 'NOT_DUE',
      head,
      baseline: base.commit,
      counts,
      reasons,
      activeReviews: active,
    }
  } catch (error) {
    return { status: 'BLOCKED', reasons: [error.message] }
  }
}

export function recordBaseline(root, sha, { complete = false, now = new Date() } = {}) {
  const report = audit(root, { now })
  if (report.status === 'BLOCKED' || report.lifecycle === 'no_git' || report.lifecycle === 'unborn')
    throw new Error(report.reasons.join('\n'))
  if (!/^[a-f0-9]{40,64}$/.test(sha ?? ''))
    throw new Error('An explicit full real commit SHA is required')
  if (git(root, ['status', '--porcelain']))
    throw new Error(
      'Commit reviewed content first; baseline registration requires a clean worktree',
    )
  const head = git(root, ['rev-parse', 'HEAD'])
  if (sha !== head) throw new Error('Register the reviewed current HEAD using its full SHA')
  git(root, ['cat-file', '-e', `${sha}^{commit}`])
  const path = join(root, 'docs/archive/archive-ledger.json')
  const ledger = readJson(path)
  if (!complete && ledger.baseline)
    throw new Error('Baseline already exists; use an explicit completed review')
  if (complete && !ledger.baseline) throw new Error('Initialize the baseline first')
  if (complete) {
    const reviews = documents(root, 'archive/plans', 'completed').filter(
      (id) =>
        !ledger.baseline.completedPlanIds.includes(id) &&
        frontmatter(readFileSync(join(root, 'docs', id), 'utf8'))?.type ===
          'documentation-archive-review',
    )
    if (!reviews.length || report.activeReviews?.length)
      throw new Error(
        'A newly completed, archived review plan is required; finish all active reviews',
      )
  }
  ledger.baseline = {
    commit: sha,
    reviewedAt: now.toISOString(),
    acceptedAdrIds: documents(root, 'decisions', 'accepted'),
    completedPlanIds: documents(root, 'archive/plans', 'completed'),
    acknowledgedTriggerIds: readJson(join(root, 'docs/archive/archive-triggers.json')).triggers.map(
      (item) => item.id,
    ),
  }
  writeFileSync(path, `${JSON.stringify(ledger, null, 2)}\n`)
  return ledger
}

if (isMain(import.meta.url)) {
  try {
    const argv = process.argv.slice(2)
    if (argv.includes('--init') || argv.includes('--complete')) {
      recordBaseline(projectRoot, argument('--baseline', argv), {
        complete: argv.includes('--complete'),
      })
      console.log('Recorded real baseline; review and commit the ledger change')
    } else {
      const report = audit(projectRoot, { bootstrap: argv.includes('--bootstrap') })
      console.log(JSON.stringify(report, null, 2))
      process.exitCode = report.status === 'NOT_DUE' || report.bootstrapPassed ? 0 : 1
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
