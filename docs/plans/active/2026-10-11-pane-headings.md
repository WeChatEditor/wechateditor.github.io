---
title: 原稿与公众号预览标题设计
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 原稿与公众号预览标题设计

按维护者要求美化两栏标题，依据[UI设计](../../design/jlab-wechat-editor-ui.md)。采用32px圆角图标底座、14px中文主标题、10px辅助标签，原稿淡蓝、预览淡绿，统一左边距，保持48px标题栏和右侧动作。article私有共享scoped样式，不改功能/存储/滚动/导出，无新依赖或ADR。

起始暂存区为空、无CodeGraph，归档NOT_DUE。既有pnpm-workspace.yaml不修改、不格式化、不提交。

- [x] 核对入口、活动计划、现行设计和Git门禁。
- [x] 完成两栏标题与静态工程检查。
- [ ] 人工确认宽/窄分栏、800px工作台、专注预览及浏览器缩放下的视觉和工具可达性。

不新增或执行前端自动化。技术完成自动提交，本轮不推送；人工视觉验收前保留本计划。

实际修改article-editor/article-preview标题结构及article私有article-pane-heading.css，两组件通过scoped style src复用。中文主标题h2、图标aria-hidden、左侧纸页代码/右侧阅读图标；标题32px视觉高度位于原48px栏中。MARKDOWN为9px间距标签、微信阅读视图为10px辅助文本，左右主标题14px/600字重、16px起始边距。无逻辑、存储或公共边界变化。

format（临时ignore隔离workspace配置）/format:check、Lint（0错误/226警告）、typecheck、build、modules:check、docs:check与diff检查通过；生产JS540.21kB/gzip194.99kB，保留原500kB提示。纯视图样式修改，治理脚本不变，不重复治理测试。归档CI结果在日志记录；关联提交由本文件Git历史定位。人工视觉尚未验收。
