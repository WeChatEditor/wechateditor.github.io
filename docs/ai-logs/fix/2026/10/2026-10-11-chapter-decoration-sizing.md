---
title: 下划线紧贴与点阵尺寸调整
status: pending_human_acceptance
change_type: fix
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 下划线紧贴与点阵尺寸调整

目标与授权来自维护者两项标题样式调整。当前下划线在heading上绘制整行边框，紧贴开关未参与；点阵为左右各2×3个5px圆点，行间距3px。选择紧贴时在标题主体上绘制底线并保留标题对齐、编号与内联节点，非紧贴沿用heading整行边框。点阵改为3px圆点、2px行间距，列间距保持3px。

已读文档入口、活动计划、排版/UI/验证/开发/治理设计和存储ADR。记忆仅用于确认既有人工验收偏好，当前事实以本仓库为准。无CodeGraph索引，暂存区为空，归档审计NOT_DUE。pnpm-workspace.yaml既有修改保留且排除提交；不运行前端自动化。无需新增ADR。

实际改动仅涉及公共排版服务、设置说明与对应设计/计划/日志。紧贴时将原heading底部间距移至inline-block标题主体，主体最大宽度100%，支持原始内联格式、编号、对齐和长标题折行；关闭时整行底线不变。点阵整体从13×21px缩为9×13px。

format/format:check、Lint（0错误/221警告）、typecheck、build、modules:check、docs:check、21项治理测试、归档CI（NOT_DUE）、commits:check与diff检查通过。JS536.56kB/gzip193.11kB，仍有原500kB体积提示。格式化原拟限定本轮文件，但pnpm format脚本固定包含根目录参数，实际仍扫描全仓库；人类文件显示unchanged，并核对diff与开始相同，没有覆盖人类修改。后续文档格式化直接调用prettier限定文件。

计划与日志保持pending_human_acceptance，人工清单包括两种下划线紧贴/整行、三种对齐、编号、内联格式/长标题和点阵的卡片、预览、公众号粘贴保存效果。准备仅提交本轮八个文件，真实模型GPT-6 trailer，提交后核验；关联提交以本文件Git历史定位，不推送。
