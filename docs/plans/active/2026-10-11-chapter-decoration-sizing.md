---
title: 下划线紧贴与点阵尺寸调整
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 下划线紧贴与点阵尺寸调整

维护者要求紧贴标题同时控制普通与粗下划线：启用时底线与标题主体等宽，关闭时保持整行宽度；点阵保持左右各两列三行，缩小圆点并压缩纵向间距。依据[排版模块](../../design/modules/typesetting.md)与[UI设计](../../design/jlab-wechat-editor-ui.md)，继续使用预览、样式卡片和公众号输出共用的规则，不新增配置字段或改变存储协议。

开始暂存区为空，无CodeGraph索引；已有pnpm-workspace.yaml改动属于人类内容，保留且不提交。归档审计NOT_DUE。圆点选择3px，列间距保留3px、行间距2px，整体9×13px。

- [x] 核对当前实现，准备设计、计划和日志。
- [x] 调整底线承载节点、点阵尺寸及设置说明。
- [x] 执行格式、Lint、类型、模块、文档、构建、治理测试和归档CI检查。
- [x] 准备本轮独立提交及关联记录。
- [ ] 人工验收两种下划线开关、三种对齐、编号、长标题、内联格式，以及点阵卡片/预览/公众号效果。

format/format:check、Lint（0错误/221警告）、typecheck、build、modules:check、docs:check、21项治理测试、docs:archive:check:ci（NOT_DUE）、commits:check与diff检查通过。生产JS536.56kB/gzip193.11kB，保留500kB体积提示。未新增或执行前端自动化，视觉与公众号效果待人类验收。pnpm format脚本固定包含根目录参数，执行时仍扫描整个仓库；核对既有人类文件格式化输出为unchanged且diff与开始一致，没有覆盖人类修改。

关联提交以本文件Git历史定位，提交后核验trailer；人工验收前保留活动计划与日志。本轮不推送。
