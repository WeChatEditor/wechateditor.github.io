---
title: 新文章编辑页隐藏账号核对修正记录
status: pending_human_acceptance
change_type: fix
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# 新文章编辑页隐藏账号核对修正记录

目标/指令：维护者确认文章新标签可以打开但未自动插入，要求继续修复。起点cacab0dcea19849ce9d30290659f209647def6ff，工作区/暂存为空，无CodeGraph；暂存门禁通过、归档NOT_DUE。

事实：维护者主动执行只读检查，官方invoke存在、页面顶层且opener存在、isReady/isNew为true；一个可见且空的TEXTAREA标题，一个不可见账号候选。当前accountName在接口读取前仅接受可见名称，导致新页被拒绝。仅存在opener和接口不能替代本次新子tab/document证据；没有实际插入/保存结果。

选择：worker仅对文章点击后唯一新增子标签的probe传入已确认账号。页面仅对该预期账号的probe/apply在官方invoke存在、可见非空名称缺失、候选节点恰好一个且名称严格一致时接受隐藏账号；可见冲突、多候选或不一致停止。导航/目标列表不启用退路；写入前后采用同一核对，保留空正文/标题保护。接口探测失败保留editor标记及原因。

实际改动：worker在step=editor、已匹配本次唯一新增子标签时，对probe传入已确认账号；bridge对probe/apply的单一隐藏候选严格核对，可见名称仍优先，导航/目标列表不放宽。相同accountName核对覆盖apply前后。接口就绪探测异常保留editor标记及具体原因。版本0.1.10，生产/开发/ZIP交付与当前设计/模块/指南、旧名称修正计划同步。

实际验证：冻结严格peer安装、format/format:check、Lint零错误（239个现行Vue警告）、全部workspace类型、Web/插件生产构建、0.1.10生产ZIP/开发包及包一致性、模块/文档、22项治理与12项共享契约、diff及归档CI NOT_DUE通过。Web现行大chunk提示保留；命令证据位于ignored的.generated/wechat-hidden-editor-account。没有依赖/锁文件、权限、协议、存储或边界变化。

偏差/未决：本轮没有创建/运行前端或浏览器自动化，没有访问公众号站点。维护者只读结果证明前置可见性阻断，但隐藏名称与原账号是否实际一致以及后续标题/正文/排版/保存仍待0.1.10人工复验。计划/日志保留pending_human_acceptance，参见[计划](../../../../plans/active/2026-10-12-wechat-hidden-editor-account.md)；本地自动提交、未推送部署，关联提交由本文件Git历史定位。
