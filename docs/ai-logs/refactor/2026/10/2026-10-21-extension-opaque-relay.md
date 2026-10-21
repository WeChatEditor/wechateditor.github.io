---
title: 插件纯转发与升级耦合审计记录
status: pending_human_acceptance
change_type: refactor
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 插件纯转发与升级耦合审计记录

维护者明确删除插件格式校验，避免后续排版更新反复发布插件，并要求审查其他耦合。起始暂存和工作区为空。现行实现除两处validateTextHtml外，还存在profile字面量、标题64字、页面媒体/标签计数及样式版本门槛。

选择：格式/媒体/标题规则只由Web执行，传输Schema与内容规则使用独立公共入口，插件包禁止引入内容解析器。稳定能力html-relay@1替代排版版本号门槛；profile只作不透明标签，传输标题不固化产品限制。来源、消息/体积/digest、仓储、账号/空文章、新建和用户活动保护保留。微信适配、manifest/域名/Chrome及传输存储能力升级边界记录到设计矩阵。

初始归档NOT_DUE；公共入口注册变更按治理进行同一复核。没有授权或运行前端测试/浏览器自动化，不发布远程更新；完成后记录真实检查与提交，功能待人类验收。

实际改动：内容规则移到/content入口（含Web专用profile与articleTitleSchema），传输根入口不再依赖解析器。worker接收和popup复制删除validateTextHtml；页面读回移除标签计数/媒体排斥，标题仅使用页面实际限制。Web按稳定能力识别；wire/clipboard保留HTML/纯文字/标题原文，不按样式profile解释。构建许可清单去掉未打包解析器，包检查增加内容规则回流门禁。

实际验证：治理22/22、契约25/25、Lint零错误/251现行排版警告、类型、生产构建、模块/文档及diff通过。两类插件构建与ZIP检查通过，6份bundle元信息均不含Web规则/parse5/entities。新增契约样例证明未来HTML/profile/标题可传输，Web仍拒绝不允许的内容，digest和严格字段保护继续有效。pnpm缓存数据库在沙箱不可写，批准的冻结严格peer离线安装后正常；治理测试使用批准的临时Git仓库写权限，无前端测试。

插件0.1.15商店派生包仅从已验证ZIP移除manifest.key，其余逐项核对；大小/哈希见计划。功能人工验收保持pending_human_acceptance；技术复核提交后才记录真实基线，最终归档CI/格式和提交收尾补记。
