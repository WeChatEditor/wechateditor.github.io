# 静态部署

执行pnpm build，发布apps/frontend/dist整个目录（含assets）。Vite base为./，支持根路径和子路径，不依赖服务端路由回退。不要直接用file://打开；使用本地preview或静态HTTP服务。

生产使用 HTTPS。浏览器数据按 origin 隔离，不能与源应用同 origin 只换路径来隔离浏览器数据。GitHub 默认地址下同一用户的其他项目共享 origin，应避免发布使用相同存储键的应用。剪贴板需要安全上下文；127.0.0.1开发环境可用于人工预览。CORS图片失败沿用产品诊断，不以服务配置承诺任意远程图可复制。

## GitHub Pages 自动部署

工作流为 .github/workflows/pages.yml。首次在仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions；仓库需允许 Actions，并允许 github-pages 环境从 master 部署。无需配置额外密钥。

推送到 master 自动触发 Deploy GitHub Pages；也可在 Actions 选择该工作流并在 master 上 Run workflow。其他分支的手动运行跳过发布，PR不部署。工作流冻结安装、执行工程门禁后构建并上传整个 dist，部署失败可在 Actions 查看失败步骤并重跑。Verify project 继续执行原多平台验证。

默认地址为 [在线应用](https://tanghaojie.github.io/JLabWeChatEditor/)，执行结果见 [部署工作流](https://github.com/tanghaojie/JLabWeChatEditor/actions/workflows/pages.yml)。工作流存在不代表已发布；首次远端成功前地址可能返回404。未配置自定义域名。首次发布后维护者确认页面及assets请求、刷新恢复、HTTPS剪贴板和公众号效果；不以构建成功代替功能验收。

其他静态平台可继续发布dist。缓存由托管平台管理，建议HTML及时刷新、哈希assets长期缓存。详细边界见[部署设计](../design/github-pages-deployment.md)。
