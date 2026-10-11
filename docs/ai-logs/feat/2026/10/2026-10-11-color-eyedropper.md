---
title: 共用调色弹窗屏幕取色器
status: pending_human_acceptance
change_type: feat
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 共用调色弹窗屏幕取色器

用户要求全部颜色panel增加取色器。已读取入口、活动计划、相关排版/UI/存储/验证设计，检查已安装Element Plus公开类型及实现；现有ColorPicker不提供footer扩展，ColorPickerPanel提供。选择Popover与Panel组合避免操作组件私有DOM。参照[EyeDropper规范](https://wicg.github.io/eyedropper-api/)使用用户点击、安全上下文检测、sRGBHex与AbortSignal。记忆用于保留单焦点框、横排常用/最近色及局部颜色既有约束；当前源码为事实依据。

草稿颜色与已确认props分离，取色成功更新草稿，确定沿用原change/最近色，取消不写。API不支持时禁用按钮说明原因，AbortError静默，其他错误面板提示；关闭/禁用/卸载中止取色且拒绝晚到结果。原局部文字选择保护类保留。无新增依赖、存储字段或ADR。

开始暂存区为空、无CodeGraph，归档NOT_DUE。既有pnpm-workspace.yaml改动保留且排除提交，前端不运行自动化。

实际修改typesetting-color-picker.vue：Panel与Popover局部导入、popover样式显式加载、原色点触发器变为可键盘操作的button；HEX旁新增带图标的取色器，独立一行取消/确定；保留选区保护类、常用/最近色和单焦点框。移除main.ts不再使用的ColorPicker注册。面板切换未访问私有DOM或组件内部状态。

首次Lint发现Vue脚本中的AbortSignal/Window类型及DOMException未列入现有no-undef环境；改用AbortController的signal类型、typeof window与window.DOMException，未扩大全局规则。随后format:check、Lint（0错误/221警告）、typecheck、build、modules:check、docs:check、21项治理测试、归档CI（NOT_DUE）和diff检查通过。JS536.43kB/gzip193.59kB，保留原500kB体积提示。格式化直接限定本轮文件，既有workspace配置diff与开始一致。

仍需人工验收实际屏幕取色、取消/失败/不支持、关闭/禁用/卸载以及各入口的HEX确认、色板、最近色与局部文字选区。计划/日志保持pending_human_acceptance。准备独立提交本轮文件，真实模型GPT-6 trailer；关联提交以本文件Git历史定位，提交后核验提交规范与归档CI，不推送。
