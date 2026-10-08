---
title: workspace模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# workspace模块

## 职责与边界

Pinia命令编排、覆盖抽屉、拖拽双栏、保存状态、配置localStorage与文章/主动版本IndexedDB。拥有完整草稿仓储。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/workspace。

## 公共接口与依赖

公共文件：`workspace.store.ts`、`draft-storage.port.ts`、`workspace.page.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：article、typesetting、ending、assets、wechat-export；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。私有workspace.service、子组件和adapters不对外。未知格式/配额/权限/事务冲突暂停对应写入；多页面writeId检查防止覆盖；恢复期间禁用编辑。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
