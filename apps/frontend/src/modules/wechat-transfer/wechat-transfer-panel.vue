<script setup lang="ts">
import type { TransferConnection } from './wechat-transfer.model'
import { phaseLabels } from './wechat-transfer.model'
defineProps<{
  title: string
  state: TransferConnection
  disabled: boolean
  warning: string
  replace: boolean
}>()
const emit = defineEmits<{
  title: [value: string]
  submit: []
  connect: []
  retry: []
  cancel: []
  replace: [value: boolean]
  copy: []
}>()
</script>
<template>
  <div class="transfer-panel">
    <p>发送当前文字排版快照。插件新建图文并插入后，请检查排版、补充封面等信息，再手动保存。</p>
    <label for="transfer-title">公众号标题</label>
    <input
      id="transfer-title"
      :value="title"
      :disabled="disabled || state.busy"
      placeholder="填写标题，最多64个字符"
      @input="emit('title', ($event.target as HTMLInputElement).value)"
    />
    <p class="hint">标题仅用于此次传稿；正文中的一级标题保留。</p>
    <p v-if="warning" class="warning" role="alert">{{ warning }}</p>
    <p v-if="state.task">
      插件任务：{{ state.task.title }} ·
      {{ phaseLabels[state.task.phase] }}。接收后改稿不会改变已接收快照。
    </p>
    <label
      v-if="state.task && !['inserted', 'cancelled', 'expired'].includes(state.task.phase)"
      class="replace"
      ><input
        type="checkbox"
        :checked="replace"
        :disabled="disabled || state.busy"
        @change="emit('replace', ($event.target as HTMLInputElement).checked)"
      />明确替换上一次待传快照</label
    >
    <p v-if="state.message" role="status">{{ state.message }}</p>
    <div class="actions">
      <button class="ui-button" :disabled="disabled || state.busy" @click="emit('connect')">
        检查插件连接
      </button>
      <button
        class="ui-button primary"
        :disabled="
          disabled || state.busy || Boolean(warning) || !title.trim() || Boolean(state.retry)
        "
        @click="emit('submit')"
      >
        {{ state.busy ? '正在连接…' : '发送并打开公众号' }}
      </button>
      <button
        v-if="state.retry"
        class="ui-button"
        :disabled="disabled || state.busy"
        @click="emit('retry')"
      >
        确认原快照接收结果
      </button>
      <button
        v-if="state.task"
        class="ui-button"
        :disabled="disabled || state.busy"
        @click="emit('cancel')"
      >
        取消待传任务
      </button>
      <button class="ui-button" :disabled="disabled || state.busy" @click="emit('copy')">
        使用现有复制流程
      </button>
    </div>
    <p class="hint">插件未连接时，请从仓库安装包加载Chrome扩展。含图片文章请使用“复制到公众号”。</p>
  </div>
</template>
<style scoped>
.transfer-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--ui-text);
}
p {
  margin: 0;
  line-height: 1.7;
}
label {
  font-weight: 600;
}
input:not([type='checkbox']) {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--ui-border);
  border-radius: 7px;
  background: var(--ui-surface);
  color: inherit;
  font: inherit;
}
.hint {
  font-size: 12px;
  color: var(--ui-muted);
}
.warning {
  color: var(--ui-warning);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.primary {
  background: var(--ui-primary);
  color: white;
}
.replace {
  font-weight: 400;
  font-size: 13px;
}
</style>
