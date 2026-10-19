---
title: 补充插件隐私披露
status: pending_human_acceptance
change_type: docs
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 补充插件隐私披露

## 用户目标、授权与关键指令

维护者要求将前序隐私申报核对结果补充到官网隐私页。开始时暂存为空，归档NOT_DUE；其他Markdown卡片任务的共享索引、设计/ADR/计划/日志与sources为既有人类内容，保留且不代提交。当前授权为本地页面和说明补充，不含上传商店或发布网站。

## 假设、选择与实际改动

遵循[搜索发现设计](../../../../design/search-discovery.md)和[实施计划](../../../../plans/active/2026-10-19-extension-privacy-disclosure.md)。依据已核对代码：工具栏读取允许站点URL；页面适配器在独立新建流程复用公众号后台完整URL，可能含会话参数；content仅上报发生真实操作，不传按键字符或输入过程。文章快照/任务/回执按24小时有效期在读取或处理命令时清理，所选账号偏好不随快照到期删除。本次只补充真实处理方式及用途，不声称Google已审核或所有认证数据均不涉及。

## 验证、偏差、未决与提交

已更新隐私页两个新章节、权限用途、日期、目录及JSON-LD dateModified；现行搜索发现设计与商店参考同步事实。涉及文章/账号本机处理、URL与可能会话参数、只检测操作发生以中止写入、有限用途与用户指定接收平台，继续区分24小时内容清理及独立账号偏好。未改插件权限、身份、代码或数据机制。

本任务五个文件使用根配置限定格式化与检查通过。首次通过PowerShell向pnpm传数组时，参数被合并成一个文件模式，未修改任何文件；改为逐项显式参数后格式化成功。Lint 0 error/244 warning；frontend生产构建、文档/模块/diff检查和docs:archive:check:ci通过，归档NOT_DUE。原有500kB体积提示保留。构建产物只读解析通过：8个section、20处站内链接/资源、锚点唯一、一个主标题、JSON-LD/dateModified有效，无可执行页面脚本，隐私页与源码逐字节一致。没有创建或运行前端测试、浏览器自动化或商店操作。

首轮全仓format:check由非本任务article-editor.vue阻断；typecheck中frontend的并行article-cards.ts出现MarkdownIt作为类型和两个隐式any错误。本任务未修改或代提交这些人类内容。并行任务自行更新后，最终全仓format:check及全部workspace类型检查均复核通过，准备按仓库规则独立提交本任务五个文件。过程中独立about页提交推进HEAD至b050ee5，不归入本任务成果。

为保护非本任务改动，没有运行全仓写入格式化，使用同一根Prettier配置限定文件格式化，最终仍运行只读format:check。共享索引保持原样，新增计划/日志从现行设计互链。关联本地提交docs(privacy): clarify extension data handling，实际SHA通过本文件历史查询，提交后核验真实模型trailer。本次未推送或部署，官网线上内容尚未由本次修改更新；页面阅读/导航、上线及商店申报仍需维护者确认。计划与日志保留pending_human_acceptance。
