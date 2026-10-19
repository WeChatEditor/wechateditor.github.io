---
title: workspace模块
status: accepted
created: 2026-10-08
updated: 2026-10-19
owner: project maintainers
---

# workspace模块

2026-10-19[卡片设置](../markdown-cards.md)沿用现有config localStorage：可选旧字段 cardSymbol/cardBrand 缺失补默认，存在时校验公共枚举和40字符上限，错误保留记录并暂停保存。历史列表调用 article 公共 articleTitle 提取渲染标题（包括封面H1），不改写历史正文、版本键或存储协议。默认示例只在无current时加载，空草稿仍优先。

2026-10-19私有workspace-theme.css提供暖灰/柔白/画板/外壳tokens并同步Element Plus背景、文字与边框变量；article通过既有全局CSS变量使用，不改变模块公共文件或依赖方向。主交互蓝色、布局和持久化保持，确切色值见[UI设计](../jlab-wechat-editor-ui.md)。

0.1.6启动一次插件连接检测并按结果切换顶栏主按钮。点击发送立即打开分组反馈抽屉，workspace持有本次busy锁并捕获同一排版快照，在点击内启动HTML/纯文字复制，再独立提交插件文字任务。复制与发送分别反馈；无插件也可复制，含图完整复制但插件整篇阻断，复制失败不取消发送。准备前后和摘要后检查generation/恢复/冲突，迟到反馈不覆盖新内容。抽屉安装指南、手动重新检测、复制、打开后台与面板入口由公开service/model/panel组成，不增加存储字段或历史。

自动保存同步插件：正文/标注/素材本机事务成功且当前articleGeneration匹配后同步，配置/头尾保存成功后450ms防抖，历史恢复应用完成后同步。调用wechat-transfer.save，复用文字排版/标题；异步前复核generation、ready、未卸载、无恢复/冲突、本机无待保存或失败。同步不等待在本机写入队列内，无插件/图片/超限/权限失败只更新保存状态的插件提示，成功显示“插件已同步”。无后台打开或系统剪贴板写入，不创建历史。原配置和正文独立存储规则保持。

顶栏点击发送即捕获当前文字排版，自动取H1标题（缺失时为“未命名文章”）并提交，点击时打开520px反馈抽屉并同步尝试复制，worker调度打开后台尝试新建插入；插件面板由用户按需打开，其中可直接复制收到的排版内容。抽屉无标题/连接/替换确认或任务状态检测。workspace调用wechat-export公开预检/文字输出及wechat-transfer公开连接，sourceGeneration覆盖既有完整输出输入并在异步提交前复核冲突/恢复。原复制、current和主动历史语义不变。

多标签冲突独立conflictReason状态，覆盖通知/配置storage事件/事务writeId冲突；锁定文章和配置写入，清除待保存、关闭抽屉、使复制快照失效，排队命令与晚到导入/恢复拒绝执行。page用inert和原生dialog顶层Modal阻断所有工作台操作，禁止Esc/遮罩关闭。确认关闭当前标签页，拒绝时提示手动关闭并保持锁定；冲突关闭页不触发补保存。普通权限/配额/损坏失败保留原流程。

## 职责与边界

2026-10-16状态栏增加产品介绍、排版教程、传稿插件和隐私说明四个普通链接，均在新标签打开静态HTML，不挂载第二份编辑器或读取草稿。保留原作者/GitHub及统计；状态栏横向空间不足可滚动，不改变编辑区高度、存储或模块依赖。

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

无本地current时，article以app.config中的exampleMarkdown初始化；2026-10-19开场先展示配色五角色与多层标题，后接Markdown、多语言和代码长篇示例。存在current时恢复保存内容，空正文同样有效。新配置由typesetting提供18套/24套上限及青黛朱砂默认；私有workspace.service读写均使用maxPalettes与chapterStyles，读取不再限定15套。存储格式、保存时机和历史语义不变。
