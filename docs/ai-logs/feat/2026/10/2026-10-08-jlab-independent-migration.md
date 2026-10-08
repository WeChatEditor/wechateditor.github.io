---
title: 桀士排版独立迁移
status: pending_human_acceptance
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
change_type: feat
---

# 桀士排版独立迁移

## 目标与约束

用户授权在已创建的JLabWeChatEditor接续迁移，并迁入相关设计和决策；完整保留功能/UI，CoAIForge0.2.0工具链，空原稿、保留默认设置，不搬旧数据，不新增前端自动化。目标Git/工作区已核验，来源2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4。

## 执行与假设

目标台账缺失正常初始化，不绕过bootstrap；验证初始模板后以b86bf90444a12ae7560eecc2ae03f7b65a6b3ff0建立真实基线。源产品代码复制适配到src/modules，原设计细节和研究保留来源说明，ADR保留原确认日期；目标当前规范与历史源证据分离。模板生成内容已提交，用户当前迁移授权覆盖替换示例。

## 验证与未决

初始模板检查通过，20项治理测试通过；框架/业务peer元数据由官方registry核对。最终迁移验证、提交、偏差在执行后补齐。功能人工验收、正式域名/发布尚未执行；不推断为通过。

## 实际交付、验证和偏差

2026-10-08 Windows，Node24.19.0/pnpm11.22.0：冻结且严格peer安装、format/format:check、Lint、TypeScript、生产构建、模块和文档检查通过；21项治理测试通过，其中新增CSS边界回归。Lint零error，保留222条格式和受控v-html提示；生产JS524.41kB（gzip188.37kB），保留500kB chunk警告，不修改阈值掩盖。

六模块25个文件与固定来源逐文件核对，除空原稿初始化和等价全角空格HTML实体外，无意外内容差异。静态HTTP验证根路径/子路径各HTML200及2个相对assets可取，未启动浏览器，不等于UI验收。目标实际Vue3.5.43、Pinia2.3.1、Element Plus2.14.7、Markdown-it15.0.2、DOMPurify3.4.16、Vite8.3.3、TypeScript6.0.3、vue-tsc3.3.12；Element Plus按兼容范围解析到2.14.7。

初次安装拒绝vue-demi postinstall，读取脚本后仅显式批准该依赖自身Vue适配生成；清除pnpm本次自动生成的批准占位。CSS检查器保留私有/公共边界并新增治理测试。Lint补齐实际浏览器globals，全角空格使用等价实体，不关闭语义检查。

仅Windows本地实际执行；Windows/Linux CI矩阵保留并严格peer安装，未推送，因此远端CI未执行。桌面UI、存储交互、公众号复制/保存/明暗等维护者人工验收待执行，域名与正式发布待定。

本会话真实模型名GPT-6用于提交trailer；提交后读取git log核验。目标技术提交、归档基线按真实提交协议接续，人工验收未完成，日志与计划不提前归档。
