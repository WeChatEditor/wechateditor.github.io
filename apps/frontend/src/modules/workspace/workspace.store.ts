import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { exampleMarkdown, maxMarkdownLength } from '../../app.config'
import type { ArticleDocument, TextSelection } from '../article/article.model'
import {
  addAnnotation,
  articleStatistics,
  migrateAnnotations,
  renderMarkdown,
  removeAnnotations,
} from '../article/article.service'
import {
  defaultTypesetting,
  normalizeTypesetting,
  maxPalettes,
} from '../typesetting/typesetting.service'
import type { TypesettingConfig } from '../typesetting/typesetting.model'
import { defaultEnding, normalizeEnding } from '../ending/ending.service'
import type { PreparedAsset } from '../assets/assets.model'
import { createAssetUrls, releaseAssetUrls } from '../assets/assets.service'
import { previewArticle, exportArticle, copyRichText } from '../wechat-export/wechat-export.service'
import type { ExportResult, ExportSnapshot, Diagnostic } from '../wechat-export/wechat-export.model'
import type {
  WorkspaceDraft,
  WorkspaceSettings,
  VersionSummary,
  ArticleVersion,
} from './draft-storage.port'
import { createDraftStorage, DraftConflictError } from './adapters/indexeddb-storage'
import { loadSettings, saveSettings, settingsKey } from './adapters/local-settings-storage'
import {
  validateDraft,
  validateLegacyDraft,
  validateVersion,
  draftWriteId,
} from './workspace.service'

