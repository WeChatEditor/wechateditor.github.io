import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as prettier from 'prettier'
import { git, projectRoot } from '../lib/project.mjs'

const paths = execFileSync(
  'git',
  ['-C', projectRoot, 'diff', '--cached', '--name-only', '--diff-filter=ACM', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)
for (const path of paths) {
  const file = resolve(projectRoot, path)
  const info = await prettier.getFileInfo(file, {
    ignorePath: resolve(projectRoot, '.prettierignore'),
  })
  if (info.ignored || !info.inferredParser) continue
  try {
    git(projectRoot, ['diff', '--quiet', '--', path])
  } catch {
    throw new Error(`Unstaged changes in ${path}; refusing to rewrite a partially staged file`)
  }
  const formatted = await prettier.format(readFileSync(file, 'utf8'), {
    ...(await prettier.resolveConfig(file)),
    filepath: file,
  })
  writeFileSync(file, formatted)
  git(projectRoot, ['add', '--', path])
}
