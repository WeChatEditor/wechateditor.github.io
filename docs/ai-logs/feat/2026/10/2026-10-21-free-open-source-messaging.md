---
title: 免费与开源产品说明
status: pending_human_acceptance
change_type: feat
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# AI 协作记录

## 用户目标、授权与关键指令

用户授权增加开源、免费宣传以帮助选择。遵守既有改动保护、设计/计划先行和前端人工验收规则。初始工作区与暂存区为空，暂存检查通过，归档审计NOT_DUE；本轮只调整产品表达与入口。

## 假设、选择与实际改动

免费表述依据当前功能，开源表述依据根LICENSE与package.json中的MIT声明。沿用静态说明页设计，工作台链接新标签打开，介绍页解释功能与适用边界，提供源码和许可证入口。不承诺永久免费，不引入付费对比或虚构用户数据，不增加依赖和业务数据流。详见[计划](../../../../plans/active/2026-10-21-free-open-source-messaging.md)和[设计](../../../../design/search-discovery.md)。

## 验证、偏差、未决事项和提交

已完成工作台品牌链接与底部源码标签、介绍页首屏标签及三张价值说明卡、源码/许可证入口和适用场景FAQ；同步插件页免费说明、根页搜索/分享摘要及JSON-LD license、README与站点地图，并将宣传中的旧配色/标题数量同步为18套/12款。无新增依赖或存储变化。

实际验证：pnpm format、format:check、lint（0错误、253项样式警告）、typecheck、build、modules:check、docs:check通过；构建保留大chunk提示。初次治理测试因沙箱拒绝临时Git仓库.git/config写入失败，经执行环境提权重跑，22项治理和25项共享契约测试全部通过。静态产物核对6个HTML、5段JSON-LD、105个本地链接/资源/锚点、新标签安全、免费/许可证字段和public资产复制，均通过；归档CI NOT_DUE，git diff --check通过。

页面视觉、工作台窄屏、键盘焦点、实际链接体验和宣传清晰度待人工验收，计划及记录保持pending_human_acceptance。未运行前端自动化，未推送部署或更改商店。关联提交由本文件Git历史定位。
