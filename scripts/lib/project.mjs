import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function filesUnder(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', '.generated', 'coverage'].includes(entry.name)) continue
    const path = join(root, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Symbolic link is not supported: ${path}`)
    if (entry.isDirectory()) files.push(...filesUnder(path))
    else files.push(path)
  }
  return files.sort()
}

export function unixPath(path) {
  return path.replaceAll('\\', '/')
}

export function samePath(left, right) {
  function canonical(path) {
    const absolute = unixPath(realpathSync.native(path))
    return process.platform === 'win32' ? absolute.toLowerCase() : absolute
  }
  return canonical(left) === canonical(right)
}

export function relativePath(root, path) {
  return unixPath(relative(root, path))
}

export function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

export function isMain(url) {
  return Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(url)
}

export function argument(name, argv = process.argv.slice(2)) {
  const index = argv.indexOf(name)
  return index === -1 ? undefined : argv[index + 1]
}
