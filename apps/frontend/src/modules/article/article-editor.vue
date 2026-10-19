<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  markdown: string
  disabled: boolean
  opening?: string
  ending?: string
}>()
const emit = defineEmits<{
  change: [value: string]
  import: []
  scroll: [element: HTMLElement]
  scrollLayout: []
}>()
const input = ref<HTMLTextAreaElement>()
function getScrollElement(): HTMLElement | undefined {
  return input.value
}
let observer: ResizeObserver | undefined
let measurementKey = ''
let lineTops: number[] = []
function getScrollAnchors(lines: number[]): { line: number; top: number }[] {
  const area = input.value
  if (!area) {
    return []
  }
  const style = window.getComputedStyle(area)
  const key = `${area.clientWidth}|${style.font}|${style.padding}|${props.markdown}`
  if (key !== measurementKey) {
    const mirror = document.createElement('div')
    Object.assign(mirror.style, {
      position: 'fixed',
      visibility: 'hidden',
      pointerEvents: 'none',
      left: '-100000px',
      top: '0',
      boxSizing: 'border-box',
      width: `${area.clientWidth}px`,
      padding: style.padding,
      font: style.font,
      letterSpacing: style.letterSpacing,
      tabSize: style.tabSize,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      wordBreak: style.wordBreak,
    })
    const rows = props.markdown.split('\n').map(function row(text) {
      const row = document.createElement('div')
      row.textContent = text || '\u200b'
      mirror.append(row)
      return row
    })
    document.body.append(mirror)
    try {
      const origin = mirror.getBoundingClientRect().top
      lineTops = rows.map((row) => row.getBoundingClientRect().top - origin)
      measurementKey = key
    } finally {
      mirror.remove()
    }
  }
  return lines.flatMap((line) =>
    lineTops[line] === undefined ? [] : [{ line, top: lineTops[line] }],
  )
}
function layoutChanged(): void {
  measurementKey = ''
  emit('scrollLayout')
}
watch(() => props.markdown, layoutChanged, { flush: 'post' })
onMounted(function observeLayout() {
  observer = new ResizeObserver(layoutChanged)
  if (input.value) {
    observer.observe(input.value)
  }
  void document.fonts.ready.then(layoutChanged)
})
onBeforeUnmount(function stopObserver() {
  observer?.disconnect()
})
defineExpose({ getScrollElement, getScrollAnchors })
const formats = [
  ['h1', 'H1', '一级标题'],
  ['h2', 'H2', '章节标题'],
  ['bold', 'B', '加粗'],
  ['italic', 'I', '斜体'],
  ['quote', '“ ”', '引用'],
  ['code', '<>', '行内代码'],
  ['ordered', '1.', '有序列表'],
  ['unordered', '•', '无序列表'],
  ['hero', '封面卡', '插入封面卡，选中文字可转为封面'],
  ['summary', '总结卡', '插入总结卡，选中文字可转为要点'],
] as const
function trimBlankLines(value: string): string {
  return value.replace(/^(?:[ \t]*\n)+|(?:\n[ \t]*)+$/g, '')
}
function cardMarkdown(kind: 'hero' | 'summary', selected: string): string {
  const text = selected.trim() ? trimBlankLines(selected) : ''
  let body: string
  if (kind === 'hero') {
    const [title, ...rest] = (text || '写完之后，让观点被看见').split('\n')
    body = `[!hero] 内容工作札记\n\n# ${title.trim().replace(/^#{1,6}\s+/, '')}\n\n${text ? trimBlankLines(rest.join('\n')) : '一篇文章的阅读体验，藏在标题、留白与重点之间。'}`
  } else {
    const items = !text
      ? '- 标题是否说清文章的主题\n- 每一节是否只解释一个重点\n- 结尾是否留下可以采取的行动'
      : /^\s*(?:[-+*]|\d+[.)])\s+/m.test(text)
        ? text
        : text
            .split('\n')
            .map((line) => (line.trim() ? `- ${line}` : ''))
            .join('\n')
    body = `[!summary] ${text ? '总结要点' : '发布前，检查这三件事'}\n\n${items}`
  }
  return trimBlankLines(body)
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n')
}
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
  if (kind === 'hero' || kind === 'summary') {
    if (start !== end) {
      from = start === 0 ? 0 : area.value.lastIndexOf('\n', start - 1) + 1
      to = area.value.indexOf('\n', end > start && area.value[end - 1] === '\n' ? end - 1 : end)
      if (to === -1) to = area.value.length
    } else {
      const lineEnd = area.value.indexOf('\n', start)
      from = to = lineEnd === -1 ? area.value.length : lineEnd
    }
    const before = area.value.slice(0, from)
    const after = area.value.slice(to)
    const prefix = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
    const suffix = after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n'
    replacement =
      prefix + cardMarkdown(kind, start === end ? '' : area.value.slice(from, to)) + suffix
  } else if (inline) {
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
      <div class="pane-identity">
        <span class="pane-identity-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            focusable="false"
          >
            <path
              d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9ZM14 3v6h6M9 12l-2 2 2 2m6-4 2 2-2 2"
            />
          </svg>
        </span>
        <div class="pane-identity-copy">
          <h2 class="pane-identity-title">原稿</h2>
          <span class="pane-identity-caption pane-identity-code">MARKDOWN</span>
        </div>
      </div>
      <el-button
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
    <section v-if="opening !== undefined" class="fixed-fragment" aria-label="固定开头，只读">
      <div class="fixed-fragment-heading"><strong>固定开头</strong><span>只读</span></div>
      <pre>{{ opening || '（内容为空）' }}</pre>
    </section>
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
      @scroll="emit('scroll', $event.target as HTMLElement)"
    />
    <section v-if="ending !== undefined" class="fixed-fragment" aria-label="固定结尾，只读">
      <div class="fixed-fragment-heading"><strong>固定结尾</strong><span>只读</span></div>
      <pre>{{ ending || '（内容为空）' }}</pre>
    </section>
  </section>
</template>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  background: var(--ui-paper);
}
.pane-heading {
  flex-shrink: 0;
  height: var(--ui-pane-heading-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text);
  background: var(--ui-surface);
  font-size: 13px;
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
.fixed-fragment {
  flex-shrink: 0;
  margin: 8px 16px;
  padding: 9px 12px;
  border: 1px solid var(--ui-border);
  border-radius: 7px;
  background: var(--ui-bg);
  color: var(--ui-muted);
}
.fixed-fragment-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  line-height: 16px;
}
.fixed-fragment-heading strong {
  font-weight: 500;
}
.fixed-fragment pre {
  max-height: 80px;
  overflow: auto;
  margin: 5px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font:
    12px/1.65 'Cascadia Code',
    Consolas,
    'Microsoft YaHei',
    monospace;
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
  background: var(--ui-surface);
}
.format-toolbar button {
  min-width: 30px;
  padding: 3px 6px;
}
</style>
<style scoped src="./article-pane-heading.css"></style>
