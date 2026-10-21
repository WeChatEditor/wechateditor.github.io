---
title: Web 与 Chrome 轻量传稿插件
status: accepted
created: 2026-10-11
updated: 2026-10-21
owner: project maintainers
---

# Web 与 Chrome 轻量传稿插件

## Web内容规则与插件转发能力

2026-10-21按维护者后续指令改为[不解释排版规则的转发器](extension-update-boundaries.md)，工程版本0.1.15。插件删除格式校验、固定profile/标题64及读回标签计数；Web内容规则继续独立执行。PING声明稳定html-relay@1能力，Web不按排版发布版本判断，旧校验版需一次迁移更新。商店已发布0.1.13事实保留，0.1.15未上架。来源、消息/摘要、账号/空页/租约及人工保存边界保持。

## 正式商店身份与安装入口

2026-10-21维护者确认0.1.13已审核发布，正式ID为neeljhohndegbhaaaclmcdeenlebhicj。共享契约extensionId为正式ID，extensionStoreUrl由此生成Chrome应用商店详情链接，Web的PING、同步、发送和面板命令统一使用extensionIdForOrigin选择身份。仅http://127.0.0.1:5175和http://127.0.0.1:4175使用原本地key推导ID，其他origin使用正式ID；无旧ID轮询或回退，插件来源白名单继续独立校验。

未连接或不兼容时，发送抽屉展示商店安装/更新按钮、官网安装说明、刷新后重新检测提示。公开插件页以商店安装和更新为主，开发包说明移至开发指南。商店身份与本地公开key分别登记并校验，不从ID推断公钥。由旧手动包迁移前先处理未保存的插件快照；两种ID存储不自动迁移，Web原稿仍在原origin。商店安装、生产PING和真实传稿待人类验收，发布状态依据维护者确认。

## 工具栏图标按站点切换

0.1.13工具栏默认使用灰色logo，每个标签独立设置图标；当前标签的origin精确为https://wechateditor.github.io或https://mp.weixin.qq.com时使用原蓝色logo，其他站点、Chrome内部页及无法读取URL时为灰色。开发包额外匹配已有127.0.0.1:5175/4175。桀士排版域内的说明页也属于本站；不依据标题或网址子串点亮。图标表示站点匹配，不表示已登录、连接、插入或保存成功；灰色不禁用面板。

extension-shell私有工具栏服务由已有公共service导出，worker入口只调用注册函数。安装、浏览器启动、worker唤醒时初始化现有标签；新建、激活、URL/加载变化与标签替换时更新对应tabId，关闭标签清理迟到任务。异步读取使用每标签令牌，只允许最新结果设置图标。现有host权限提供允许站点的URL，未申请全局tabs或额外权限，不记录网址、不读正文、不访问仓储。蓝/灰资源随包提供，默认灰色避免不支持页面短暂显示蓝色。工程检查与真实Chrome人工验收见[计划](../plans/active/2026-10-19-extension-toolbar-icon.md)。

## 搜索发现与官网说明

0.1.12保留插件名称、当时的本地ID、权限、协议和传稿行为，仅把manifest摘要调整为微信公众号文字排版/复制/辅助插入用途，homepage_url指向https://wechateditor.github.io/extension/。网站独立静态安装页、隐私页与商店文案见[搜索发现设计](search-discovery.md)；0.1.13商店发布状态依据上述维护者确认，实际连接与插入仍需独立验收。

## ProseMirror标题与空页判定

0.1.11根据维护者实际结构适配#js_title_main内可见的.title-editor-overlay .title-editor__input > .ProseMirror[contenteditable="true"]；旧textarea#title[name="title"]已隐藏，仅作标题同步核对，不能作为可见编辑入口。使用浏览器原生insertText编辑事务写入标题，让平台处理自身标题状态；不读取ProseMirror私有实例，不用innerHTML/textContent赋值标题或正文。原生输入/textarea继续使用原生value setter与input/change。实际覆盖层唯一且可编辑，其他独立标题候选冲突拒绝；写入后可见标题和隐藏textarea必须同时匹配，最多等待2秒同步，失败停止，不自动重试。

