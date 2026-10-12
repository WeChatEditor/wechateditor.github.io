<script setup lang="ts">
import type { TransferConnection } from './wechat-transfer.model'
defineProps<{ title: string; state: TransferConnection; disabled: boolean }>()
const emit = defineEmits<{ copy: [] }>()
</script>
<template>
  <div class="transfer-panel">
    <p class="title">{{ title }}</p>
    <p v-if="state.message" role="status">{{ state.message }}</p>
    <p class="hint">未登录公众号时，在插件中打开后台，登录后点击账号旁的刷新图标即可继续。</p>
    <button class="ui-button" :disabled="disabled || state.busy" @click="emit('copy')">
      复制到公众号
    </button>
  </div>
</template>
<style scoped>
.transfer-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  color: var(--ui-text);
}
p {
  margin: 0;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.title {
  font-weight: 600;
}
.hint {
  font-size: 12px;
  color: var(--ui-muted);
}
</style>
