---
title: 扩展默认新手示例稿
status: pending_human_acceptance
created: 2026-10-14
updated: 2026-10-14
owner: project maintainers
---

# 扩展默认新手示例稿

## 目标、授权与设计依据

维护者要求将默认“把想法，排成好文章”写长，并加入各种语言，方便新用户查看。保留标题，将正文扩成可编辑的入门示例，同时展示自然语言文字和常见编程、标记、配置及命令代码块。依据[产品设计](../../design/jlab-wechat-editor.md)、[存储设计](../../design/jlab-wechat-editor-storage.md)与[存储决策](../../decisions/ADR-20261005-jlab-local-storage-history.md)。本次不需要新增长期架构决策。

## 实施步骤和退出条件

- [x] 确认初始工作区和暂存区为空，无.codegraph目录，归档审计NOT_DUE；定向核对示例稿和已有current恢复分支。
- [x] 准备当前设计、本计划和AI记录，明确内容展示与实际功能验收的边界。
- [x] 扩展exampleMarkdown，覆盖常用Markdown、16种自然语言与30种代码块；校对现行操作名称。
- [x] 执行format/format:check、Lint、类型、生产构建、模块与文档检查、治理及契约测试、diff和归档CI，按仓库规则提交并核验trailer。
- [ ] 维护者确认首次无current显示新示例；已有正文和空正文仍优先恢复。
- [ ] 维护者检查手机/电脑长文阅读、标题/表格/列表/多语言/代码块，以及修改后自动保存和公众号复制效果。

## 实际结果、偏差、遗留与提交

代码修改限定app.config.ts的默认正文，标题保留，正文现为8736字符、534行，含16种自然语言与30种代码块。静态读取TypeScript字面量核对60行代码围栏和换行转义，不执行示例代码或前端测试。不改解析器、工作台恢复、持久化、配色或导出逻辑。语言标签仅用于示范Markdown围栏，不承诺语法高亮或可执行环境。示例不引用远程图片，不增加依赖。

2026-10-14 Windows Node24.18.0/pnpm11.13.1：format/format:check、Lint、typecheck、build、modules:check、docs:check、diff检查和归档CI全部通过（NOT_DUE）。治理测试22/22、共享契约测试12/12通过。Lint为0 error/239 warning，全部位于本次未改动的Vue文件；生产前端JS797.19kB/gzip263.15kB，构建保留500kB体积提示。前端首次显示、长文阅读与公众号效果仍由维护者验收，未新增或执行前端自动化，计划保持pending_human_acceptance。本任务提交通过文件Git历史定位，提交后核验末尾模型trailer；技术交付不代表人工验收或远端部署。