export const useWorkspaceStore = defineStore('jlab-workspace', function workspaceStore() {
  const article = ref<ArticleDocument>({
    schemaVersion: 1,
    id: crypto.randomUUID(),
    markdown: exampleMarkdown,
    revision: 0,
    updatedAt: Date.now(),
    annotations: [],
  })
  const config = ref(defaultTypesetting())
  const ending = ref(defaultEnding())
  const assets = ref<PreparedAsset[]>([])
  const ratio = ref(0.5)
  const previewMode = ref<'phone' | 'desktop'>('phone')
  const localColor = ref('#c44b77')
  const drawer = ref<'text' | 'colors' | 'ending' | 'chapters' | 'history' | undefined>()
  const focus = ref(false)
  const ready = ref(false)
  const articleDirty = ref(false)
  const settingsDirty = ref(false)
  const dirty = computed(() => articleDirty.value || settingsDirty.value)
  const articleSaveState = ref('正在读取草稿…')
  const settingsError = ref('')
  const settingsBlocked = ref(false)
  const saveState = computed(() => settingsError.value || articleSaveState.value)
  const saveBlocked = ref(false)
  const versions = ref<VersionSummary[]>([])
  const selectedVersion = ref<ArticleVersion>()
  const historyBusy = ref(false)
  const historyError = ref('')
  const restoring = ref(false)
  const copyState = ref<'idle' | 'preparing' | 'ready' | 'copying' | 'success' | 'error'>('idle')
  const message = ref('')
  const diagnostics = ref<Diagnostic[]>([])
  const exportResult = ref<ExportResult>()
  const urls = ref(new Map<string, string>())
  const storage = createDraftStorage()
  let timer: ReturnType<typeof setTimeout> | undefined
  let saveQueue = Promise.resolve()
  let generation = 0
  let articleGeneration = 0
  let expectedWriteId: string | undefined
  let applying = false
  let exportGeneration = 0
  const channel =
    typeof BroadcastChannel === 'undefined'
      ? undefined
      : new BroadcastChannel('jlab-wechat-editor-draft')
  if (channel) {
    channel.onmessage = function externalSave(event) {
      if (event.data?.saved) {
        saveBlocked.value = true
        articleSaveState.value = '另一页面更新了草稿，请复制原稿到本地文件后刷新页面。'
      }
      if (drawer.value === 'history') {
        void historyAction(refreshVersions)
      }
    }
  }
  function externalSettings(event: StorageEvent): void {
    if (event.storageArea === localStorage && (event.key === settingsKey || event.key === null)) {
      settingsBlocked.value = true
      settingsError.value = '另一页面更新了配置，配置保存已暂停，请刷新页面。'
    }
  }
  window.addEventListener('storage', externalSettings)

  function snapshot(): ExportSnapshot {
    return {
      article: JSON.parse(JSON.stringify(article.value)),
      config: JSON.parse(JSON.stringify(config.value)),
      ending: JSON.parse(JSON.stringify(ending.value)),
      assets: assets.value.map((a) => ({ ...a, blob: a.blob })),
    }
  }
  const preview = computed(function renderPreview() {
    return previewArticle(snapshot(), urls.value)
  })
  const invalidAnnotations = computed(
    () => article.value.annotations.filter((a) => a.invalid).length,
  )
  const statistics = computed(function measureArticle() {
    return articleStatistics(
      [
        ending.value.opening?.enabled ? ending.value.opening.markdown : '',
        article.value.markdown,
        ending.value.enabled ? ending.value.markdown : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
  })

  function rebuildUrls(): void {
    releaseAssetUrls(urls.value)
    urls.value = createAssetUrls(assets.value)
  }

  async function initialize(): Promise<void> {
    let settings: WorkspaceSettings | undefined
    try {
      settings = loadSettings()
      if (settings) {
        applySettings(settings)
      }
    } catch (error) {
      settingsBlocked.value = true
      settingsError.value = '配置读取失败，配置保存已暂停'
      message.value = error instanceof Error ? error.message : '无法读取本地配置。'
    }
    try {
      const stored = await storage.load()
      if (stored !== undefined) {
        expectedWriteId = draftWriteId(stored)
        const legacy = expectedWriteId === 'legacy' ? validateLegacyDraft(stored) : undefined
        const draft = legacy
          ? { schemaVersion: 2 as const, article: legacy.article, assets: legacy.assets }
          : validateDraft(stored)
        article.value = draft.article
        assets.value = draft.assets
        rebuildUrls()
        if (legacy) {
          if (settingsBlocked.value) {
            throw new Error('配置不可读取，旧草稿已恢复到内存，迁移和文章保存暂停，原记录保留。')
          }
          if (!settings) {
            applySettings({
              schemaVersion: 1,
              config: legacy.config,
              ending: legacy.ending,
              ratio: legacy.ratio,
              previewMode: legacy.previewMode,
              localColor: localColor.value,
            })
            saveSettings(settingsSnapshot())
          }
          const result = await storage.save(draft, expectedWriteId)
          expectedWriteId = result.writeId
          channel?.postMessage({ saved: true })
        }
      }
      articleSaveState.value = stored ? '已恢复本地文章' : '修改后自动保存到本机'
    } catch (error) {
      saveBlocked.value = true
      articleSaveState.value = '文章读取或迁移失败，文章保存已暂停'
      message.value =
        error instanceof Error ? error.message : '无法读取草稿，请检查浏览器存储权限。'
    } finally {
      ready.value = true
    }
  }

  function settingsSnapshot(): WorkspaceSettings {
    return {
      schemaVersion: 1,
      config: JSON.parse(JSON.stringify(config.value)),
      ending: normalizeEnding(ending.value),
      ratio: ratio.value,
      previewMode: previewMode.value,
      localColor: localColor.value,
    }
  }
  function applySettings(settings: WorkspaceSettings): void {
    config.value = normalizeTypesetting(settings.config)
    ending.value = normalizeEnding(settings.ending)
    ratio.value = settings.ratio
    previewMode.value = settings.previewMode
    localColor.value = settings.localColor
  }
  function persistSettings(): void {
    if (!ready.value || settingsBlocked.value) {
      return
    }
    try {
      saveSettings(settingsSnapshot())
      settingsDirty.value = false
      settingsError.value = ''
    } catch {
      settingsError.value =
        config.value.palettes.length > maxPalettes
          ? '保存失败：配色最多九个，请删除多余配色或重置所有配色'
          : '保存失败：配置未保存，请检查浏览器存储空间或权限后重试'
    }
  }

  function changed(): void {
    generation++
    exportResult.value = undefined
    copyState.value = 'idle'
    diagnostics.value = []
  }
  function articleChanged(): void {
    changed()
    articleGeneration++
    articleDirty.value = true
    if (timer) {
      clearTimeout(timer)
    }
    if (!saveBlocked.value) {
      articleSaveState.value = '有修改，等待保存…'
      timer = setTimeout(function autosave() {
        void saveNow()
      }, 450)
    }
  }
  watch(
    [article, assets],
    function draftChanged() {
      if (ready.value && !applying) {
        articleChanged()
      }
    },
    { deep: true, flush: 'sync' },
  )
  watch(
    [config, ending, ratio, previewMode, localColor],
    function settingsChanged() {
      if (ready.value && !applying) {
        changed()
        settingsDirty.value = true
        persistSettings()
      }
    },
    { deep: true, flush: 'sync' },
  )

  function articleSnapshot(): WorkspaceDraft {
    const current = snapshot()
    return { schemaVersion: 2, article: current.article, assets: current.assets }
  }
  async function writeArticle(
    draft: WorkspaceDraft,
    version: number,
    history = false,
  ): Promise<number | undefined> {
    if (saveBlocked.value) {
      throw new Error('文章保存已暂停，请备份后刷新页面。')
    }
    articleSaveState.value = '保存中…'
    try {
      const result = await storage.save(draft, expectedWriteId, history)
      expectedWriteId = result.writeId
      if (version === articleGeneration) {
        articleSaveState.value = '已保存到本机'
        articleDirty.value = false
      }
      channel?.postMessage({ saved: true })
      return result.timestamp
    } catch (error) {
      if (error instanceof DraftConflictError) {
        saveBlocked.value = true
      }
      articleSaveState.value = '保存失败，请复制原稿到本地文件备份并重试'
      throw error
    }
  }

  function enqueue<T>(action: () => Promise<T>): Promise<T> {
    const task = saveQueue.then(action)
    saveQueue = task.then(
      () => undefined,
      () => undefined,
    )
    return task
  }

  async function saveNow(): Promise<void> {
    if (timer) {
      clearTimeout(timer)
    }
    if (!ready.value || restoring.value) {
      return
    }
    if (settingsDirty.value) {
      persistSettings()
    }
    if (!articleDirty.value || saveBlocked.value) {
      return
    }
    const version = articleGeneration
    const draft = articleSnapshot()
    try {
      await enqueue(() => writeArticle(draft, version))
    } catch (error) {
      message.value = error instanceof Error ? error.message : '保存失败，请重试。'
    }
  }

  async function refreshVersions(): Promise<void> {
    try {
      versions.value = await storage.listVersions()
      historyError.value = ''
      if (
        selectedVersion.value &&
        !versions.value.some((v) => v.timestamp === selectedVersion.value?.timestamp)
      ) {
        selectedVersion.value = undefined
      }
    } catch (error) {
      historyError.value = error instanceof Error ? error.message : '读取历史版本失败，请重试。'
    }
  }
  async function historyAction(action: () => Promise<void>): Promise<void> {
    if (!ready.value || historyBusy.value) {
      return
    }
    historyBusy.value = true
    historyError.value = ''
    try {
      await enqueue(action)
    } catch (error) {
      historyError.value = error instanceof Error ? error.message : '历史操作失败，请重试。'
    } finally {
      historyBusy.value = false
    }
  }
  async function refreshHistory(): Promise<void> {
    await historyAction(refreshVersions)
  }
  async function createVersion(): Promise<void> {
    if (saveBlocked.value || historyBusy.value) {
      return
    }
    const draft = articleSnapshot()
    const version = articleGeneration
    if (timer) {
      clearTimeout(timer)
    }
    await historyAction(async function appendVersion() {
      await writeArticle(draft, version, true)
      message.value = '已新增文章版本。'
      await refreshVersions()
    })
  }
  async function viewVersion(timestamp: number): Promise<void> {
    await historyAction(async function view() {
      selectedVersion.value = undefined
      selectedVersion.value = validateVersion(await storage.loadVersion(timestamp), timestamp)
    })
  }
  async function restoreVersion(timestamp: number): Promise<void> {
    if (saveBlocked.value || historyBusy.value) {
      return
    }
    restoring.value = true
    if (timer) {
      clearTimeout(timer)
    }
    await historyAction(async function restore() {
      const record = validateVersion(await storage.loadVersion(timestamp), timestamp)
      const draft = record.draft
      const revision = Math.max(article.value.revision, draft.article.revision) + 1
      draft.article = {
        ...draft.article,
        revision,
        updatedAt: Date.now(),
        annotations: draft.article.annotations.map((a) => ({ ...a, revision })),
      }
      const endingAssets = assets.value.filter(
        (asset) =>
          (ending.value.markdown.includes(`asset:${asset.id}`) ||
            ending.value.opening?.markdown.includes(`asset:${asset.id}`)) &&
          !draft.assets.some((item) => item.id === asset.id),
      )
      draft.assets = [...draft.assets, ...endingAssets]
      await writeArticle(draft, articleGeneration)
      applying = true
      try {
        article.value = draft.article
        assets.value = draft.assets
        rebuildUrls()
      } finally {
        applying = false
      }
      articleGeneration++
      changed()
      message.value = '已恢复到当前文章，排版设置与固定头尾保持当前配置。'
    })
    restoring.value = false
    if (articleDirty.value && !saveBlocked.value) {
      void saveNow()
    }
  }
  async function deleteVersion(timestamp: number): Promise<void> {
    await historyAction(async function remove() {
      await storage.deleteVersion(timestamp)
      if (selectedVersion.value?.timestamp === timestamp) {
        selectedVersion.value = undefined
      }
      await refreshVersions()
      channel?.postMessage({ history: true })
      message.value = '已删除历史版本，当前文章保留。'
    })
  }

  function updateMarkdown(markdown: string): void {
    if (restoring.value || markdown === article.value.markdown) {
      return
    }
    if (markdown.length > maxMarkdownLength) {
      message.value = '文章超过 50 万字符，请拆分后再导入。'
      return
    }
    const before = renderMarkdown(article.value.markdown).text
    const after = renderMarkdown(markdown).text
    const revision = article.value.revision + 1
    article.value = {
      ...article.value,
      markdown,
      revision,
      updatedAt: Date.now(),
      annotations: migrateAnnotations(before, after, article.value.annotations, revision),
    }
    pruneAssets()
  }
  function pruneAssets(): void {
    const markdown = [
      article.value.markdown,
      ending.value.markdown,
      ending.value.opening?.markdown ?? '',
    ].join('\n')
    const used = assets.value.filter((asset) => markdown.includes(`asset:${asset.id}`))
    if (used.length !== assets.value.length) {
      assets.value = used
      rebuildUrls()
    }
  }
  function setConfig(patch: Partial<TypesettingConfig>): void {
    config.value = { ...config.value, ...patch }
  }
  function choosePreset(id: string): void {
    const preset = config.value.palettes.find((p) => p.id === id)
    if (preset) {
      setConfig({ preset: preset.id, colors: { ...preset.colors } })
    }
  }
  function colorSelection(selection: TextSelection | undefined, color: string): void {
    localColor.value = color
    if (restoring.value) {
      return
    }
    if (!selection || selection.revision !== article.value.revision) {
      message.value = '请重新选中右侧预览中的正文文字，再设置颜色。'
      return
    }
    article.value = {
      ...article.value,
      annotations: addAnnotation(article.value.annotations, selection, color),
      updatedAt: Date.now(),
    }
  }
  function toggleDrawer(kind: 'text' | 'colors' | 'ending' | 'chapters' | 'history'): void {
    drawer.value = drawer.value === kind ? undefined : kind
    if (drawer.value === 'history') {
      void historyAction(refreshVersions)
    }
  }
  function clearSelectionColor(selection: TextSelection | undefined): void {
    if (!ready.value || restoring.value) {
      return
    }
    if (!selection || selection.revision !== article.value.revision) {
      message.value = '请重新选择需要清除颜色的正文文字。'
      return
    }
    article.value = {
      ...article.value,
      annotations: removeAnnotations(article.value.annotations, selection),
      updatedAt: Date.now(),
    }
  }
  function clearInvalidAnnotations(): void {
    if (!ready.value || restoring.value) {
      return
    }
    article.value = {
      ...article.value,
      annotations: article.value.annotations.filter((a) => !a.invalid),
      updatedAt: Date.now(),
    }
  }
  async function prepareCopy(): Promise<void> {
    if (copyState.value === 'preparing' || copyState.value === 'copying') {
      return
    }
    copyState.value = 'preparing'
    message.value = ''
    const current = generation
    const job = ++exportGeneration
    try {
      const result = await exportArticle(snapshot())
      if (current !== generation || job !== exportGeneration) {
        message.value = '准备期间内容已修改，请重新复制。'
        copyState.value = 'idle'
        return
      }
      diagnostics.value = result.diagnostics
      if (result.diagnostics.some((d) => d.level === 'error')) {
        copyState.value = 'error'
        message.value = '请打开「诊断」处理图片或内容问题后再复制。'
        return
      }
      exportResult.value = result
      await copyPrepared()
    } catch (error) {
      copyState.value = exportResult.value ? 'ready' : 'error'
      message.value = error instanceof Error ? error.message : '复制失败，请重试。'
    }
  }
  async function copyPrepared(): Promise<void> {
    if (!exportResult.value) {
      return
    }
    copyState.value = 'copying'
    try {
      await copyRichText(exportResult.value)
      copyState.value = 'success'
      message.value = '已复制图文，请到公众号编辑器粘贴，并检查保存后的效果。'
    } catch (error) {
      copyState.value = 'ready'
      message.value =
        error instanceof Error && error.message.startsWith('富文本复制需要')
          ? error.message
          : '内容已准备好，浏览器未允许复制。请再次点击「复制已准备内容」，或检查剪贴板权限。'
    }
  }
  function dispose(): void {
    if (timer) {
      clearTimeout(timer)
    }
    releaseAssetUrls(urls.value)
    channel?.close()
    window.removeEventListener('storage', externalSettings)
    void saveQueue.finally(() => storage.close())
  }

  return {
    article,
    config,
    ending,
    assets,
    ratio,
    previewMode,
    localColor,
    drawer,
    focus,
    ready,
    dirty,
    saveState,
    saveBlocked,
    settingsBlocked,
    versions,
    selectedVersion,
    historyBusy,
    historyError,
    restoring,
    copyState,
    message,
    diagnostics,
    exportResult,
    preview,
    invalidAnnotations,
    statistics,
    snapshot,
    initialize,
    saveNow,
    refreshHistory,
    createVersion,
    viewVersion,
    restoreVersion,
    deleteVersion,
    updateMarkdown,
    setConfig,
    choosePreset,
    colorSelection,
    clearSelectionColor,
    clearInvalidAnnotations,
    toggleDrawer,
    prepareCopy,
    copyPrepared,
    dispose,
  }
})
