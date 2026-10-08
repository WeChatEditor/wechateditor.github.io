<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { readSelection } from './article.service'
import type { TextSelection } from './article.model'
import ColorPicker from '../typesetting/typesetting-color-picker.vue'
const props = defineProps<{
  html: string
  revision: number
  mode: 'phone' | 'desktop'
  focus: boolean
  disabled: boolean
  accent: string
  localColor: string
  syncScroll: boolean
}>()
const emit = defineEmits<{
  selection: [value: TextSelection | undefined]
  error: [message: string]
  mode: [value: 'phone' | 'desktop']
  focus: []
  color: [color: string]
  clear: []
  syncScroll: [value: boolean]
  scroll: [element: HTMLElement]
  scrollLayout: []
}>()
const root = ref<HTMLElement>()
const pane = ref<HTMLElement>()
const paper = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const outerScroll = ref<HTMLElement>()
const readerContent = ref<HTMLElement>()
const frameScale = ref(1)
const scaleMode = ref<'fit' | 'actual'>('fit')
const phoneScale = computed(() => (scaleMode.value === 'actual' ? 1 : frameScale.value))
const readerTitle = computed(() => {
  const content = document.createElement('div')
  content.innerHTML = props.html
  const title = [...content.querySelectorAll('h1')].find(
    (heading) => !heading.closest('[data-opening], [data-ending]'),
  )
  return title?.textContent || '微信文章'
})
const bubble = ref<HTMLElement>()
const showFrame = ref(true)
const bubbleOpen = ref(false)
const bubblePosition = ref({ left: '0px', top: '0px' })
const quickColors = computed(() => [
  ...new Set([props.accent, '#b7791f', '#c2410c', '#0f766e', '#30323d']),
])
let observer: ResizeObserver | undefined
function getScrollElement(): HTMLElement | undefined {
  return showFrame.value ? readerContent.value : outerScroll.value
}
function scrolled(event: Event): void {
  closeSelection()
  if (event.target === getScrollElement()) {
    emit('scroll', event.target as HTMLElement)
  }
}
function measureFrame(): void {
  if (stage.value && stage.value.clientWidth > 0 && stage.value.clientHeight > 0) {
    frameScale.value = Math.min(1, stage.value.clientWidth / 440, stage.value.clientHeight / 956)
  }
  closeSelection()
  void nextTick(function layoutChanged() {
    emit('scrollLayout')
  })
}
function closeSelection(): void {
  bubbleOpen.value = false
  emit('selection', undefined)
}
function captureSelection(): TextSelection | undefined {
  if (!root.value || props.disabled) {
    return
  }
  try {
    const value = readSelection(root.value, props.revision)
    if (value) {
      emit('selection', value)
    }
    return value
  } catch (error) {
    closeSelection()
    emit('error', error instanceof Error ? error.message : '请重新选择文字。')
  }
}
async function selectionFinished(): Promise<void> {
  if (!captureSelection()) {
    closeSelection()
    return
  }
  const range = window.getSelection()?.getRangeAt(0)
  if (!range || !pane.value) {
    return
  }
  const rect = range.getBoundingClientRect()
  bubbleOpen.value = true
  await nextTick()
  if (!bubble.value || !pane.value || !bubbleOpen.value) {
    return
  }
  const bounds = pane.value.getBoundingClientRect()
  const width = bubble.value.offsetWidth
  const height = bubble.value.offsetHeight
  const above = rect.top - bounds.top - height - 8
  bubblePosition.value = {
    left: `${Math.max(8, Math.min(bounds.width - width - 8, rect.left - bounds.left + (rect.width - width) / 2))}px`,
    top: `${Math.max(8, Math.min(bounds.height - height - 8, above >= 8 ? above : rect.bottom - bounds.top + 8))}px`,
  }
}
function changedSelection(): void {
  const selection = window.getSelection()
  if (!selection?.anchorNode || !root.value?.contains(selection.anchorNode)) {
    return
  }
  if (selection.isCollapsed) {
    closeSelection()
  } else {
    captureSelection()
  }
}
function outsidePointer(event: PointerEvent): void {
  const target = event.target instanceof Element ? event.target : undefined
  if (target?.closest('.selection-bubble, .color-capsule, .el-color-picker__panel')) {
    return
  }
  if (target && root.value?.contains(target)) {
    return
  }
  closeSelection()
}
function keydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeSelection()
  }
}
function applyColor(color: string): void {
  emit('color', color)
  bubbleOpen.value = false
}
function clearColor(): void {
  emit('clear')
  bubbleOpen.value = false
}
watch(() => [props.html, props.revision, props.mode, props.focus, props.disabled], closeSelection)
watch([showFrame, scaleMode, () => props.mode, () => props.focus], measureFrame, { flush: 'post' })
onMounted(function listen() {
  document.addEventListener('selectionchange', changedSelection)
  document.addEventListener('pointerdown', outsidePointer)
  document.addEventListener('keydown', keydown)
  observer = new ResizeObserver(measureFrame)
  if (paper.value) {
    observer.observe(paper.value)
  }
  if (stage.value) {
    observer.observe(stage.value)
  }
  if (root.value) {
    observer.observe(root.value)
  }
  measureFrame()
})
onBeforeUnmount(function unlisten() {
  observer?.disconnect()
  document.removeEventListener('selectionchange', changedSelection)
  document.removeEventListener('pointerdown', outsidePointer)
  document.removeEventListener('keydown', keydown)
})
defineExpose({ captureSelection, getScrollElement })
</script>
<template>
  <section ref="pane" class="preview-pane">
    <div class="preview-heading">
      <span class="preview-title">
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        公众号预览
      </span>
      <div class="preview-actions">
        <button
          type="button"
          class="ui-button"
          :class="{ active: syncScroll }"
          :aria-pressed="syncScroll"
          :disabled="disabled"
          @click="emit('syncScroll', !syncScroll)"
        >
          同步滚动
        </button>
        <button
          type="button"
          class="ui-button"
          :class="{ active: showFrame }"
          :aria-pressed="showFrame"
          :disabled="disabled"
          @click="showFrame = !showFrame"
        >
          阅读外壳
        </button>
        <el-radio-group
          :model-value="mode"
          size="small"
          :disabled="disabled"
          aria-label="预览宽度"
          @update:model-value="emit('mode', $event as 'phone' | 'desktop')"
          ><el-radio-button value="phone"
            ><svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M7 2h10v20H7ZM10 18h4" /></svg
            >手机</el-radio-button
          ><el-radio-button value="desktop"
            ><svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 4h18v13H3ZM12 17v4M8 21h8" /></svg
            >电脑</el-radio-button
          ></el-radio-group
        ><button
          type="button"
          class="ui-button"
          :class="{ active: focus }"
          :disabled="disabled"
          :aria-pressed="focus"
          @click="emit('focus')"
        >
          <svg
            class="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" /></svg
          >{{ focus ? '返回编辑' : '专注预览' }}
        </button>
      </div>
    </div>
    <div
      ref="outerScroll"
      class="preview-scroll"
      :class="{
        framed: showFrame,
        'actual-pixels': showFrame && mode === 'phone' && scaleMode === 'actual',
      }"
      @scroll="scrolled"
    >
      <div v-if="showFrame && mode === 'phone'" class="phone-scale-toolbar">
        <div class="phone-scale-controls">
          <el-radio-group
            v-model="scaleMode"
            size="small"
            :disabled="disabled"
            aria-label="手机外壳缩放"
          >
            <el-radio-button value="fit">自适应屏幕</el-radio-button>
            <el-radio-button value="actual">原始比例</el-radio-button>
          </el-radio-group>
          <span class="scale-status" role="status">
            当前缩放比例: {{ Math.round(phoneScale * 100) }}%
          </span>
        </div>
      </div>
      <div ref="stage" class="frame-stage">
        <div
          ref="paper"
          class="paper"
          :class="[mode, { 'without-frame': !showFrame }]"
          :style="showFrame && mode === 'phone' ? { zoom: phoneScale } : undefined"
        >
          <template v-if="showFrame">
            <div v-if="mode === 'phone'" class="phone-status" aria-hidden="true">
              <span>9:41</span><i class="island" /><span>5G ▰</span>
            </div>
            <div v-if="mode === 'phone'" class="reader-nav" aria-hidden="true">
              <span>‹</span><span>微信文章</span><span>···</span>
            </div>
            <div v-else class="desktop-toolbar" aria-hidden="true">
              <span class="browser-controls">‹&#x3000;›&#x3000;⟳</span>
              <span class="browser-tab">{{ readerTitle }} <span>×</span></span>
              <span class="browser-search">⌕</span>
              <span class="window-controls">···&#x3000;−&#x3000;□&#x3000;×</span>
            </div>
          </template>
          <div ref="readerContent" class="reader-content" @scroll="scrolled">
            <div v-if="showFrame" class="reader-meta">
              <span class="original">原创</span><span class="account">公众号名称</span
              ><small>模拟阅读信息</small>
            </div>
            <article
              ref="root"
              title="选中文字可局部改色"
              @pointerup="selectionFinished"
              @keyup="selectionFinished"
              v-html="html"
            />
          </div>
          <div v-if="showFrame && mode === 'phone'" class="phone-home" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="bubbleOpen"
      ref="bubble"
      class="selection-bubble"
      :style="bubblePosition"
      role="toolbar"
      aria-label="选中文字颜色"
      @pointerdown.prevent
    >
      <span>字色</span
      ><button
        v-for="color in quickColors"
        :key="color"
        class="color-dot"
        :style="{ '--swatch': color }"
        :aria-label="`设置字色 ${color}`"
        :disabled="disabled"
        @click="applyColor(color)"
      />
      <ColorPicker
        :color="localColor"
        label="自定义字色"
        compact
        :disabled="disabled"
        @change="applyColor"
      />
      <button class="ui-button" :disabled="disabled" @click="clearColor">
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m9 4 11 11-6 6H8l-6-6ZM7 10l11 11M14 21h8" /></svg
        >清除
      </button>
    </div>
  </section>
