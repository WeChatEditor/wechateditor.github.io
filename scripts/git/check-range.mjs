import { argument, git, isMain, projectRoot } from '../lib/project.mjs'
import { checkCommitMessage } from './commit-message.mjs'

if (isMain(import.meta.url)) {
  try {
    const range = argument('--range') ?? 'HEAD'
    const commits = git(projectRoot, ['rev-list', range]).split('\n').filter(Boolean)
    let failed = false
    for (const sha of commits) {
      const errors = checkCommitMessage(git(projectRoot, ['show', '-s', '--format=%B', sha]))
      if (errors.length) {
        failed = true
        console.error(`${sha.slice(0, 8)}: ${errors.join('; ')}`)
      }
    }
    console.log(`Commit convention: ${commits.length} checked`)
    process.exitCode = failed ? 1 : 0
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
