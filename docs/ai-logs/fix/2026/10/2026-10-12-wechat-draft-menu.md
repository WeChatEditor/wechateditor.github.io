---
title: 公众号首页草稿箱菜单定位修正记录
status: pending_human_acceptance
change_type: fix
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# 公众号首页草稿箱菜单定位修正记录

目标/授权：维护者反馈首页无法唯一定位草稿箱，授权本机Chrome调试，并主动提供菜单结构。起点ba31a2ce7cf43d9e243317751ee61b49cf03cd34，工作区/暂存为空，无CodeGraph；暂存门禁通过、归档NOT_DUE。

事实与限制：Chrome连接成功，公众号页面被浏览器工具站点策略拒绝，禁止绕过且没有尝试其他通道。人工HTML确认内容管理分组.weui-desktop-menu_create，标题span.weui-desktop-menu__link，草稿箱a.weui-desktop-menu__link、title和内部name。只保留结构和语义，不复制原始链接/登录参数。现有代码全页面匹配，零个和多个目标共用错误，span分组标题不在可点击候选中；尚无证据确定线上错误唯一根因。

选择：优先限定实际左侧分组，用title/名称核对链接；子项未显示时一次展开分组，worker保持草稿箱阶段有界等待。区分缺失、折叠、多个和禁用，保留具体超时原因。使用不含凭据和平台请求的本地浏览器样例验证人工结构，不称实际公众号验收通过。

实际实现：草稿箱仅匹配可见内容管理分组内的实际链接，title/name语义核对；可见性排除hidden/inert和visibility:hidden/collapse。内部分组展开布尔请求仅在本次尝试首次允许，返回menuExpansionRequested/retryNavigation后不推进创作阶段。菜单尚未加载/子项未出现等待，多个分组/链接或禁用停止；创作/文章同样区分零/多目标，worker超时保留具体原因。版本0.1.8；现行设计/模块/验证例外/指南、原导航计划同步。

实际验证：用户授权范围内，在本机Chrome的回环本地样例执行11项真实DOM检查，11/11通过，覆盖同名干扰、一次展开等待、隐藏副本、多个分组/链接、缺失/禁用、已在草稿箱及ID/title兼容等。仅测试副本适配来源/HTTPS为本地HTTP；初轮4项因此阻断，补齐样例适配后通过，生产门禁未改。样例与截图保留在ignored的.generated/wechat-menu-debug，不含真实账号或平台链接，也没有访问受阻页面。

冻结严格peer安装、format/format:check、Lint零错误（239个现行Vue警告）、类型、Web/插件生产构建、0.1.8生产/开发包及ZIP一致、模块/文档、22项治理及12项契约、diff与归档CI NOT_DUE通过；Web现行大chunk提示保留。没有新增依赖/锁文件变化、权限、共享外部协议、存储格式或模块边界。

偏差/遗留：本地样例不验证微信Vue实际展开、真实页面加载、创作/文章入口、新标签插入或手动保存；单段HTML无法证明线上唯一根因。政策限制未绕过，未推送部署/上架/代为保存。计划/日志保持pending_human_acceptance；实施清单见[计划](../../../../plans/active/2026-10-12-wechat-draft-menu.md)，关联提交由本文件Git历史定位。
