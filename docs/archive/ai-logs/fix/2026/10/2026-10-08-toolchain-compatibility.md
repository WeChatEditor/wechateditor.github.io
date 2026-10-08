---
title: 工具链兼容范围调整
status: completed
change_type: fix
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 工具链兼容范围调整

维护者先要求Node20/pnpm10，确认VueUse15要求Node>=22后改为Node22+。最终Node >=22.13.0、pnpm >=10.26.0，推荐22、CI同步；保留应用依赖和锁文件，批准设置改为pnpm10/11共同支持的onlyBuiltDependencies，仅允许esbuild/vue-demi。

起始工作区/暂存区为空、归档NOT_DUE，无CodeGraph索引。最初沙箱pnpm出现realpath EPERM，授权环境同命令成功；排队的Node20命令因最新授权改变被自动审批拒绝，未执行。使用Node24.19.0（满足22+）与pnpm10.32.1完成冻结严格peer安装。格式、Lint、类型、生产构建、模块/文档及21项治理测试通过，归档CI NOT_DUE；保留222条Lint warning、零error，以及原有500kB构建警告。

Node22.13.0/pnpm10.26.0精确下界组合本地未执行，远端CI及Vercel未执行。不运行前端自动化。关联[归档计划](../../../../plans/2026-10-08-toolchain-compatibility.md)与[现行设计](../../../../../design/dependency-lifecycle.md)。本轮提交通过文件Git历史定位，提交后核验真实模型trailer；不推送或部署。

提交身份从当前会话日志turn_context.model读取并确认：gpt-6.1-sol。此前GPT-6名称未获自动审批确认，提交命令未执行；本次使用会话实际名称。

维护者明确确认提交署名为gpt-6.1-sol，授权按该真实名称完成本地提交。
