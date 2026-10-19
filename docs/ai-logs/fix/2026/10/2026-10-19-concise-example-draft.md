---
title: 精简默认 Markdown 语法示例稿
status: pending_human_acceptance
change_type: fix
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 精简默认 Markdown 语法示例稿

## 用户目标、授权与关键指令

维护者要求删除默认文章的各国语言和各编程语言，澄清此前是指各种Markdown语法。默认稿应简短、整体通顺，主要展示Markdown、自定义语法及分段的渲染。

## 假设、选择与实际改动

初始工作区和暂存区为空，无.codegraph目录，归档审计NOT_DUE（HEAD f18c425d911e729a6770fd032baabd1ed4cb78ce）。已读取文档入口、活动计划、产品/卡片/存储相关设计与实际解析、current恢复代码。先准备[产品设计](../../../../design/jlab-wechat-editor.md)、[计划](../../../../plans/active/2026-10-19-concise-example-draft.md)和本记录，再改默认正文。

以写作到发布为主线，保留封面/总结卡片和简短普通Markdown示例。代码仅展示无语言标签的文本围栏；图片只写语法，不添加网络素材。保持已有current（含空正文）优先，不重置草稿或改运行逻辑。

## 验证、偏差、未决事项和提交

实际默认稿由9839字符/600行缩为1564字符/99行，减少84%。封面与总结分置开头和结尾，正文展示一至六级标题、强调/删除线、段落/换行、嵌套引用/列表、有序列表、对齐表格、分隔线、行内代码、单个无语言标签文本围栏和链接。图片仅有行内写法示例。通过TypeScript AST读取字符串核对长度、标题、围栏和卡片标记，导出.generated/concise-default-article.md供主动导入，不执行示例或前端渲染。产品、卡片、workspace、存储、迁移设计与应用说明同步；运行代码只修改app.config.ts，未改初始化/恢复、解析、配置或输出。

Windows Node24.18.0/pnpm11.13.1：format/format:check、Lint（0 error/244条既有Vue warning）、typecheck、build、modules:check、docs:check、治理22/22和共享契约12/12、diff与归档CI通过（NOT_DUE）。前端产物约797.41kB/gzip260.45kB，保留既有500kB体积提示。按仓库规则不运行前端单元、组件、E2E或浏览器自动化；人类阅读/卡片/current恢复/公众号验收未完成，计划和日志保持pending_human_acceptance。

关联提交fix(example): simplify default Markdown showcase，实际SHA由本记录Git历史定位。真实模型从当前会话turn_context核验为gpt-6.1-sol；按仓库规则提交后用git log -1 --format=full核验trailer。不推送或部署。
