---
title: 删除插件格式校验与升级耦合审计
status: pending_human_acceptance
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 删除插件格式校验与升级耦合审计

维护者要求插件不做格式校验，并检查其他影响后续更新的能力。依据[设计](../../design/extension-update-boundaries.md)和[ADR](../../decisions/ADR-20261021-extension-opaque-html-relay.md)。起点327a83fb6a3bc7efc90f7439d5c151c3111b099a，工作区/暂存为空、无.codegraph，首次修改门禁通过，归档NOT_DUE。

- [x] 核对接收/复制/页面读回、profile/标题与版本门槛，准备设计和记录。
- [x] 拆开Web内容入口与传输契约，删除插件内容校验，改能力握手。
- [x] 放宽profile/传输标题，去除页面标签计数与固定64兜底，保留操作保护。
- [x] 契约/治理、格式、Lint、类型、构建、包隔离与文档/模块检查。
- [x] 完成新增公共边界复核，真实基线、归档CI和自动提交。
- [ ] 人类更新后验收同步、复制、插入、保护及手动保存；不运行前端自动化。

插件工程版本0.1.15，本轮不推送、部署或上架。当前0.1.13/0.1.14仍有旧校验，需一次更新，不能声称已安装旧插件无需升级。

实际验证：契约25/25、治理22/22、typecheck、生产build、Lint（0错误/251条现行Vue排版警告）、模块/文档和git diff检查通过。生产/开发构建、ZIP一致性及6个bundle的输入隔离通过，不含内容规则、parse5/entities；Web内容检查回归仍通过。冻结严格peer离线安装仅刷新workspace状态，没有新依赖。最终format:check及归档CI在提交收尾再次执行。

交付production/development目录、jlab-wechat-transfer-0.1.15.zip和移除manifest.key的商店包jlab-wechat-transfer-store-0.1.15.zip。商店包348926字节、10项文件读回一致，SHA256为afe12d8d6d538ffee64387393a732acb60142d3621615934050ed6b3a35c36c3。升级耦合审计矩阵见设计：微信页面/接口、传输/存储协议、域名/ID/权限及原生能力仍可能触发插件发布；普通Web排版变化不再触发。

完成记录：实现/技术复核提交ece16d85e16a481ca2234bfd128d443cce35e990，git log -1 --format=full核对AI trailer。在真实清洁HEAD上登记同一复核基线，归档CI为NOT_DUE；format/format:check、文档/模块和diff检查通过，提交规范范围检查通过。台账与完成记录另作docs提交，功能验收保持活动。
