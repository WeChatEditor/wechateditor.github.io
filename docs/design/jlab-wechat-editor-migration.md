---
title: 桀士排版独立仓库迁移
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 桀士排版独立仓库迁移

维护者已授权接续迁移，并要求一并迁入Cyber-Sight相关设计和决策。目标为当前JLabWeChatEditor仓库，origin为https://github.com/tanghaojie/JLabWeChatEditor.git，默认分支master。人类已提交CoAIForge前端模板，版本/CLI均为0.2.0，模板来源d07a9fcac33cbc1d40e57ab2c9de46cfaa8c80f9；初始提交b86bf90444a12ae7560eecc2ae03f7b65a6b3ff0。

## 范围与目标结构

完整保留当前产品功能/UI，六模块进入apps/frontend/src/modules；app.config.ts为登记的组装配置，App/main只组装。替换模板introduction示例。采用模板Vue/Vite/TypeScript工具链，迁入实际业务依赖，逐项严格peer/类型/构建验证。无后台、契约、Router或Forge同步关系。

首次无本地草稿时加载原版示例稿“把想法，排成好文章”，默认配色/排版和结尾启停规则保留；历史/标注/素材/最近色为空。不搬旧数据，不清除源origin存储，开发/预览使用127.0.0.1:5175/4175 strictPort；生产平台/域名待定，仅交付相对base静态产物。

## 文档和来源

源代码与适用文档基线2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4。产品/UI/存储/模块设计重写为目标当前规范；三份相关ADR保留原决策日期及来源，并适配独立仓库事实；原站研究和公众号兼容研究作为参考，保留证据和研究性质。源设计快照保存到reference/source-designs以查证细节，历史日志/计划/ledger不继承。目标规则不含scope、上下游身份。

迁移记录见[来源清单](../reference/migration-provenance.md)，最终规则见[产品](jlab-wechat-editor.md)、[UI](jlab-wechat-editor-ui.md)、[存储](jlab-wechat-editor-storage.md)与[模块](modules/README.md)。

## 验证、失败与回滚

执行格式、Lint、TypeScript、模块、文档、构建、治理测试及归档/提交规范。前端功能和公众号效果仅人类验收，不新增或运行前端自动化。框架冲突不关闭检查，未知数据/存储异常保留现有失败规则。

本次不推送或部署，保留Cyber-Sight源应用；新旧origin数据独立，不自动双向同步或合并。人工验收未完成时计划和AI日志保留pending_human_acceptance；源交接只标技术迁移，不能写产品已验收。关联[实施计划](../plans/active/2026-10-08-jlab-independent-migration.md)。

## 工程兼容适配

Pinia2依赖vue-demi0.14.10。已读取postinstall/utils：仅按实际Vue版本复制自身lib中的适配文件，无下载或应用数据操作；在pnpm allowBuilds显式允许该包，其他策略保留。

workspace私有CSS通过相对import引入。目标模块检查器应将存在的.css文件纳入同一模块归属/公开文件/依赖方向检查，而不是误报为无法解析的代码；新增治理测试覆盖合法同模块样式、跨模块私有拒绝、公开允许及缺失路径拒绝。它是工具测试，不是前端自动化。

## 最终实现与技术边界

六模块与产品文档已迁入，模板introduction已移除，app.config与组装注册齐备；首次无本地草稿时使用原版示例稿，默认设置与原存储规则保留；已有草稿（包括空稿）优先恢复。正式部署与人类验收未完成。[技术验证](../reference/migration-validation.md)记录实际结果及遗留，不继承来源通过结论。
