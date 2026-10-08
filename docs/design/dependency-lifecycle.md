---
title: 运行时与依赖升级策略
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 运行时与依赖升级策略

本独立前端项目使用 Node >=22.13.0、pnpm >=10.26.0；.node-version 推荐22。维护者在 Vercel pnpm10 安装失败后要求降低 pnpm 下界，并确认使用 Node22+；Node22.13.0 下界满足当前 ESLint 等依赖约束。保留现有应用依赖和冻结锁文件，不新增 packageManager 自动切换版本。

CI 在 Windows/Linux 显式检查 Node22.13.0/pnpm10.26.0 下界及 Node22/pnpm10 组合。未来 pnpm 大版本虽允许安装，仍需实际兼容验证，声明范围不等于已测试所有版本。

依赖使用兼容范围，锁文件记录精确图。日常安装执行 pnpm install --frozen-lockfile --strict-peer-dependencies；更新执行 pnpm update -r 后重新验证，跨大版本单独审查。pnpm-workspace.yaml 维护 engineStrict、savePrefix、minimumReleaseAge 和依赖构建批准。pnpm10/11共同支持的 onlyBuiltDependencies 只允许 esbuild 与 vue-demi，其他依赖不执行构建脚本。

类型、peer、engine、锁文件或构建冲突必须修复，不关闭检查。执行格式、Lint、类型、生产构建、模块、文档、治理测试和归档CI；前端功能仍由维护者人工验收。不涉及模板生成器、后端、契约或发布包验证。