共享契约公开固定nativeTitleEditAttribute作为DOM输入事件协作标记；仅在同步insertText调用期间标记已识别标题节点，finally立即删除。MAIN与content只排除该节点本次程序生成的input；真实pointerdown/keydown、其他节点input、调用前后input继续中止租约。PageCommand只接受该固定属性名，worker外部协议仍为2，无外部新消息、权限或持久化。

维护者get_content返回空section/br及隐藏mp-style-type标记，文字码点和媒体为空，现有emptyBody已经接受，无需放宽正文判空。旧empty把标题不可用与已有内容合并，现分开提示接口等待、标题控件等待、正文非空和标题非空；仅标题控件未就绪在原30秒期限内等待，真实内容立即停止。见[实施计划](../plans/active/2026-10-12-wechat-title-overlay.md)。

## 新文章编辑页隐藏账号名称

0.1.10修正已打开新文章标签但未插入的情况。维护者只读检查确认顶层官方invoke存在、isReady/isNew为true、可见空textarea标题存在，但账号候选节点只有一个且隐藏；旧账号识别在接口探测前拒绝该页。导航页仍只识别唯一可见账号。worker只对本次文章点击后唯一新增子标签的probe传入已确认账号；probe/apply在官方invoke存在、无非空可见账号且候选节点恰好一个时，允许以隐藏名称与该已确认账号严格相等来核对。可见名称冲突、不一致、空名称或多候选拒绝；导航操作不使用此退路。新documentId、空标题/正文与写入前后账号复核继续适用，不能凭接口或隐藏名称复用旧编辑页。接口探测失败保留editor标记，使worker等待真实就绪原因。见[实施计划](../plans/active/2026-10-12-wechat-hidden-editor-account.md)。

## 创作下拉菜单名称识别

0.1.9修正维护者反馈的“文章”入口已显示但定位超时。维护者提供的实际菜单中，li.weui-desktop-dropdown__list-ele同时含可见的.weui-desktop-dropdown__list-ele__text和display:none的同名tooltip；整项textContent为“文章文章”，不能作为入口名称。页面适配器对已登记的下拉菜单项优先读取可见名称标签，其他候选读取innerText表示的渲染文字，aria-label仍优先。点击原菜单项，不点击tooltip，不使用包含匹配或任意div/span；唯一可见入口、原生链接目标、新标签证据和30秒等待边界继续适用。实施与人工复验见[名称修正计划](../plans/active/2026-10-12-wechat-article-label.md)。

## 首页左侧草稿箱菜单定位

0.1.8根据维护者手动提供的菜单HTML，将草稿箱定位限定在.weui-desktop-menu_create内容管理分组内的a.weui-desktop-menu__link，验证title或.weui-desktop-menu__name为“草稿箱”；不再用全页面同名链接确定导航目标。已有菜单但子项隐藏时，只点击一次该分组的“内容管理”标题，再在原草稿箱阶段等待菜单出现，不提前进入创作阶段，也不反复切换展开状态。缺少菜单、子项加载中、匹配多个和禁止点击分别提示；加载等待纳入原30秒导航期限。

维护者已授权本机Chrome调试，但浏览器工具站点策略拒绝公众号页面。使用维护者主动提供的结构修复，并在无凭据、无平台网络请求的本地浏览器样例验证定位与折叠行为；不尝试绕过限制。原始HTML中的链接参数不进入文件或记录，页面点击只使用当前DOM链接。线上首页到文章插入仍待人类验收，见[菜单修正计划](../plans/active/2026-10-12-wechat-draft-menu.md)。

## 草稿箱到文章新标签页

2026-10-12维护者明确实际目标路径为“草稿箱 → 新的创作 → 文章”，文章入口会在新标签页打开编辑器。0.1.7按该顺序执行，优先匹配“文章”，兼容旧“图文/图文消息”名称，保留平台链接自身的新标签页行为。仅跟随本次文章点击后新增、由独立后台标签打开的唯一公众号子标签；新建证据必须同时具备文章点击、新tab及不同documentId，不能仅凭“新的创作”点击进入写入。

没有可用后台标签时先打开固定公众号首页并保留pending任务，绑定该新标签；首次检查及其完成加载/URL变化事件尝试识别登录账号，识别成功后自动继续。未登录等待用户登录，面板刷新/选择仍可继续。监听仅处理本次pending登录标签，不启动历史已中断任务；该标签直接作为独立导航起点，避免再开一份后台。

