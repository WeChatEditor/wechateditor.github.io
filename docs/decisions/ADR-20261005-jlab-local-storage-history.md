---
title: 桀士排版配置即时保存与主动文章版本
status: accepted
created: 2026-10-05
updated: 2026-10-08
owner: project maintainers
---

# 桀士排版配置即时保存与主动文章版本

原决策在Cyber-Sight确认于2026-10-05，本次迁入独立工程；[固定来源](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/decisions/ADR-20261005-jlab-local-storage-history.md)。以下过去日期、提交与验收状态仅指来源，目标技术/人工证据见[迁移计划](../plans/active/2026-10-08-jlab-independent-migration.md)。当前交付位置为本仓库apps/frontend，治理不再继承来源所有权；原纯前端、桌面与存储语义继续有效，历史界面尺寸以[当前UI设计](../design/jlab-wechat-editor-ui.md)为准。

维护者明确要求配置与固定结尾修改实时保存到 localStorage，不保留历史；文章 Markdown 在 IndexedDB 默认保存 current，用户主动新增版本才按时间戳保存新版。

采用唯一 localStorage 配置记录和 IndexedDB current/versions 分离。版本只保存正文、标注和正文必要旧素材，不保存排版或固定结尾。恢复只替换 current，继续使用当前配置；不自动增加历史。选择毫秒时间戳，在同毫秒或时钟回退时递增，避免覆盖版本。

旧完整 IndexedDB 草稿兼容迁移，已有 localStorage 配置优先。两种存储没有跨库原子事务；迁移先保证配置写入成功，再替换 current。未知格式/损坏数据暂停对应写入并保留原记录；多页面文章写入使用事务内 writeId 校验，配置通过 storage 事件提示暂停。

此决策替代原有完整草稿将配置、结尾和偏好一并存入 IndexedDB 的存储安排。独立纯前端边界继续遵守[原 ADR](ADR-20261004-jlab-wechat-editor-standalone-app.md)。浏览器清理、权限与配额仍可能丢失或阻止保存；需要云同步或配置历史时重新评审。人工验收和失败流程见[现行存储设计](../reference/source-designs/jlab-wechat-editor-storage.md)。
