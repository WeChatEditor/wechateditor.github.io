---
title: Web 与 Chrome 轻量传稿插件
status: accepted
created: 2026-10-11
updated: 2026-10-12
owner: project maintainers
---

# Web 与 Chrome 轻量传稿插件

## 授权与当前事实

维护者已授权执行[实施计划](../plans/active/2026-10-11-wechat-transfer-extension.md)，确认生产Web为https://wechateditor.github.io/，实际公众号验收尚未进行。官方HTTP草稿API路线被排除；保留Web写作和排版，增加可选Chrome MV3传稿插件。技术实现、构建与包检查不证明真实后台已通过。长期边界见[ADR](../decisions/ADR-20261011-wechat-transfer-extension.md)。

现有Web继续独占localStorage配置、IndexedDB current、素材和主动历史，存储格式不变。插件不复制编辑器，不引入后端、账号云同步或私有HTTP接口。第一版只处理文字排版，自动独立新建图文并插入标题与正文，用户检查、补封面等信息后手动保存。公众号自己的自动保存行为不被插件控制，也尚未实测。

## 用户流程与导出

Web顶栏提供“发送到公众号”和原有“复制到公众号”。520px覆盖抽屉确认临时标题、连接、快照状态和明确替换；不挤压双栏。标题候选来自正文第一个H1的纯文字，不删除正文H1，不写ArticleDocument或配置。标题去首尾空白、非空、至多64个Unicode码点；当前标题控件更严格的maxlength再次检查。

wechat-export公开preflightTextArticle/exportTextArticle复用articleDom、排版、启用头尾、站外链接转换、可读纯文字和DOMPurify。文字输出不调用图片抓取/转换，使用wechat-editor-text@1-candidate，剪贴板wechat-clipboard@0.1-candidate保持原行为。正文、启用头尾或样式包含图片/媒体时整篇阻断，提示“这篇文章含图片，请使用‘复制到公众号’，在后台粘贴并检查图片”；不静默删图后发送。

workspace捕获完整snapshot和generation，正文、标注、所有排版和头尾变化使准备失效。连接/digest等异步工作后、发SUBMIT前再次核对generation、ready、恢复和冲突锁。接收成功后插件持有固定快照，Web继续修改不会自动改变已接收内容。含图/冲突/恢复/连接失败保留复制出口。

Popup打开或切换原Web，显示标题/接收时间/状态、公众号目标与页面能力。用户明确选择已登录后台首页或草稿箱标签，确认显示账号后点击新建插入。原编辑页不被复用；新开独立后台标签进入草稿箱→新的创作→图文。公众号浮层使用closed Shadow DOM，只显示摘要并打开可信popup；Chrome版本/策略不允许openPopup时提示点击工具栏图标。浮层不直接启动写入。

成功文案仅为“已插入，请检查排版并手动保存”。它表示标题/正文读回通过，不表示保存、持久化、发布或视觉验收通过。

## 工程和模块

独立apps/extension包含worker/content/popup组装入口和本地打包的MAIN桥接；packages/wechat-transfer-contract通过显式exports提供Zod Schema和z.infer类型。schemaVersion2模块登记以workspace:name区分跨工作区同名wechat-transfer，旧schemaVersion1治理测试仍兼容。

| 模块                      | 职责、公共文件与依赖                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| frontend/workspace        | 只读快照、generation、冲突和传稿抽屉编排；依赖现有模块及frontend/wechat-transfer          |
| frontend/wechat-export    | 公共model/service增加文字预检与导出；依赖article/typesetting/ending/assets                |
| frontend/wechat-transfer  | 公共model/service/panel管理握手、提交、状态和原请求重试；只依赖契约及Vue，不导入workspace |
| extension/wechat-transfer | 公共model/service协调任务和租约，私有repository唯一写storage.local；依赖契约及wechat-page |
| extension/wechat-page     | 公共model/service，私有固定操作MAIN桥接；依赖契约，不读任务仓储                           |
| extension/extension-shell | 公共service呈现popup/浮层，通过消息调用任务服务；依赖契约及wechat-transfer方向            |
| contract/wechat-transfer  | Zod、来源/尺寸/digest/parse5 HTML校验；不依赖应用                                         |

模块公共文件、单向依赖、组装入口与跨workspace私有导入由.module-boundaries.json及modules:check检查；详见[模块索引](modules/README.md)。

## 消息、权限和稳定ID

Web使用externally_connectable和chrome.runtime.sendMessage。共享[协议](../reference/wechat-transfer-protocol.md)采用版本1、UUID请求ID、严格字段校验、2MiB整个信封UTF8保护和SHA256摘要。插件重新解析受控HTML：限定标签/属性/CSS属性，拒绝脚本、事件、危险URI、CSS URL/逃逸/表达式等；不改写载荷后悄悄继续。Zod禁用JIT，代码和依赖随包打包，不申请unsafe-eval或加载远程代码。

生产仅允许https://wechateditor.github.io/及/index.html；worker复核实际sender.url/origin、顶层frame和tab，不信任payload自报来源。开发包另外允许127.0.0.1:5175及4175，生产manifest与JS均不包含这些地址。工作台改地址时需同步契约和构建白名单；既有存储按origin隔离，插件不迁移Web数据。

最低Chrome120，桌面Chrome为当前目标；Edge/手机/无痕均未验收。权限仅storage、scripting；host_permissions为公众号和组织Web。无全局tabs、cookies、debugger、剪贴板、downloads、nativeMessaging、unlimitedStorage或all_urls。storage.local设置TRUSTED_CONTEXTS，content只能查询摘要、打开Web/popup和报告可信用户页面活动；START_INSERT/CANCEL/CLEAR只接受扩展popup来源。

