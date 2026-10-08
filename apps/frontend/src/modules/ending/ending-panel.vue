<script setup lang="ts">
import { computed } from 'vue'
import type { FixedEnding, FixedOpening } from './ending.model'
import { defaultOpening } from './ending.service'
const props = defineProps<{ ending: FixedEnding }>()
const emit = defineEmits<{ change: [patch: Partial<FixedEnding>] }>()
const opening = computed(() => props.ending.opening ?? defaultOpening())
function changeOpening(patch: Partial<FixedOpening>): void {
  emit('change', { opening: { ...opening.value, ...patch } })
}
const snippets = [
  { name: '名片', markdown: '---\n\n**作者 / 公众号名称**\n\n在这里写一句介绍。' },
  { name: '关注提示', markdown: '---\n\n如果这篇文章对你有帮助，欢迎关注、点赞或分享。' },
  {
    name: '往期精选',
    markdown: '---\n\n**往期精选**\n\n- 精选介绍 【手动去公众号编辑往期链接】',
  },
]
function appendSnippet(markdown: string): void {
  const value = [props.ending.markdown.trimEnd(), markdown].filter(Boolean).join('\n\n')
  if (value.length <= 500000) {
    emit('change', { markdown: value, enabled: true })
  }
}
</script>

<template>
  <div class="ending-body">
    <p class="intro">为每篇文章保留熟悉的开头和结尾，分别启用、随时修改。</p>
    <section class="opening-section" aria-label="固定开头">
      <label class="ending-switch"
        >启用固定开头<el-switch
          :model-value="opening.enabled"
          @update:model-value="changeOpening({ enabled: Boolean($event) })"
      /></label>
      <label class="ending-label" for="opening-markdown">开头 Markdown</label>
      <textarea
        id="opening-markdown"
        :value="opening.markdown"
        maxlength="500000"
        placeholder="例如：公众号介绍、栏目寄语…"
        @input="changeOpening({ markdown: ($event.target as HTMLTextAreaElement).value })"
      />
      <div class="ending-actions">
        <el-button size="small" @click="changeOpening({ markdown: '' })">清空开头</el-button>
      </div>
    </section>
    <label class="ending-switch"
      >启用固定结尾<el-switch
        :model-value="ending.enabled"
        @update:model-value="emit('change', { enabled: Boolean($event) })"
    /></label>
    <label class="ending-label" for="ending-markdown">结尾 Markdown</label>
    <div class="snippet-buttons">
      <button
        v-for="snippet in snippets"
        :key="snippet.name"
        class="ui-button bordered"
        :disabled="ending.markdown.length + snippet.markdown.length + 2 > 500000"
        @click="appendSnippet(snippet.markdown)"
      >
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 4v16M4 12h16" /></svg
        >{{ snippet.name }}
      </button>
    </div>
    <textarea
      id="ending-markdown"
      :value="ending.markdown"
      maxlength="500000"
      @input="emit('change', { markdown: ($event.target as HTMLTextAreaElement).value })"
    />
    <div class="ending-actions">
      <el-button size="small" @click="emit('change', { markdown: '' })"
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
          <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></svg
        >清空</el-button
      >
    </div>
    <p class="note">
      片段追加到现有结尾并自动启用。请替换示例名称；往期链接请在公众号编辑器内手动添加。头尾修改即预览，设置即时保存到当前浏览器。
    </p>
  </div>
</template>

<style scoped>
.ending-body {
  padding: 22px;
}
.opening-section {
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--ui-border);
}
.intro,
.note {
  font-size: 12px;
  line-height: 1.9;
  color: var(--ui-muted);
}
.intro {
  margin: 0 0 24px;
}
.ending-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--ui-text);
}
.ending-label {
  display: block;
  margin: 25px 0 12px;
  font-size: 13px;
  color: var(--ui-text);
}
textarea {
  width: 100%;
  height: 200px;
  resize: vertical;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 12px;
  font:
    13px/1.9 Consolas,
    'Microsoft YaHei',
    monospace;
  color: var(--ui-text);
  outline-color: var(--ui-primary);
}
.snippet-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}
.snippet-buttons button {
  font-size: 12px;
  padding: 4px 7px;
}
.ending-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
</style>
