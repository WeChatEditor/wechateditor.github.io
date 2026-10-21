# 桀士排版·公众号助手

桀士排版是一款无需注册的微信公众号Markdown排版工具。支持实时预览、九组默认配色、八种标题装饰、固定头尾、本地草稿、主动文章版本和HTML/纯文字复制；可选Chrome插件辅助文字传稿，由用户检查后手动保存。

[在线工作台](https://wechateditor.github.io/) · [产品介绍](https://wechateditor.github.io/about/) · [Markdown排版教程](https://wechateditor.github.io/guides/markdown-to-wechat/) · [Chrome传稿插件](https://wechateditor.github.io/extension/) · [隐私说明](https://wechateditor.github.io/privacy/)

Vue、Pinia、Element Plus纯前端实现，英文项目标识JLab WeChat Editor；由CoAIForge0.2.0工程迁入，保留2026 JTLab MIT声明。新增静态说明页随本轮代码部署后可访问，搜索收录另行核验。

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

可选Chrome轻量传稿插件工程版本0.1.14（商店已发布版本为0.1.13，规则修复尚待发布）；新版Web要求插件至少0.1.14。插件在Web自动保存后同步当前文字排版，可从插件面板复制排版或标题，无需手动发送。点击“发送到公众号”才打开后台尝试独立新建插入，自动同步不影响原发送任务。当前标签为桀士排版或公众号后台时工具栏图标呈蓝色，其他页面灰色；灰色仍可打开插件面板。插件默认首个可用公众号、紧凑导航及logo，不检测发送状态或要求二次确认/启动。用户检查后手动保存，含图沿用编辑器复制。维护者确认插件已发布，请[从Chrome应用商店安装](https://chromewebstore.google.com/detail/neeljhohndegbhaaaclmcdeenlebhicj)，安装后刷新网页，在发送抽屉点击“重新检测”。详见[安装与人工验收](docs/guides/wechat-transfer-extension.md)，其中保留本地开发打包说明。实际Chrome同步和公众号流程尚待人工验收。

## 搜索发现与发布

网站保留根编辑器入口，产品、教程、插件和隐私说明为不依赖JavaScript的静态HTML，提供独立搜索元信息、canonical、结构化数据和站点地图。完整构建产物包含robots.txt、sitemap.xml及404页，沿用GitHub Pages发布流程。[收录操作指南](docs/guides/search-discovery.md)说明部署后核对及搜索平台验证；[商店文案](docs/reference/chrome-web-store-listing.md)继续供维护者更新Chrome开发者后台。
