# Web 与轻量插件消息协议

2026-10-12实现规格。packages/wechat-transfer-contract/src/modules/wechat-transfer/wechat-transfer.schema.ts中的Zod Schema为结构来源，类型使用z.infer。业务边界见[插件设计](../design/wechat-transfer-extension.md)。

## 外部消息

请求包含protocolVersion:1、UUID requestId及kind；仅SUBMIT_TASK包含payload。严格拒绝未知字段。成功响应为同版本/同ID/status:0/data，失败为同版本/同ID/非零status/err；不附原始页面错误或载荷。

| kind        | 请求字段                     | 成功data                                                | 副作用                  |
| ----------- | ---------------------------- | ------------------------------------------------------- | ----------------------- |
| PING        | 无                           | extensionVersion/supportedProtocolVersions/capabilities | 只握手                  |
| SUBMIT_TASK | payload                      | {task:摘要}                                             | 存储后ACK，不写后台     |
| GET_STATUS  | 可选taskId、receiptRequestId | {task:摘要或null}                                       | 不返回正文/账号         |
| OPEN_WECHAT | 无                           | {}                                                      | 打开固定公众号首页      |
| CANCEL_TASK | taskId                       | {task:摘要}                                             | 仅未执行任务可从Web取消 |

仅真实组织Web根或/index.html顶层来源接受外部消息，开发包额外支持5175/4175。来源字段不得由payload提供。外部没有START_INSERT或任意代码、URL、选择器、方法名参数。

## 内部消息和结果

独立internalRequestSchema支持STATUS、TARGETS、OPEN_WEB、OPEN_WECHAT、OPEN_PANEL、PAGE_ACTIVITY、START_INSERT(taskId/tabId/account)、CANCEL_TASK(taskId/inspected)和CLEAR_STORAGE(inspected:true)。写入/清理只接受实际扩展popup来源；公众号content仅STATUS/OPEN_WEB/OPEN_PANEL/PAGE_ACTIVITY。PAGE_ACTIVITY需匹配当前任务tab/document，shell只在可信页面输入/指针/键盘活动时报告。成功{status:0,data}，失败{status,err}。

页面结果通过内置scripting.executeScript的直接返回，由worker检查绑定/租约/phase，不接受旧设计中的content TARGET_READY/STEP_RESULT消息。SOURCE_CHANGED由Web当前快照校验显示；后台页面原始异常和正文不作为错误响应。

## 快照及摘要

payload字段为sourceArticleId(UUID)、sourceRevision/sourceGeneration(非负安全整数)、createdAt(epoch毫秒)、title(去空白1至64码点)、html/plainText(非空)、profile(wechat-editor-text@1-candidate)、digest(64位SHA256十六进制)，可选replaceTaskId(UUID)。

摘要按数组固定顺序序列化：protocolVersion、profile、title、html、plainText、sourceArticleId、sourceRevision、sourceGeneration、createdAt、replaceTaskId或null。收到后复算，HTML解析校验失败整篇拒绝，不静默清洗改稿。整个信封UTF8上限2MiB，schema也限制单字段；不截断。图片/媒体、CSS URL或危险HTML阻断。

任务摘要含id/requestId/title/receivedAt/phase/message，不返回原稿或账号。phase为pending/waiting_login/waiting_target/creating/waiting_editor/applying/inserted/blocked/uncertain/cancelled/expired。当前实现未登录/未选择时维持pending；正常到期移除，uncertain到期清除敏感载荷后保留阻断。

同requestId同digest返回同一回执；不同digest拒绝。替换需要明确旧taskId，不能替换执行中/uncertain。持久化后ACK，执行前持久化creating/applying。创建/写入后结果不明、worker重启或用户介入均uncertain，不自动重放。正常TTL24小时，最多100回执；终态延迟重试不复活任务。

Web握手1.5秒/提交5秒。提交超时保留原请求，只重试同ID/digest，或GET_STATUS按receiptRequestId查询；明确拒绝可重新准备。页面操作整体30秒/JSAPI单次10秒，不等于微信官方限制。

## 错误码

| status | 名称                 | 处理                                    |
| ------ | -------------------- | --------------------------------------- |
| 4101   | SOURCE_REJECTED      | 来源/权限不符                           |
| 4102   | PROTOCOL_UNSUPPORTED | 更新Web和插件                           |
| 4103   | PAYLOAD_INVALID      | 字段/digest/尺寸/内容不合法             |
| 4104   | IMAGE_UNSUPPORTED    | 使用现有复制流程                        |
| 4105   | STORAGE_UNAVAILABLE  | 检查配额/损坏记录；先检查后台再明确清理 |
| 4106   | TASK_BUSY            | 不替换或重复执行                        |
| 4107   | TASK_EXPIRED         | 重新准备                                |
| 4108   | TARGET_REQUIRED      | 登录/选择账号并确认                     |
| 4109   | PAGE_UNSUPPORTED     | 页面能力缺失，使用复制                  |
| 4110   | EDITOR_NOT_EMPTY     | 停止覆盖                                |
| 4111   | STEP_TIMEOUT         | 就绪/导航超时，执行任务转uncertain      |
| 4112   | RESULT_UNCERTAIN     | 检查后台后明确丢弃，禁止自动重放        |
| 4113   | SOURCE_CHANGED       | Web重新准备快照（当前显示本地错误）     |
| 4114   | REQUEST_CONFLICT     | 同ID不同内容/目标任务变化               |

共享契约检查覆盖来源、严格字段/动作、标题码点、digest、UTF8尺寸、受控HTML/媒体和空内容。它不启动浏览器。实际来源权限、ID安装、MAIN世界、导航、标题内部状态及保存保真仍由人类验收。
