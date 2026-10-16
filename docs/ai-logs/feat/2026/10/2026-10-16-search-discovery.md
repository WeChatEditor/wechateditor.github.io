---
title: 网站与插件SEO实施
status: pending_human_acceptance
change_type: feat
created: 2026-10-16
updated: 2026-10-16
owner: project maintainers
---

# 网站与插件SEO实施

## 目标、指令与假设

维护者要求落实已推荐的全项目SEO优化。开始时Git工作区和暂存区为空；归档NOT_DUE。保留编辑器根入口、品牌、本地存储、插件ID/权限及人工保存边界。未授权前端自动化，按仓库规则执行工程检查并自动提交；不推送或操作外部商店/搜索账号。

## 选择和实际改动

先准备[设计](../../../../design/search-discovery.md)、ADR和[计划](../../../../plans/active/2026-10-16-search-discovery.md)。选择独立静态HTML说明资产，避免引入路由和服务端；工作台普通链接让公开内容可发现，单独的新标签不接触草稿或触发编辑冲突。插件摘要与官网用于准确表达文字排版传稿用途，不扩大发布承诺。

## 验证、偏差、未决与提交

实际交付根页搜索标题/摘要、canonical/OG/Twitter/JSON-LD、加载说明，以及四个不依赖应用脚本的公开HTML页面、统一响应式样式、robots/sitemap和noindex 404。工作台保留编辑器入口，底部新增四个静态说明链接。插件升至0.1.12，更新场景摘要和homepage_url，打包校验增加名称、官网与摘要长度约束；ID、权限、协议和插入流程不改。README、现行设计、安装/部署/验证文档、商店文案和收录指南同步。静态说明资产不引入业务模块、依赖、路由或草稿读写。

2026-10-16 Windows Node24.18.0/pnpm11.13.1：format/format:check通过；Lint 0 error/239 warning，类型、构建、模块、文档、提交规范和diff通过，docs:archive:check:ci为NOT_DUE。治理22/22、契约12/12通过；production插件ZIP、extension:check和development构建通过，稳定ID仍imiclghaaoleoggfhfdbanmaehamnpmg。前端JS798.02kB/gzip263.52kB、CSS108.20kB/gzip17.25kB，保留原有500kB体积提示。

一次性静态检查使用HTML解析器读取6份构建HTML及JSON-LD，核对5个可索引入口、102处站内资源与锚点、逐页标题/摘要/canonical/OG、无虚构评价和404 noindex；四个说明页无应用脚本。XML解析检查站点地图通过。仅解析磁盘产物，不导入前端代码或运行浏览器；符合仓库前端人类验收边界。

为维护者启动http://127.0.0.1:4175/about/本地预览，根页、四个说明页及CSS/robots/sitemap共8个HTTP200；只读取响应。Codex打开预览请求为queued，不作为页面视觉或交互验收证据。

搜索平台所有权验证、公开商店地址和真实截图尚无当前会话或素材，提供可操作指南与准确文案，未编造验证值或上架结果。页面布局、键盘体验和既有公众号流程待人工验收；计划和日志保持pending_human_acceptance。关联本地提交feat(seo): improve website and extension discoverability，通过本文件Git历史查询实际SHA，提交后核验模型trailer。不推送或声称远端发布。
