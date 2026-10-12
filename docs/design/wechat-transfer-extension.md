---
title: Web 与 Chrome 轻量传稿插件
status: accepted
created: 2026-10-11
updated: 2026-10-12
owner: project maintainers
---

# Web 与 Chrome 轻量传稿插件

## 授权与当前事实

维护者已授权实现插件，生产Web为https://wechateditor.github.io/。2026-10-12要求简化六项交互，并补充自动新建插入只做尝试，插件面板可直接复制本次内容。现行实现为0.1.4、协议2；技术构建和安装包不代替真实Chrome/公众号验收。依据[ADR](../decisions/ADR-20261011-wechat-transfer-extension.md)、[交互简化计划](../plans/active/2026-10-12-wechat-transfer-simplification.md)和[复制退路计划](../plans/active/2026-10-12-wechat-plugin-copy-fallback.md)。

Web继续拥有localStorage配置、IndexedDB current、素材和主动历史。插件只保存短期文字快照、已选公众号和去重回执，不复制编辑器，不增加后端、账号同步或私有HTTP接口。文字首版、独立新建空图文、官方正文接口、用户检查后手动保存继续适用；公众号自身自动保存未实测。

## 一键发送流程

Web交付快照后优先打开公众号后台尝试新建插入，不强制打开插件面板；没有可用账号也自动打开固定后台登录页。用户按需打开插件面板“复制到公众号”及“复制标题”，不需回编辑器。当前快照标题/HTML/纯文字在成功、失败或worker中断后仍保留，直到24小时到期或下次发送替换；复制不查询发送状态、不自动重放。仅可信popup可调用COPY_ARTICLE读取正文，Web/content仅有元信息。复制由用户点击触发，同一快照提供text/html和text/plain，保留排版，不静默降级为纯文本。

Web顶栏点击“发送到公众号”即捕获当前完整文字排版并提交，不再先确认标题、连接或替换。标题来自正文第一个H1的纯文字，缺失时使用“未命名文章”；正文H1保留。标题1至64个Unicode码点，受当前标题控件maxlength再次约束。提交后打开520px覆盖反馈抽屉，worker立即调度打开后台并尝试新建/插入。抽屉只说明接收和插件复制退路，不查询插入或保存状态。

wechat-export公开preflightTextArticle/exportTextArticle，复用articleDom、排版、启用头尾、站外链接转换、可读纯文字与DOMPurify。文字输出使用wechat-editor-text@1-candidate，不抓取/转换图片。正文、启用头尾或样式含图片/媒体时整篇阻断，提示既有“复制到公众号”，不静默丢图。

workspace捕获snapshot/generation，所有影响输出的正文、标注、排版和头尾变化使迟到提交失效。digest完成后、SUBMIT前复核generation、ready、恢复和冲突锁。插件接收固定快照后，Web后续修改不改变该快照；再次明确发送自动更新旧快照。

插件接收后自动使用已选且仍有效的公众号；首次或目标失效时默认第一个识别账号且非编辑页的目标。没有可用账号则自动打开后台登录页并保留尚未启动快照，用户登录后刷新或选择公众号可自动继续，不另设启动按钮。有效目标再次由页面适配器核对，独立打开后台标签进入草稿箱→新的创作→图文，不复用已有编辑页。入口或接口不支持时停止自动尝试，已接收快照仍可从插件复制。

## 插件界面

Popup和后台浮层使用本项目既有logo；“打开写作工作台”“打开公众号后台”为小尺寸并排按钮。Popup“选择公众号”下拉默认已选或第一个可用目标，刷新图标位于其右侧，具备title/aria-label和键盘焦点。目标/页面能力只在打开、刷新或选择时检查。

删除确认checkbox及校验、手动新建插入按钮、取消任务和中断恢复/清理入口。Web、Popup与浮层均无发送状态查询或轮询。界面打开时只读取文章标题/接收时间元信息；点击复制时才向worker读取当前完整快照，按钮可在成功、失败或中断后使用。“复制到公众号”提供HTML/纯文字，“复制标题”仅提供标题纯文字，写入剪贴板成功后才显示复制反馈。调用剪贴板写入在可信点击处理内直接发起，异步数据以Promise<Blob>进入ClipboardItem，两个格式来自同一次读取；不新增剪贴板权限。缺失/到期快照、浏览器能力或权限失败显示原因，不静默降级。

自动插入结束或失败时，worker向当前后台浮层发送一次性结果提示，不轮询阶段。提示“已插入，请检查排版并手动保存”不代表持久化、发布或视觉验收。

