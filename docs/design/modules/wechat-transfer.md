---
title: wechat-transfer跨工作区模块
status: accepted
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# wechat-transfer跨工作区模块

同名能力按workspace登记，schemaVersion2以workspace:name区分身份。依赖方向包契约→Web连接/插件任务，插件任务→wechat-page；公共文件见.module-boundaries.json，不访问其他workspace私有文件。

契约包为Zod结构来源、z.infer类型及来源/尺寸/digest/parse5 HTML校验。协议2只接收快照和打开固定界面，不再提供发送状态查询、启动、取消和清理。ARTICLE只返回标题/接收时间；TARGETS/SELECT_TARGET用于公众号选择，TRANSFER_NOTICE为后台一次性结果提示。

Web公共service/model/panel直接提交当前文字快照，再打开反馈和插件，无握手/状态/重试检测及额外标题确认。workspace调用wechat-export并在异步提交前复核generation和冲突/恢复。原稿/配置/历史仍归Web。

插件公共service/model组织单写队列、所选目标和自动执行；私有repository保存schemaVersion2的一份快照与100个24小时回执。先持久化再ACK，已选有效目标优先、首次默认第一个可用公众号，登录后刷新/选择继续未启动快照。重复请求不启动第二次，活动执行租约禁止新发送，其他旧快照自动更新。worker中断停止且删除载荷，不重放；旧v1存储经校验迁移，旧快照不执行。损坏数据拒绝并提示重装，Web原稿不受影响。

内部阶段用于去重/租约，不向UI提供状态检测。账号、非空页、可信后台输入和迟到绑定保护仍适用。失败含图片/超限/来源或摘要错误、任务忙、账号/页面/接口变化、超时、存储问题。格式/Lint/类型/构建、模块、契约/治理检查验证工程；真实Chrome插入/保存由人类验收。
