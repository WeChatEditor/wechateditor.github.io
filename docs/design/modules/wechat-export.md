---
title: wechat-export模块
status: accepted
created: 2026-10-08
updated: 2026-10-12
owner: project maintainers
---

# wechat-export模块

copyRichText支持ExportResult或同一快照的Promise。用户点击内立即调用剪贴板write，ClipboardItem的HTML/纯文字Promise来自同次输出；异步图片准备及错误诊断完成后才解析Blob。两种格式保留一致内容，尺寸/图片错误拒绝整个复制，不静默降级。发送调用者在异步准备前后复核generation/冲突；插件只接收无图片文字输出。系统剪贴板失败与插件提交独立反馈，自动保存不调用此接口。

## 职责与边界

接受显式只读快照，构建受控HTML、内联样式、DOMPurify清洗及HTML/纯文字剪贴板输出。

公共preflightTextArticle/exportTextArticle使用相同articleDom和finishExport，正文及启用头尾含图片/媒体/CSS图片时整篇阻断；不调用prepareExportImages，不抓取图片。文字profile为wechat-editor-text@1-candidate；原剪贴板入口继续图片处理及原profile。

预览与导出共用articleDom，正文先排版编号，再prepend固定开头、append固定结尾；头尾单独应用排版且不编号，分别标记data-opening/data-ending以拒绝局部标注。HTML/纯文字都包含启用头尾，沿用图片处理和受控清洗。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/wechat-export。

## 公共接口与依赖

公共文件：`wechat-export.model.ts`、`wechat-export.service.ts`。跨模块仅导入这些文件，禁止barrel。允许依赖：article、typesetting、ending、assets；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。图片失败阻止复制，权限拒绝保留已准备结果供重试；改稿不复制过期快照。候选wechat-clipboard@0.1-candidate仍需公众号粘贴/保存/明暗人工验收。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
