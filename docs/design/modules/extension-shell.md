---
title: extension-shell模块
status: accepted
created: 2026-10-12
updated: 2026-10-19
owner: project maintainers
---

# extension-shell模块

0.1.13增加工具栏站点指示。已登记的公共extension-shell.service.ts显式导出registerToolbarIcon，worker只组装注册；私有extension-shell-toolbar.ts负责origin判断、Chrome标签事件和每标签action.setIcon，不读取传稿仓储或页面内容。公共文件和依赖登记无需变更。蓝色对应生产桀士排版及公众号精确origin；开发包沿用两个本机origin；其他和URL不可读为灰色，保持面板可点击。默认灰色资源随包提供，品牌logo继续蓝色。

数据流为标签事件→读取该tab当前可见URL→精确origin分类→设置该tab图标，启动/安装/worker唤醒先同步已有标签。每标签最新令牌阻断迟到读取；移除标签时释放令牌，读取/设置失败由本次更新吸收，不影响传稿。只使用既有host权限；不记录URL、不新增状态存储、轮询或全局tabs权限。资源存在性、PNG尺寸/灰阶与ZIP一致性由打包检查覆盖；切换、导航、重启、多窗口和面板交互由维护者人工验收。依据[实施计划](../../plans/active/2026-10-19-extension-toolbar-icon.md)。

0.1.11content从已有共享契约依赖读取nativeTitleEditAttribute，只排除#js_title_main内已登记ProseMirror标题节点在同步原生insertText期间带active标记的input事件。pointerdown/keydown、其他节点input及标记移除后的input仍报告PAGE_ACTIVITY；不持续暂停用户活动，也不读取标题/正文。此标记是公开DOM协作约定，不是跨模块私有状态或新消息授权。依赖和模块边界不变。

0.1.6公众号浮层宽320px并钳制到视口，导航为两列minmax(0,1fr)、文字可换行、logo与图标不收缩，正文最长受视口高度限制并独立滚动。标题栏支持可信Pointer拖动、capture/up/cancel/lostcapture/失焦清理；方向键移动、Shift加速、Home恢复右下角，移动/尺寸变化钳制12px边距。不持久化位置，不访问页面内容。收起与恢复保留操作；可信外部页面活动保护排除浮层拖动/键盘。

浮层由安装插件注入，初始化一次内部PING校验实际worker连接，检测中及失效时打开传稿面板禁用；打开失败后维持禁用并提示启用/刷新。没有插件的新页面不会出现插件浮层；已打开页面的失效浮层在下一次操作失败时提示，不做轮询。Web抽屉同样按连接状态禁用面板入口。

apps/extension/src/modules/extension-shell公开service挂载popup和公众号closed Shadow DOM浮层。依赖共享契约和wechat-transfer消息端口，不读仓储、不导入页面适配器；用户文字用textContent创建。

复用本项目logo，Web/公众号导航按钮缩小并排。Popup下拉默认已选或第一个可用账号，右侧刷新图标具备title/aria-label/键盘焦点；仅打开/刷新/选择时检查页面能力。按钮响应可信点击并使用busy锁。选择保存由worker校验，登录后刷新可自动继续用户已发送但尚未启动的快照。

删除checkbox/校验、新建插入启动、取消和恢复清理入口。没有状态查询和2秒轮询。界面打开时一次读取文章元信息，后台浮层接收worker一次性TRANSFER_NOTICE并校验Schema/发送者，不通过网页消息触发操作；“已插入”不等于保存证明。

Popup增加“复制到公众号”和“复制标题”，用户点击时才读取COPY_ARTICLE当前快照，正文不交给公众号content或Web。可信点击内直接调用剪贴板write，ClipboardItem的异步HTML/纯文字来自同一次快照读取，保留排版；标题复制仅纯文字。复制反馈等到write成功，缺失/过期或权限/能力失败显示错误，不降级或触发自动重试。成功、失败和中断后均可复制，无需回编辑器。

元信息和COPY_ARTICLE读取最新成功自动保存或手动发送的独立clipboard快照，面板显示“已保存内容”。缺失内容提示等待Web修改后的自动保存或手动发送；自动同步不写系统剪贴板、不打开面板或后台，面板不新增同步/发送状态查询。

浮层仍报告外部可信pointerdown/keydown/input活动供worker阻断匹配写入竞态，不含正文/URL/账号。content不能选择账号；OPEN_PANEL受Chrome策略限制时打开本地面板标签。收起浮层不影响已授权执行。

格式/Lint/类型/构建允许；logo布局、默认选择、登录后继续、键盘、Chrome面板与后台结果提示由人类验收，无前端自动化。
