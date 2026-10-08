---
title: Node 22+ 与 pnpm 10 工具链兼容调整
status: completed
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 工具链兼容调整

维护者因Vercel默认pnpm10安装失败，要求pnpm >=10.26.0，并最终选择Node22+。根engines使用Node >=22.13.0，以满足现有ESLint等依赖要求；.node-version推荐22，CI为Node22.13.0/pnpm10.26.0与Node22/pnpm10。起始工作区/暂存区为空，归档审计NOT_DUE。

同步[开发流程](../../design/developer-workflow.md)、[依赖策略](../../design/dependency-lifecycle.md)、README和依赖说明。onlyBuiltDependencies保持仅批准esbuild/vue-demi，兼容pnpm10/11。保留应用依赖与锁文件。

Windows Node24.19.0/pnpm10.32.1冻结严格peer安装通过；格式、Lint、类型、生产构建、模块/文档检查及21项治理测试通过，归档CI为NOT_DUE。Lint原有222条warning、零error；生产JS525.40kB，保留500kB警告。Node22.13.0/pnpm10.26.0下界组合由CI配置覆盖，本地未实测该精确组合；远端CI与Vercel未执行。产品功能未变，不执行前端自动化。

本轮提交通过文件Git历史定位，创建后核验模型trailer。不推送或部署。计划和日志归档。
