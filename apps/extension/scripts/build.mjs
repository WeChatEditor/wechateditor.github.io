import { build } from 'esbuild'
import { mkdir, readFile, writeFile, copyFile, realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { zipSync } from 'fflate'
import { createRequire } from 'node:module'

const root = fileURLToPath(new URL('..', import.meta.url))
const development = process.argv.includes('--dev')
const directory = resolve(root, 'dist', development ? 'development' : 'production')
const identity = JSON.parse(await readFile(resolve(root, 'extension.identity.json'), 'utf8'))
const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
await mkdir(directory, { recursive: true })
const entries = { worker: 'src/worker.ts', content: 'src/content.ts', popup: 'src/popup.ts' }
for (const [name, path] of Object.entries(entries)) {
  const result = await build({
    entryPoints: [resolve(root, path)],
    outfile: resolve(directory, `${name}.js`),
    bundle: true,
    format: name === 'worker' ? 'esm' : 'iife',
    platform: 'browser',
    target: 'chrome120',
    minify: true,
    define: { __DEVELOPMENT__: String(development) },
    legalComments: 'eof',
    metafile: true,
  })
  await writeFile(
    resolve(directory, `${name}.meta.json`),
    `${JSON.stringify(result.metafile, null, 2)}\n`,
  )
}
const contractRequire = createRequire(
  resolve(root, '../../packages/wechat-transfer-contract/package.json'),
)
const parseRoot = resolve(await realpath(contractRequire.resolve('parse5')), '../..')
const zodRoot = resolve(await realpath(contractRequire.resolve('zod')), '..')
const licenses = [await readFile(resolve(root, '../../LICENSE'), 'utf8')]
for (const [name, path] of [
  ['Zod', resolve(zodRoot, 'LICENSE')],
  ['parse5', resolve(parseRoot, 'LICENSE')],
  ['entities', resolve(parseRoot, '../entities/LICENSE')],
])
  licenses.push(`\n## ${name}\n\n${await readFile(path, 'utf8')}`)
await writeFile(resolve(directory, 'LICENSES.txt'), licenses.join('\n'))
const devSources = ['http://127.0.0.1:5175/*', 'http://127.0.0.1:4175/*']
const manifest = {
  manifest_version: 3,
  name: '桀士排版·公众号助手',
  version,
  minimum_chrome_version: '120',
  description:
    '配合桀士排版同步微信公众号文字排版，支持复制正文与标题，辅助新建文章并插入内容，由你检查后手动保存。',
  homepage_url: 'https://wechateditor.github.io/extension/',
  key: identity.key,
  icons: { 32: 'logo-32.png', 192: 'logo.png' },
  permissions: ['storage', 'scripting'],
  host_permissions: [
    'https://mp.weixin.qq.com/*',
    'https://wechateditor.github.io/*',
    ...(development ? devSources : []),
  ],
  externally_connectable: {
    matches: ['https://wechateditor.github.io/*', ...(development ? devSources : [])],
  },
  background: { service_worker: 'worker.js', type: 'module' },
  action: { default_popup: 'popup.html', default_title: '桀士排版·公众号助手' },
  content_scripts: [
    { matches: ['https://mp.weixin.qq.com/*'], js: ['content.js'], run_at: 'document_idle' },
  ],
  content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
  web_accessible_resources: [{ resources: ['logo.png'], matches: ['https://mp.weixin.qq.com/*'] }],
}
await writeFile(resolve(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
await copyFile(resolve(root, 'popup.html'), resolve(directory, 'popup.html'))
await copyFile(resolve(root, 'NOTICE.md'), resolve(directory, 'NOTICE.md'))
await copyFile(
  resolve(root, '../frontend/public/favicon-192x192.png'),
  resolve(directory, 'logo.png'),
)
await copyFile(
  resolve(root, '../frontend/public/favicon-32x32.png'),
  resolve(directory, 'logo-32.png'),
)
if (process.argv.includes('--zip')) {
  const files = {}
  for (const name of [
    'worker.js',
    'content.js',
    'popup.js',
    'popup.html',
    'manifest.json',
    'NOTICE.md',
    'LICENSES.txt',
    'logo.png',
    'logo-32.png',
  ])
    files[name] = new Uint8Array(await readFile(resolve(directory, name)))
  const archive = resolve(root, 'dist', `jlab-wechat-transfer-${version}.zip`)
  await writeFile(archive, zipSync(files))
  console.log(`Extension ZIP: ${archive}`)
}
console.log(
  `Extension ${development ? 'development' : 'production'}: ${directory}; ID ${identity.id}`,
)