租约获取时不绑定用户原后台页；每次导航绑定独立标签当前documentId，忽略旧文档迟到的活动消息。真实后台操作仍中止自动执行，中止后保留具体原因，避免只显示“执行租约已失效”。正文使用手动发送时捕获的HTML排版快照，经官方正文接口插入，不读取或替换用户后来改变的系统剪贴板。验收见[导航修正计划](../plans/active/2026-10-12-wechat-article-navigation.md)，截图只证明当前页面与失败提示，不能据此确定失败唯一原因。

## 插件检测与传稿布局修订

2026-10-12维护者授权启动检测及发送同时复制，现行版本0.1.13。协议2增加无载荷PING，只返回插件版本，不查询文章/账号/发送阶段、不启动页面动作。网页初始化一次检查；抽屉允许手动重新检测。可用插件时蓝色发送主按钮置右、复制图标置左；检测中、缺失或不兼容时蓝色复制置右、小型发送图标置左并带tooltip。点击小型发送仍展示安装提示。

手动发送捕获同一输出快照，在点击内启动HTML/纯文字剪贴板写入并独立提交文字传稿；复制和插件各自报告成功/失败。缺失插件也可复制；含图完整复制沿用原输出，但文字自动插入仍整篇阻断。520px覆盖抽屉分组展示标题、连接、复制/发送反馈、安装/重新检测、复制/打开面板/后台与简短步骤。面板入口只在连接可用时启用。

公众号浮层由插件注入，标题栏可用Pointer capture或键盘拖动，取消/失焦清理，移动及窗口缩放钳制视口；紧凑导航允许换行，内容有最大高度并独立滚动。浮层一次检测worker连接，失效或检查失败禁用打开传稿面板；无插件的新页面不会注入浮层。工程与人类验收分别记录，见[实施计划](../plans/active/2026-10-12-transfer-availability-layout.md)。

## 自动保存同步插件

2026-10-12维护者要求自动保存也保留当前排版到插件，协议2增加SAVE_ARTICLE，当前0.1.13继续保留。正文/标注/素材的本机事务成功后，排版/头尾配置保存成功后450ms防抖，同步当前标题/受控HTML/纯文字。历史恢复成功后同步最终正文；初始化只恢复本机数据，不主动传示例稿。待保存/保存失败、冲突、恢复和卸载拒绝新的或迟到同步。发送串行并在摘要准备后复核generation，本机保存与插件保存不组成原子事务，插件失败不影响本机存储。保存状态显示插件同步结果，无弹窗/抽屉或发送状态检测。

SAVE_ARTICLE只覆盖独立可复制快照，先持久化后ACK；不打开后台、选择账号、创建任务/回执、启动或重放插入，也不写系统剪贴板。插件面板复制仍由用户点击触发，读取最新快照。手动SUBMIT_TASK仍捕获点击时内容并更新可复制快照，自动执行持有独立payload，后续自动同步不影响当前执行或待登录任务。快照24小时TTL，重复自动保存不占100个发送回执；2MiB、来源/digest和仓储保护沿用；标题64码点及HTML/图片规则仅在Web，插件不重复执行。无插件或失败时提示可复制内容未更新，旧快照保留。

schemaVersion2新增独立clipboard字段；旧格式2缺失时从task.payload迁移一次，格式1继续不恢复旧载荷。公众号content只能读元信息，完整快照仍只供可信popup读取。两端均需更新，旧0.1.4不支持自动同步消息。参见[自动同步计划](../plans/active/2026-10-12-wechat-autosave-snapshot.md)。

## 授权与当前事实

维护者已授权实现插件，生产Web为https://wechateditor.github.io/。2026-10-12要求简化六项交互，并补充自动新建插入只做尝试，插件面板可直接复制自动保存或手动发送的内容。现行实现为0.1.13、协议2；技术构建和安装包不代替真实Chrome/公众号验收。依据[ADR](../decisions/ADR-20261011-wechat-transfer-extension.md)、[交互简化计划](../plans/active/2026-10-12-wechat-transfer-simplification.md)和[复制退路计划](../plans/active/2026-10-12-wechat-plugin-copy-fallback.md)。