OPEN_PANEL优先Chrome action.openPopup；受Chrome版本/策略限制失败时打开本地popup.html标签。后台浮层可收起，收起不影响已授权的自动执行；用户可从工具栏重新打开面板。

## 工程与协议

独立apps/extension包含worker/content/popup组装入口及本地MAIN桥接。packages/wechat-transfer-contract通过显式exports提供Zod Schema和z.infer类型。模块登记和依赖方向见.module-boundaries.json及[模块索引](modules/README.md)；不跨模块访问私有仓储。

[协议2](../reference/wechat-transfer-protocol.md)先改契约再改调用方，外部仅SUBMIT_TASK、OPEN_PANEL和OPEN_WECHAT。移除PING、GET_STATUS、CANCEL_TASK及内部STATUS/START_INSERT/CANCEL_TASK/CLEAR_STORAGE。成功接收只返回标题/接收时间，不暴露执行阶段。旧协议明确拒绝并提示同时更新Web/插件。

来源仍仅生产组织Web根/index.html顶层页面；开发包额外支持127.0.0.1:5175及4175，生产包无本地地址。worker复核sender.url/origin、顶层frame和tab，严格拒绝未知字段，信封UTF8最大2MiB，复算SHA256，parse5验证受控文字HTML/CSS，拒绝脚本、危险URI和媒体。Zod禁用JIT，代码随包构建。

Chrome最低120，权限仍storage/scripting及公众号、组织Web两个host。只有logo.png以web_accessible_resources开放给公众号页面，用于浮层显示。稳定ID由extension.identity.json公开key推导，Web使用同一ID；不记录凭据、正文或完整后台URL日志。生产和开发包相同ID，只安装一份。

## 内部执行约束与升级

worker仍为storage.local唯一写入者，所有写入串行；一份schemaVersion2记录包含当前快照、所选目标及最多100个24小时回执。收到后先持久化再ACK。相同requestId/digest返回既有回执，不重复启动；同ID不同内容拒绝。没有公开任务管理流程；新请求自动替换未执行或已结束快照，实际执行租约存在时拒绝下一次发送。

执行前持久化attemptId和creating，导航/写入前记录内部阶段及tab/document/账号。迟到操作必须匹配当前任务与租约。worker重启时中断执行转uncertain，仅清除执行绑定，保留载荷供复制，不自动重放；下一次用户明确发送可建立新任务。未启动快照可在登录后选择/刷新目标时继续。旧schemaVersion1经Zod验证迁移，保留去重回执，但删除旧载荷/绑定，不自动执行升级前快照。0.1.3已经删除的正文不能恢复，更新后需再次发送。

正文成功读回后只清除执行绑定，当前载荷继续用于面板复制；复制本身不删除载荷。24小时到期任务和回执删除，读取/命令时检查；无事件不保证正点清理。未知存储格式不静默重置，提示重新安装后从Web发送；Web原稿仍归Web保存。无需清理按钮。

PAGE_ACTIVITY仅报告可信页面输入/指针/键盘活动，worker按执行tab/document使租约失效；MAIN同时检查写入中的用户输入。它是防止覆盖人类编辑的内部保护，不提供发送状态检测。账号变更、非空页、无法确认本次新建、接口缺失或超时停止，不重放写入。

## 页面与交付限制

账号识别包括维护者提供的首页weui-desktop_name、其他页面acount_box-nickname以及历史候选；仍要求可见名称唯一。标题和“草稿箱/新的创作/图文”入口为保守候选，完整流程待人类验收。

仅顶层文档，官方invoke对象参数、get_isready的isReady/isNew、get_content/set_content。isNew是编辑器版本标识，不能代替独立新建证据；要求create点击及不同documentId、空标题/正文。标题原生setter和input/change后复核，正文读回核对规范化文本和主要结构。导航整体30秒、每次JSAPI10秒。不同frame和同document SPA新建当前阻断；不使用私有实例/HTTP、DOM正文赋值、保存或发布。

pnpm build构建Web与插件；package:extension生成production及0.1.4 ZIP；build:extension:dev生成development。包包含本地脚本、logo、manifest、NOTICE和依赖许可。extension:check验证ID、权限、logo开放范围、生产来源和ZIP一致性。Pages只部署Web，插件独立分发；[安装与人工验收指南](../guides/wechat-transfer-extension.md)给出更新流程。计划/日志保留pending_human_acceptance，不运行前端自动化，不推送或上架。
