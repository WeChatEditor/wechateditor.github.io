---
title: 原稿固定头尾显示配置
status: pending_human_acceptance
change_type: feat
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 原稿固定头尾显示配置

按维护者要求将原稿头尾展示改为可配置。选择固定头尾抽屉中的单一展示开关，默认true延续当前行为；workspace持久化可选布尔偏好，旧记录缺失补true，错误类型拒绝。ending面板仅props/events，文章与头尾实际启用状态保持独立，不写文章版本。起始工作区/暂存为空，无CodeGraph，归档NOT_DUE；先准备设计与计划。静态验证和人工验收分别记录，不运行前端自动化，完成后自动提交不推送。

实现配置端口/校验/规范化、store快照/恢复/监听、ending面板开关及workspace.page条件展示。false原样恢复，缺失补true；只读块仍仅展示实际启用的头尾。复用原稿ResizeObserver响应布局变化和既有冲突写入门禁。初次新增label沿用旧排版产生4条格式警告，改为span与独立switch后无新增警告。

format/format:check、Lint（0错误/既有228警告）、typecheck、build、modules:check、docs:check、diff检查通过，归档CI为NOT_DUE。最终JS545.89kB/gzip196.83kB，保留既有体积提示。未运行前端自动化，也未重复未修改的治理脚本测试；界面/刷新恢复/预览复制与冲突锁定待人工验收。计划和记录保持pending_human_acceptance，关联提交由Git历史定位，提交后核验真实GPT-6 trailer，不推送。
