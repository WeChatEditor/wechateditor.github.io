---
title: 网站与插件SEO实施
status: pending_human_acceptance
created: 2026-10-16
updated: 2026-10-16
owner: project maintainers
---

# 网站与插件SEO实施

## 授权、门禁与依据

维护者要求按前述建议优化整个项目SEO。开始时工作区和暂存区为空，无.codegraph；归档审计NOT_DUE，真实HEAD a7ad076dd935048a137743434e06b6ba10883ac5。遵循[搜索发现设计](../../design/search-discovery.md)及[静态页面决策](../../decisions/ADR-20261016-static-discovery-pages.md)。

## 步骤和退出条件

- [x] 读取文档、核对Git和归档门禁，准备设计、ADR、计划及日志。
- [x] 完成根页元信息、静态说明页、共用视觉样式、robots/sitemap/404及工作台链接。
- [x] 更新插件摘要/官网及版本，准备真实商店文案和搜索平台操作指南。
- [x] 更新现行产品、部署和验证说明，完成工程检查、构建静态核对及插件打包；按仓库规则本地提交。
- [ ] 维护者验收公开页面在桌面/手机的阅读、工作台链接、既有编辑器及插件行为。
- [ ] 维护者在实际部署后验证站点所有权、提交站点地图，并核对商店公开发布与搜索数据。

## 实际验证与遗留

根编辑器保留，新增/about/、/guides/markdown-to-wechat/、/extension/、/privacy/及共享CSS、robots、sitemap和noindex 404。五个可索引入口都有独立元信息、规范网址和JSON-LD，四个说明页没有应用脚本；工作台状态栏新增可聚焦的普通链接，保持35px并允许横向滚动。插件0.1.12只改摘要和homepage_url，ID、权限、协议与传稿行为不变。同步产品、部署、验证、安装和README；准备商店文案与搜索账号验证步骤。未新增依赖、业务模块、追踪或存储迁移。

2026-10-16 Windows Node24.18.0/pnpm11.13.1：format/format:check、Lint（0 error、239 warning）、typecheck、build、modules:check、docs:check、commits:check与diff检查通过，归档CI为NOT_DUE。治理测试22/22、共享契约12/12通过；插件production打包、extension:check及development构建通过，ZIP为apps/extension/dist/jlab-wechat-transfer-0.1.12.zip（480248字节）。

生产构建根HTML4.62kB，JS798.02kB/gzip263.52kB，CSS108.20kB/gzip17.25kB，保留500kB体积提示。一次性只读产物检查解析6份HTML及JSON-LD，核对5个站点地图入口、102处站内资源/锚点、唯一主标题与规范网址，全部通过；XML解析确认站点地图结构有效。没有加载或执行前端模块、创建前端测试或运行浏览器自动化。页面视觉、键盘与公众号行为待维护者验收。

本地preview为http://127.0.0.1:4175/about/，供维护者阅读验收；根页、四个说明页、CSS、robots与sitemap共8个HTTP请求均200，仅读取响应，不执行页面脚本。Codex预览打开请求已排队，未声明视觉验收完成。未知路径生产404需实际部署后核对。

搜索平台及商店后台没有当前账号会话或验证值，交付指南与待填文案，不声称已提交、已收录或已公开。未请求推送，本轮保留本地交付。关联提交标题feat(seo): improve website and extension discoverability，实际SHA通过本文件Git历史定位并在提交后核验trailer。计划及日志保持pending_human_acceptance，验收前不归档。
