# 桀士排版·公众号助手

JLab WeChat Editor：纯前端桌面Markdown公众号排版工具。Vue、Pinia、Element Plus；本地草稿、主动文章版本、固定结尾、九种章节与HTML/纯文字复制。由CoAIForge0.2.0工程迁入，保留2026 JTLab MIT声明。

## 运行

兼容Node >=22.13.0（推荐22），pnpm >=10.26.0。

```sh
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm dev:frontend
pnpm build
pnpm --filter @jlab-wechat-editor/frontend preview
```

开发127.0.0.1:5175，预览4175，严格端口；源站5174/4174数据不读取或清理。新origin无本地草稿时显示原版示例稿与默认配色/排版；已有草稿（包括空稿）优先恢复。配置localStorage、文章IndexedDB，浏览器清理可能丢失；无账号、云同步或后端。

## 文档与交付

[协作规则](AGENTS.md)、[文档入口](docs/README.md)、[功能与人工验收清单](apps/frontend/README.md)、[迁移来源](docs/reference/migration-provenance.md)、[静态部署](docs/guides/static-deployment.md)。

功能和公众号接收效果等待维护者人工验收；静态检查和构建不替代。生产平台/域名未确定，尚未正式发布。
