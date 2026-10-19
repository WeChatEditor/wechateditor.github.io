---
title: Markdown 封面与总结卡片
status: pending_human_acceptance
change_type: feat
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# Markdown 封面与总结卡片

目标与指令：维护者在确认调研建议后要求完成简化卡片，并置于默认文章前面。采用 Callout 标记，保留现有草稿和完整多语言教程。

事实与选择：暂存区为空，只有 sources/ 未跟踪，归档 NOT_DUE。线上调研确认 md2wechat 以 markdown-it 自定义规则生成内联 HTML；本次独立实现两类语义，不复制其字段式协议或引入 API。article 负责 token 语义和映射，typesetting 负责主题和样式，workspace 只校验已有配置扩展。

先行记录：已准备[设计](../../../../design/markdown-cards.md)、ADR 和[计划](../../../../plans/active/2026-10-19-markdown-cards.md)。后续记录真实改动、验证与未决；前端测试和浏览器自动化不在本轮授权内。

实际改动：新增article私有token转换，支持顶层hero和summary以及普通引用回退，内部Markdown/源行/局部标注同源。typesetting内联样式和符号/品牌设置复用当前配色，卡片不影响章节编号，品牌默认空。原稿工具栏插入/选区转换沿用IME/撤销/长度保护，保留正文缩进。历史列表调用articleTitle显示封面H1，旧版本不改写；预览/复制/插件仍走原输出链和原白名单。默认文章最前增加两张卡片、写法与入口说明，原有教程尾部经AST静态比较完整保留，导出可导入示例9839字符/600行。

实际验证：format/format:check、Lint（0 error/244 warning）、typecheck、build、modules:check、docs:check、治理22/22和共享契约12/12、diff与归档CI通过；产物约812.17kB/gzip268.71kB，仍有既有体积提示。首次typecheck发现markdown-it默认导出须用InstanceType作实例类型，已修正。检查只执行工程、治理和共享契约，不运行产品前端自动化。品牌/配色/撤销/缩放/选区/同步、旧配置及公众号复制保存保留人工清单。

偏差与隔离：品牌默认空，避免文章自动加入产品落款；通过标题样式抽屉填写。已有草稿（包括空稿）不替换，提供可导入示例供主动查看。另有会话修改静态介绍/隐私文案，保留并排除其文件及sources/；最终按本次文件和索引条目提交。人类验收未完成，计划与本日志保持pending_human_acceptance。关联提交feat(article): add Markdown cover and summary cards，模型经本会话turn_context核验为gpt-6.1-sol，提交后核验实际trailer；未推送/部署。
