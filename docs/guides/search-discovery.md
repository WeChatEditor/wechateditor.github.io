# SEO发布、收录与持续维护

实现设计见[网站与插件搜索发现](../design/search-discovery.md)，商店文案见[发布文案](../reference/chrome-web-store-listing.md)。本地构建、远端部署、搜索收录和商店发布分别记录。

## 发布前检查

执行pnpm format:check、lint、typecheck、modules:check、docs:check、build、test、package:extension、extension:check及docs:archive:check:ci。前端布局和交互按仓库规范人工验收，不运行前端自动化。

完整发布apps/frontend/dist，不要只上传index.html和assets。新增public内容由Vite复制，产物包含：

- index.html：编辑器、描述性标题、canonical及WebSite/WebApplication结构化数据。
- about/index.html：产品介绍。
- guides/markdown-to-wechat/index.html：使用教程。
- extension/index.html：插件安装、使用和限制。
- privacy/index.html：网站与插件隐私说明。
- site.css、robots.txt、sitemap.xml和404.html。

说明页正文和导航不依赖JavaScript，工作台底部链接在新标签打开说明页，不挂载第二份编辑器。分享图沿用192px品牌图标，属于summary卡片。

## 部署后核对

按[静态部署](static-deployment.md)发布，再检查生产根页、四个说明页、CSS、图标、robots和sitemap均HTTP200；未知地址应由GitHub Pages返回HTTP404，404.html带noindex。Vite开发/preview的未知路由回退不代表GitHub Pages生产404行为。

查看网页源代码，确认每页独立title/description、唯一自引用canonical及可解析JSON-LD。canonical、og:url和sitemap只使用生产来源https://wechateditor.github.io/。说明页采用相对链接，404页为生产根路径设计；子目录部署时需同时调整404根链接和规范网址，不能直接沿用生产SEO来源。

手工确认桌面和手机阅读、键盘焦点、目录锚点、工作台链接在新标签打开、正文完整显示。编辑器仍最小800px桌面布局，顶栏品牌不增加英文或营销口号。插件重新加载0.1.12并刷新两端页面，原账号识别、复制与手动保存继续按既有人工清单验收。

## 搜索平台所有权和提交

1. 打开[Google Search Console](https://search.google.com/search-console/about)，为https://wechateditor.github.io/添加网址前缀属性。没有github.io的DNS控制权时不要选择需要DNS的整个github.io域名验证。
2. 使用平台提供的真实HTML验证文件或meta值。文件放入apps/frontend/public再部署，meta放入根index.html。不要编造验证值，不要随意删除仍用于验证的文件或标签。
3. 验证后提交https://wechateditor.github.io/sitemap.xml，使用网址检查查看根页和新页面的抓取/呈现状态，并按需要请求编入索引。
4. 在[Bing Webmaster Tools](https://www.bing.com/webmasters/about)和[百度搜索资源平台](https://zy.baidu.com/)按账号当前可用的验证、站点提交入口处理。同样只使用真实验证值；平台访问与所有权未完成时保留待办。
5. 记录实际已发现/已收录页面、搜索词、展示、点击、点击率及日期，不把搜索结果中的临时缺席当作完全未收录。

Google支持的验证方式及持续保留验证凭据要求见[所有权验证说明](https://support.google.com/webmasters/answer/9008080)。

站点地图是发现提示，不保证抓取、收录、排名或完成时间。robots缺失本身并不等于禁止抓取；当前robots明确允许并提供站点地图。依据见[Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)、[站点地图](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)和[摘要](https://developers.google.com/search/docs/appearance/snippet)。

## 插件商店与内容迭代

先完成真实功能验收，再将[商店文案](../reference/chrome-web-store-listing.md)和实际截图填入开发者后台，核对公开可见性及地区。官网链接应可访问；拿到真实公开商店地址后，再同步官网插件页与文档的安装入口，不根据本地开发ID推断商店已上架。

观察“微信公众号Markdown排版”“公众号排版工具”“公众号文字传稿插件”等候选词的实际展示，再针对有需求的问题补充教程和实例。网站与GitHub/文章介绍可以互相链接，但不要批量制造重复页面或堆积无关关键词。

新增页面时同步导航、独立元信息、JSON-LD和sitemap；lastmod只在页面发生实质变化时更新。修改域名或编辑器入口需要重新评审本地草稿origin、插件允许来源和搜索迁移，不作为日常SEO小改直接执行。
