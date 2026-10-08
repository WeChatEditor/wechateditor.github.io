---
title: 单项目文档治理与归档审计
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 单项目文档治理与归档审计

## 生命周期

design 描述现行实现，decisions 保存有效长期决策，plans/active 保存未完成实施，ai-logs 按类型/年/月组织。任务结束更新最终事实、验证、偏差与遗留，计划和日志标记 completed 后移动到 archive 对应目录。尚待人类前端验收的计划使用 pending_human_acceptance，保留验收清单，不把静态检查当成功能验收。被取代设计和 ADR 归档并在索引注明原因和现行替代。

frontmatter 包含 title/status/created/updated/owner 等适用字段；AI 日志有 change_type，复核计划有 type: documentation-archive-review。无目录所有权或上下游字段。ADR 命名 ADR-YYYYMMDD-<topic>.md。链接和日期在移动后重新检查。公共模板是唯一维护来源。

## 审计状态

策略位于 docs/archive/archive-policy.json，台账位于 archive-ledger.json。默认阈值：20 个有效提交、3 个新接受 ADR、3 个完成计划、30 天。有效提交排除仅有历史日志、计划、台账和索引的记录；现行代码和设计变化仍计算。显式即时触发证据登记 archive-triggers.json；模块边界变更和既有 ADR 被替代亦触发复核。

NOT_DUE 无需复核；DUE 需创建复核计划；IN_PROGRESS 表示已有活动复核但尚未完成，CI 仍失败；BLOCKED 表示损坏配置、无效基线、结构或链接冲突等，保留证据并先修复。审计不自动移动文件，也不自动推进台账。

## 无 Git 与首基线

无 Git、无首提交或未登记真实基线时输出 INITIALIZATION_REQUIRED，正常 CI 不放行。`pnpm docs:archive:check:bootstrap` 仅执行结构检查并明确输出生命周期；有提交却未登记基线不能借 bootstrap 绕过。先在无首提交状态完成所有适用工程与结构验证，创建真实首提交，然后 `pnpm docs:archive:init -- --baseline <真实 SHA>`，保存台账再提交。初始化拒绝虚构 SHA、非祖先、脏工作树和已存在基线；不能用 HEAD 字面量写入台账。

正常复核需先根据代码、契约、测试和 Git 历史更新当前设计/ADR，完成计划并归档，再对真实已提交的复核内容使用 `pnpm docs:archive:complete -- --baseline <真实 SHA>`。未提交工作不得被写成已复核。基线只记录审查过的真实祖先提交，不包含未来或未提交内容；后续保存台账的提交正常计数。

## 收尾门禁

任务前 pnpm docs:archive:check，最终 pnpm docs:archive:check:ci。损坏配置、过期、未完成复核或未建基线必须失败。bootstrap 不用于已有历史的 CI。阈值外置且可调整；测试验证各状态和边界。
