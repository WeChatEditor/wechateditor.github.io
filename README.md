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

功能和公众号接收效果等待维护者人工验收；静态检查和构建不替代。源码同步到组织仓库后，GitHub Pages工作流自动检查并部署Web。维护者确认地址为[在线应用](https://wechateditor.github.io/)，执行边界见[静态部署](docs/guides/static-deployment.md)。

可选Chrome轻量传稿插件0.1.4提供Web一键发送，接收当前文字排版后优先打开后台尝试独立新建插入；未完成时可直接从插件面板复制排版或标题，无需回编辑器。插件默认首个可用公众号、紧凑导航及logo，不检测发送状态或要求二次确认/启动。用户检查后手动保存，含图沿用编辑器复制。执行`pnpm package:extension`得到安装目录和ZIP，详见[安装与人工验收](docs/guides/wechat-transfer-extension.md)。真实公众号尚未验收，本次实现尚未推送或部署。
