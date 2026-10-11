---
title: wechat-transfer跨工作区模块
status: accepted
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# wechat-transfer跨工作区模块

同名能力按workspace登记，注册schemaVersion2以workspace:name区分身份。包契约→Web连接/插件任务；插件任务→wechat-page。不得从包导入应用，也不得互相访问Web和插件私有文件。全部公共文件见.module-boundaries.json。

packages/wechat-transfer-contract提供Zod结构来源、z.infer类型、来源/尺寸/digest和DOM无关parse5文字HTML校验。显式package exports只导出wechat-transfer.schema.ts。它不持有页面、任务存储或Vue状态。

Web公共service/model/panel管理插件握手、快照提交、原请求重试和状态。workspace提供经wechat-export导出的纯数据，并在所有await之后提交之前以sourceGeneration及冲突锁复核。临时标题不写既有存储。接收应答丢失重试沿用原请求，不生成第二份快照。

插件公共service/model组织单写队列；私有repository持有storage.local一份任务及最多100个24小时回执。先持久化、再ACK和执行；creating/waiting_editor/applying恢复为uncertain，不自动重放。成功清除HTML/纯文字，保留短期摘要。损坏存储只允许明确检查后台后清空。执行阶段取消/清空被阻断，租约和任务ID拒绝迟到结果。

失败：图片、超限、摘要/来源错误、未知协议、任务忙、账号变化、页面能力缺失、超时、配额、执行中断。保留复制出口；插入不等于保存。格式/Lint/类型/构建/模块、共享契约和治理测试验证工程，真实Chrome及公众号仍由人类验收。
