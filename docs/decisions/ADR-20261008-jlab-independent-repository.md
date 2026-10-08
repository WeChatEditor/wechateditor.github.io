---
title: 桀士排版独立仓库与CoAIForge工具链
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 桀士排版独立仓库与CoAIForge工具链

## 背景和来源

维护者在来源确认独立迁移方案，并于2026-10-08创建目标、生成并提交前端模板后授权实施和文档迁入。[来源决策](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/decisions/ADR-20261008-jlab-independent-repository.md)。

## 决策

1. 仓库/目录JLabWeChatEditor，中文桀士排版、英文JLab WeChat Editor。
2. 完整保留功能/UI，CoAIForge0.2.0前端工具链和单项目协作治理，六模块位于src/modules。
3. 不迁旧浏览器数据；首开原稿为空，保留默认设置和现有本地持久化、主动历史能力。
4. 交付可静态部署产物，平台/域名未定；源应用保留，不自动双向同步、删除或生产切换。

## 影响与复审

工具链大版本变化需严格兼容验证，三份ADR、源产品设计及研究按性质迁入。跨origin新旧数据独立，没有自动合并/数据回滚。新增后台/云同步、旧数据搬迁、功能/UI扩充或源删除须重审；不改变Cyber-Sight下游身份。

关联[迁移设计](../design/jlab-wechat-editor-migration.md)、[产品](../design/jlab-wechat-editor.md)。
