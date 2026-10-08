---
title: ending模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# ending模块

## 职责与边界

独立 Markdown 固定头尾、各自启停与结尾片段追加；不写回正文，不参与章节编号或局部标注。旧FixedEnding的enabled/markdown仍表示结尾，新增可选opening；defaultOpening/normalizeEnding补缺失为空且关闭，renderOpening/renderEnding分别生成受控HTML。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/ending。

## 公共接口与依赖

公共文件：`ending.model.ts`、`ending.service.ts`、`ending-panel.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：article；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。预览和复制开头→正文→结尾，各头尾只组合一次。用户显式追加结尾片段，不自动开启或覆盖；开头默认空且关闭，头尾均可编辑/清空。损坏配置由workspace校验拒绝保存；启停、持久化与刷新由人类验收。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
