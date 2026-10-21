# Web 与轻量插件消息协议

2026-10-21插件0.1.15起只转发HTML。根入口为稳定传输契约，/content仅供Web；协议仍为2。PING增加可选capabilities（最多32项，每项1至80字符），新插件声明html-relay@1，Web按此能力判定而非版本号。旧插件缺少能力时提示一次迁移更新，今后普通样式/规则更新不发布插件。见[转发边界](../design/extension-update-boundaries.md)。

2026-10-21正式商店ID为neeljhohndegbhaaaclmcdeenlebhicj。共享extensionId及extensionStoreUrl服务正式检测和安装；extensionIdForOrigin仅在http://127.0.0.1:5175/4175返回developmentExtensionId，其余origin返回正式ID。身份选择不改变下述协议2结构或插件来源校验。

2026-10-12交互简化规格，协议版本2。Zod Schema为结构来源，类型使用z.infer，入口为packages/wechat-transfer-contract/src/modules/wechat-transfer/wechat-transfer.schema.ts。[插件设计](../design/wechat-transfer-extension.md)描述现行行为。Web和插件需同时更新，协议1明确拒绝。

## 外部消息

0.1.6引入无载荷PING，当前请求仍仅protocolVersion/requestId/kind。0.1.15成功data为{extensionVersion,capabilities:[html-relay@1]}；connectionInfoSchema接受旧版只含extensionVersion以准确提示升级。新Web容纳未知能力名，识别稳定转发能力，不读取正文/账号/阶段。内部PING同样返回能力，来源与操作权限保持。

所有请求包含protocolVersion:2和UUID requestId，严格拒绝未知字段。成功响应为同版本/同ID/status:0/data；失败为非零status/err，不附载荷或原始页面异常。

| kind         | 请求字段 | 成功data                         | 行为                                                          |
| ------------ | -------- | -------------------------------- | ------------------------------------------------------------- |
| PING         | 无       | {extensionVersion,capabilities?} | 仅检测插件连接，无仓储或页面操作                              |
| SUBMIT_TASK  | payload  | {article:{title,receivedAt}}     | 先持久化后ACK，自动选择目标并新建插入                         |
| SAVE_ARTICLE | payload  | {article:{title,receivedAt}}     | 自动保存的独立可复制快照，先持久化后ACK，无页面操作/任务/回执 |
| OPEN_PANEL   | 无       | {}                               | 优先打开popup，失败时打开本地面板标签                         |
| OPEN_WECHAT  | 无       | {}                               | 打开固定公众号首页                                            |

PING只检测插件连接并返回版本；不再支持GET_STATUS、CANCEL_TASK，Web不查询发送阶段、不重试接收状态。手动发送接收超时提示检查后台，自动同步超时提示检查插件且本机草稿不受影响；没有自动重试同一请求。没有公开任意代码/URL/选择器/方法名参数。

worker仅接受真实组织Web根/index.html顶层来源；开发包额外支持5175/4175。来源不能由payload自报。保留整个信封2MiB UTF8限制、严格传输字段和digest校验；HTML/样式/媒体只在Web校验。

## 内部消息

| kind                                | 参数           | 用途                                                                             |
| ----------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| ARTICLE                             | 无             | 一次读取标题/接收时间元信息或null，不返回正文和阶段                              |
| COPY_ARTICLE                        | 无             | 仅可信popup读取{article:{title,receivedAt,html,plainText}}或null，供用户点击复制 |
| TARGETS                             | 无             | 返回targets及selected，保存有效选择或默认第一个，继续未启动快照                  |
| SELECT_TARGET                       | tabId、account | 复核并保存所选公众号，继续未启动快照                                             |
| OPEN_WEB / OPEN_WECHAT / OPEN_PANEL | 无             | 打开固定界面                                                                     |
| PAGE_ACTIVITY                       | 无             | 可信后台用户活动使匹配执行租约失效                                               |

