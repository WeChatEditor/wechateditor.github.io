---
title: 补充插件隐私披露
status: pending_human_acceptance
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 补充插件隐私披露

## 目标、授权与设计依据

维护者在商店隐私申报文案之后要求补充官网隐私说明，范围为当前网址与可能的会话参数、用户操作中止保护、有限数据用途和保留期限。依据[搜索发现设计](../../design/search-discovery.md)、[静态说明页决策](../../decisions/ADR-20261016-static-discovery-pages.md)、插件现行实现及[本次日志](../../ai-logs/docs/2026/10/2026-10-19-extension-privacy-disclosure.md)。不更改插件行为、权限、身份或存储。

开始时暂存为空，HEAD为16ed27c73c18710a71693d46a08c470f0836b72f，无.codegraph，归档NOT_DUE。现有Markdown卡片任务占用四个共享索引及独立设计/ADR/计划/日志和sources目录；本任务不改写、格式化、暂存或提交这些既有内容。独立计划与日志从现行设计互链，不修改已被占用的共享索引。

## 实施步骤与退出条件

- [x] 核对Git门禁、归档状态、实际实现和现行隐私页，先更新设计并准备日志。
- [x] 补充官网隐私页的网址/会话参数、操作事件、有限用途及数据保留，更新日期与目录。
- [x] 同步商店隐私填表依据，区分确定的数据处理事实与分类建议，不把本机处理写成无数据。
- [x] 完成本任务范围格式化、只读全仓检查、生产构建和静态HTML/链接/JSON-LD核对；首轮并行任务格式/类型阻断在其自行更新后复核通过。
- [x] 全仓门禁恢复后按仓库规则准备仅提交本任务五个文件，不包含并行任务改动。
- [ ] 维护者验收页面阅读和目录导航；实际部署后再确认线上政策与商店申报一致。

## 实际结果、偏差、遗留与关联提交

已更新apps/frontend/public/privacy/index.html，新增“网址、会话参数和页面操作”及“数据用途与限制”，同步权限用途、日期、JSON-LD dateModified和侧边目录。说明当前允许站点URL的本机匹配与导航、完整公众号链接可能含会话参数、不建立历史档案、不记录具体按键/鼠标轨迹/输入过程，以及用户发送/复制的接收位置。有限用途涵盖不出售、不发往维护者或无关第三方、不作广告画像/无关用途/信贷；保留快照与账号偏好各自的清理事实。商店参考新增事实核对表，认证信息保守分类明确为根据实际URL及表单定义判断，不冒充已核对后台。

2026-10-19：本任务五个文件按根Prettier配置限定格式化及检查通过；Lint完成，0 error/244 warning；生产frontend构建、docs:check、modules:check、diff及归档CI通过（NOT_DUE）。只静态解析构建HTML，8个section、20处站内链接/资源、唯一锚点、单一主标题、JSON-LD及dateModified有效，构建隐私HTML与源文件一致，页面无可执行脚本。保留原有前端500kB体积提示，不新增或运行前端测试、浏览器自动化。

首轮全仓format:check报告非本任务article-editor.vue格式不符；typecheck中frontend被并行卡片功能article-cards.ts的MarkdownIt类型及隐式any错误阻断。本任务未修改这些文件，也未因检查失败覆盖、暂存或提交他人改动。并行任务自行更新后，最终全仓format:check与所有workspace的typecheck均复核通过，已具备本任务独立提交条件。期间另一个独立about页提交使HEAD推进至b050ee561f3e2cec61b76188bbc38be64dd25008，不属于本次修改。

为保护初始及持续出现的非本任务改动，不执行会重写全仓的pnpm format，改为同一根配置的限定文件格式化，最终仍执行只读pnpm format:check。共享索引保留，由现行设计链接独立计划和日志。关联本地提交标题docs(privacy): clarify extension data handling，实际SHA通过本文件Git历史查询并在提交后核验真实模型trailer。本次未推送、未部署，线上页面尚未因此更新；维护者仍需验收阅读和导航，并在实际发布后核对官网与商店申报一致。计划与日志保持pending_human_acceptance。
