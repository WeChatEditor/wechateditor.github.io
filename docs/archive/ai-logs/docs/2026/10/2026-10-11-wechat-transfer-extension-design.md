---
title: 轻量传稿插件设计协作记录
status: completed
change_type: docs
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# AI 协作记录

## 用户目标、授权与关键指令

维护者确认官方HTTP草稿API无法使用，选择Web加轻量Chrome插件。本轮明确只设计与实施计划；首版自动新建图文并插入，用户检查后手动保存；含图片文章提示改用现有复制流程。

## 假设、选择与实际改动

起始工作区/暂存为空，git diff --cached --quiet通过，无.codegraph；归档NOT_DUE，真实HEAD为0dc7a9a7cb01cc823f9a66636ff679e6d38d5ea0。读取当前产品、UI、存储、六模块、治理/部署设计和相关ADR，核对exportArticle/ExportResult、workspace冲突锁及图片dataURL导出现状。

编写主设计、共享消息协议规格、官方证据与能力未验证边界、路线ADR、未来分阶段实施计划和本次设计计划；索引与产品增加明确尚未实现的插件入口。保持Web拥有文章/配置/版本，扩展只持有待传快照；来源/目标绑定、官方JSAPI、文字首版、手动保存、去重和uncertain恢复写入设计。

Chrome120、2MiB、24小时和各阶段超时为设计参数，需P0实际验证；公众号导航/账号识别/标题状态和JSAPI调用形态不伪造。扩展目录、依赖、Schema和模块登记均未创建，不改变当前产品运行时，不执行前端自动化、不操作公众号或推送。

## 验证、偏差、未决事项和提交

pnpm docs:check、全仓pnpm format:check与git diff --check通过；pnpm docs:archive:check:ci为NOT_DUE。首次docs:check发现未来归档链接尚未存在，调整为实际路径，通过后完成计划/日志归档并重验最终路径。本任务文档使用根Prettier配置定向格式化；未改变代码/依赖/模块登记，因此不运行Lint、类型、构建或前端自动化，不把文档门禁当作插件功能证明。

设计计划和本记录completed并归档，独立未来实施计划draft；主设计draft，ADR接受已确认路线与范围。未来插件代码尚无授权，P0至P5未执行；真实功能验收保持未来工作。适用检查通过后按仓库默认规则提交docs(wechat-transfer)，真实模型按会话开发者身份GPT-6记录，关联提交通过本记录Git历史定位；不推送、上架或操作公众号。实际trailer和归档后门禁在收尾核验，不预写未来SHA。