取消内部STATUS、START_INSERT、CANCEL_TASK、CLEAR_STORAGE。TARGETS/SELECT_TARGET/COPY_ARTICLE只接受popup.html来源。公众号content仅PING/ARTICLE/OPEN_WEB/OPEN_WECHAT/OPEN_PANEL/PAGE_ACTIVITY，使用共享contentRequestAllowed校验；Web没有正文读取消息。成功{status:0,data}、失败{status,err}。

COPY_ARTICLE只返回当前独立clipboard快照（最新成功自动保存或手动发送），不返回账号、执行阶段、来源标识或历史。无论成功/失败/中断均保留供复制，TTL24小时或下次成功同步/发送替换。复制动作不检测状态、不重放写入，不改变快照。Popup可信点击内直接启动ClipboardItem异步HTML/纯文字写入，同次读取保证两个格式一致。ARTICLE返回同一快照的元信息。

SAVE_ARTICLE与SUBMIT_TASK使用相同payload及来源/尺寸/摘要校验，不解释正文HTML。SAVE_ARTICLE只写clipboard，不创建task/发送回执，不改变已选目标或执行租约，不调度页面操作或剪贴板写入；可在手动发送执行中使用。字段保留schemaVersion2，旧记录缺失clipboard时仅从合法task.payload迁移一次，显式null不复活旧任务内容；格式1不恢复载荷。自动保存不计入100个发送回执上限，快照时间校验仍使用24小时及未来60秒保护。

worker向公众号content发送TRANSFER_NOTICE(message)作为一次性完成/失败提示；content校验Schema及sender.id，不接收网页window消息。它不触发状态查询或新建操作。

共享公开nativeTitleEditAttribute为固定data-jlab-native-title-edit，仅协作同步浏览器原生标题事务产生的input事件，不是授权令牌或新消息字段。页面apply由service传入固定属性名，仅调用期间在已识别标题节点设置active，finally移除；content只在同一标题节点的input事件看到active时不报告PAGE_ACTIVITY，其他真实活动继续报告。PageCommand属于插件本地scripting参数，不向Web/content开放任意选择器、属性或代码。

## 快照与内部去重

payload为sourceArticleId(UUID)、sourceRevision/sourceGeneration(非负安全整数)、createdAt、title/html/plainText(非空且各有2MiB字符串资源上限)、profile(1至200字符不透明标签)、digest(64位SHA256)。整个信封另受2MiB UTF8限制。标题和纯文字原样传输，不trim；当前Web的articleTitleSchema执行64 Unicode码点及去首尾空白，插件不固定此产品规则。删除replaceTaskId，重新发送自动更新旧快照。

digest数组固定顺序：protocolVersion、profile、title、html、plainText、sourceArticleId、sourceRevision、sourceGeneration、createdAt。插件复算，不静默改稿后执行。Web标题自动来自当前H1，缺失使用“未命名文章”；当前Web对图片/媒体整篇拒绝，插件不重复格式检查。

执行阶段仅用于插件本地租约/去重回执，不提供外部查询。手动发送相同requestId/digest不再启动，不同digest冲突；执行租约存在时拒绝新发送，自动同步仍可覆盖clipboard。最多100发送回执，TTL24小时，正常到期删除。worker中断只失效执行绑定，独立可复制快照保留，不重放写入。旧v1快照升级后不能执行；0.1.3已经删除的正文不能恢复，更新后修改自动保存或重新发送。下一次明确发送可以创建新任务。

## 错误与验证

现有错误码4101至4114继续用于来源、协议、字段/HTML/摘要/尺寸、图片、存储、任务忙、到期、目标、页面、非空编辑器、超时、结果不确定、源变化和请求冲突。仅必要失败响应和后台一次性提示对用户可见，不维护发送状态页面。

共享契约检查覆盖SAVE_ARTICLE完整快照/额外执行字段拒绝、严格字段/已删除动作、协议1拒绝、选择目标参数、元信息无阶段、来源、Unicode标题、digest、尺寸、HTML/媒体及空正文。静态检查不启动浏览器，真实来源权限、自动保存同步、Chrome面板、导航、标题状态、插入与手动保存仍由人类验收。
