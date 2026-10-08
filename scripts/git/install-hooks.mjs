import { chmodSync } from 'node:fs'
import { join } from 'node:path'
import { git, projectRoot, samePath } from '../lib/project.mjs'

try {
  if (samePath(git(projectRoot, ['rev-parse', '--show-toplevel']), projectRoot)) {
    for (const name of ['pre-commit', 'commit-msg'])
      chmodSync(join(projectRoot, '.githooks', name), 0o755)
    git(projectRoot, ['config', '--local', 'core.hooksPath', '.githooks'])
    console.log('Installed local Git hooks')
  } else console.log('Skipping hooks: this directory is not a Git repository root')
} catch {
  console.log('Skipping hooks: initialize Git then run pnpm prepare')
}
