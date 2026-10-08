import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import ts from 'typescript'
import { filesUnder, isMain, projectRoot, readJson, relativePath } from '../lib/project.mjs'

function owner(path) {
  return /^(?:apps|packages)\/[^/]+\/src\/modules\/([^/]+)\//.exec(path)?.[1]
}

function importedSpecifiers(file, text, errors) {
  if (file.endsWith('.vue'))
    text = [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1])
      .join('\n')
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const imports = []
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      imports.push(node.moduleSpecifier.text)
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    )
      imports.push(node.moduleReference.expression.text)
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      if (node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0]))
        imports.push(node.arguments[0].text)
      else errors.push(`${file}: Nonliteral module import cannot be checked`)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}

function existingSource(path) {
  const paths = [
    path,
    `${path}.ts`,
    `${path}.tsx`,
    `${path}.vue`,
    `${path}.js`,
    path.replace(/\.js$/, '.ts'),
    join(path, 'index.ts'),
  ]
  return paths.find(
    (candidate) => existsSync(candidate) && /\.(?:[cm]?[jt]sx?|vue)$/.test(candidate),
  )
}

function exportTarget(value) {
  if (typeof value === 'string') return value
  for (const key of ['default', 'import', 'require']) {
    const target = value && exportTarget(value[key])
    if (target) return target
  }
}

export function checkModules(root) {
  const errors = []
  try {
    const registry = readJson(join(root, '.module-boundaries.json'))
    if (
      registry.schemaVersion !== 1 ||
      !Array.isArray(registry.assembly) ||
      !Array.isArray(registry.modules)
    )
      return ['Invalid module registry']
    const modules = new Map()
    for (const entry of registry.modules) {
      if (
        !/^[a-z][a-z0-9-]*$/.test(entry.name) ||
        modules.has(entry.name) ||
        !Array.isArray(entry.publicFiles) ||
        !Array.isArray(entry.dependencies) ||
        !entry.design ||
        !existsSync(join(root, entry.design))
      ) {
        errors.push(`Invalid module registration ${entry.name}`)
        continue
      }
      modules.set(entry.name, entry)
      for (const path of entry.publicFiles) {
        if (owner(path) !== entry.name || !existsSync(join(root, path)))
          errors.push(`Invalid public file ${path}`)
        if (/(?:^|\/)index\.[jt]s$/.test(path) && !entry.allowBarrels?.includes(path))
          errors.push(`Undeclared barrel exception ${path}`)
      }
    }
    for (const entry of modules.values())
      for (const dependency of entry.dependencies)
        if (!modules.has(dependency) || dependency === entry.name)
          errors.push(`Invalid dependency ${entry.name} -> ${dependency}`)
    const allFiles = filesUnder(root)
    const packageFiles = allFiles.filter((file) =>
      /^(?:apps|packages)\/[^/]+\/package\.json$/.test(relativePath(root, file)),
    )
    const packages = new Map(
      packageFiles.map((file) => [
        readJson(file).name,
        { path: dirname(file), manifest: readJson(file) },
      ]),
    )
    const edges = new Map([...modules.keys()].map((name) => [name, new Set()]))
    for (const file of allFiles) {
      const name = relativePath(root, file)
      if (!/^(?:apps|packages)\/[^/]+\/src\/.*\.(?:[cm]?[jt]sx?|vue)$/.test(name)) continue
      const from = owner(name)
      if (from && !modules.has(from)) {
        errors.push(`Undeclared module in ${name}`)
        continue
      }
      if (!from && !registry.assembly.includes(name))
        errors.push(`Source outside a module or registered assembly: ${name}`)
      const workspaceRoot = resolve(root, name.split('/').slice(0, 2).join('/'))
      const configPath = join(workspaceRoot, 'tsconfig.json')
      let options = { allowJs: true, moduleResolution: ts.ModuleResolutionKind.Node16 }
      if (existsSync(configPath)) {
        const config = ts.readConfigFile(configPath, ts.sys.readFile)
        if (config.error) {
          errors.push(`Invalid tsconfig ${configPath}`)
          continue
        }
        options = ts.parseJsonConfigFileContent(config.config, ts.sys, workspaceRoot).options
      }
      for (const specifier of importedSpecifiers(name, readFileSync(file, 'utf8'), errors)) {
        let target
        const workspace = [...packages.entries()].find(
          ([packageName]) => specifier === packageName || specifier.startsWith(`${packageName}/`),
        )
        if (workspace) {
          const [packageName, data] = workspace
          const subpath =
            specifier === packageName ? '.' : `.${specifier.slice(packageName.length)}`
          const exported = data.manifest.exports?.[subpath]
          const path = exportTarget(exported)
          if (!path) {
            errors.push(`${name}: Undeclared workspace export ${specifier}`)
            continue
          }
          target = existingSource(
            resolve(
              data.path,
              path.replace(/^\.\/dist\/(?:cjs\/|esm\/)?/, './src/').replace(/\.[cm]?js$/, '.ts'),
            ),
          )
          if (!target) {
            errors.push(`${name}: Workspace export has no source ${specifier}`)
            continue
          }
        } else if (specifier.startsWith('.')) {
          target = existingSource(resolve(dirname(file), specifier))
          if (!target) errors.push(`${name}: Unresolved local import ${specifier}`)
        } else {
          target = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule
            ?.resolvedFileName
          const aliases = Object.keys(options.paths ?? {})
          if (!target && aliases.some((alias) => specifier.startsWith(alias.split('*')[0])))
            errors.push(`${name}: Unresolved internal alias ${specifier}`)
        }
        if (!target) continue
        const destination = relativePath(root, target)
        const to = owner(destination)
        if (!to) continue
        const sameWorkspace =
          name.split('/').slice(0, 2).join('/') === destination.split('/').slice(0, 2).join('/')
        if (!sameWorkspace && destination.startsWith('apps/'))
          errors.push(`${name}: Cannot import another application workspace ${destination}`)
        if (!sameWorkspace && !workspace)
          errors.push(`${name}: Use a declared workspace package export instead of ${specifier}`)
        if (from === to && sameWorkspace) continue
        const registration = modules.get(to)
        if (!registration?.publicFiles.includes(destination))
          errors.push(`${name}: Private cross-module import ${destination}`)
        if (from && from !== to) {
          if (!modules.get(from).dependencies.includes(to))
            errors.push(`${from}: Undeclared dependency on ${to}`)
          edges.get(from).add(to)
        }
      }
    }
    const visiting = new Set()
    const visited = new Set()
    function visit(name, path) {
      if (visiting.has(name)) {
        errors.push(`Module dependency cycle: ${[...path, name].join(' -> ')}`)
        return
      }
      if (visited.has(name)) return
      visiting.add(name)
      for (const dependency of new Set([...edges.get(name), ...modules.get(name).dependencies]))
        if (modules.has(dependency)) visit(dependency, [...path, name])
      visiting.delete(name)
      visited.add(name)
    }
    for (const name of modules.keys()) visit(name, [])
  } catch (error) {
    errors.push(error.message)
  }
  return errors
}

if (isMain(import.meta.url)) {
  const errors = checkModules(projectRoot)
  for (const error of errors) console.error(error)
  console.log(`Module boundaries: ${errors.length ? 'FAILED' : 'PASS'}`)
  process.exitCode = errors.length ? 1 : 0
}
