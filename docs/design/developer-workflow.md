---
title: 开发与启动流程
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 开发与启动流程

本项目独立前端，Node >=22.13.0（推荐22），pnpm >=10.26.0。冻结严格peer安装：pnpm install --frozen-lockfile --strict-peer-dependencies。pnpm prepare安装本地hooks。

pnpm dev:frontend启动127.0.0.1:5175 strictPort；生产构建pnpm build，预览pnpm --filter @jlab-wechat-editor/frontend preview使用4175。没有backend、health代理或API契约命令。静态部署见[指南](../guides/static-deployment.md)。

pnpm format/format:check、lint、typecheck、modules:check、docs:check、build、test执行目标工程检查与治理测试；产品功能人工验收。pnpm update -r更新兼容依赖并重验锁，跨大版本审查peer。vue-demi postinstall仅显式批准自身Vue适配文件生成，onlyBuiltDependencies仅允许esbuild与vue-demi，兼容pnpm10/11。

日常任务前归档审计、设计/计划/日志先行，真实基线遵守[治理](documentation-governance.md)，不以bootstrap绕过已存在历史。
