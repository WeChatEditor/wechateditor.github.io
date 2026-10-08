<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ color: string; label: string; disabled?: boolean; compact?: boolean }>()
const emit = defineEmits<{ change: [color: string]; open: [] }>()
const recentKey = 'jlab-wechat-editor:recent-colors'
const recommended = ['#30323d', '#2563eb', '#b7791f', '#c2410c', '#0f766e']
const recent = ref<string[]>([])
const picker = ref<{ show: () => void }>()
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
function openPalette(event: MouseEvent): void {
  if (props.disabled) {
    return
  }
  readRecent()
  emit('open')
  if (!(event.target instanceof Element && event.target.closest('.el-color-picker'))) {
    picker.value?.show()
  }
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
  <div
    class="color-capsule"
    :class="{ compact, disabled }"
    @pointerdown="!disabled && emit('open')"
    @click="openPalette"
  >
    <el-color-picker
      ref="picker"
      :model-value="props.color"
      :disabled="disabled"
      :predefine="[...new Set([...recommended, ...recent])]"
      :aria-label="label"
      popper-class="jlab-color-palette"
      @change="change"
    />
    <span v-if="!compact" class="color-label">{{ label }}</span>
  </div>
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
:deep(.el-color-picker__trigger) {
  border: 0;
  width: 28px;
  height: 28px;
  padding: 5px;
}
:deep(.el-color-picker__color) {
  border: 0;
  border-radius: 50%;
  overflow: hidden;
}
:deep(.el-color-picker__icon) {
  display: none;
}
</style>
