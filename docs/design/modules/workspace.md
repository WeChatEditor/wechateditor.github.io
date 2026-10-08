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

固定头尾均存即时配置，旧结尾兼容且缺失开头补默认值。统计包含启用的头尾；正文编辑清理素材、历史恢复合并素材时同时考虑头尾引用。改头尾使复制快照失效但不新增文章版本。配色抽屉最大640px，标题样式/固定头尾/历史520px，文字320px。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/workspace。

## 公共接口与依赖

公共文件：`workspace.store.ts`、`draft-storage.port.ts`、`workspace.page.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：article、typesetting、ending、assets、wechat-export；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。私有workspace.service、子组件和adapters不对外。未知格式/配额/权限/事务冲突暂停对应写入；多页面writeId检查防止覆盖；恢复期间禁用编辑。

私有workspace-scroll-sync协调原稿与预览滚动百分比，requestAnimationFrame平滑追随并抑制自身写入产生的回环；关闭/专注/恢复/卸载取消，布局变化重新对齐。开关默认关闭且不持久化。复制成功2500ms计时由store拥有，再次复制/内容失效/卸载清理，不影响权限重试。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。

## 首次原稿

无本地current时，article以app.config中的原版exampleMarkdown初始化；有current时恢复已保存内容，空正文也属于有效草稿。默认配置、存储格式、保存时机和历史规则保持原有语义。
