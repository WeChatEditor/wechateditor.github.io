---
title: 以独立静态说明页承接网站与插件搜索
status: accepted
created: 2026-10-16
updated: 2026-10-16
owner: project maintainers
---

# 以独立静态说明页承接网站与插件搜索

维护者要求落实网站和插件SEO优化。现有Vue单页以根路径为编辑入口，文章在本地保存；初始HTML缺少产品正文。选择保留根入口，使用Vite public发布独立产品、教程、插件及隐私HTML，以真实页面链接和逐页元信息承接搜索。

静态说明资产不加载编辑器、不接触用户草稿，不引入Router、SSR服务、内容系统或业务模块。接受少量页面共同导航/元信息需要同步维护的成本，以保持现有GitHub Pages部署、离线内容阅读和本地数据所有权。新增内容时同步站点地图及现行设计；多语言或大量内容增长后再评估生成器。

当前[纯前端决策](ADR-20261004-jlab-wechat-editor-standalone-app.md)与[GitHub Pages决策](ADR-20261008-github-pages-deployment.md)继续有效。详细事实见[搜索发现设计](../design/search-discovery.md)。
