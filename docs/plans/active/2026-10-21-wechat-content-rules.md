---
title: 微信官方内容规则同步与传稿样式修复
status: pending_human_acceptance
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 微信官方内容规则同步与传稿样式修复

后续职责变更见[删除插件格式校验](2026-10-21-extension-opaque-relay.md)：本计划记录0.1.14阶段的实现与验证，插件内校验和最低版本门槛已被纯转发/能力识别取代；官方规则与总结纯色等Web成果继续有效。

## 目标、授权与设计依据

维护者明确要求按官方plugin_spec核对并更新项目规则和校验，修复发送失败。依据[现行设计](../../design/wechat-content-rules.md)和[官方来源核对](../../reference/wechat-content-rules.md)。起点d3b5e217c7e00f77072820c65acbc77cab39143b；工作区/暂存为空，无.codegraph，首次修改前暂存门禁通过、归档NOT_DUE。

## 实施步骤和退出条件

- [x] 核对官方页面和权威规则版本，准备设计/计划/日志。
- [x] 契约先行：修正属性集合、具体错误与官方静态诊断，增加契约回归检查。
- [x] 预览/复制/发送共用规则；总结卡纯色、插件0.1.14与旧版更新提示。
- [x] 格式、Lint、类型、构建、治理/契约、打包、模块/文档及归档CI。
- [x] 完成新增依赖边界的同一归档复核；自动提交，核对真实trailer。
- [ ] 人类更新网页/插件后验证同步、发送、粘贴、保存重开及手机明暗阅读。

## 实际结果、偏差、遗留与提交

本轮不运行前端单元/组件/E2E/浏览器自动化，不发布网页/商店，不操作公众号保存。工程完成后仍保留pending_human_acceptance。

工程结果：共享契约22/22（新增9项含Chrome序列化样例）、治理22/22、类型、生产构建、Lint（0错误/251条既有Vue排版警告）、模块/文档及0.1.14生产/开发打包检查通过。媒体/未知CSS仍拒绝；建议不阻断，诊断面板合并预览与导出的同条提示。固定height百分比和普通行内height不伪判为确定零高度。最终格式与归档CI在收尾记录。

交付apps/extension/dist/jlab-wechat-transfer-0.1.14.zip及开发解包目录；另从生产ZIP仅移除manifest.key派生商店上传包jlab-wechat-transfer-store-0.1.14.zip，10项文件逐项读回一致，版本0.1.14。商店包489933字节，SHA256为93f5e104b08c29443ecd33c999694de66d488133e07f8a071cd8cb85ac4c9ff3。实际线上仍需部署网页并发布商店更新；不把本地包称为已审核发布。

功能与技术复核提交912150f39b99917349b1122fffeff1ae3221642f，git log -1 --format=full已核对实际AI trailer。在该真实清洁HEAD运行docs:archive:complete登记基线，随后docs:archive:check:ci为NOT_DUE；format/format:check、文档/模块与diff检查通过。台账和本完成记录另行提交，人工验收计划继续活动。
