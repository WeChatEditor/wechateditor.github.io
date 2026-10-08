<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ markdown: string; disabled: boolean }>()
const emit = defineEmits<{ change: [value: string]; import: [] }>()
const input = ref<HTMLTextAreaElement>()
const formats = [
  ['h1', 'H1', '一级标题'],
  ['h2', 'H2', '章节标题'],
  ['bold', 'B', '加粗'],
  ['italic', 'I', '斜体'],
  ['quote', '“ ”', '引用'],
  ['code', '<>', '行内代码'],
  ['ordered', '1.', '有序列表'],
  ['unordered', '•', '无序列表'],
] as const
let composing = false
function format(kind: string): void {
  const area = input.value
  if (!area || composing || props.disabled) {
    return
  }
  const start = area.selectionStart
  const end = area.selectionEnd
  const inline = { bold: '**', italic: '*', code: '`' }[kind as 'bold' | 'italic' | 'code']
  let from = start
  let to = end
  let replacement: string
  if (inline) {
    replacement = `${inline}${area.value.slice(start, end) || '文字'}${inline}`
  } else {
    from = start === 0 ? 0 : area.value.lastIndexOf('\n', start - 1) + 1
    to = area.value.indexOf('\n', end)
    if (to === -1) {
      to = area.value.length
    }
    const prefix = { h1: '# ', h2: '## ', quote: '> ', unordered: '- ' }[
      kind as 'h1' | 'h2' | 'quote' | 'unordered'
    ]
    replacement = area.value
      .slice(from, to)
      .split('\n')
      .map((line, i) => (kind === 'ordered' ? `${i + 1}. ` : prefix || '') + line)
      .join('\n')
  }
  if (area.value.length - (to - from) + replacement.length > 500000) {
    return
  }
  area.focus()
  area.setSelectionRange(from, to)
  if (!document.execCommand('insertText', false, replacement)) {
    area.setRangeText(replacement, from, to, 'end')
  }
  emit('change', area.value)
}
function update(event: Event): void {
  if (!composing) {
    emit('change', (event.target as HTMLTextAreaElement).value)
  }
}
function compositionEnd(event: CompositionEvent): void {
  composing = false
  update(event)
}
function tab(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !input.value || composing) {
    return
  }
  event.preventDefault()
  if (
    input.value.value.length - (input.value.selectionEnd - input.value.selectionStart) + 2 >
    500000
  ) {
    return
  }
  input.value.setRangeText('  ', input.value.selectionStart, input.value.selectionEnd, 'end')
  emit('change', input.value.value)
}
</script>

<template>
  <section class="editor-pane">
    <div class="pane-heading">
      <span class="pane-label">MARKDOWN</span><span>原稿</span
      ><el-button
        class="import-button"
        size="small"
        text
        :disabled="disabled"
        title="导入单个 Markdown / TXT"
        @click="emit('import')"
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
          <path d="M12 3v12m-4-4 4 4 4-4M4 15v6h16v-6" /></svg
        >导入</el-button
      >
    </div>
    <div class="format-toolbar" aria-label="Markdown 快捷格式" @pointerdown.prevent>
      <button
        v-for="[kind, label, title] in formats"
        :key="kind"
        class="ui-button"
        :title="title"
        :aria-label="title"
        :disabled="disabled"
        @click="format(kind)"
      >
        {{ label }}
      </button>
    </div>
    <textarea
      ref="input"
      :value="markdown"
      :disabled="disabled"
      aria-label="Markdown 原稿"
      spellcheck="false"
      maxlength="500000"
      placeholder="从这里开始写作…"
      @input="update"
      @compositionstart="composing = true"
      @compositionend="compositionEnd"
      @keydown="tab"
    />
  </section>
</template>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  background: var(--ui-surface);
}
.pane-heading {
  flex-shrink: 0;
  height: var(--ui-pane-heading-height);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text);
  font-size: 13px;
}
.pane-label {
  font-size: 11px;
  letter-spacing: 1.6px;
  font-weight: 700;
  color: var(--ui-muted);
}
.import-button {
  margin-left: auto;
}
textarea {
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
  resize: none;
  border: 0;
  outline: none;
  padding: 24px 28px;
  background: transparent;
  color: var(--ui-text);
  font:
    14px/1.85 'Cascadia Code',
    Consolas,
    'Microsoft YaHei',
    monospace;
  tab-size: 2;
}
textarea::placeholder {
  color: var(--ui-muted);
}
.format-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 20px;
  border-bottom: 1px solid var(--ui-border);
}
.format-toolbar button {
  min-width: 30px;
  padding: 3px 6px;
}
</style>
