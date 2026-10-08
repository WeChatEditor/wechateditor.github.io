import { readFileSync } from 'node:fs'
import { isMain } from '../lib/project.mjs'

export function checkCommitMessage(message, { requireAi = false } = {}) {
  const errors = []
  const lines = message.trimEnd().split(/\r?\n/)
  if (
    !/^(?:chore|docs|feat|fix|refactor|style|test|ci|build|revert)(?:\([a-zA-Z0-9._/-]+\))?!?: \S.*$/.test(
      lines[0],
    )
  )
    errors.push('Use <type>(<topic>)?!: <summary>')
  const aiLines = lines.filter((line) => /^Co-Authored-By:\s*-AI-/i.test(line))
  if (requireAi && aiLines.length !== 1) errors.push('Exactly one AI co-author trailer is required')
  if (aiLines.length > 1) errors.push('Duplicate AI trailer')
  for (const line of aiLines) {
    const match = /^Co-Authored-By: -AI- (.+) <ai@scaffold-proj\.com>$/.exec(line)
    if (
      !match ||
      /[[\]<>]|placeholder|actual|真实|模型名称|AI model name/i.test(match[1]) ||
      /^(?:AI|Codex|ChatGPT|unknown)$/i.test(match[1])
    )
      errors.push('Use the actual model name and exact AI trailer format')
    const index = lines.indexOf(line)
    if (index !== lines.length - 1 || lines[index - 1] !== '')
      errors.push('AI trailer must be last and preceded by a blank line')
  }
  return errors
}

if (isMain(import.meta.url)) {
  const errors = checkCommitMessage(readFileSync(process.argv[2], 'utf8'), {
    requireAi: process.env.AI_COMMIT === '1',
  })
  for (const error of errors) console.error(error)
  process.exitCode = errors.length ? 1 : 0
}
