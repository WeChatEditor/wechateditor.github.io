---
title: 验证策略与证据边界
status: accepted
created: 2026-10-08
updated: 2026-10-12
owner: project maintainers
---

# 验证策略与证据边界

本项目包含Web frontend、独立Chrome extension和共享wechat-transfer-contract。执行冻结严格peer安装、format/format:check、lint、typecheck、modules:check、docs:check、build、治理及共享契约test与docs:archive:check:ci/commits:check。22项治理检查覆盖合法/非法模块导入（含跨workspace同名）、文档、提交和归档生命周期，11项共享契约检查覆盖协议/HTML/来源/digest/尺寸/响应、popup正文权限与自动保存快照，不是产品前端自动化。插件另执行package:extension/extension:check检查ID/权限/本地打包输入与ZIP，开发包独立构建。

前端不新增或运行单元、组件、E2E或浏览器自动化，功能与公众号粘贴/保存/明暗由维护者人工验收。清单见[应用说明](../../apps/frontend/README.md)。初始模板、目标产品、Windows本地/远端Linux CI结果分别登记；未执行的不写通过。技术交付提交不等于人工验收完成。

Verify project 保留模板 Windows/Linux 兼容下界与推荐环境矩阵，只执行静态检查、构建和治理测试。另设[GitHub Pages 部署](github-pages-deployment.md)：master 推送或手动触发，独立工程门禁通过后发布静态产物。远端执行和人工功能验收分别记录。
