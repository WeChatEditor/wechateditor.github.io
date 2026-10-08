<script setup lang="ts">
import type { TypesettingConfig } from '../typesetting/typesetting.model'
import ColorPicker from '../typesetting/typesetting-color-picker.vue'
defineProps<{
  config: TypesettingConfig
  localColor: string
  drawer?: string
  copyState: string
  disabled: boolean
  saveState: string
  saveBlocked: boolean
}>()
const emit = defineEmits<{
  config: [patch: Partial<TypesettingConfig>]
  localColor: [color: string]
  capture: []
  drawer: [kind: 'text' | 'colors' | 'ending' | 'chapters' | 'history']
  copy: []
  retry: []
}>()
const controls = [
  ['text', '文字设置', 'M4 5h16M12 5v14M8 19h8'],
  ['chapters', '标题样式', 'M4 5h16M4 12h16M4 19h10'],
  [
    'colors',
    '配色',
    'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-4h3a3 3 0 0 0 3-3 9 9 0 0 0-9-7ZM7 8h.01M12 6h.01M17 8h.01M6 13h.01',
  ],
  ['ending', '固定头尾', 'M5 3h10l4 4v14H5ZM9 12h6M9 16h6M15 3v4h4'],
] as const
</script>
<template>
  <header class="toolbar">
    <div class="brand">
      <svg
        class="brand-mark"
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m12 3 8 8-8 10-8-10 8-8Zm0 0v10m-4 8h8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="13" r="2" fill="currentColor" /></svg
      ><strong>桀士排版</strong><small>公众号助手</small>
    </div>
    <div class="toolbar-divider" />
    <ColorPicker
      :color="config.colors.body"
      label="正文色"
      :disabled="disabled"
      @change="emit('config', { preset: 'custom', colors: { ...config.colors, body: $event } })"
    />
    <ColorPicker
      :color="localColor"
      label="局部字色"
      :disabled="disabled"
      @open="emit('capture')"
      @change="emit('localColor', $event)"
    />
    <div class="toolbar-divider" />
    <nav aria-label="排版设置" class="toolbar-tools">
      <button
        v-for="[kind, label, iconPath] in controls"
        :key="kind"
        class="ui-button"
        :class="{ active: drawer === kind }"
        :aria-pressed="drawer === kind"
        :disabled="disabled"
        @click="emit('drawer', kind)"
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
          <path :d="iconPath" /></svg
        >{{ label }}
      </button>
    </nav>
    <div class="toolbar-spacer" />
    <span
      class="save-status"
      :class="{ failed: saveBlocked || saveState.startsWith('保存失败') }"
      :title="saveState"
      role="status"
      ><i aria-hidden="true" />{{ saveState }}</span
    >
    <button
      v-if="saveState.startsWith('保存失败') && !saveBlocked"
      class="ui-button"
      :disabled="disabled"
      @click="emit('retry')"
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
        <path d="M20 7a8 8 0 1 0 0 10M20 3v5h-5" />
      </svg>
      重试
    </button>
    <button
      class="ui-button"
      :class="{ active: drawer === 'history' }"
      :aria-pressed="drawer === 'history'"
      :disabled="disabled"
      @click="emit('drawer', 'history')"
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
        <path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2" />
      </svg>
      历史版本
    </button>
    <el-button
      class="copy-button"
      :type="copyState === 'success' ? 'success' : 'primary'"
      :disabled="disabled"
      :loading="copyState === 'preparing' || copyState === 'copying'"
      @click="emit('copy')"
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
        <path d="M9 9h12v12H9ZM15 5V3H3v12h2" /></svg
      >{{
        copyState === 'preparing'
          ? '准备图文'
          : copyState === 'ready'
            ? '复制已准备内容'
            : copyState === 'success'
              ? '已复制 ✓'
              : '复制到公众号'
      }}</el-button
    >
  </header>
</template>
<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 52px;
  gap: 8px;
  padding: 0 16px;
  background: var(--ui-surface);
  border-bottom: 1px solid var(--ui-border);
  flex-shrink: 0;
  white-space: nowrap;
  overflow-x: auto;
}
.toolbar > * {
  flex-shrink: 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
  color: var(--ui-text);
}
.brand strong {
  font-size: 14px;
  letter-spacing: 0.5px;
}
.brand small {
  font-size: 11px;
  letter-spacing: 1px;
  padding: 2px 4px;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  color: var(--ui-muted);
}
.toolbar-divider {
  width: 1px;
  height: 22px;
  background: var(--ui-border);
  margin: 0 2px;
}
.toolbar-tools {
  display: flex;
  gap: 2px;
}
.toolbar-spacer {
  flex: 1;
  min-width: 0;
}
.copy-button {
  margin: 0;
  font-size: 13px;
  border-radius: 6px;
  box-shadow: 0 3px 10px #2563eb20;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}
.save-status {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--ui-muted);
}
.save-status i {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--ui-success);
  vertical-align: middle;
}
.save-status.failed {
  color: var(--ui-warning);
}
.save-status.failed i {
  background: var(--ui-warning);
}
@media (max-width: 1200px) {
  .toolbar {
    padding: 0 12px;
    gap: 6px;
  }
  .save-status {
    max-width: 130px;
  }
}
</style>
