---
title: 公众号首页左侧草稿箱菜单定位修正
status: pending_human_acceptance
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# 公众号首页左侧草稿箱菜单定位修正

维护者实际反馈0.1.7从首页进入草稿箱失败，授权本机Chrome调试。浏览器工具已连接但站点策略拒绝公众号页面，未用其他工具或通道绕过。维护者随后提供内容管理分组HTML，确认.weui-desktop-menu_create、span标题“内容管理”、嵌套子菜单、a.weui-desktop-menu__link的title与.weui-desktop-menu__name“草稿箱”。不保存原始链接参数，也不据单段HTML认定全页面重复或折叠是唯一根因。

起点ba31a2ce7cf43d9e243317751ee61b49cf03cd34，工作区/暂存为空，无.codegraph，暂存门禁通过，归档NOT_DUE。已读相关设计/活动计划/有效ADR、归档索引和最近插件模块复核。依据[插件设计](../../design/wechat-transfer-extension.md)及[页面模块](../../design/modules/wechat-page.md)，继续[文章导航计划](2026-10-12-wechat-article-navigation.md)的修正。

- [x] 设计/计划/fix日志先行，记录人工结构和Chrome调试限制。
- [x] 草稿箱定位限定内容管理分组、核对链接title/名称，避免全页面同名干扰；仍要求唯一可见可用。
- [x] 折叠菜单最多点击一次内容管理标题，返回原阶段继续等待；不反复展开/关闭，不跳到创作。
- [x] 区分菜单不存在/子项未就绪/多个匹配/禁用，worker在30秒期限内等待并保留具体超时原因。
- [x] 在用户授权的本机Chrome调试范围内，使用无凭据的本地结构样例验证；不访问受阻公众号页面。
- [x] 格式、Lint、类型、构建、模块/文档、适用契约/治理、0.1.8生产/开发/ZIP包与归档CI检查。
- [ ] 人类复验线上首页、折叠菜单、已在草稿箱、创作/文章新标签与正文插入、手动保存。

不新增权限、共享外部协议、依赖或持久化格式；测试样例不得带账号/凭据/完整后台URL。实际公众号未验收时计划和日志保持pending_human_acceptance，工程通过后本地自动提交，不推送部署。

## 实际结果

0.1.8按所给结构限定菜单，识别title及内部名称，ID变动仍可使用。visible同时排除hidden/inert及visibility:hidden/collapse。内容管理展开请求只发一次，menuExpansionRequested由worker在本次尝试内持有，retryNavigation保持草稿箱阶段；创作/文章入口缺失同样等待，多目标立即停止，最后具体原因进入超时提示。未新增共享消息、存储迁移或私有API。

Chrome本地真实DOM样例11/11通过：全页面同名干扰、一次展开/等待/展开后导航、多个草稿箱阻断、visibility隐藏副本、菜单未加载等待、已在草稿箱、禁用入口、ID/title兼容、多个分组阻断、创作入口等待、文章零/多目标区别。样例位于ignored的.generated/wechat-menu-debug，截图为chrome-results.jpg；不含真实后台链接或账号。测试副本仅将来源与HTTPS条件适配回环HTTP，生产门禁未修改。首轮4项被样例HTTP与生产HTTPS检查差异阻断，补齐本地副本适配后11项通过；这不是平台流程实测。

工程验证：冻结严格peer安装、format/format:check、Lint零错误（239个现行Vue排版警告）、类型、Web/插件生产构建、0.1.8生产ZIP/开发包、ID/权限/来源与ZIP一致、modules:check、docs:check、22项治理与12项共享契约、diff及归档CI NOT_DUE通过。Web现行大chunk提示保留；依赖/锁文件与模块边界未变。

遗留：真实公众号首页菜单展开、草稿箱路由加载、新的创作/文章及新标签正文/标题/排版/保存仍由维护者复验。用户HTML不证明线上唯一根因；站点工具限制未绕过，也未将测试来源适配应用到插件。计划/日志保持pending_human_acceptance；本地提交、未推送部署，关联提交由文件Git历史定位。
