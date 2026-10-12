---
title: ProseMirror标题适配与空页判定修正记录
status: pending_human_acceptance
change_type: fix
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# ProseMirror标题适配与空页判定修正记录

目标/指令：维护者反馈本次新建编辑器被误报已有内容，继续修复自动插入。起点fa0d95e71e842ca01c6ad0f2e71ca4cd0990f494，工作区/暂存为空，无CodeGraph，暂存门禁通过、归档NOT_DUE。

人工证据：get_content为无文本/媒体的空section/br及隐藏mp-style-type，现有emptyBody已接受；唯一原生textarea却visibility:hidden。父容器实际使用可见ProseMirror标题覆盖层，隐藏旧textarea只作为后续同步核对。源码将标题控件不可用与非空内容合并，并立即阻断。

选择：支持可见标题覆盖层的浏览器原生insertText事务，保留原生输入兼容，2秒内同时核对覆盖层文本及隐藏旧textarea值。共享契约公开固定DOM协作标记，仅同步调用内排除自身标题input，finally清除；真实键盘/指针和其他input继续保护。标题加载与非空提示分开，加载在原30秒内等待。正文判空不放宽，不读ProseMirror私有状态或直接赋值HTML。

实际改动：识别唯一可见标题覆盖层，浏览器原生insertText后2秒内同时核对可见文本及旧textarea值；原生输入保持兼容，最大长度及非空保护继续适用。公开常量nativeTitleEditAttribute及固定类型scripting参数协作MAIN/content，仅同步事务期间排除同节点input，finally清除，其他活动保护保持。标题尚未就绪在原30秒内等待，非空标题/正文分别提示；页面明确拒绝原因保留到写入不确定提示。0.1.11生产/开发/ZIP、设计/模块/ADR/协议说明和指南同步。

实际验证：冻结严格peer安装、format/format:check、Lint零错误（239个现行Vue警告）、全部workspace类型、Web/插件生产构建、0.1.11生产ZIP/开发包及包一致性、模块/文档、22项治理和12项共享契约、diff及归档CI NOT_DUE通过。Web现行大chunk及本轮构建计时提示保留，构建成功；命令证据位于ignored的.generated/wechat-title-overlay。没有依赖/锁文件、权限、存储、消息Schema、协议版本或模块依赖变化。

偏差/未决：本轮没有创建/运行前端或浏览器自动化，没有访问公众号站点；仅用维护者主动提供的空正文/标题DOM和可见性证据。真实原生事务、标题状态同步、正文/排版/保存待0.1.11人工复验，不将技术检查写为产品通过。计划/日志保持pending_human_acceptance，完整清单见[计划](../../../../plans/active/2026-10-12-wechat-title-overlay.md)；仅本地自动提交/打包，关联提交由文件Git历史定位。
