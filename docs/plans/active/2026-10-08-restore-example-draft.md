---
title: 恢复首次打开的原版示例稿
status: pending_human_acceptance
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 恢复首次打开的原版示例稿

## 目标、授权与设计依据

维护者明确要求恢复原桀士排版首次示例稿，替代此前空原稿初始化。按[迁移设计](../../design/jlab-wechat-editor-migration.md)、[存储设计](../../design/jlab-wechat-editor-storage.md)与[迁移决策](../../decisions/ADR-20261008-jlab-independent-repository.md)实施。

## 实施步骤和退出条件

- [x] 确认目标暂存区/工作区为空，归档审计NOT_DUE；核对来源原版示例内容与草稿恢复规则。
- [x] 更新现行设计、ADR和人工验收清单，准备本记录与AI日志。
- [x] 恢复app.config的exampleMarkdown，并在workspace初始化中引用，完整沿用原示例正文。
- [x] 执行格式、Lint、类型、构建、模块/文档、diff与归档CI检查，提交并核验标记。
- [ ] 维护者确认无current时显示示例稿，已有正文/空稿恢复，编辑和刷新恢复正常。

## 实际结果、偏差、遗留与提交

已有current优先恢复，不删除或改写浏览器草稿，不新增数据迁移/历史版本。仅恢复初始Markdown，默认设置与持久化规则保持。前端人工验收由维护者执行，不新增或运行前端自动化。人工验收前保留活动计划。本轮提交通过本文件Git历史定位，创建后核验标记。

2026-10-08 Windows Node24.19.0/pnpm11.22.0：format/format:check、Lint、类型、生产构建、modules:check、docs:check、diff和归档CI通过（NOT_DUE）。原版app.config逐字核对一致；代码diff仅恢复示例常量与初始引用，存储加载分支未变。Lint保留原有222条warning、零error；生产JS525.40kB/gzip189.28kB，保留原有500kB体积警告。未执行前端自动化，人工初始显示与刷新恢复待维护者确认。
