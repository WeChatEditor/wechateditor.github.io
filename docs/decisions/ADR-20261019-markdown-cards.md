---
title: 以 Callout 承载 Markdown 视觉卡片
status: accepted
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 以 Callout 承载 Markdown 视觉卡片

## 背景与决定

维护者喜欢 md2wechat 的刊头和总结清单，认为字段式 `:::` 语法过于复杂，在调研后授权实现并置于默认文章前面。采用 `> [!hero]` 和 `> [!summary]`，内部保留普通 Markdown，视觉由现有排版服务生成。它们是本产品扩展类型，并非 CommonMark 或 GitHub 原生卡片类型。

不从普通标题、引用、列表自动猜卡片，也不引入 md2wechat API、YAML 字段正文、外部组件渲染器或原始 HTML。未知/结构不完整的卡片退回普通引用，避免隐藏内容；卡片样式沿用当前配色，品牌和刊头符号进入现有本地排版配置。文章版本只保存原稿与标注，配置不进入历史。

## 后果和复审

作者只需一种块边界和 Markdown 内容；支持的编辑器可呈现卡片，其他解析器仍保留引用文字。代价是卡片视觉不跨编辑器通用；字段结构、跨平台导出或新卡片类型应另评审。前端静态检查不能替代公众号人工验收。

当前边界与语法详见[设计](../design/markdown-cards.md)。
