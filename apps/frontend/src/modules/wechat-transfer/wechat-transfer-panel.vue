<script setup lang="ts">
import { computed } from 'vue'
import { extensionStoreUrl, productionWebUrl } from '@jlab-wechat-editor/wechat-transfer-contract'
import type { TransferConnection } from './wechat-transfer.model'

const props = defineProps<{ title: string; state: TransferConnection; disabled: boolean }>()
const emit = defineEmits<{ copy: []; detect: []; panel: [] }>()
const connected = computed(() => props.state.availability === 'available')
const installationGuide = `${productionWebUrl}extension/`
</script>
<template>
  <section class="transfer-panel" aria-label="公众号传稿">
    <div class="article-card">
      <span class="eyebrow">本次文章</span>
      <h2>{{ title || '未命名文章' }}</h2>
      <p>正文、排版与启用的固定头尾会一起复制。</p>
    </div>
    <div class="connection-card" :class="{ connected }">
      <div class="connection-heading">
        <span class="connection-label"
          ><i aria-hidden="true" />{{
            connected
              ? '插件已连接'
              : state.availability === 'checking'
                ? '正在检测插件'
                : state.availability === 'incompatible'
                  ? '请更新传稿插件'
                  : '请安装传稿插件'
          }}</span
        >
        <button
          class="ui-button"
          :disabled="disabled || state.availability === 'checking' || state.busy"
          @click="emit('detect')"
        >
          重新检测
        </button>
      </div>
      <p role="status">{{ state.connectionMessage }}</p>
      <template v-if="!connected && state.availability !== 'checking'">
        <p>
          从 Chrome
          应用商店安装或更新后，刷新本页，再点击“重新检测”。已安装时请确认插件已启用，并允许访问本站。
        </p>
        <div class="installation-actions">
          <a class="store-link" :href="extensionStoreUrl" target="_blank" rel="noopener noreferrer"
            >{{
              state.availability === 'incompatible'
                ? '前往 Chrome 应用商店更新'
                : '前往 Chrome 应用商店安装'
            }}
            <span aria-hidden="true">↗</span></a
          >
          <a :href="installationGuide" target="_blank" rel="noopener noreferrer"
            >查看安装说明 <span aria-hidden="true">↗</span></a
          >
        </div>
      </template>
    </div>
    <div class="results" aria-live="polite">
      <div
        class="result-row"
        :class="{
          succeeded: state.clipboardStatus === 'copied',
          failed: state.clipboardStatus === 'error',
        }"
      >
        <span class="result-mark" aria-hidden="true">{{
          state.clipboardStatus === 'copied' ? '✓' : state.clipboardStatus === 'error' ? '!' : '1'
        }}</span>
        <div>
          <h3>复制到剪贴板</h3>
          <p>{{ state.clipboardMessage || '点击复制后，可直接粘贴到公众号正文。' }}</p>
        </div>
      </div>
      <div
        class="result-row"
        :class="{ succeeded: state.sendStatus === 'sent', failed: state.sendStatus === 'error' }"
      >
        <span class="result-mark" aria-hidden="true">{{
          state.sendStatus === 'sent' ? '✓' : state.sendStatus === 'error' ? '!' : '2'
        }}</span>
        <div>
          <h3>{{ state.sendStatus === 'sent' ? '插件已接收' : '发送到公众号' }}</h3>
          <p>{{ state.message || '插件会尝试新建图文并插入；完成后请检查并手动保存。' }}</p>
        </div>
      </div>
    </div>
    <div class="actions">
      <button class="primary-action" :disabled="disabled || state.busy" @click="emit('copy')">
        {{ state.clipboardStatus === 'error' ? '重新复制到公众号' : '复制到公众号' }}
      </button>
      <button
        class="secondary-action"
        :disabled="disabled || !connected || state.panelBusy"
        :title="connected ? '打开插件传稿面板' : '请先安装或启用传稿插件'"
        @click="emit('panel')"
      >
        {{ state.panelBusy ? '正在打开…' : '打开传稿面板' }}
      </button>
      <a
        class="backend-link"
        href="https://mp.weixin.qq.com/"
        target="_blank"
        rel="noopener noreferrer"
        >打开公众号后台 <span aria-hidden="true">↗</span></a
      >
    </div>
    <p v-if="state.actionMessage" class="action-error" role="alert">{{ state.actionMessage }}</p>
    <div class="next-steps">
      <h3>接下来</h3>
      <ol>
        <li>打开公众号后台并进入图文编辑器。</li>
        <li>自动插入未完成时，直接粘贴已复制的正文。</li>
        <li>检查标题、排版和图片，手动保存文章。</li>
      </ol>
      <p v-if="connected">尚未登录时，可在插件面板登录后刷新公众号列表。</p>
    </div>
  </section>
</template>
<style scoped>
.transfer-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 18px;
  padding: 22px;
  color: var(--ui-text);
}
p,
h2,
h3 {
  margin: 0;
  overflow-wrap: anywhere;
}
p {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ui-muted);
}
h2 {
  margin: 7px 0;
  font-size: 18px;
  line-height: 1.5;
}
h3 {
  margin-bottom: 5px;
  font-size: 13px;
  line-height: 1.5;
}
.eyebrow {
  font-size: 11px;
  color: var(--ui-muted);
}
.article-card {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--ui-border);
}
.connection-card {
  padding: 14px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
}
.connection-card.connected {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.connection-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.connection-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
}
.connection-label i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ui-warning);
}
.connected .connection-label i {
  background: var(--ui-success);
}
.connection-card a {
  display: inline-block;
  margin-top: 9px;
  font-size: 13px;
}
.installation-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
}
.connection-card .store-link {
  padding: 8px 12px;
  border-radius: 7px;
  color: #fff;
  background: var(--ui-primary);
}
a {
  color: var(--ui-primary);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
.results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.result-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
}
.result-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 12px;
  border-radius: 50%;
  background: var(--ui-hover);
  color: var(--ui-muted);
}
.succeeded .result-mark {
  background: #dcfce7;
  color: var(--ui-success);
}
.failed .result-mark {
  background: #fef3c7;
  color: var(--ui-warning);
}
.failed p,
.action-error {
  color: var(--ui-warning);
}
.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.actions button {
  min-width: 0;
  min-height: 38px;
  padding: 8px;
  border: 1px solid var(--ui-border);
  border-radius: 7px;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.primary-action {
  color: #fff;
  background: var(--ui-primary);
  border-color: var(--ui-primary) !important;
}
.secondary-action {
  color: var(--ui-text);
  background: var(--ui-surface);
}
.backend-link {
  grid-column: 1 / -1;
  justify-self: center;
  padding: 4px;
  font-size: 12px;
}
.next-steps {
  border-top: 1px solid var(--ui-border);
  padding-top: 16px;
}
.next-steps ol {
  padding-left: 19px;
  margin: 8px 0;
  color: var(--ui-muted);
  font-size: 12px;
  line-height: 1.8;
}
.next-steps p {
  font-size: 12px;
}
@media (max-width: 900px) {
  .transfer-panel {
    padding: 18px;
  }
}
</style>