Web继续拥有localStorage配置、IndexedDB current、素材和主动历史。插件只保存短期文字快照、已选公众号和去重回执，不复制编辑器，不增加后端、账号同步或私有HTTP接口。文字首版、独立新建空图文、官方正文接口、用户检查后手动保存继续适用；公众号自身自动保存未实测。

## 一键发送流程

Web手动发送快照后优先打开公众号后台尝试新建插入，不强制打开插件面板；没有可用账号也自动打开固定后台登录页。用户按需打开插件面板“复制到公众号”及“复制标题”，不需回编辑器。可复制快照标题/HTML/纯文字在成功、失败或worker中断后仍保留，直到24小时到期、下次成功自动保存或手动发送替换；复制不查询发送状态、不自动重放。仅可信popup可调用COPY_ARTICLE读取正文，Web/content仅有元信息。复制由用户点击触发，同一快照提供text/html和text/plain，保留排版，不静默降级为纯文本。

Web顶栏点击“发送到公众号”即捕获当前完整文字排版并提交，不再先确认标题、连接或替换。标题来自正文第一个H1的纯文字，缺失时使用“未命名文章”；正文H1保留。标题1至64个Unicode码点，受当前标题控件maxlength再次约束。点击时打开520px覆盖反馈抽屉并同时复制系统剪贴板，worker立即调度打开后台并尝试新建/插入。抽屉只说明接收和插件复制退路，不查询插入或保存状态。

wechat-export公开preflightTextArticle/exportTextArticle，复用articleDom、排版、启用头尾、站外链接转换、可读纯文字与DOMPurify。文字输出使用wechat-editor-text@1-candidate，不抓取/转换图片。正文、启用头尾或样式含图片/媒体时整篇阻断，提示既有“复制到公众号”，不静默丢图。

workspace捕获snapshot/generation，所有影响输出的正文、标注、排版和头尾变化使迟到提交失效。digest完成后、SUBMIT/SAVE前复核generation、ready、恢复和冲突锁。插件接收固定任务后，Web后续修改不改变该任务；自动保存仅更新供面板复制的独立快照。

插件接收后自动使用已选且仍有效的公众号；首次或目标失效时默认第一个识别账号且非编辑页的目标。没有可用账号则自动打开后台登录页并保留尚未启动快照，本次登录标签完成加载后自动识别账号继续，面板刷新或选择公众号也可继续，不另设启动按钮。有效目标再次由页面适配器核对，独立打开后台标签进入草稿箱→新的创作→文章→新标签编辑器，不复用已有编辑页。入口或接口不支持时停止自动尝试，已接收快照仍可从插件复制。

## 插件界面

Popup和后台浮层使用本项目既有logo；“打开写作工作台”“打开公众号后台”为小尺寸并排按钮。Popup“选择公众号”下拉默认已选或第一个可用目标，刷新图标位于其右侧，具备title/aria-label和键盘焦点。目标/页面能力只在打开、刷新或选择时检查。

删除确认checkbox及校验、手动新建插入按钮、取消任务和中断恢复/清理入口。Web、Popup与浮层均无发送状态查询或轮询。界面打开时只读取文章标题/接收时间元信息；点击复制时才向worker读取当前完整快照，按钮可在成功、失败或中断后使用。“复制到公众号”提供HTML/纯文字，“复制标题”仅提供标题纯文字，写入剪贴板成功后才显示复制反馈。调用剪贴板写入在可信点击处理内直接发起，异步数据以Promise<Blob>进入ClipboardItem，两个格式来自同一次读取；不新增剪贴板权限。缺失/到期快照、浏览器能力或权限失败显示原因，不静默降级。

自动插入结束或失败时，worker向当前后台浮层发送一次性结果提示，不轮询阶段。提示“已插入，请检查排版并手动保存”不代表持久化、发布或视觉验收。

OPEN_PANEL优先Chrome action.openPopup；受Chrome版本/策略限制失败时打开本地popup.html标签。后台浮层可收起，收起不影响已授权的自动执行；用户可从工具栏重新打开面板。

## 工程与协议

独立apps/extension包含worker/content/popup组装入口及本地MAIN桥接。packages/wechat-transfer-contract通过显式exports提供Zod Schema和z.infer类型。模块登记和依赖方向见.module-boundaries.json及[模块索引](modules/README.md)；不跨模块访问私有仓储。

