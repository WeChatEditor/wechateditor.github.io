import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { projectRoot } from '../lib/project.mjs'

const root = join(projectRoot, 'apps/extension')
const identity = JSON.parse(readFileSync(join(root, 'extension.identity.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(join(root, 'dist/production/manifest.json'), 'utf8'))
const packageManifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
assert.equal(manifest.version, packageManifest.version)
const digest = createHash('sha256')
  .update(Buffer.from(identity.key, 'base64'))
  .digest()
  .subarray(0, 16)
const id = [...digest]
  .map(function character(byte) {
    return String.fromCharCode(97 + (byte >> 4), 97 + (byte & 15))
  })
  .join('')
assert.equal(identity.id, id)
const contractSource = readFileSync(
  join(
    projectRoot,
    'packages/wechat-transfer-contract/src/modules/wechat-transfer/wechat-transfer.schema.ts',
  ),
  'utf8',
)
assert.equal(/export const extensionId = ['"]([a-p]{32})['"]/.exec(contractSource)?.[1], id)
assert.equal(manifest.key, identity.key)
assert.equal(manifest.manifest_version, 3)
assert.equal(manifest.name, '桀士排版·公众号助手')
assert.equal(manifest.homepage_url, 'https://wechateditor.github.io/extension/')
assert.ok(manifest.description.length > 0 && manifest.description.length <= 132)
assert.deepEqual(manifest.permissions, ['storage', 'scripting'])
assert.deepEqual(manifest.host_permissions, [
  'https://mp.weixin.qq.com/*',
  'https://wechateditor.github.io/*',
])
assert.deepEqual(manifest.externally_connectable.matches, ['https://wechateditor.github.io/*'])
assert.ok(
  manifest.host_permissions.every(function restricted(url) {
    return url.startsWith('https://') && !url.includes('*://') && !url.includes('<all_urls>')
  }),
)
assert.equal(JSON.stringify(manifest).includes('127.0.0.1'), false)
assert.equal(JSON.stringify(manifest).includes('localhost'), false)
assert.equal(manifest.content_security_policy.extension_pages.includes('unsafe-eval'), false)
assert.deepEqual(manifest.web_accessible_resources, [
  { resources: ['logo.png'], matches: ['https://mp.weixin.qq.com/*'] },
])
assert.deepEqual(manifest.icons, { 32: 'logo-32.png', 192: 'logo.png' })
assert.deepEqual(manifest.action.default_icon, { 32: 'logo-32-gray.png' })
assert.equal(manifest.action.default_popup, 'popup.html')
assert.notEqual(manifest.action.default_state, 'disabled')
for (const [name, size] of [
  ['logo-32.png', 32],
  ['logo-32-gray.png', 32],
  ['logo.png', 192],
]) {
  const png = readFileSync(join(root, 'dist/production', name))
  assert.equal(png.readUInt32BE(16), size)
  assert.equal(png.readUInt32BE(20), size)
}
for (const script of ['worker.js', 'content.js', 'popup.js']) {
  const metadata = JSON.parse(
    readFileSync(join(root, 'dist/production', script.replace('.js', '.meta.json')), 'utf8'),
  )
  assert.ok(
    Object.keys(metadata.inputs).every(function isolated(path) {
      return (
        !path.includes('apps/frontend') && !/node_modules\/(?:vue|pinia|element-plus)\//.test(path)
      )
    }),
  )
  assert.ok(
    Object.values(metadata.outputs).every(function bundled(output) {
      return output.imports.every(function local(dependency) {
        return !dependency.external
      })
    }),
  )
  const source = readFileSync(join(root, 'dist/production', script), 'utf8')
  assert.equal(source.includes('http://127.0.0.1:'), false)
  assert.equal(source.includes('prepareExportImages'), false)
  assert.equal(source.includes('createPinia'), false)
}
const require = createRequire(join(root, 'package.json'))
const { unzipSync } = require('fflate')
const files = unzipSync(
  readFileSync(join(root, `dist/jlab-wechat-transfer-${manifest.version}.zip`)),
)
assert.deepEqual(
  Object.keys(files).sort(),
  [
    'LICENSES.txt',
    'NOTICE.md',
    'content.js',
    'manifest.json',
    'popup.html',
    'popup.js',
    'worker.js',
    'logo.png',
    'logo-32.png',
    'logo-32-gray.png',
  ].sort(),
)
for (const [name, bytes] of Object.entries(files))
  assert.deepEqual(Buffer.from(bytes), readFileSync(join(root, 'dist/production', name)))
console.log(
  `Extension package: PASS; version ${manifest.version}; ID ${id}; ZIP matches unpacked files`,
)
