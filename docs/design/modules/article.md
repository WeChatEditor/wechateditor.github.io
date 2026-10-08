---
title: article模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# article模块

## 职责与边界

Markdown 解析、正文位置映射、结构化颜色标注、快捷格式与预览。只拥有文章语义，不拥有完整工作台草稿。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/article。

## 公共接口与依赖

公共文件：`article.model.ts`、`article.service.ts`、`article-editor.vue`、`article-preview.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：typesetting；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。无效混合选区整体拒绝；改稿歧义标注失效；IME、撤销、长文与跨强调/链接选区由人类验收。

编辑器/预览组件通过scroll事件及getScrollElement公开当前滚动元素，预览通过scrollLayout报告容器/尺寸变化；协调逻辑归workspace，不互相引用组件。开壳且手机模式时，模型上方独立横排“自适应屏幕 / 原始比例”radio button与“当前缩放比例: N%”，原始比例为1:1 CSS像素；开壳取reader-content、关壳取preview-scroll。同步/外壳/专注按钮使用统一active背景及aria-pressed。缩放模式为临时UI状态，无存储格式变化。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
