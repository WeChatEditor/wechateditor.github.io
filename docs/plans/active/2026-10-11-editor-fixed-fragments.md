---
title: 原稿固定头尾显示配置
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 原稿固定头尾显示配置

维护者要求用配置控制左侧原稿头尾的只读展示。固定头尾面板新增“在原稿中显示固定头尾”开关，默认开启，独立于头尾启用状态。workspace拥有showFixedFragments偏好，沿用localStorage配置格式1；旧记录缺失补true，类型损坏拒绝读写。仅控制传给原稿组件的只读内容，不影响预览、复制、统计、正文及文章版本。依据[UI](../../design/jlab-wechat-editor-ui.md)、[存储](../../design/jlab-wechat-editor-storage.md)与既有固定头尾ADR；不新增模块、依赖或ADR。

起始工作区和暂存为空，无CodeGraph，归档NOT_DUE。先同步设计和记录再实现。

- [x] 实现偏好、面板开关、展示条件和配置兼容。
- [x] 执行格式、Lint、类型、生产构建、模块、文档和归档CI检查。
- [ ] 人工验收开关即时展示、刷新恢复、旧配置默认开启、预览复制不受影响及冲突锁定。

不运行前端自动化；技术验证通过自动提交，不推送。人工验收前保持活动计划。

实际修改配置端口、校验/默认值、store快照/恢复/监听、ending面板及page只读块条件。隐藏不改头尾启用状态或文章数据；配置冲突锁复用既有写入门禁，textarea尺寸改变沿用ResizeObserver重算滚动对齐。format/format:check、Lint（0错误/既有228警告）、typecheck、build、modules:check、docs:check、diff检查通过，归档CI为NOT_DUE。最终JS545.89kB/gzip196.83kB，保留既有500kB提示。未运行前端自动化，关联提交通过本文件Git历史定位。
