<script setup lang="ts">
import WorkspacePage from './modules/workspace/workspace.page.vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const locale = {
  ...zhCn,
  el: { ...zhCn.el, colorpicker: { ...zhCn.el.colorpicker, clear: '清除', confirm: '确定' } },
}
</script>

<template>
  <ElConfigProvider :locale="locale"><WorkspacePage /></ElConfigProvider>
</template>
