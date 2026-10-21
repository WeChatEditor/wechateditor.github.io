---
title: 免费与开源产品说明
status: pending_human_acceptance
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 免费与开源产品说明

## 目标、授权与设计依据

用户要求“添加开源、免费的宣传内容，让用户更容易容易选择”。以现有MIT许可证、免费编辑功能、无需注册和浏览器本地保存为依据，增强工作台、产品与插件说明页的可见表达，并解释适用场景。

初始HEAD为a7f11a4831ab637caa3015833a5bb51d72771bef，工作区及暂存区为空，无.codegraph。首次修改前暂存门禁通过，pnpm docs:archive:check为NOT_DUE。依据[搜索发现设计](../../design/search-discovery.md)、[工作台UI](../../design/jlab-wechat-editor-ui.md)、[workspace模块](../../design/modules/workspace.md)及[静态说明页决策](../../decisions/ADR-20261016-static-discovery-pages.md)，不引入新的长期架构决定。

## 实施步骤和退出条件

- [x] 核对许可证、现行页面和免费功能，准备设计及协作记录。
- [x] 增加工作台入口、产品价值说明、源码/许可证链接与选择建议。
- [x] 同步根页搜索/分享摘要、结构化数据、插件页、README及站点地图。
- [x] 执行格式、Lint、类型、构建、模块/文档/归档检查和适用治理/契约测试，静态核对产物。
- [ ] 人类验收工作台800/1280/1440px顶栏与键盘焦点、介绍页手机/桌面阅读、链接和宣传清晰度。

## 实际结果、偏差、遗留与提交

工作台品牌旁增加“免费 · 开源”链接，底部GitHub链接明确为开源代码；介绍页首屏突出免费、MIT开源、无需注册，新增三张说明卡、源码/许可证直达入口和适用场景FAQ。插件页补充免费、开源与网页独立使用说明；根页搜索/分享摘要、JSON-LD许可证、README和站点地图同步，顺带修正宣传入口中旧配色/标题数量为18套/12款。沿用静态架构，无新增依赖、数据模型或业务模块。

实际验证：pnpm format、format:check、lint、typecheck、build、modules:check、docs:check通过；Lint为0错误/253项样式警告，构建仍有大于500kB的chunk提示。22项治理及25项共享契约测试通过。静态检查覆盖6个构建HTML、5段JSON-LD、105个本地链接/资源/锚点、安全新标签、宣传文案、免费/license字段和public资产原样复制；pnpm docs:archive:check:ci为NOT_DUE，git diff --check通过。

环境偏差：首次pnpm test因沙箱禁止测试临时仓库.git/config写入而失败，执行环境提权后47项全部通过。只描述当前免费使用与MIT开源，不作永久免费或竞品价格承诺。未创建或运行前端单元、组件、E2E及浏览器自动化；视觉及功能保留人工验收，计划和记录保持pending_human_acceptance。未推送部署或变更商店内容。关联提交由本文件Git历史定位。
