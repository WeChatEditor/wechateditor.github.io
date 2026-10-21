<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useWorkspaceStore } from './workspace.store'
import { clampRatio, splitBounds } from './workspace.service'
import { useScrollSync } from './workspace-scroll-sync'
import WorkspaceToolbar from './workspace-toolbar.vue'
import WorkspaceFeedback from './workspace-feedback.vue'
import './workspace-theme.css'
import HistoryPanel from './workspace-history-panel.vue'
import ArticleEditor from '../article/article-editor.vue'
import ArticlePreview from '../article/article-preview.vue'
import TypesettingPanel from '../typesetting/typesetting-panel.vue'
import EndingPanel from '../ending/ending-panel.vue'
import TransferPanel from '../wechat-transfer/wechat-transfer-panel.vue'
import type { TextSelection } from '../article/article.model'
import { maxMarkdownLength } from '../../app.config'

const store = useWorkspaceStore()
const conflictDialog = ref<InstanceType<typeof window.HTMLDialogElement>>()
const manualClose = ref(false)
const disabled = computed(() => !store.ready || store.restoring || Boolean(store.conflictReason))
let closeTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => store.conflictReason,
  async function conflictChanged(reason) {
    if (!reason) {
      return
    }
    stopDrag()
    selection.value = undefined
    ElMessageBox.close()
    await nextTick()
    if (conflictDialog.value && !conflictDialog.value.open) {
      conflictDialog.value.showModal()
    }
  },
  { flush: 'post' },
)
function closeConflictedTab(): void {
  try {
    window.close()
  } catch {
    manualClose.value = true
  }
  clearTimeout(closeTimer)
  closeTimer = setTimeout(function checkClosed() {
    if (!window.closed) {
      manualClose.value = true
    }
  }, 200)
}
const split = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const selection = ref<TextSelection>()
const previewComponent = ref<InstanceType<typeof ArticlePreview>>()
const editorComponent = ref<InstanceType<typeof ArticleEditor>>()
const syncScroll = ref(false)
const canSyncScroll = computed(
  () =>
    syncScroll.value && store.ready && !store.focus && !store.restoring && !store.conflictReason,
)
const scrollSync = useScrollSync(
  canSyncScroll,
  () => editorComponent.value?.getScrollElement(),
  () => previewComponent.value?.getScrollElement(),
  () => previewComponent.value?.getScrollAnchors() || [],
  (lines) => editorComponent.value?.getScrollAnchors(lines) || [],
)
const containerWidth = ref(900)
const dragging = ref(false)
let observer: ResizeObserver | undefined
const displayedRatio = computed(() => clampRatio(store.ratio, containerWidth.value))
const drawerSize = computed(() => {
  const wide = store.drawer !== 'text'
  const available = wide
    ? containerWidth.value - 40
    : Math.floor(containerWidth.value * displayedRatio.value)
  const maximum = store.drawer === 'colors' ? 640 : wide ? 520 : 320
  return `${Math.min(maximum, available)}px`
})
function toggleDrawer(kind: NonNullable<typeof store.drawer>): void {
  store.focus = false
  store.toggleDrawer(kind)
}
const gridStyle = computed(() =>
  store.focus
    ? { gridTemplateColumns: '1fr' }
    : {
        gridTemplateColumns: `minmax(280px, ${displayedRatio.value}fr) minmax(320px, ${1 - displayedRatio.value}fr)`,
      },
)
const drawerTitle = computed(
  () =>
    ({
      text: '文字设置',
      colors: '配色',
      ending: '固定头尾',
      chapters: '标题样式',
      history: '历史版本',
      transfer: '发送到公众号',
    })[store.drawer || 'text'],
)
function updatePointer(event: PointerEvent): void {
  if (!split.value || !dragging.value || disabled.value) {
    return
  }
  const rect = split.value.getBoundingClientRect()
  store.ratio = clampRatio((event.clientX - rect.left) / rect.width, rect.width)
}
function startDrag(event: PointerEvent): void {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  updatePointer(event)
}
function stopDrag(): void {
  dragging.value = false
}
function keyRatio(event: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return
  }
  event.preventDefault()
  const bounds = splitBounds(containerWidth.value)
  store.ratio =
    event.key === 'Home'
      ? bounds.min
      : event.key === 'End'
        ? bounds.max
        : clampRatio(
            displayedRatio.value + (event.key === 'ArrowLeft' ? -0.02 : 0.02),
            containerWidth.value,
          )
}
async function importFile(event: Event): Promise<void> {
  if (disabled.value) {
    return
  }
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  try {
    if (!/\.(md|txt)$/i.test(file.name) || file.size > 2 * 1024 * 1024) {
      throw new Error('请选择不超过 2 MB 的单个 .md 或 .txt 文件。')
    }
    if (!window.confirm('导入将替换当前正文。需要保留时，请先在「历史版本」新增版本。')) {
      return
    }
    const revision = store.article.revision
    const markdown = new TextDecoder('utf-8', { fatal: true })
      .decode(await file.arrayBuffer())
      .replace(/^\uFEFF/, '')
    if (store.conflictReason) {
      return
    }
    if (markdown.length > maxMarkdownLength) {
      throw new Error('文章超过 50 万字符，请拆分后导入。')
    }
    if (revision !== store.article.revision) {
      throw new Error('读取文件期间正文已修改，请重新导入。')
    }
    store.updateMarkdown(markdown)
    selection.value = undefined
    store.message = `已导入 ${file.name}`
  } catch (error) {
    store.message = error instanceof Error ? error.message : '文件无法读取，请使用 UTF-8 编码。'
  }
}
function copy(): void {
  if (store.copyState === 'ready') {
    void store.copyPrepared()
  } else {
    void store.prepareCopy()
  }
}
function beforeUnload(event: BeforeUnloadEvent): void {
  if (store.dirty && !store.conflictReason) {
    event.preventDefault()
    event.returnValue = ''
    void store.saveNow()
  }
}
function pageHidden(): void {
  if (document.hidden && store.dirty) {
    void store.saveNow()
  }
}
onMounted(function initialize() {
  void store.initialize()
  void store.detectPlugin()
  observer = new ResizeObserver(function measure(entries) {
    containerWidth.value = entries[0].contentRect.width
  })
  if (split.value) {
    observer.observe(split.value)
  }
  window.addEventListener('blur', stopDrag)
  window.addEventListener('beforeunload', beforeUnload)
  document.addEventListener('visibilitychange', pageHidden)
})
onBeforeUnmount(function cleanup() {
  clearTimeout(closeTimer)
  conflictDialog.value?.close()
  observer?.disconnect()
  window.removeEventListener('blur', stopDrag)
  window.removeEventListener('beforeunload', beforeUnload)
  document.removeEventListener('visibilitychange', pageHidden)
  store.dispose()
})
</script>

