---
title: 原稿与公众号预览标题设计
status: pending_human_acceptance
change_type: style
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 原稿与公众号预览标题设计

维护者要求两栏标题更美观。读取现行UI、article边界、活动计划与决策索引；记忆仅参考800px双栏和语义图标习惯。选择统一圆角图标底座、中文主标题及细小辅助标签，原稿蓝/预览绿，标题使用h2语义且不新增交互。保持栏高、工具位置及窄栏横向滚动，样式归article私有共用文件。

暂存区为空、无CodeGraph、归档NOT_DUE；保留既有workspace配置改动。前端不运行自动化，静态检查和人工视觉验收分别记录。完成后仅提交本轮文件，不推送。

已完成两个标题的双行结构：原稿+MARKDOWN、公众号预览+微信阅读视图；淡蓝纸页代码与淡绿阅读SVG图标，32px渐变圆角底座/细边框。中文标题h2、辅助文本轻量、图标隐藏于辅助技术；16px左边距、原48px栏高与工具位置保留。article-pane-heading.css为模块私有scoped样式，被两个组件共享；不涉及功能、存储、导出或跨模块公共接口。

format通过临时ignore隔离既有workspace配置；format:check、Lint（0错误/226警告）、typecheck、build、modules:check、docs:check、diff检查通过。JS540.21kB/gzip194.99kB，沿用体积提示。治理脚本未变，不重复治理测试；未运行前端自动化或浏览器操作。宽窄分栏、800px、专注与缩放视觉保留人工验收，计划和日志pending_human_acceptance，关联提交通过Git历史定位。真实GPT-6 trailer按提交后核验，不推送。

最终归档CI为NOT_DUE，文档与格式检查再次通过。提交采用Git历史中已有作者身份的单次命令配置，不改本地/全局Git配置，保留人类workspace改动。
