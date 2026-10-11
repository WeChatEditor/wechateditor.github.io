<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ElColorPickerPanel, ElPopover } from 'element-plus'
import 'element-plus/theme-chalk/el-popover.css'
const props = defineProps<{ color: string; label: string; disabled?: boolean; compact?: boolean }>()
const emit = defineEmits<{ change: [color: string]; open: [] }>()
const recentKey = 'jlab-wechat-editor:recent-colors'
const recommended = ['#30323d', '#2563eb', '#b7791f', '#c2410c', '#0f766e']
const recent = ref<string[]>([])
const visible = ref(false)
const draftColor = ref<string | null>(props.color)
const panel = ref<InstanceType<typeof ElColorPickerPanel>>()
const picking = ref(false)
const errorMessage = ref('')
let selectionController: AbortController | undefined
type ScreenColorPicker = {
  open: (options: { signal: AbortController['signal'] }) => Promise<{ sRGBHex: string }>
}
const EyeDropper = (window as typeof window & { EyeDropper?: new () => ScreenColorPicker })
  .EyeDropper
const canPickScreen = window.isSecureContext && typeof EyeDropper === 'function'
const pickerTitle = computed(function pickerTitle() {
  return canPickScreen ? '从屏幕选取颜色（Esc 取消）' : '当前浏览器或页面不支持屏幕取色'
})
function readRecent(): void {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(recentKey) || '[]')
    if (Array.isArray(value)) {
      recent.value = value.filter(isHex).slice(0, 8)
    }
  } catch {
    /* Recent colors are optional; article settings remain authoritative. */
  }
}
readRecent()
function openPalette(): void {
  if (props.disabled) {
    return
  }
  readRecent()
  emit('open')
}
function abortSelection(): void {
  selectionController?.abort()
  selectionController = undefined
  picking.value = false
}
function closePalette(): void {
  abortSelection()
  visible.value = false
}
watch(
  visible,
  function paletteVisibility(open) {
    if (open) {
      draftColor.value = props.color
      errorMessage.value = ''
    } else {
      abortSelection()
    }
  },
  { flush: 'sync' },
)
watch(() => [props.disabled, props.color], closePalette)
onBeforeUnmount(abortSelection)
async function updatePanel(): Promise<void> {
  await nextTick()
  panel.value?.update()
}
async function pickScreenColor(): Promise<void> {
  if (!EyeDropper || !canPickScreen || props.disabled || picking.value || !visible.value) {
    return
  }
  const controller = new AbortController()
  selectionController = controller
  picking.value = true
  errorMessage.value = ''
  try {
    const result = await new EyeDropper().open({ signal: controller.signal })
    if (controller.signal.aborted || !visible.value || props.disabled) {
      return
    }
    if (!isHex(result.sRGBHex)) {
      throw new Error('Invalid screen color')
    }
    draftColor.value = result.sRGBHex.toLowerCase()
    await updatePanel()
  } catch (error) {
    if (
      !controller.signal.aborted &&
      !(error instanceof window.DOMException && error.name === 'AbortError')
    ) {
      errorMessage.value = '取色失败，请重试或输入 HEX 颜色。'
    }
  } finally {
    if (selectionController === controller) {
      selectionController = undefined
      picking.value = false
    }
  }
}
function confirmColor(): void {
  if (props.disabled || picking.value || !isHex(draftColor.value)) {
    return
  }
  change(draftColor.value)
  closePalette()
}
function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
}
function change(value: string | null): void {
  if (!isHex(value)) {
    return
  }
  const color = value.toLowerCase()
  recent.value = [color, ...recent.value.filter((item) => item !== color)].slice(0, 8)
  try {
    localStorage.setItem(recentKey, JSON.stringify(recent.value))
  } catch {
    /* Optional palette. */
  }
  emit('change', color)
}
</script>
<template>
  <ElPopover
    v-model:visible="visible"
    trigger="click"
    placement="bottom-start"
    width="auto"
    :disabled="disabled"
    :show-arrow="false"
    :persistent="false"
    popper-class="jlab-color-palette el-color-picker__panel"
    @after-enter="updatePanel"
  >
    <template #reference>
      <button
        type="button"
        class="color-capsule"
        :class="{ compact, disabled }"
        :disabled="disabled"
        :aria-label="label"
        :aria-expanded="visible"
        aria-haspopup="dialog"
        @pointerdown="!disabled && emit('open')"
        @click="openPalette"
      >
        <span class="color-swatch" :style="{ backgroundColor: props.color }" />
        <span v-if="!compact" class="color-label">{{ label }}</span>
      </button>
    </template>
    <ElColorPickerPanel
      v-if="visible"
      ref="panel"
      v-model="draftColor"
      color-format="hex"
      :border="false"
      :disabled="disabled"
      :predefine="[...new Set([...recommended, ...recent])]"
      :validate-event="false"
      @keydown.esc.stop="closePalette"
    >
      <template #footer>
        <button
          type="button"
          class="palette-eyedropper"
          :title="pickerTitle"
          :disabled="disabled || !canPickScreen || picking"
          @click="pickScreenColor"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="m14 5 5 5M4 20l4-1 11-11a2.8 2.8 0 0 0-4-4L4 15l-1 5Z" />
          </svg>
          {{ picking ? '取色中…' : '取色器' }}
        </button>
        <div class="palette-actions">
          <button type="button" :disabled="disabled" @click="closePalette">取消</button>
          <button
            type="button"
            :disabled="disabled || picking || !isHex(draftColor)"
            @click="confirmColor"
          >
            确定
          </button>
        </div>
      </template>
    </ElColorPickerPanel>
    <p v-if="!canPickScreen" class="palette-error">当前浏览器不支持屏幕取色，可使用 HEX 或色板。</p>
    <p v-if="errorMessage" class="palette-error" role="status">{{ errorMessage }}</p>
  </ElPopover>
</template>
<style scoped>
.color-capsule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--ui-border);
  border-radius: 20px;
  padding: 0 10px 0 2px;
  height: 30px;
  background: var(--ui-surface);
  white-space: nowrap;
  cursor: pointer;
  color: inherit;
  font: inherit;
}
.color-label {
  font-size: 13px;
  color: var(--ui-text);
}
.compact {
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-sm);
}
.disabled {
  opacity: 0.5;
}
.color-swatch {
  width: 18px;
  height: 18px;
  margin: 5px;
  flex-shrink: 0;
  border-radius: 50%;
}
.color-capsule:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}
.palette-eyedropper,
.palette-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--ui-border);
  border-radius: 4px;
  background: var(--ui-surface);
  color: var(--ui-text);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
.palette-eyedropper {
  margin-left: 6px;
}
.palette-eyedropper svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.palette-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
}
:deep(.el-color-picker-panel__footer) {
  flex-wrap: wrap;
  align-items: center;
}
.palette-actions button:last-child {
  color: var(--ui-primary);
}
.palette-eyedropper:disabled,
.palette-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.palette-error {
  max-width: 280px;
  margin: 8px 0 0;
  color: var(--ui-muted);
  font-size: 12px;
}
</style>
