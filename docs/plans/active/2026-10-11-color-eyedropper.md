---
title: 共用调色弹窗屏幕取色器
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 共用调色弹窗屏幕取色器

维护者授权所有颜色调整弹窗在HEX输入之外增加取色器。依据[排版模块](../../design/modules/typesetting.md)、[UI设计](../../design/jlab-wechat-editor-ui.md)与[存储设计](../../design/jlab-wechat-editor-storage.md)，修改公共颜色控件覆盖正文色、局部字色和配色角色。

采用Element Plus公开的ColorPickerPanel footer插槽与Popover组合，浏览器EyeDropper由用户按钮点击启动。面板保留HEX、色板、常用/最近色；草稿颜色只驻内存，确定时走原change通道及最近色记录，取消不应用。取色成功填入草稿，Esc取消取色保留之前草稿。运行时检测安全上下文和API，不支持时按钮禁用并说明原因；非取消错误在面板内反馈。面板关闭、禁用或卸载时中止待完成取色，拒绝过期结果。沿用弹层选择保护类，避免局部文字选区被面板点击清除。不增加依赖、跨模块接口或存储字段，无需ADR。

开始暂存区为空，无CodeGraph索引，归档NOT_DUE；pnpm-workspace.yaml既有人类内容保留且不提交。格式化仅针对本轮文件。

- [x] 核对公开组件接口、浏览器API和设计，准备计划/日志。
- [x] 实现共用面板取色、确认/取消与生命周期处理。
- [x] 完成格式、Lint、类型、构建、模块、文档、治理测试及归档CI检查。
- [ ] 人工验收所有入口、HEX/色板/最近色、屏幕取色/取消/失败/不支持、局部文字选区和关闭/禁用时取色。

实际修改公共控件与入口注册：Popover/Panel局部导入并显式引入popover样式，移除已不用的ColorPicker注册。无依赖或数据格式变化。前端未新增/运行自动化。format:check、Lint（0错误/221警告）、typecheck、build、modules:check、docs:check、21项治理测试、归档CI（NOT_DUE）及diff检查通过。最终JS536.43kB/gzip193.59kB，保留500kB体积提示。

屏幕取色、局部选区、组件切换后的交互与视觉为人工验收项，尚未验证。关联提交以本文件Git历史定位；提交后核验trailer、提交规范与归档CI，不推送。人工验收前保留活动计划。
