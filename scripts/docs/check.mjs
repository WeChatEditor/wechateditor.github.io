import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { parse } from 'yaml'
import { filesUnder, isMain, projectRoot, relativePath } from '../lib/project.mjs'

export const changeTypes = [
  'chore',
  'docs',
  'feat',
  'fix',
  'refactor',
  'style',
  'test',
  'ci',
  'build',
  'revert',
]

export function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)
  return match ? parse(match[1]) : null
}

function validDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  )
}

export function checkDocs(root) {
  const errors = []
  const docs = join(root, 'docs')
  if (!existsSync(docs)) return ['Missing docs directory']
  const required = [
    'README.md',
    'design/README.md',
    'decisions/README.md',
    'plans/active/README.md',
    'ai-logs/README.md',
    'guides/README.md',
    'reference/README.md',
    'templates/README.md',
    'archive/README.md',
  ]
  for (const path of required)
    if (!existsSync(join(docs, path))) errors.push(`Missing docs/${path}`)
  for (const path of filesUnder(docs).filter((file) => extname(file) === '.md')) {
    const name = relativePath(docs, path)
    const text = readFileSync(path, 'utf8')
    const template = name.startsWith('templates/')
    let meta
    try {
      meta = frontmatter(text)
    } catch (error) {
      errors.push(`${name}: ${error.message}`)
      continue
    }
    const governed =
      /^(?:design|decisions|plans\/active|ai-logs|archive\/(?:design|decisions|plans|ai-logs))\//.test(
        name,
      )
    if (governed && !name.endsWith('README.md')) {
      if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
        errors.push(`${name}: Missing frontmatter`)
        continue
      }
      for (const key of ['title', 'status', 'owner'])
        if (typeof meta[key] !== 'string' || !meta[key].trim())
          errors.push(`${name}: Invalid ${key}`)
      for (const key of ['created', 'updated'])
        if (!validDate(meta[key])) errors.push(`${name}: Invalid ${key}`)
      if (meta.updated < meta.created) errors.push(`${name}: updated precedes created`)
      for (const key of [
        'scope',
        'review_scopes',
        'downstreamAction',
        'repositoryRole',
        'integrationOwner',
      ]) {
        if (Object.hasOwn(meta, key)) errors.push(`${name}: Removed ownership field ${key}`)
      }
      const statuses =
        name.startsWith('plans/active/') || name.startsWith('ai-logs/')
          ? ['draft', 'in_progress', 'pending_human_acceptance']
          : name.startsWith('archive/plans/') || name.startsWith('archive/ai-logs/')
            ? ['completed']
            : ['draft', 'accepted', 'superseded', 'rejected']
      if (!statuses.includes(meta.status))
        errors.push(`${name}: Invalid lifecycle status ${meta.status}`)
      if (
        /^(?:archive\/)?decisions\//.test(name) &&
        !/(?:^|\/)ADR-\d{8}-[a-z0-9-]+\.md$/.test(name)
      )
        errors.push(`${name}: Invalid ADR filename`)
      if (/^(?:archive\/)?ai-logs\//.test(name)) {
        const match =
          /^(?:archive\/)?ai-logs\/([^/]+)\/(\d{4})\/(\d{2})\/(\d{4}-\d{2}-\d{2})-.+\.md$/.exec(
            name,
          )
        if (
          !match ||
          !changeTypes.includes(match[1]) ||
          meta.change_type !== match[1] ||
          meta.created?.slice(0, 7) !== `${match[2]}-${match[3]}` ||
          meta.created !== match[4]
        )
          errors.push(`${name}: Invalid AI log type or date path`)
      }
    }
    if (template) continue
    const withoutCode = text.replace(/```[\s\S]*?```/g, '')
    const links = [...withoutCode.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map(
      (match) => match[1].trim().split(/\s+"/)[0],
    )
    for (let link of links) {
      link = link.replace(/^<|>$/g, '')
      if (/^(?:[a-z]+:|#)/i.test(link)) continue
      try {
        link = decodeURIComponent(link.split('#')[0])
      } catch {
        errors.push(`${name}: Invalid URL ${link}`)
        continue
      }
      if (!link) continue
      if (link.startsWith('/') || !existsSync(resolve(dirname(path), link)))
        errors.push(`${name}: Broken relative link ${link}`)
    }
  }
  return errors
}

if (isMain(import.meta.url)) {
  const errors = checkDocs(projectRoot)
  for (const error of errors) console.error(error)
  console.log(`Documentation structure: ${errors.length ? 'FAILED' : 'PASS'}`)
  process.exitCode = errors.length ? 1 : 0
}
