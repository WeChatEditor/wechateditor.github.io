---
title: 手机档位、冲突阻断与固定头尾只读展示
status: pending_human_acceptance
change_type: feat
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 手机档位、冲突阻断与固定头尾只读展示

目标为四项维护者要求。用户明确冲突确认关闭当前标签页，不能自动关闭则提示手动关闭。记忆仅参考既有BroadcastChannel/writeId/storage协议，当前源码与设计为依据。暂存/工作区为空、无CodeGraph、归档NOT_DUE，有效提交19，即将按阈值触发同范围复核。

选择内存手机档位、原生dialog顶层阻断和store独立冲突锁、原稿上下文本只读块。保留存储格式、头尾配置、正文textarea/选区/锚点和组件公共依赖方向，不新增模块或依赖。最低字号11px指CSS逻辑字号，手机模拟缩放独立。前端不运行自动化，工程验证与人工功能验收分开记录。

实际实现article-preview的375/390/414视口选择及壳体边框、尺寸/zoom重测；article-editor可选opening/ending文本props与浅灰只读块；共享标题9/10px提升11px并调整行高/字距、组件extra-small下限。workspace的conflictReason同时锁文章/配置保存，取消450ms待保存、关闭抽屉、invalidate复制，排队命令及晚到导入/恢复应用拦截。page原生dialog+inert阻止鼠标键盘/外部弹层，Esc不能关闭；确认window.close，拒绝则提示手动关闭并保持Modal。冲突退出绕过beforeunload补保存。普通损坏/配额错误不进入此冲突Modal。

首次Lint指出HTMLDialogElement不在既有Vue全局白名单，改用window构造器类型，无配置扩大。format/format:check、Lint零错误/228警告、typecheck、build、modules:check、docs:check、21项治理测试、diff检查通过。JS544.92kB/gzip196.53kB，保留体积提示。源码字体扫描无低于11px的显式font-size；静态核对标题33px内容/48px栏、控制行横向滚动与只读块最大80px，未做真实浏览器/前端自动化验收。已开始事务不能撤销，收到冲突后的新操作被拒绝、原writeId检查保留，存储格式未变。计划保持pending_human_acceptance。按20个有效提交阈值完成关联归档复核，真实内容提交后登记真实基线，不推送。
