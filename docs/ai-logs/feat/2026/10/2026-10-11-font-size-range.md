---
title: 扩展文字设置字号范围
status: pending_human_acceptance
change_type: feat
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 扩展文字设置字号范围

维护者要求增加字号。当前事实是滑杆和配置校验14至18px，快捷14/15/16/17px。按已确认全站11px下限，选择11至32px、步长1px，常用11/12/14/16/18/20/24/28/32；保留默认/重置16px及已有合法小数记录。定义公共范围常量，UI/配置校验共享，预览/输出不新建规则。存储协议无变化，无新ADR/依赖/模块。

起始工作区/暂存为空、无CodeGraph、归档NOT_DUE。先同步设计/计划；静态检查和人工验收分别记录，不运行前端自动化。本轮完成后自动提交、不推送。

实际修改typesetting.model公共范围/快捷档、typesetting-panel滑杆和独立三列字号按钮、workspace.service配置上下界。既有step属性改为共享step、未叠加；快捷组原无wrap，新增仅限字号的wrap/三等分宽度以适配九项。其他快捷组、默认16px、重置/相对标题/预览导出规则不变。校验继续接受原合法小数值，无配置迁移。

format/format:check、Lint（0错误/228警告）、typecheck、build、modules:check、docs:check及diff检查通过，归档CI为NOT_DUE。最终JS545.04kB/gzip196.62kB，保留已有体积提示。只有前端变更，未运行前端自动化，治理脚本未改不重复其测试。人工验收计划pending_human_acceptance，关联提交以Git历史定位，真实GPT-6 trailer提交后核验，不推送。
