---
title: 公众号文章菜单名称识别修正
status: pending_human_acceptance
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# 公众号文章菜单名称识别修正

维护者确认0.1.9已能打开文章新标签；未插入正文的后续问题由只读检查定位为编辑页账号节点隐藏，见[0.1.10隐藏账号修正](2026-10-12-wechat-hidden-editor-account.md)。实际正文/排版/保存尚未验收。

## 目标、授权与设计依据

维护者确认草稿箱已能正确打开，但可见“文章”入口定位超时；随后主动提供创作下拉菜单HTML。菜单项li.weui-desktop-dropdown__list-ele同时含可见.weui-desktop-dropdown__list-ele__text和display:none的同名tooltip，当前controlsFor使用textContent得到“文章文章”并精确匹配失败。截图证明入口可见，所给HTML解释该结构为何不匹配；不据此声称完整新标签/正文流程已通过。

起点eca432e25039e97437d58cbd0d07d3448bd43f31，工作区和暂存为空；首次修改前暂存门禁通过、归档NOT_DUE，无.codegraph。已读文档入口、相关活动计划、[插件设计](../../design/wechat-transfer-extension.md)、[页面模块](../../design/modules/wechat-page.md)、[有效ADR](../../decisions/ADR-20261011-wechat-transfer-extension.md)、验证/治理设计、归档索引与最近插件模块复核。

## 实施步骤和退出条件

- [x] 先更新现行设计并准备计划/fix日志，登记人工提供的结构与匹配原因。
- [x] 下拉菜单项读取可见名称标签，通用候选读取渲染文字；保留aria-label、精确匹配、唯一入口及原节点点击。
- [x] 更新版本0.1.9及当前安装说明，构建生产/开发目录与ZIP。
- [x] 执行格式、Lint、类型、生产构建、模块/文档、治理/契约、包一致性、diff与归档CI检查。
- [ ] 人类复验新的创作后文章菜单、新标签、标题/正文排版与手动保存。

本次不新增前端/浏览器自动化；此前草稿箱本地样例11项结果不作为本次验证。工程完成后计划/日志保留pending_human_acceptance，按规则本地自动提交；关联提交由文件Git历史定位。

## 实际结果、偏差、遗留与提交

私有bridge对已登记的下拉项读取可见.weui-desktop-dropdown__list-ele__text；通用候选使用innerText，保留aria-label优先。所给结构中隐藏tooltip不再拼接名称，原li节点继续接收点击；嵌套链接去重、文章优先和旧图文名称兼容、唯一可见入口和新标签证据保持。插件版本0.1.9，生产/开发目录和ZIP已生成，当前设计/模块/指南和相关旧计划同步。

实际验证：冻结严格peer安装、pnpm format/format:check、Lint零错误（239个现行Vue警告）、全部workspace类型检查、Web/插件生产构建、0.1.9生产ZIP/开发包、模块/文档检查、22项治理和12项共享契约测试、安装包ID/权限/来源及ZIP与production一致、diff和归档CI NOT_DUE通过。Web现行大chunk提示保留。过程证据保存在ignored的.generated/wechat-article-label；没有改依赖/锁文件或模块边界。

偏差/遗留：本轮未创建或运行前端/浏览器自动化，未访问公众号页面。人工HTML解释本次名称匹配失败，不证明平台实际点击、新标签、JSAPI、正文排版或手动保存；需维护者重新加载0.1.9并刷新Web/公众号后复验。计划/日志保持pending_human_acceptance；仅本地提交/打包，关联提交由本文件Git历史定位。
