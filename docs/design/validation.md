---
title: 验证策略与证据边界
status: accepted
created: 2026-10-08
updated: 2026-10-16
owner: project maintainers
---

# 验证策略与证据边界

2026-10-16公开静态说明页仅进行构建产物的文本/HTML结构检查：元信息、JSON-LD、站点地图、本地链接和资源存在性，不运行页面脚本、前端测试或浏览器自动化。插件打包检查增加品牌名、homepage_url及摘要132字符上限。页面视觉、导航体验、实际部署、搜索平台收录及商店状态分别记录，见[收录指南](../guides/search-discovery.md)。

本项目包含Web frontend、独立Chrome extension和共享wechat-transfer-contract。执行冻结严格peer安装、format/format:check、lint、typecheck、modules:check、docs:check、build、治理及共享契约test与docs:archive:check:ci/commits:check。22项治理检查覆盖合法/非法模块导入（含跨workspace同名）、文档、提交和归档生命周期，11项共享契约检查覆盖协议/HTML/来源/digest/尺寸/响应、popup正文权限与自动保存快照，不是产品前端自动化。插件另执行package:extension/extension:check检查ID/权限/本地打包输入与ZIP，开发包独立构建。

前端不新增或运行单元、组件、E2E或浏览器自动化，功能与公众号粘贴/保存/明暗由维护者人工验收。清单见[应用说明](../../apps/frontend/README.md)。初始模板、目标产品、Windows本地/远端Linux CI结果分别登记；未执行的不写通过。技术交付提交不等于人工验收完成。

2026-10-12维护者针对草稿箱失败明确授权本机Chrome调试，本轮例外仅限该导航问题。公众号站点被浏览器工具安全策略拒绝后不绕过；使用维护者主动提供的脱敏菜单结构，在本地Chrome真实DOM中运行11项样例检查。测试副本的来源/HTTPS断言仅适配回环HTTP，生产源文件不改门禁；它证明菜单匹配、展开请求与等待/阻断分支，不证明公众号登录、实际Vue菜单展开或完整文章写入。未扩大为其他前端自动化授权，见[菜单计划](../plans/active/2026-10-12-wechat-draft-menu.md)。

Verify project 保留模板 Windows/Linux 兼容下界与推荐环境矩阵，只执行静态检查、构建和治理测试。另设[GitHub Pages 部署](github-pages-deployment.md)：master 推送或手动触发，独立工程门禁通过后发布静态产物。远端执行和人工功能验收分别记录。
