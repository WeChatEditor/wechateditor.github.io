---
title: 公众号账号名称识别修正记录
status: pending_human_acceptance
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
change_type: fix
---

# 公众号账号名称识别修正记录

目标：修复维护者已登录公众号首页却无法识别账号的反馈。维护者人工确认账号名称元素class为weui-desktop_name；现有候选不包含它。依据[修正计划](../../../../plans/active/2026-10-12-wechat-account-detection.md)及wechat-page现行设计。

工作区/暂存起点为空，f6f92b0bebe15cb865dfb7c60266a118c7487b4b，无.codegraph；暂存门禁及归档NOT_DUE通过。浏览器工具拒绝读取该公众号站点，未使用其他工具/注入方式绕过，改用人类提供的class。只记录结构，不保存后台URL、账号文本或凭据。

选择：增加精确候选，保留可见性/唯一性及执行前后账号检查；改善账号未匹配提示；插件0.1.1保持稳定ID/协议/权限。实际改动、验证、提交和人类复验结果收尾补齐。

实际改动：bridge加入.weui-desktop_name，无法匹配/不唯一与来源/frame限制分开提示；extension/package.json升级0.1.1，build读取单一版本生成manifest/ZIP，package checker检查包版本一致，CI交付路径使用版本ZIP通配；指南/设计及主实施计划同步人类结构观察。

验证：冻结严格peer安装、pnpm format及format:check、Lint（0错误，现行240个Vue排版警告）、typecheck、模块/文档、生产package/开发build、ID/权限/来源/ZIP检查、归档CI NOT_DUE及git diff --check通过。没有前端单元、组件或浏览器自动化；浏览器受站点策略阻断后未绕过。未核验真实识别成功、正文写入或保存，未推送。

交接：原安装目录已更新，用户在扩展管理页重新加载并核对0.1.1，再刷新公众号、刷新目标能力。复验结果仍待用户；日志和计划pending_human_acceptance。真实关联提交由此文件Git历史定位，不记录后台URL/账号内容。
