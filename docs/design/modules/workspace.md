---
title: workspace模块
status: accepted
created: 2026-10-08
updated: 2026-10-12
owner: project maintainers
---

# workspace模块

新增520px文字传稿覆盖抽屉，临时标题/替换确认不进入localStorage或文章版本。workspace调用wechat-export公开预检/文字输出及wechat-transfer公开连接，sourceGeneration覆盖既有完整输出输入并在异步提交前复核冲突/恢复。原复制、current和主动历史语义不变。

多标签冲突独立conflictReason状态，覆盖通知/配置storage事件/事务writeId冲突；锁定文章和配置写入，清除待保存、关闭抽屉、使复制快照失效，排队命令与晚到导入/恢复拒绝执行。page用inert和原生dialog顶层Modal阻断所有工作台操作，禁止Esc/遮罩关闭。确认关闭当前标签页，拒绝时提示手动关闭并保持锁定；冲突关闭页不触发补保存。普通权限/配额/损坏失败保留原流程。

## 职责与边界

workspace拥有原稿头尾展示偏好showFixedFragments，默认true、即时保存到配置localStorage；仅控制原稿只读块，不影响实际头尾组合或文章版本。旧配置缺失补true，损坏类型拒绝；多标签冲突同样阻断偏好写入。

Pinia命令编排、覆盖抽屉、拖拽双栏、保存状态、配置localStorage与文章/主动版本IndexedDB。拥有完整草稿仓储。

固定头尾均存即时配置，旧结尾兼容且缺失开头补默认值。统计包含启用的头尾；正文编辑清理素材、历史恢复合并素材时同时考虑头尾引用。改头尾使复制快照失效但不新增文章版本。配色抽屉最大640px，标题样式/固定头尾/历史520px，文字320px。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/workspace。

## 公共接口与依赖

公共文件：`workspace.store.ts`、`draft-storage.port.ts`、`workspace.page.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：article、typesetting、ending、assets、wechat-export、wechat-transfer；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。私有workspace.service、子组件和adapters不对外。未知格式/配额/权限/事务冲突暂停对应写入；多页面writeId检查防止覆盖；恢复期间禁用编辑。

私有workspace-scroll-sync通过article组件公开的源行/纵向坐标，按相邻正文块锚点插值协调双向滚动，requestAnimationFrame平滑追随并抑制自身写入产生的回环；关闭/专注/恢复/卸载取消，布局变化重新对齐。开关默认关闭且不持久化。复制成功2500ms计时由store拥有，再次复制/内容失效/卸载清理，不影响权限重试。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。

## 首次原稿

无本地current时，article以app.config中的原版exampleMarkdown初始化；有current时恢复已保存内容，空正文也属于有效草稿。默认配置、存储格式、保存时机和历史规则保持原有语义。
