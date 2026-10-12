---
title: 公众号文章菜单名称识别修正记录
status: pending_human_acceptance
change_type: fix
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# 公众号文章菜单名称识别修正记录

目标/指令：维护者反馈已到草稿箱但“文章”入口定位超时，要求修复；维护者随后提供完整创作菜单结构。起点eca432e25039e97437d58cbd0d07d3448bd43f31；工作区/暂存为空，无CodeGraph，暂存门禁通过、归档NOT_DUE。

事实：li.weui-desktop-dropdown__list-ele包含可见名称span.weui-desktop-dropdown__list-ele__text及display:none同名tooltip。controlsFor已包括该li候选，但使用整个textContent，读成“文章文章”而无法精确匹配。截图和人工HTML不验证平台新标签及正文写入。

选择：登记菜单项优先读取可见名称标签，通用候选使用innerText过滤隐藏文字，保留aria-label优先、精确语义、唯一可见可用及原节点点击；不增加广泛div/span匹配或包含文字匹配。私有bridge改动，不需新的长期ADR或公共契约变更。

实际改动：私有bridge对已登记菜单项读取可见名称标签，其他候选使用innerText，继续aria-label优先与原节点点击。隐藏同名tooltip不再进入名称；没有扩大候选或修改唯一入口、账号/文档绑定、新标签证据及正文保护。交付0.1.9，当前设计/模块/指南及旧导航/草稿箱计划同步；无依赖/锁文件、权限、协议、持久化或边界变化。

实际验证：冻结严格peer安装、format/format:check、Lint零错误（239个现行Vue警告）、全部workspace类型、Web/插件生产构建、0.1.9生产ZIP/开发包及包一致性、模块/文档、22项治理和12项共享契约、diff与归档CI NOT_DUE通过。Web现行大chunk提示保留，命令证据位于ignored的.generated/wechat-article-label。计划见[实施清单](../../../../plans/active/2026-10-12-wechat-article-label.md)。

偏差/未决：本次没有创建/运行前端或浏览器自动化，没有访问公众号站点；既有草稿箱本地样例11项不算本次验证。人工HTML解释名称合并失败，实际文章新标签、插入、排版和手动保存仍交维护者重新加载0.1.9并刷新页面后复验。计划/日志保持pending_human_acceptance；本地自动提交、未推送部署，关联提交由本文件Git历史定位。
