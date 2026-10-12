---
title: wechat-transfer跨工作区模块
status: accepted
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# wechat-transfer跨工作区模块

0.1.8在本次尝试内记录menuExpansionRequested，只在草稿箱阶段首次允许页面适配器展开内容管理；retryNavigation不推进到新的创作，继续使用原30秒期限。后续创作/文章缺失等待，多目标或其他拒绝立即停止；超时保留最后的页面/入口原因。不新增仓储字段、共享协议或公开状态查询。

0.1.7导航阶段依次进入草稿箱、打开创作菜单、点击文章、等待唯一新增文章子标签并插入。获取租约时不绑定用户原后台，检查账号后绑定独立导航页当前documentId；切换文章子标签清除旧文档绑定，旧文档活动不影响新阶段，真实用户活动仍停止执行并保留具体原因。任务处于pending且没有可用后台时打开固定首页，在task.tabId保存本次登录标签；首次及该标签加载完成/完成状态URL变化时用单个30秒就绪探测识别账号并自动继续，超时保留pending供登录事件或popup刷新继续。仅pending可以恢复，creating/applying中断不会重放；登录打开及探测均防并发重复。

0.1.6连接检测：Web公共service.detect在初始化一次PING，重复检测共享同一在途Promise；model区分checking/available/unavailable/incompatible，连接或协议失败更新可用性。openPanel只在available时运行，失败提供操作反馈。panel分组展示文章、连接/安装、复制/发送结果和步骤；没有发送阶段轮询。worker的外部/内部PING只返回manifest版本，不进入repository或页面调度。固定OPEN_WECHAT允许可信公众号content调用，修复浮层既有导航入口。

同名能力按workspace登记，schemaVersion2以workspace:name区分身份。依赖方向包契约→Web连接/插件任务，插件任务→wechat-page；公共文件见.module-boundaries.json，不访问其他workspace私有文件。

契约包为Zod结构来源、z.infer类型及来源/尺寸/digest/parse5 HTML校验。协议2外部PING只返回插件版本，SUBMIT_TASK提交手动发送任务，SAVE_ARTICLE只同步独立可复制快照，另有打开固定界面；不提供发送状态查询、启动、取消和清理。ARTICLE只返回最新可复制快照标题/接收时间；COPY_ARTICLE仅可信popup读取对应HTML/纯文字，contentRequestAllowed禁止公众号content读取正文，Web无正文读取消息。TARGETS/SELECT_TARGET用于公众号选择，TRANSFER_NOTICE为后台一次性结果提示。

Web公共service/model/panel直接提交当前文字快照并打开反馈，worker优先调度打开后台尝试新建插入，用户按需打开插件复制。service.save仅同步插件，无打开后台/面板或剪贴板操作；两类请求共用串行队列、校验和迟到结果保护，自动同步结果与手动发送反馈分开。启动一次连接检测及手动重新检测，无发送状态/重试检测及额外标题确认。workspace调用wechat-export并在异步提交前复核generation和冲突/恢复；自动同步额外复核本机保存成功。原稿/配置/历史仍归Web。

插件公共service/model组织单写队列、所选目标和自动执行；私有repository保存schemaVersion2的一份快照与100个24小时回执。先持久化再ACK，已选有效目标优先、首次默认第一个可用公众号；无账号也自动打开后台登录页，登录后刷新/选择继续未启动快照。成功、失败、worker中断后保留标题/HTML/纯文字供面板复制，直到TTL到期或新发送替换；清除执行绑定、不重放。重复请求不启动第二次，活动执行租约禁止新发送。旧v1存储经校验迁移，旧快照不执行；0.1.3已删正文不恢复。损坏数据拒绝并提示重装，Web原稿不受影响。

私有repository的clipboard保存独立payload/receivedAt；SAVE_ARTICLE只覆盖它，SUBMIT_TASK新任务同时更新它。执行始终读取task.payload，自动保存不改task/租约/selected/receipts、不启动任务。旧格式2缺失clipboard从当前合法task.payload迁移，显式null不会复活；格式1旧载荷仍不恢复。两个快照独立按24小时清理，插件面板始终复制clipboard。

内部阶段用于去重/租约，不向UI提供状态检测。账号、非空页、可信后台输入和迟到绑定保护仍适用。失败含图片/超限/来源或摘要错误、任务忙、账号/页面/接口变化、超时、存储问题。格式/Lint/类型/构建、模块、契约/治理检查验证工程；真实Chrome同步/插入/保存由人类验收。
