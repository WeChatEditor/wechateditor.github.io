---
title: 精简默认 Markdown 语法示例稿
status: pending_human_acceptance
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 精简默认 Markdown 语法示例稿

## 目标、授权与设计依据

维护者澄清“各种语言”指Markdown语法，要求移除各国语言和各编程语言，缩短默认文章，以通顺正文直接展示常用Markdown、自定义卡片与分段效果。依据[产品设计](../../design/jlab-wechat-editor.md)、[卡片设计](../../design/markdown-cards.md)与[存储设计](../../design/jlab-wechat-editor-storage.md)，只替换默认正文并同步相关说明，不修改解析器、存储、配色和导出。不需要新ADR。

## 实施步骤和退出条件

- [x] 确认工作区与暂存区为空，无.codegraph目录，归档审计NOT_DUE。
- [x] 核对已有语法和current恢复分支，准备设计、本计划及协作记录。
- [x] 重写exampleMarkdown，覆盖标题、文本强调、段落/换行、引用、列表、表格、分隔线、链接、代码与两类卡片。
- [x] 同步现行设计与验收说明，执行格式、Lint、类型、构建、模块/文档、适用治理/契约检查及归档CI。
- [ ] 维护者检查首次默认稿、已有正文与空current恢复、手机/电脑阅读与分段、卡片和公众号复制/保存。

## 实际结果、偏差、遗留与提交

默认正文由9839字符/600行缩为1564字符/99行，字符数减少84%。封面卡开场、总结卡收尾，中间按写作、整理、检查串联普通Markdown。一至六级标题、强调/删除线、分段/单行换行、嵌套引用/列表、对齐表格、分隔线、行内代码、一个无语言标签的文本围栏和链接均有直接示例。图片只示范语法，不加载远程素材或让默认稿进入含图传稿分支。通过TypeScript AST读取字面量核对字符/行数、各级标题、两个卡片标记和无语言标签围栏，并导出.gitignore内的.generated/concise-default-article.md，供维护者主动导入查看；没有运行解析器或页面测试。

源码只修改app.config.ts的默认正文；现行产品、卡片、存储、迁移、workspace和应用验收说明同步。current恢复实现未修改，已有正文和空current均继续优先。

Windows Node24.18.0/pnpm11.13.1：format/format:check、Lint（0 error/244条既有Vue warning）、typecheck、build、modules:check、docs:check、治理22/22与共享契约12/12、git diff --check和归档CI通过（NOT_DUE）。前端产物约797.41kB/gzip260.45kB，保留既有500kB体积提示。前端自动化不在本轮授权内，视觉、首次恢复和公众号效果保留人类验收，本计划和日志保持pending_human_acceptance。

关联提交标题fix(example): simplify default Markdown showcase；模型从本会话turn_context核验为gpt-6.1-sol，提交后核验实际trailer。不推送或部署。
