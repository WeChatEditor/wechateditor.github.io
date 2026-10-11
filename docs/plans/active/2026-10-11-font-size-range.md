---
title: 扩展文字设置字号范围
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 扩展文字设置字号范围

按维护者要求增加可用字号，依据[排版模块](../../design/modules/typesetting.md)和[UI](../../design/jlab-wechat-editor-ui.md)。现滑杆14至18px、快捷14/15/16/17px、持久化校验14至18px。改为11至32px、步长1px、九个常用快捷档；默认/重置16px。公共模型集中范围，UI及workspace校验共享，预览/导出复用既有排版规则，配置格式和历史不变。旧合法小数记录不追加整数限制。无新依赖/模块/ADR。

暂存和工作区为空、无CodeGraph，归档NOT_DUE。

- [x] 核对入口、活动计划、UI/排版/存储ADR和门禁。
- [x] 实现范围/快捷档/持久化校验并执行适用静态检查。
- [ ] 人工确认11/32端点与中间档、键盘滑杆、快捷按钮换行、刷新恢复/旧配置、重置16px和公众号复制效果。

前端不运行自动化，完成技术验证自动提交、不推送；人工验收前保持活动计划。

fontSizeRange/fontSizePresets位于已有公共模型；Slider与workspace校验引用同一范围，字号快捷组独立三列自动换行，其他快捷组不变。format/format:check、Lint（0错误/228警告）、typecheck、build、modules:check、docs:check、diff检查通过，归档CI为NOT_DUE。最终JS545.04kB/gzip196.62kB，保留已有500kB提示；仅前端改动，未运行前端自动化或重复未变的治理测试。真实视觉/刷新恢复/公众号效果尚待人工确认，关联提交由本文件Git历史定位。
