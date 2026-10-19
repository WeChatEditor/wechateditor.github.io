---
title: Markdown 封面与总结卡片
status: pending_human_acceptance
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# Markdown 封面与总结卡片

依据[设计](../../design/markdown-cards.md)与[ADR](../../decisions/ADR-20261019-markdown-cards.md)，完成简化卡片语法并在默认文章最前展示；不覆盖已有草稿，不接入外部渲染服务。

- [x] 暂存区为空，无 CodeGraph；sources/ 为维护者未跟踪内容，保留且不提交。归档审计 NOT_DUE，HEAD 16ed27c73c18710a71693d46a08c470f0836b72f。
- [x] 读取文档、活动计划、现行解析/主题/存储/导出实现，先准备设计、ADR、计划与日志。
- [x] 实现顶层 Callout 识别、可见文字映射和源行、普通引用回退。
- [x] 实现主题卡片与品牌/符号配置、共享输出和原稿插入按钮。
- [x] 默认文章最前展示两类卡片和写法，保留完整后续教程、current 优先语义。
- [x] 完成适用工程检查，记录实际结果；交付提交及trailer在提交后核验。
- [ ] 人类验收卡片视觉、编辑/撤销/配置恢复、局部标注/同步、公众号粘贴保存。

人类验收未完成时保持 pending_human_acceptance，不标记 completed 或归档。代码检查不运行前端自动化。

## 实施结果与验证

使用block后/inline前的token转换，保留普通Markdown和可见字色位置。卡片内标题不参与章节级别和编号；hero支持可选眉题、首个H1及正文，summary直接列表项目生成主题白底行，有序号或装饰对勾不重复应用到子列表。类型大小写兼容，未知/不完整/嵌套类型保持原文引用，代码内标记不转换。

刊头符号和品牌落款位于标题样式抽屉底部，缺失旧配置补spark/空字符串；品牌文本安全插入、留空隐藏，错误字段拒绝读写。插入模板或转换完整选中行，保留正文缩进，沿用原生撤销与禁用流程。历史列表经article公共服务提取可见标题，存储协议不变。

默认文章9839字符/600行；通过TypeScript AST读取字符串确认原有文章完整作为尾部保留，并提供本次输出目录中的可导入Markdown。当前草稿恢复代码未改，已有current（包括空正文）不会被示例更新覆盖。

Windows Node24.18.0/pnpm11.13.1：format及format:check、Lint（0 error/244 warning）、typecheck、build、modules:check、docs:check、治理22/22和共享契约12/12、diff及归档CI通过。前端产物约812.17kB/gzip268.71kB，保留既有500kB提示。初次类型检查发现markdown-it类型须使用InstanceType，修正后通过；没有执行前端单元/组件/E2E/浏览器测试或公众号验收。

本次工作期间另有静态页面/隐私说明工作，相关文件与sources/不纳入本次提交；格式化先排除其他工作文件，最终全仓format:check通过。关联提交标题feat(article): add Markdown cover and summary cards，实际SHA通过本计划Git历史定位；模型标识从本会话turn_context核验为gpt-6.1-sol。不推送或部署。
