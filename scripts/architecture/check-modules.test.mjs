import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkModules } from './check-modules.mjs'
import { document, put, putJson, temporaryProject, removeTemporary } from '../lib/testing.mjs'

function fixture(t) {
  const root = temporaryProject()
  t.after(function cleanup() {
    removeTemporary(root)
  })
  put(root, 'docs/design/a.md', document('Module a'))
  put(root, 'docs/design/b.md', document('Module b'))
  put(root, 'apps/backend/src/modules/a/a.api.ts', 'export const a = true\n')
  put(root, 'apps/backend/src/modules/b/b.api.ts', 'export const b = true\n')
  put(root, 'apps/backend/src/modules/b/private.ts', 'export const secret = true\n')
  const registry = {
    schemaVersion: 1,
    assembly: [],
    modules: [
      {
        name: 'a',
        design: 'docs/design/a.md',
        publicFiles: ['apps/backend/src/modules/a/a.api.ts'],
        dependencies: ['b'],
      },
      {
        name: 'b',
        design: 'docs/design/b.md',
        publicFiles: ['apps/backend/src/modules/b/b.api.ts'],
        dependencies: [],
      },
    ],
  }
  putJson(root, '.module-boundaries.json', registry)
  return { root, registry }
}

test('public module dependency succeeds; private dependency fails', function (t) {
  const { root } = fixture(t)
  put(
    root,
    'apps/backend/src/modules/a/a.api.ts',
    "import { b } from '../b/b.api'\nexport const a = b\n",
  )
  assert.deepEqual(checkModules(root), [])
  put(root, 'apps/backend/src/modules/a/a.api.ts', "export { secret } from '../b/private'\n")
  assert.ok(checkModules(root).some((error) => error.includes('Private cross-module')))
})

test('cycles and undeclared dependencies are rejected', function (t) {
  const { root, registry } = fixture(t)
  put(
    root,
    'apps/backend/src/modules/b/b.api.ts',
    "import { a } from '../a/a.api'\nexport const b = a\n",
  )
  assert.ok(checkModules(root).some((error) => error.includes('Undeclared dependency')))
  registry.modules[1].dependencies = ['a']
  putJson(root, '.module-boundaries.json', registry)
  assert.ok(checkModules(root).some((error) => error.includes('cycle')))
})

test('tsconfig alias and literal dynamic imports cannot reach private files', function (t) {
  const { root } = fixture(t)
  putJson(root, 'apps/backend/tsconfig.json', {
    compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] } },
  })
  put(
    root,
    'apps/backend/src/modules/a/a.api.ts',
    "export const a = import('@/modules/b/private')\n",
  )
  assert.ok(checkModules(root).some((error) => error.includes('Private cross-module')))
  put(
    root,
    'apps/backend/src/modules/a/a.api.ts',
    'const path = "dynamic"\nexport const a = import(path)\n',
  )
  assert.ok(checkModules(root).some((error) => error.includes('Nonliteral')))
})

test('unregistered modules and source scattered outside modules fail', function (t) {
  const { root } = fixture(t)
  put(root, 'apps/backend/src/modules/unregistered/feature.ts', 'export const feature = true\n')
  put(root, 'apps/backend/src/services/business.ts', 'export const business = true\n')
  const errors = checkModules(root)
  assert.ok(errors.some((error) => error.includes('Undeclared module')))
  assert.ok(errors.some((error) => error.includes('outside a module')))
})

test('conditional workspace exports expose only registered public sources', function (t) {
  const { root, registry } = fixture(t)
  put(root, 'packages/contracts/src/modules/b/b.schema.ts', 'export const schema = true\n')
  put(root, 'packages/contracts/src/modules/b/private.ts', 'export const secret = true\n')
  putJson(root, 'packages/contracts/package.json', {
    name: '@fixture/contracts',
    exports: {
      './b': {
        import: { default: './dist/esm/modules/b/b.schema.js' },
        require: { default: './dist/cjs/modules/b/b.schema.js' },
      },
      './private': './dist/cjs/modules/b/private.js',
    },
  })
  registry.modules[1].publicFiles.push('packages/contracts/src/modules/b/b.schema.ts')
  putJson(root, '.module-boundaries.json', registry)
  put(
    root,
    'apps/backend/src/modules/a/a.api.ts',
    "export { schema } from '@fixture/contracts/b'\n",
  )
  assert.deepEqual(checkModules(root), [])
  put(
    root,
    'apps/backend/src/modules/a/a.api.ts',
    "export { secret } from '@fixture/contracts/private'\n",
  )
  assert.ok(checkModules(root).some((error) => error.includes('Private cross-module')))
})

test('applications cannot import another application even with matching capability names', function (t) {
  const { root } = fixture(t)
  put(
    root,
    'apps/frontend/src/modules/a/a.api.ts',
    "export { a } from '../../../../backend/src/modules/a/a.api'\n",
  )
  assert.ok(checkModules(root).some((error) => error.includes('another application')))
})
