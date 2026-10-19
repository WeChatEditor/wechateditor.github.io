---
title: 代码随主题配色与暖纸工作台
status: pending_human_acceptance
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 代码随主题配色与暖纸工作台

## 目标与依据

维护者指出代码块没有跟随配色，要求设计修复；喜欢本次palette-atlas.png的暖灰背景及About页底色，授权重设计网站背景和右侧预览画板。依据[排版模块](../../design/modules/typesetting.md)、[工作台UI](../../design/jlab-wechat-editor-ui.md)、[article模块](../../design/modules/article.md)与现行存储ADR。

## 步骤与退出条件

- [x] 工作树仅有维护者未跟踪sources/截图，暂存区为空；无.codegraph，归档审计NOT_DUE。
- [x] 阅读当前设计、活动计划、实际排版服务与主题样式；确认pre、行内代码和终端圆点使用固定色，About底色#f6f5f1、设计板#f7f5f1。
- [x] 先记录设计、本计划与AI日志；保持五角色配色、配置协议、解析及模块依赖不变。
- [x] 代码块/行内代码随当前主题变化，边框与终端装饰同源，低对比度自定义配色使用可读前景。
- [x] 工作台采用暖灰/柔白/深一级画板层次，统一抽屉、控件、编辑区与手机/电脑外壳背景，保留布局与蓝色交互主色。
- [x] 完成format/format:check、Lint、类型、构建、模块/文档、治理/契约测试、diff、归档CI；交付提交与trailer在提交后核验。
- [ ] 人工验收18套与自定义代码配色、长代码/行内代码、引用底色关闭、复制/插件/公众号效果，以及工作台/双预览/抽屉的视觉与可读性。

## 边界与结果

不操作sources/截图，不覆盖文章、旧配置或配色，不增加语法高亮、存储字段、依赖或后端。应用暖纸背景只属于UI外壳；代码色由公共styleArticle生成内联样式，预览/剪贴板/插件文字快照同源。产品前端自动化仍不执行，视觉与公众号效果由人类验收。

代码主题在typesetting公共服务中统一生成：背景background、可读正文/强调前景、22%强调混合边框、2px强调顶边和主题三圆点；PRE内CODE显式继承样式，标题代码沿用标题色。引用底色开关只控制引用。原18套配色数据与24套限制保持。

工作台新增paper/canvas/chrome三个tokens并修改既有背景/边框/文字/阴影；编辑区与手机/电脑纸面为#fffdf8，画板为#f7f5f1到#ebe7df轻渐变，抽屉/控件/工具条统一暖灰。辅助文字最终采用#5e6966，避免在较深画板上对比度不足。布局/滚动/缩放和存储协议未改。[设计示意](../../reference/warm-workspace-study.svg)与本次输出PNG按现行字面量绘制、目视检查并修复设计图字体回退；不作为运行截图或功能证据。

2026-10-19 Windows Node24.18.0/pnpm11.13.1：format/format:check、Lint（0 error/243个现有warning）、typecheck、build、modules:check、docs:check、治理22/22、共享契约12/12、diff及归档CI（NOT_DUE）通过。JS803.51kB/gzip265.81kB，保留既有500kB提示。纯静态读取18套颜色计算代码前景/浅底最低约4.67，辅助文字对各UI底色最低约4.62；构建CSS包含全部暖纸tokens，默认配色数据与HEAD保持一致。未加载前端模块进行测试，未执行产品前端自动化、公众号或页面视觉验收。

人工清单未完成，计划/日志保持pending_human_acceptance；sources/截图不纳入提交。关联提交fix(typesetting): theme code and warm workspace，通过本文件Git历史定位；提交后核验真实模型trailer。不推送或部署。
