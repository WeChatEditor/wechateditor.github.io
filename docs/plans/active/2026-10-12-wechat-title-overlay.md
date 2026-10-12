---
title: ProseMirror标题适配与空页判定修正
status: pending_human_acceptance
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
---

# ProseMirror标题适配与空页判定修正

## 目标、授权与设计依据

维护者反馈0.1.10提示已有内容，但实际为本次新建文章。主动提供只读get_content：空section/span/br和display:none的mp-style-type，文字码点/媒体均为空；标题为原生空textarea、无禁用/只读，却visibility:hidden。实际父容器#js_title_main有可见ProseMirror标题覆盖层；旧判空将无法识别标题控件误报已有内容。正文样例本已满足现有emptyBody规则，不放宽真实正文保护。

起点fa0d95e71e842ca01c6ad0f2e71ca4cd0990f494，工作区/暂存为空，无.codegraph；暂存门禁通过、归档NOT_DUE。已读入口/活动计划、相关设计/有效ADR、验证/治理、归档索引和最近插件复核。依据[现行设计](../../design/wechat-transfer-extension.md)、[页面模块](../../design/modules/wechat-page.md)及[ADR](../../decisions/ADR-20261011-wechat-transfer-extension.md)。

## 实施步骤和退出条件

- [x] 先准备设计、计划/fix日志及长期决策补充，记录人工DOM证据。
- [x] 适配唯一可见ProseMirror标题，原生编辑事务写入，核对可见标题和旧textarea同步；保留原生标题兼容及真实非空保护。
- [x] 共享公开固定DOM标记，仅同步调用期间排除本次标题input，finally清除；其他真实活动继续中止，不新增消息/依赖/边界。
- [x] 分开标题未就绪、标题非空、正文非空；标题不可用在原30秒内等待，正文判空规则不变。
- [x] 交付0.1.11生产/开发/ZIP，格式、Lint、类型、构建、模块/文档、治理/契约、包一致性、diff和归档CI检查。
- [ ] 人类复验标题覆盖层同步、正文自动插入、真实内容/用户操作保护、排版与手动保存。

本次不创建或运行前端/浏览器自动化，不访问公众号站点；原生编辑事务与真实平台同步必须由维护者复验。技术完成后计划/日志保持pending_human_acceptance，本地自动提交，关联提交由文件Git历史定位。

## 实际结果、偏差、遗留与提交

适配实际可见标题覆盖层，以浏览器原生insertText事务编辑；旧textarea仅核对同步，可见标题和旧值须在2秒内一致。保留原生输入兼容与最大长度；跨独立候选冲突拒绝。MAIN及content通过共享公开固定DOM标记仅排除同步调用产生的标题input，finally清除，键盘/指针/其他input继续保护。正文判空未改，空section/br及隐藏样式标记已经符合原规则。标题控件缺失在原30秒内等待，标题/正文非空分别停止。标题同步等页面明确拒绝的原因保留在写入不确定提示中，不自动重试。

实际验证：冻结严格peer安装、format/format:check、Lint零错误（239个现行Vue警告）、全部workspace类型、Web/插件生产构建、0.1.11生产ZIP/开发包及包ID/权限/来源/ZIP一致性、模块/文档、22项治理和12项共享契约、diff与归档CI NOT_DUE通过。Web现行大chunk及本轮构建计时提示保留，均未阻断构建。证据位于ignored的.generated/wechat-title-overlay。公开常量不改变消息Schema、协议2或模块依赖；没有依赖/锁文件、权限、存储变化。

偏差/遗留：本轮没有创建/运行前端或浏览器自动化，没有访问公众号站点；人工DOM明确标题适配缺口，但原生事务、ProseMirror/旧textarea同步、正文插入、排版和保存需维护者重新加载0.1.11并刷新后复验。没有直接标题/正文HTML赋值、私有实例/API或保存/发布；不支持原生事务或平台不同步时停止，不仅宣称可见DOM成功。计划/日志保持pending_human_acceptance，工程通过后本地自动提交，关联提交由本文件Git历史定位。
