---
title: extension-shell模块
status: accepted
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# extension-shell模块

apps/extension/src/modules/extension-shell公开service挂载popup和公众号Shadow DOM浮层。依赖方向为共享契约和插件wechat-transfer消息端口，不读仓储、不导入页面适配器。以textContent创建用户内容，避免HTML模板注入。

Popup提供Web/公众号打开、目标能力刷新、显式账号选择及勾选确认、新建插入、取消、检查后台后丢弃或清空损坏任务。双击busy锁，按钮只响应可信用户点击；任务执行约束由worker再次检查。任务状态2秒轮询，页面离开释放计时。

后台浮层只显示摘要并打开可信插件面板；content来源不能START_INSERT/CANCEL/CLEAR，不依靠page消息启动写入。Chrome版本/策略不支持action.openPopup时提示点击工具栏图标。关闭浮层不取消任务。

浮层之外的可信后台pointerdown/keydown/input活动报告PAGE_ACTIVITY，不含载荷、URL或账号；worker只对匹配执行目标失效租约。

失败和恢复通过状态文案显示，成功文案为“已插入，请检查排版并手动保存”。界面不记录原稿、历史、封面或后台凭据。格式/Lint/类型/构建及人工键盘、登录、目标、多窗口和恢复验收。