[协议2](../reference/wechat-transfer-protocol.md)先改契约再改调用方，外部提供PING、SUBMIT_TASK、SAVE_ARTICLE、OPEN_PANEL和OPEN_WECHAT。PING仅检测连接，保留删除GET_STATUS、CANCEL_TASK及内部STATUS/START_INSERT/CANCEL_TASK/CLEAR_STORAGE。成功接收只返回标题/接收时间，不暴露执行阶段。旧协议明确拒绝并提示同时更新Web/插件。

来源仍仅生产组织Web根/index.html顶层页面；开发包额外支持127.0.0.1:5175及4175，生产包无本地地址。worker复核sender.url/origin、顶层frame和tab，严格拒绝未知消息字段，信封UTF8最大2MiB，复算SHA256。HTML/CSS/媒体安全与排版检查由Web完成，插件只将可信快照交给官方接口/剪贴板，不读取或执行任意网页代码。Zod禁用JIT，代码随包构建；插件bundle不含内容规则/parse5/entities。

Chrome最低120，权限仍storage/scripting及公众号、组织Web两个host。只有logo.png以web_accessible_resources开放给公众号页面，用于浮层显示。extension.identity.json的key/id用于本地打包身份，storeId登记正式商店身份；本地production/development包共用本地ID，正式站点只连接商店ID，回环开发/预览使用本地ID。不记录凭据、正文或完整后台URL日志。

## 内部执行约束与升级

worker仍为storage.local唯一写入者，所有写入串行；一份schemaVersion2记录包含独立clipboard快照、当前任务、所选目标及最多100个24小时发送回执。收到后先持久化再ACK。手动发送相同requestId/digest返回既有回执，不重复启动；同ID不同内容拒绝。自动保存可在执行期间更新clipboard，不变动task/selected/receipts。没有公开任务管理流程；新手动发送自动替换未执行或已结束任务，实际执行租约存在时拒绝下一次发送。

执行前持久化attemptId和creating，导航/写入前记录内部阶段及tab/document/账号。迟到操作必须匹配当前任务与租约。worker重启时中断执行转uncertain，仅清除执行绑定，保留载荷供复制，不自动重放；下一次用户明确发送可建立新任务。未启动快照可在登录后选择/刷新目标时继续。旧schemaVersion1经Zod验证迁移，保留去重回执，但删除旧载荷/绑定，不自动执行升级前快照。0.1.3已经删除的正文不能恢复，更新后需再次发送。

正文成功读回后只清除执行绑定，当前载荷继续用于面板复制；复制本身不删除载荷。24小时到期任务和回执删除，读取/命令时检查；无事件不保证正点清理。未知存储格式不静默重置，提示重新安装后从Web发送；Web原稿仍归Web保存。无需清理按钮。

PAGE_ACTIVITY仅报告可信页面输入/指针/键盘活动，worker按执行tab/document使租约失效；MAIN同时检查写入中的用户输入。它是防止覆盖人类编辑的内部保护，不提供发送状态检测。账号变更、非空页、无法确认本次新建、接口缺失或超时停止，不重放写入。

## 页面与交付限制

账号识别包括维护者提供的首页weui-desktop_name、其他页面acount_box-nickname以及历史候选；仍要求可见名称唯一。标题和“草稿箱/新的创作/文章”入口为保守候选，完整流程待人类验收。

仅顶层文档，官方invoke对象参数、get_isready的isReady/isNew、get_content/set_content。isNew是编辑器版本标识，不能代替独立新建证据；要求article点击、新子tab及不同documentId、空标题/正文。标题原生setter和input/change后复核，正文读回只核对规范化文字，不比较标签数量或排版属性。导航整体30秒、每次JSAPI10秒。不同frame和同document SPA新建当前阻断；不使用私有实例/HTTP、DOM正文赋值、保存或发布。

pnpm build构建Web与插件；package:extension生成production及0.1.15 ZIP；build:extension:dev生成development。包包含本地脚本、logo、manifest、NOTICE和依赖许可。extension:check验证ID、权限、logo开放范围、生产来源和ZIP一致性。Pages只部署Web，插件独立分发；[安装与人工验收指南](../guides/wechat-transfer-extension.md)给出更新流程。计划/日志保留pending_human_acceptance，不运行前端自动化，不推送或上架。