<template>
  <main class="workbench" :inert="Boolean(store.conflictReason)">
    <WorkspaceToolbar
      :config="store.config"
      :drawer="store.drawer"
      :copy-state="store.copyState"
      :transfer-busy="store.transferState.busy"
      :plugin-availability="store.transferState.availability"
      :disabled="disabled"
      :save-state="store.saveState"
      :plugin-save-state="store.pluginSaveState"
      :save-blocked="store.saveBlocked || store.settingsBlocked"
      @config="store.setConfig"
      @drawer="toggleDrawer"
      @copy="copy"
      @transfer="store.openTransfer"
      @retry="store.saveNow"
    />
    <input
      ref="fileInput"
      class="hidden-input"
      type="file"
      accept=".md,.txt"
      @change="importFile"
    />
    <el-drawer
      :model-value="Boolean(store.drawer)"
      :title="drawerTitle"
      direction="ltr"
      :size="drawerSize"
      :modal="false"
      :modal-penetrable="true"
      :lock-scroll="false"
      class="settings-drawer"
      @update:model-value="!$event && (store.drawer = undefined)"
    >
      <TypesettingPanel
        v-if="
          store.drawer &&
          store.drawer !== 'ending' &&
          store.drawer !== 'history' &&
          store.drawer !== 'transfer'
        "
        :kind="store.drawer"
        :config="store.config"
        @change="store.setConfig"
        @preset="store.choosePreset"
      />
      <EndingPanel
        v-else-if="store.drawer === 'ending'"
        :ending="store.ending"
        :show-fixed-fragments="store.showFixedFragments"
        @change="store.ending = { ...store.ending, ...$event }"
        @show-fixed-fragments="store.showFixedFragments = $event"
      />
      <HistoryPanel
        v-else-if="store.drawer === 'history'"
        :versions="store.versions"
        :selected="store.selectedVersion"
        :busy="store.historyBusy"
        :blocked="store.saveBlocked"
        :error="store.historyError"
        @create="store.createVersion"
        @refresh="store.refreshHistory"
        @view="store.viewVersion"
        @restore="store.restoreVersion"
        @delete="store.deleteVersion"
      />
      <TransferPanel
        v-if="store.drawer === 'transfer'"
        :title="store.transferTitle"
        :state="store.transferState"
        :disabled="disabled || ['preparing', 'copying'].includes(store.copyState)"
        @copy="copy"
        @detect="store.detectPlugin"
        @panel="store.openTransferPanel"
      />
    </el-drawer>
    <div class="content-row">
      <div ref="split" class="split-workspace" :style="gridStyle">
        <ArticleEditor
          v-if="!store.focus"
          ref="editorComponent"
          :markdown="store.article.markdown"
          :opening="
            store.showFixedFragments && store.ending.opening?.enabled
              ? store.ending.opening.markdown
              : undefined
          "
          :ending="
            store.showFixedFragments && store.ending.enabled ? store.ending.markdown : undefined
          "
          :disabled="disabled"
          @change="store.updateMarkdown"
          @import="fileInput?.click()"
          @scroll="scrollSync.scrolled"
          @scroll-layout="scrollSync.align"
        />
        <div
          v-if="!store.focus"
          class="separator"
          :class="{ dragging }"
          role="separator"
          tabindex="0"
          aria-label="调整编辑与预览比例"
          aria-orientation="vertical"
          :aria-valuenow="Math.round(displayedRatio * 100)"
          :aria-valuemin="Math.round(splitBounds(containerWidth).min * 100)"
          :aria-valuemax="Math.round(splitBounds(containerWidth).max * 100)"
          @pointerdown="startDrag"
          @pointermove="updatePointer"
          @pointerup="stopDrag"
          @pointercancel="stopDrag"
          @lostpointercapture="stopDrag"
          @keydown="keyRatio"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
            <path
              d="M4 5v10M8 5v10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <ArticlePreview
          ref="previewComponent"
          :html="store.preview.html"
          :revision="store.article.revision"
          :mode="store.previewMode"
          :focus="store.focus"
          :disabled="disabled"
          :accent="store.config.colors.accent"
          :local-color="store.localColor"
          :sync-scroll="syncScroll"
          @sync-scroll="syncScroll = $event"
          @scroll="scrollSync.scrolled"
          @scroll-layout="scrollSync.align"
          @mode="store.previewMode = $event"
          @focus="store.focus = !store.focus"
          @selection="selection = $event"
          @error="store.message = $event"
          @color="store.colorSelection(selection, $event)"
          @clear="store.clearSelectionColor(selection)"
        />
      </div>
      <WorkspaceFeedback
        :message="store.message"
        :invalid="store.invalidAnnotations"
        :diagnostics="[...store.preview.diagnostics, ...store.diagnostics]"
        :disabled="disabled"
        @dismiss="store.message = ''"
        @clear="store.clearInvalidAnnotations"
      />
    </div>
    <footer class="status-bar">
      <span title="排版文字的非空白字符数，含已启用的固定头尾；阅读时长按 600 字/分钟估算">
        {{ store.statistics.characters.toLocaleString() }} 字
        <span class="status-dot">/</span>
        预计阅读 {{ store.statistics.readingMinutes }} 分钟
      </span>
      <nav class="author-info" aria-label="产品与使用帮助">
        <a href="./about/" target="_blank" rel="noopener noreferrer">产品介绍</a>
        <a href="./guides/markdown-to-wechat/" target="_blank" rel="noopener noreferrer"
          >排版教程</a
        >
        <a href="./extension/" target="_blank" rel="noopener noreferrer">传稿插件</a>
        <a href="./privacy/" target="_blank" rel="noopener noreferrer">隐私说明</a>
        <span>作者：桀士</span>
        <a
          href="https://github.com/tanghaojie/JLabWeChatEditor"
          target="_blank"
          rel="noopener noreferrer"
          >开源代码 ↗</a
        >
      </nav>
    </footer>
  </main>
  <dialog
    ref="conflictDialog"
    class="conflict-dialog"
    aria-labelledby="conflict-title"
    aria-describedby="conflict-description"
    @cancel.prevent
  >
    <div class="conflict-warning" aria-hidden="true">!</div>
    <h2 id="conflict-title">当前页面自动保存已暂停</h2>
    <p id="conflict-description">{{ store.conflictReason }}</p>
    <p class="conflict-instruction">请关闭当前标签页，继续使用另一标签页编辑。</p>
    <p v-if="manualClose" class="conflict-close-error" role="alert">
      浏览器未允许自动关闭。请点击标签页的关闭按钮，手动关闭当前页面。
    </p>
    <button type="button" class="conflict-confirm" @click="closeConflictedTab">
      知道了，关闭当前标签页
    </button>
  </dialog>
