# Web 与轻量插件消息协议设计

2026-10-11设计规格，尚未实现。业务边界见[插件设计](../design/wechat-transfer-extension.md)。未来 `packages/wechat-transfer-contract` 的 Zod Schema 是运行时结构来源，所有 TypeScript类型由z.infer推导；本文件与实际Schema同步，不另建HTTP/OpenAPI契约。

## 版本、信封与动作

请求固定为 `protocolVersion: 1`、`requestId`、`kind`、`payload`。requestId使用UUID，Schema拒绝未知字段。成功响应包含同版本、同requestId、`status: 0`及data；失败包含同版本、同requestId、非零status及面向用户的err。成功/失败使用判别联合，不混入任意网页异常。消息不是HTTP请求，不套用HTTP状态码。

| kind                           | 允许发送方            | payload / 成功data                                                 | 副作用边界                                                |
| ------------------------------ | --------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| `PING`                         | 受信任Web             | 空对象 / extensionVersion、supportedProtocolVersions、capabilities | 只做握手，不读取公众号内容                                |
| `SUBMIT_TASK`                  | 受信任Web             | 文字快照 / taskId、digest、phase、receivedAt、expiresAt            | 持久化后才接收；不直接新建/写文章                         |
| `GET_STATUS`                   | 受信任Web、插件UI     | 可选taskId / 精简任务摘要或明确无任务                              | 不返回HTML、正文或账号标识                                |
| `OPEN_WECHAT`                  | 受信任Web、插件UI     | 可选taskId / 已打开状态或目标选择需求                              | 只打开固定后台入口，不接受URL                             |
| `CANCEL_TASK`                  | 受信任Web、插件UI     | taskId / cancelled                                                 | 只取消未执行任务，不撤销公众号改动                        |
| `START_INSERT`                 | 插件popup或公众号浮层 | taskId、目标候选引用、确认值 / 已启动状态                          | 额外校验真实sender/标签、显式操作和phase；拒绝外部Web调用 |
| `TARGET_READY` / `STEP_RESULT` | 绑定公众号content入口 | taskId、attemptId、阶段证据 / 当前状态                             | 内部消息；拒绝未绑定文档、迟到/重复阶段结果               |

外部消息和扩展内部消息采用分开的Schema/接收入口；不能只靠kind字符串区分可信度。内部结果不把网页提供的阶段名或成功布尔值直接当作最终完成，wechat-transfer协调器对照租约、预期phase和实际页面读回决定转移。

## 文字快照

| 字段             | 约束与用途                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| sourceArticleId  | 原稿ID摘要关联，合法UUID；只存本地，不写诊断日志                                                                      |
| sourceRevision   | 非负安全整数；不是所有排版变化的完整版本                                                                              |
| sourceGeneration | 非负安全整数，Web页面本次输出generation                                                                               |
| createdAt        | Web准备时间，正整数epoch毫秒；扩展另记真实receivedAt并生成TTL，不信任Web自报有效期                                    |
| title            | 去首尾空白，1至64个Unicode码点；公众号实际限制更严格时阻断提示                                                        |
| html             | 受控、清洗、内联后的完整文章；正文与头尾不得含img、SVG、视频、iframe、脚本或事件属性                                  |
| plainText        | 包含启用头尾、移除纯装饰的可见文字；用于摘要与完整性核对                                                              |
| profile          | 固定 `wechat-editor-text@1-candidate`，独立于既有剪贴板profile                                                        |
| digest           | 对protocolVersion、profile、title、html、plainText、来源版本按固定顺序JSON序列化后计算SHA-256十六进制值；扩展重新计算 |
| replaceTaskId    | 可选，用户显式同意替换的pending任务ID；不允许覆盖执行中或uncertain任务                                                |

Schema检查形状和长度，HTML检查还必须解析受控结构，清洗后复核；digest对最终接收内容重新计算，发生清洗差异时拒绝原digest并要求Web重新准备，不静默改内容。样式检查拒绝远程背景图、url型排版图片和不支持媒体；恶意HTML不能因“不含img”就进入MAIN世界。

整个SUBMIT_TASK信封序列化后的UTF-8上限2MiB，plainText不超过现行导入/原稿保护范围允许的完整输出规模，并受总字节限制；大于保护值拒绝，不能截断标题/正文。无正文、只有空白或只有装饰拒绝。任务ID由扩展在接收时生成，WebrequestId用于重试去重，attemptId由扩展每次开始执行生成；这些ID不复用作为公众号URL参数。

握手设计超时1.5秒，提交应答5秒。提交超时不等于未持久化，先使用同requestId重试或查询状态；禁止改用新requestId盲目重建任务。Web重载后的手动发送是新请求，若pending任务digest相同可提示现有任务，若内容不同必须确认替换。只有完成持久化后返回SUBMIT成功。当前任务之外保留最多100个24小时内的小型request回执，取消/替换/插入后的原requestId重试只返回终态，不重新创建；达到保护上限拒绝新增请求，过期回执才可删除。

## 错误码与显示

| status | 名称                 | 处理                                                       |
| ------ | -------------------- | ---------------------------------------------------------- |
| 4101   | SOURCE_REJECTED      | 来源或扩展内部sender不受信任，拒绝；不给外部调用者页面细节 |
| 4102   | PROTOCOL_UNSUPPORTED | 显示更新插件/Web或使用复制                                 |
| 4103   | PAYLOAD_INVALID      | 字段、digest、尺寸、空正文或格式不合法，保留原稿           |
| 4104   | IMAGE_UNSUPPORTED    | 含图片/媒体，提示现有复制流程，不创建任务                  |
| 4105   | STORAGE_UNAVAILABLE  | 存储/配额失败，未接收，不覆盖旧任务                        |
| 4106   | TASK_BUSY            | 执行中/uncertain，不能替换或启动第二次                     |
| 4107   | TASK_EXPIRED         | 已过期，需要Web重新发送                                    |
| 4108   | TARGET_REQUIRED      | 登录、账号选择或目标确认需要用户操作                       |
| 4109   | PAGE_UNSUPPORTED     | 页面/JSAPI/isNew不支持，提示手动复制                       |
| 4110   | EDITOR_NOT_EMPTY     | 本次目标已有内容，停止，不覆盖                             |
| 4111   | STEP_TIMEOUT         | 未发生副作用的步骤超时；按阶段允许显式继续                 |
| 4112   | RESULT_UNCERTAIN     | 新建/写入结果无法确认，停止重放，要求人工检查              |
| 4113   | SOURCE_CHANGED       | 准备期间输出输入改变，重新准备                             |
| 4114   | REQUEST_CONFLICT     | 相同requestId携带不同digest，拒绝                          |

导航失败与写入后超时不能统一处理：发生副作用或无法排除副作用时必须4112/uncertain。取消不是失败码。错误记录只含阶段、名称、耗时与插件版本；不附正文、HTML、token、cookie、原始账号信息、完整URL或截图。用户可见详情使用清晰说明，不要求理解phase或digest。

## 验证边界

未来Schema契约检查覆盖未知版本/字段、UTF-8字节限制、digest、动作权限与损坏记录；纯契约检查不启动浏览器。来源权限、扩展ID、Chrome隔离世界、页面导航和正文保真必须人工验收。未额外获得授权前，不运行前端单元、组件或浏览器自动化。
