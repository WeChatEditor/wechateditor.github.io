---
title: 使用 GitHub Pages 托管静态前端
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 使用 GitHub Pages 托管静态前端

维护者要求添加 GitHub Pages 自动部署。应用没有后端，构建产物为静态文件，使用官方 Pages Actions 从 master 发布完整 dist；冻结依赖和工程门禁通过后才发布。保留相对 base，不增加服务端路由或发布分支。

默认 GitHub HTTPS 地址为当前托管地址，自定义域名未配置。GitHub 用户站下项目共享 origin，不能以仓库子路径隔离 localStorage/IndexedDB；需避免与相同存储键的应用同 origin。功能与公众号接收仍由人类验收。具体配置见[部署设计](../design/github-pages-deployment.md)。