版本0.1.2；manifest及ZIP版本统一来自extension/package.json。实际稳定ID为imiclghaaoleoggfhfdbanmaehamnpmg，由extension.identity.json公开manifest key推导。生成过程仅保存公钥，私钥未写文件。生产/开发包使用相同ID，二者只安装一份。Web内置同一ID；未来商店ID变化需一起更新Web和插件，不把开发ID称为商店ID。

## 单任务和恢复

worker是唯一写入者，所有存储命令串行。一份版本化记录含当前任务及最多100个24小时小型回执；新请求超过回执上限拒绝，过期才删除。相同requestId/digest返回原回执；同ID不同内容拒绝；取消、替换、成功后的延迟重试不复活旧任务。

SUBMIT先完整持久化再ACK；用户START先持久化creating及attemptId，再异步执行。每次导航阶段/写入前持久化，taskId、attemptId和预期phase拒绝迟到结果。Popup离开不持有执行状态；worker休眠/浏览器重启导致执行阶段转uncertain，并清除旧绑定。单次事件内被中断不自动重放。

| 阶段                                               | 实际行为                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| pending                                            | 接收快照，可取消、明确替换、选择目标开始                           |
| creating / waiting_editor                          | 独立新建与有截止时间的就绪探测                                     |
| applying                                           | 写入前已记录，绑定tab/document/账号，禁止第二次开始                |
| inserted                                           | 读回通过，清除载荷和执行绑定，回执保留至TTL                        |
| uncertain                                          | 导航/写入可能有副作用、重启、读回差异或用户操作；禁止自动重放/替换 |
| cancelled                                          | 清除载荷，不撤回后台改动                                           |
| waiting_login / waiting_target / blocked / expired | 协议保留值；当前未登录/未选目标保留pending，正常TTL移除任务        |

执行期间取消或清空被阻断。uncertain仅在用户检查后台后明确丢弃；页面可信pointerdown/keydown/input报告活动，停止后续操作，写入中的输入也由MAIN监听。清空损坏存储需要明确检查确认。该保护不能让公众号副作用和本地存储成为原子事务，仍以uncertain处理无法确定结果。

TTL为收到后24小时；唤醒/命令/读取时检查，无事件时不保证正点清理。正常终态和待传任务到期删除；uncertain到期清除正文、原标题与绑定，保留匿名阻断摘要直到人工丢弃，防止自动重复操作。只本地保存，不记录正文、凭据、账号或完整后台URL日志。

Web提交应答丢失保留原信封，只允许重试原请求；已收到明确拒绝可重新准备。GET_STATUS支持按原requestId查询回执。刷新不能把存储错误当无任务。Web无永久轮询，popup/公众号浮层可见期间每2秒查询摘要。

## 页面能力和当前限制

官方原始文档已核对invoke对象参数apiName/apiParam/sucCb/errCb，以及get_isready的isReady/isNew和get_content的content。isNew代表新编辑器版本，不证明新建文章；必须另有本次create点击证据、独立标签和空标题/正文。适配器只操作顶层文档；接口位于其他frame或返回不支持结构时阻断，不遍历frame写入。

账号/标题选择器和“草稿箱/新的创作/图文”语义匹配都是保守候选，尚未经维护者账号验证。缺失、不唯一或账号变化停止。导航/就绪整体30秒，JSAPI每次10秒，按探测结果等待，不能因固定延时就认定就绪。标题用原生setter和input/change，之后重新确认正文仍空、标题显示一致及无可信输入。正文用官方set_content，再get_content核对规范化文本、标题和主要结构数量；不比较HTML字节完全相等。

首轮人工反馈确认首页右上角名称class为weui-desktop_name，0.1.1加入该精确候选，保留名称可见/唯一性和账号复核。结构观察来自维护者；插件更新后的识别和后续流程仍待复验。

后续人工补充其他后台页面名称为acount_box-nickname，0.1.2加入同一识别函数，使导航及写入前后校验继续支持页面变化；实际拼写按提供值使用，唯一性保护不变。

尚未验证：真实入口/账号/标题内部状态、接口所在frame、实际保存后保真、章节装饰/局部颜色/头尾/表格/代码/列表/明暗阅读和中断恢复。读回结构检查不替代这些证据。能力不足保持复制出口，不转用私有编辑器实例、DOM正文赋值、模拟粘贴或私有HTTP接口。

当前新建还要求create点击文档到空编辑器的documentId改变，同document的SPA新建暂时阻断，需P0实际证据后校准。正文读回必须无媒体，任何运行中租约存在时禁止取消或清空，即使任务已标uncertain。

## 构建与交付

pnpm build同时构建Web和独立插件；pnpm package:extension输出production unpacked目录和ZIP，pnpm build:extension:dev输出单独development目录。ZIP包含本地脚本、manifest、popup、NOTICE和依赖许可正文。extension:check检查稳定ID、权限、生产来源、脚本无本地地址/完整编辑器、ZIP字节一致。

Verify工作流增加插件打包检查和ZIP artifact；Pages仅上传frontend/dist，插件独立分发。[安装与人工验收指南](../guides/wechat-transfer-extension.md)记录使用与恢复。本轮不推送、上架或代用户保存。实施计划和AI日志保持pending_human_acceptance；格式/Lint/类型/构建、契约/治理和包检查与真实Chrome/公众号验收分开记录。
