# 静态部署

执行pnpm build，发布apps/frontend/dist整个目录（含assets）。Vite base为./，支持根路径和子路径，不依赖服务端路由回退。不要直接用file://打开；使用本地preview或静态HTTP服务。

生产使用 HTTPS。浏览器数据按 origin 隔离，不能与源应用同 origin 只换路径来隔离浏览器数据。GitHub 默认地址下同一用户的其他项目共享 origin，应避免发布使用相同存储键的应用。剪贴板需要安全上下文；127.0.0.1开发环境可用于人工预览。CORS图片失败沿用产品诊断，不以服务配置承诺任意远程图可复制。

## GitHub Pages 自动部署

工作流为.github/workflows/pages.yml，仅在组织仓库WeChatEditor/wechateditor.github.io的master运行部署；源码仓库tanghaojie/JLabWeChatEditor通过已有sync-org工作流同步组织仓库。首次在组织仓库Settings → Pages → Build and deployment → Source选择GitHub Actions；允许Actions和github-pages环境从master部署。源码同步的既有配置由维护者管理，本轮不修改其凭据。

推送到 master 自动触发 Deploy GitHub Pages；也可在 Actions 选择该工作流并在 master 上 Run workflow。其他分支的手动运行跳过发布，PR不部署。工作流冻结安装、执行工程门禁后构建并上传整个 dist，部署失败可在 Actions 查看失败步骤并重跑。Verify project 继续执行原多平台验证。

维护者2026-10-12确认地址为[在线应用](https://wechateditor.github.io/)，执行结果见[组织部署工作流](https://github.com/WeChatEditor/wechateditor.github.io/actions/workflows/pages.yml)。本轮插件代码未推送或部署；新工作流存在不代表远端已执行。更新后维护者确认页面及assets请求、刷新恢复、HTTPS剪贴板和公众号效果；不以构建成功代替功能验收。

其他静态平台可继续发布dist。缓存由托管平台管理，建议HTML及时刷新、哈希assets长期缓存。详细边界见[部署设计](../design/github-pages-deployment.md)。
