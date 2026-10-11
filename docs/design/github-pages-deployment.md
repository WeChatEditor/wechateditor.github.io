---
title: GitHub Pages 自动部署
status: accepted
created: 2026-10-08
updated: 2026-10-12
owner: project maintainers
---

# GitHub Pages 自动部署

## 当前事实与职责

纯前端Web由Vite构建到apps/frontend/dist，base为./。源码仓库master经已有sync-org工作流同步组织仓库WeChatEditor/wechateditor.github.io；pages.yml以组织仓库和master为条件部署。维护者2026-10-12确认https://wechateditor.github.io/为实际地址。本轮不改变源码同步方式或凭据，仅增加插件打包检查，Pages上传仍为frontend/dist。

## 依赖、数据流与失败模式

master 推送或在 master 手动运行触发独立部署工作流。Ubuntu 使用 Node 22、pnpm 10.26.0，冻结锁文件并严格校验 peer；格式、Lint、类型、模块、文档、治理测试、归档与提交检查通过后构建并上传整个 dist。部署作业依赖构建，使用官方 configure-pages、upload-pages-artifact、deploy-pages 和 github-pages 环境。顶层仅 contents: read，部署作业增加 pages: write 和 id-token: write；PR 和其他分支不发布。不使用 PAT 或 gh-pages 分支。

部署使用固定 pages 并发组，不取消正在运行的发布。检查或构建失败不产生新的部署；GitHub Pages 未设置为 GitHub Actions、环境限制或权限不足会使远端失败，应修复配置后重跑。原 Verify project 保留 Windows/Linux 工具链矩阵，部署自身检查负责阻止未通过验证的版本发布。

## 浏览器数据与验收

实际地址为https://wechateditor.github.io/。浏览器存储按origin隔离，旧tanghaojie.github.io来源的数据不由插件迁移；本项目既有存储键不变。维护者应避免在同一origin发布使用相同存储键的应用，页面路径不能提供数据隔离。生产HTTPS支持剪贴板，图片CORS仍受来源限制。

本地执行适用静态检查、构建、治理测试；远端部署与页面实际可访问性单独记录。应用交互、刷新恢复、复制和公众号接收由维护者人工验收，不运行前端自动化。执行方式见[部署指南](../guides/static-deployment.md)，长期选择见[决策](../decisions/ADR-20261008-github-pages-deployment.md)。
