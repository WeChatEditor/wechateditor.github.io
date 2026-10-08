---
title: 恢复首次示例稿
status: pending_human_acceptance
change_type: fix
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 恢复首次示例稿

## 用户目标、授权与关键指令

维护者明确要求恢复原桀士排版首次打开的示例稿，替代此前首次空原稿选择。目标现行设计、ADR和验收计划同步本次最新指令；不改写初次迁移的历史验证结果。

## 假设、选择与实际改动

目标初始暂存区/工作区为空，归档审计NOT_DUE。来源app.config包含完整示例稿“把想法，排成好文章”，目标迁移时只保留storageName/maxMarkdownLength。恢复该原版常量与workspace初始引用，已有存储加载/校验优先级保持，包括空正文；不读写或删除浏览器数据。恢复不影响默认配色/排版或主动历史规则。

CodeGraph在来源返回无可用索引，回退定向源码读取；没有创建索引。目标无.codegraph目录，直接定向读取。

## 验证、偏差、未决事项和提交

2026-10-08 Windows Node24.19.0/pnpm11.22.0：format/format:check、Lint、类型、生产构建、modules:check、docs:check、diff和归档CI通过（NOT_DUE）。原版app.config逐字核对一致；代码diff仅恢复示例常量与初始引用，存储加载分支未变。Lint保留原有222条warning、零error；生产JS525.40kB/gzip189.28kB，保留原有500kB体积警告。未执行前端自动化，人工初始显示与刷新恢复待维护者确认。前端功能由人类验收，不执行前端自动化。来源Cyber-Sight代码和历史交接文档不变；目标现行规则以本次维护者指令为准。

关联[计划](../../../../plans/active/2026-10-08-restore-example-draft.md)、[迁移设计](../../../../design/jlab-wechat-editor-migration.md)。本轮提交通过文件Git历史定位，提交后核验真实模型trailer；不推送。
