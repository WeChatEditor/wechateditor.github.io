<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Diagnostic } from '../wechat-export/wechat-export.model'
const props = defineProps<{
  message: string
  invalid: number
  diagnostics: Diagnostic[]
  disabled: boolean
}>()
const emit = defineEmits<{ dismiss: []; clear: [] }>()
const opened = ref(false)
const toastVisible = ref(false)
const count = computed(
  () => props.diagnostics.length + (props.invalid ? 1 : 0) + (props.message ? 1 : 0),
)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => [props.message, props.invalid],
  function showToast() {
    if (timer) {
      clearTimeout(timer)
    }
    toastVisible.value = Boolean(props.message || props.invalid)
    timer = setTimeout(function hideToast() {
      toastVisible.value = false
    }, 6000)
  },
  { immediate: true },
)
onBeforeUnmount(function cleanup() {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>
<template>
  <div class="feedback-layer">
    <button
      v-if="count"
      class="ui-button bordered diagnostic-trigger"
      :aria-expanded="opened"
      @click="opened = !opened"
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
        <path d="M12 3 2 21h20ZM12 9v5M12 17h.01" /></svg
      >诊断 {{ count }}<span v-if="invalid"> · {{ invalid }} 处颜色失效</span>
    </button>
    <section v-if="opened && count" class="diagnostic-panel" aria-label="排版诊断">
      <div class="diagnostic-heading">
        <strong>排版诊断</strong
        ><button class="ui-button" aria-label="关闭诊断" @click="opened = false">×</button>
      </div>
      <p v-if="message">
        {{ message }}
        <button class="ui-button" @click="emit('dismiss')">
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
          >移除提示
        </button>
      </p>
      <div v-if="invalid" class="invalid-warning">
        <p>{{ invalid }} 处局部颜色因改稿失效，请重新选择文字。</p>
        <button class="ui-button bordered" :disabled="disabled" @click="emit('clear')">
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
            <path d="m9 4 11 11-6 6H8l-6-6ZM7 10l11 11M14 21h8" />
          </svg>
          清除失效标注
        </button>
      </div>
      <p
        v-for="(diagnostic, i) in diagnostics"
        :key="`${diagnostic.rule}-${i}`"
        :class="{ error: diagnostic.level === 'error' }"
      >
        {{ diagnostic.message }}
      </p>
    </section>
    <div v-if="toastVisible" class="floating-toast" role="status">
      <span>{{ invalid ? `${invalid} 处局部颜色因改稿失效` : message }}</span
      ><button v-if="invalid" class="ui-button" :disabled="disabled" @click="emit('clear')">
        清除失效标注</button
      ><button class="ui-button" aria-label="隐藏提示" @click="toastVisible = false">×</button>
    </div>
  </div>
</template>
<style scoped>
.feedback-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}
.feedback-layer button,
.diagnostic-panel,
.floating-toast {
  pointer-events: auto;
}
.diagnostic-trigger {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 12px;
  box-shadow: var(--ui-shadow);
}
.diagnostic-panel {
  position: absolute;
  bottom: 56px;
  right: 16px;
  width: 360px;
  max-height: min(450px, 75%);
  overflow: auto;
  padding: 16px;
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  box-shadow: var(--ui-shadow-float);
}
.diagnostic-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.diagnostic-heading strong {
  font-size: 14px;
}
.diagnostic-panel p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--ui-muted);
  overflow-wrap: anywhere;
}
.diagnostic-panel .error,
.invalid-warning p {
  color: var(--ui-warning);
}
.floating-toast {
  position: absolute;
  bottom: 54px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 40px);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-float);
  font-size: 12px;
  line-height: 1.8;
}
.floating-toast > span {
  overflow-wrap: anywhere;
}
@media (prefers-reduced-motion: no-preference) {
  .floating-toast {
    animation: show 0.18s ease-out;
  }
  @keyframes show {
    from {
      opacity: 0;
      translate: 0 6px;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }
}
</style>
