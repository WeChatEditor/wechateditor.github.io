---
title: extension-shell模块
status: accepted
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# extension-shell模块

apps/extension/src/modules/extension-shell公开service挂载popup和公众号closed Shadow DOM浮层。依赖共享契约和wechat-transfer消息端口，不读仓储、不导入页面适配器；用户文字用textContent创建。

复用本项目logo，Web/公众号导航按钮缩小并排。Popup下拉默认已选或第一个可用账号，右侧刷新图标具备title/aria-label/键盘焦点；仅打开/刷新/选择时检查页面能力。按钮响应可信点击并使用busy锁。选择保存由worker校验，登录后刷新可自动继续用户已发送但尚未启动的快照。

删除checkbox/校验、新建插入启动、取消和恢复清理入口。没有状态查询和2秒轮询。界面打开时一次读取文章元信息，后台浮层接收worker一次性TRANSFER_NOTICE并校验Schema/发送者，不通过网页消息触发操作；“已插入”不等于保存证明。

浮层仍报告外部可信pointerdown/keydown/input活动供worker阻断匹配写入竞态，不含正文/URL/账号。content不能选择账号；OPEN_PANEL受Chrome策略限制时打开本地面板标签。收起浮层不影响已授权执行。

格式/Lint/类型/构建允许；logo布局、默认选择、登录后继续、键盘、Chrome面板与后台结果提示由人类验收，无前端自动化。