</template>
<style scoped>
.preview-pane {
  position: relative;
  border-left: 1px solid var(--ui-border);
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  min-height: 0;
  background: var(--ui-bg);
}
.preview-heading {
  height: var(--ui-pane-heading-height);
  padding: 0 16px;
  flex-shrink: 0;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  background: var(--ui-surface);
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text);
  font-size: 13px;
}
.preview-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}
.preview-title {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
}
.preview-pane :deep(.el-radio-button__inner) {
  padding: 6px 10px;
  color: var(--ui-muted);
}
.preview-pane :deep(.el-radio-button) {
  --el-radio-button-checked-bg-color: var(--ui-active);
  --el-radio-button-checked-text-color: var(--ui-primary);
  --el-radio-button-checked-border-color: var(--ui-border);
}
.preview-pane :deep(.el-radio-button:not(.is-disabled) .el-radio-button__inner:hover) {
  background: var(--ui-hover);
  color: var(--ui-text);
}
.preview-pane :deep(.el-radio-button.is-active:not(.is-disabled) .el-radio-button__inner) {
  background: var(--ui-active);
  color: var(--ui-primary);
}
.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 18px 16px;
}
.phone-scale-toolbar {
  flex-shrink: 0;
  overflow-x: auto;
  margin-bottom: 12px;
}
.phone-scale-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  margin: 0 auto;
  white-space: nowrap;
}
.phone-scale-controls :deep(.el-radio-group) {
  flex-shrink: 0;
}
.scale-status {
  color: var(--ui-muted);
  font-size: 12px;
}
.paper {
  margin: 0 auto;
  background: #fff;
  box-shadow: var(--ui-shadow);
  border: 1px solid var(--ui-border);
  overflow: hidden;
}
.paper.phone {
  width: 440px;
  max-width: 100%;
  border-radius: 24px;
}
.paper.desktop {
  width: 1100px;
  max-width: 100%;
  border-radius: var(--ui-radius-lg);
}
.paper.without-frame {
  border-radius: var(--ui-radius);
}
.phone-status {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 20px;
  font-size: 12px;
  color: #1e293b;
}
.island {
  width: 66px;
  height: 17px;
  border-radius: 20px;
  background: #17212f;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.reader-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 20px;
  background: #fafafa;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #334155;
}
.reader-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 24px 24px 0;
  font-size: 12px;
  color: #64748b;
}
.original {
  border: 1px solid #e2e8f0;
  padding: 1px 4px;
  border-radius: 3px;
}
.account {
  color: #576b95;
}
.reader-meta small {
  font-size: 11px;
}
article {
  padding: 4px 24px 28px;
  min-height: 480px;
}
.without-frame article {
  padding-top: 24px;
}
.desktop article {
  padding: 4px 36px 36px;
}
.desktop .reader-meta {
  padding-left: 36px;
}
.desktop.without-frame article {
  padding-top: 24px;
}
.selection-bubble {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 8px;
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-shadow-float);
  white-space: nowrap;
}
.selection-bubble > span {
  color: var(--ui-muted);
  font-size: 12px;
  margin-right: 3px;
}
.color-dot {
  display: grid;
  place-items: center;
  width: 26px;
  height: 30px;
  padding: 4px;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
}
.color-dot::after {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--swatch);
}
.color-dot:hover {
  background: var(--ui-hover);
}
article :deep(::selection) {
  background: #dbeafe;
}
@media (prefers-reduced-motion: no-preference) {
  .selection-bubble {
    animation: appear 0.15s ease-out;
  }
  @keyframes appear {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.preview-scroll.framed {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.frame-stage {
  min-height: 0;
}
.framed .frame-stage {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}
.framed .paper {
  display: flex;
  flex-direction: column;
  margin: 0;
  min-height: 0;
  flex-shrink: 0;
}
.framed .paper.phone {
  width: 440px;
  max-width: none;
  height: 956px;
  border: 3px solid #cbd2da;
  box-shadow:
    0 0 0 1px #e2e8f0,
    0 8px 24px #0f172a0a;
  border-radius: 58px;
}
.preview-scroll.actual-pixels {
  overflow: auto;
}
.actual-pixels .frame-stage {
  min-width: 440px;
}
.actual-pixels .paper.phone {
  height: 100%;
  max-height: 956px;
}
.framed .paper.desktop {
  height: 100%;
  max-height: 100%;
  width: 100%;
  max-width: 1100px;
  border: 1px solid #bfc5ce;
  border-radius: 10px;
}
.framed .phone-status {
  height: 58px;
  flex-shrink: 0;
  padding: 0 28px;
  font-weight: 600;
}
.framed .island {
  width: 126px;
  height: 34px;
  background: #080808;
}
.framed .reader-nav {
  flex-shrink: 0;
}
.framed .reader-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
.reader-content {
  scrollbar-width: thin;
  scrollbar-color: #94a3b855 transparent;
}
.desktop-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  background: #ededf0;
  border-bottom: 1px solid #e1e3e8;
  color: #51545b;
  font-size: 13px;
  flex-shrink: 0;
}
.browser-controls {
  white-space: nowrap;
  color: #9b9ca1;
}
.browser-tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 7px 12px;
  border: 1px solid #e1e3e8;
  border-radius: 5px;
  background: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.browser-search {
  padding: 5px 8px;
  border: 1px solid #dcdfe4;
  border-radius: 5px;
}
.window-controls {
  margin-left: auto;
  white-space: nowrap;
}
.phone-home {
  height: 28px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: white;
}
.phone-home i {
  width: 140px;
  height: 5px;
  border-radius: 8px;
  background: #141414;
}
.desktop .reader-content {
  padding: 0 clamp(0px, 6%, 80px);
}
.paper.phone.without-frame {
  width: 440px;
}
.paper.desktop.without-frame {
  width: 1100px;
}
</style>
