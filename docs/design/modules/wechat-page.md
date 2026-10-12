---
title: wechat-page模块
status: accepted
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# wechat-page模块

0.1.7按维护者确认的“草稿箱 → 新的创作 → 文章”导航；文章优先匹配，旧图文名称兼容。菜单自身与其链接归为同一操作，独立入口仍须唯一且可见；已在草稿箱时用可见标题/选中菜单和唯一创作按钮确认。导航显式绑定documentId，保留平台链接target；文章点击前记录子标签基线，之后只接受唯一新增公众号子标签。openWechat返回本次独立后台tabId，便于pending登录任务绑定，不返回后台URL或登录凭据。

apps/extension/src/modules/wechat-page隔离公众号适配，公共service/model，私有bridge由scripting序列化到MAIN。仅依赖共享wechat-transfer契约，不读取任务仓储。固定操作probe/drafts/create/article/apply；消息不能传任意代码。入口只组装。

账号候选选择器、标题候选和草稿箱/新的创作/文章语义入口均为保守适配，完整流程尚未在维护者账号验证；缺失、不唯一或来源不符阻断。只识别顶层文档，不能访问真实能力所在frame时阻断，不遍历所有frame写入。选择后台首页/草稿箱后打开独立标签，绑定账号、tab/document和本次新建证据；不复用已有编辑页。

2026-10-12维护者人工检查首页右上角账号名称，确认class为weui-desktop_name；本次修正加入该精确候选，并继续要求可见名称唯一。该结构证据不代表新建/标题/正文保存流程已验收。登录/账号匹配失败与来源/frame不支持分开提示，不要求用户绕过保护。

维护者继续确认其他后台页面名称class为acount_box-nickname；0.1.2同时支持两种当前结构以及历史候选。使用统一识别函数覆盖首页探测、导航、写入前后账号校验，不因页面变化丢失绑定。仅可见名称形成一个唯一值时接受，不选第一个冲突名称。

正文调用官方对象参数invoke(apiName/apiParam/sucCb/errCb)，get_isready要求isReady及isNew（新编辑器版本标识，不能替代新建证据）。get_content重新确认正文/媒体为空及标题为空；标题原生setter派发input/change，再get_content复核无编辑活动，set_content后核对账号、标题、规范化文本和主要结构数量。不调用私有实例、HTTP、保存或发布。

页面导航/就绪30秒，JSAPI调用10秒；超时可能已产生新建/写入，停止自动操作，向后台浮层发送一次性提示，由人类检查实际页面后决定是否重送。主要风险为候选入口改变、标题实际状态、格式保真与后台自身自动保存；读回不是持久化/视觉验收。静态检查允许，前端自动化需维护者明确授权。

公众号content入口报告可信pointerdown/keydown/input活动，worker按tab/document匹配当前执行任务并转uncertain，失效租约阻断后续写入。MAIN也检测写入中的可信input，无法排除竞态时保持uncertain。

新建需有文章点击、之后新增子tab及不同documentId的空编辑器三项证据；同document或同tab流程保守阻断并交人类校准。读回还确认没有媒体。任何活动执行租约存在时均禁止下一次新发送；没有公开取消/清空或状态检测流程。