</template>

<style>
.workbench {
  display: flex;
  flex-direction: column;
  min-width: 800px;
  height: 100vh;
  min-height: 650px;
}
.hidden-input {
  display: none;
}
.content-row {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.settings-drawer {
  top: 52px !important;
  height: calc(100% - 87px) !important;
}
.settings-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 22px;
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text);
}
.settings-drawer .el-drawer__body {
  padding: 0;
}
.split-workspace {
  position: relative;
  flex: 1;
  min-width: 600px;
  display: grid;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr);
  overflow: hidden;
}
.workbench .editor-pane textarea,
.workbench .preview-scroll {
  scrollbar-width: thin;
  scrollbar-color: #94a3b855 transparent;
}
.workbench .editor-pane textarea:hover,
.workbench .preview-scroll:hover {
  scrollbar-color: #94a3b899 transparent;
}
.workbench .editor-pane textarea::-webkit-scrollbar,
.workbench .preview-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.workbench .editor-pane textarea::-webkit-scrollbar-track,
.workbench .preview-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.workbench .editor-pane textarea::-webkit-scrollbar-thumb,
.workbench .preview-scroll::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background: #94a3b855;
}
.workbench .editor-pane textarea:hover::-webkit-scrollbar-thumb,
.workbench .preview-scroll:hover::-webkit-scrollbar-thumb {
  background: #94a3b899;
}
.separator {
  position: absolute;
  left: v-bind('displayedRatio * 100 + "%"');
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 12px;
  height: 32px;
  cursor: col-resize;
  touch-action: none;
  user-select: none;
  display: grid;
  place-items: center;
  color: var(--ui-muted);
  border-radius: 4px;
}
.separator:hover,
.separator.dragging {
  color: var(--ui-primary);
  background: var(--ui-active);
}
.status-bar {
  height: 35px;
  flex-shrink: 0;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--ui-surface);
  border-top: 1px solid var(--ui-border);
  font-size: 12px;
  color: var(--ui-muted);
  gap: 16px;
  white-space: nowrap;
  overflow-x: auto;
}
.status-dot {
  padding: 0 12px;
  color: var(--ui-border);
}
.author-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.status-bar > span {
  flex-shrink: 0;
}
.author-info a {
  color: var(--ui-primary);
  text-decoration: none;
}
.author-info a:hover {
  text-decoration: underline;
}
.author-info a:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
.conflict-dialog {
  width: min(460px, calc(100vw - 40px));
  padding: 28px;
  border: 1px solid #f0cf9e;
  border-radius: 16px;
  color: var(--ui-text);
  background: var(--ui-surface);
  box-shadow: 0 24px 80px #0f172a40;
}
.conflict-dialog::backdrop {
  background: #0f172aa6;
}
.conflict-warning {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #fff3df;
  color: #a16207;
  font-size: 24px;
  font-weight: 700;
}
.conflict-dialog h2 {
  margin: 18px 0 12px;
  font-size: 20px;
  line-height: 1.5;
}
.conflict-dialog p {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.75;
}
.conflict-instruction {
  color: var(--ui-muted);
}
.conflict-close-error {
  padding: 12px;
  border-radius: 8px;
  background: #fff3df;
  color: #92400e;
}
.conflict-confirm {
  width: 100%;
  margin-top: 18px;
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: var(--ui-primary);
  color: white;
  font-size: 14px;
  line-height: 22px;
}
</style>
