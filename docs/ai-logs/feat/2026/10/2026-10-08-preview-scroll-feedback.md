---
title: 手机缩放、同步滚动与操作反馈
status: pending_human_acceptance
change_type: feat
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 手机缩放、同步滚动与操作反馈

维护者明确授权[计划](../../../../plans/active/2026-10-08-preview-scroll-feedback.md)四项实现、提交与推送。开始暂存区/工作区为空，无.codegraph；现行设计原先规定片段不自动启用，本轮按明确指令同步更改。历史记忆仅用于识别功能/静态验证边界，源码和本仓库文档为当前依据。

pnpm11脚本前隐式依赖检查生成allowBuilds占位并失败，仅清理本轮工具生成的占位，保留原onlyBuiltDependencies。直接node运行同一归档脚本得到NOT_DUE；选用项目CI的pnpm10.26重跑。UI采用临时缩放/同步状态，不改变配置或历史协议，不新增依赖/模块/ADR。1:1保持CSS像素和文章宽度、缩短可用壳高度，保证文章在壳内滚动。同步通过既有公共组件props/events/暴露方法编排，协调器私有于workspace。

article编辑器/预览公开当前滚动元素和滚动事件；预览观测画板与文章布局、区分内外滚动容器，顶部提供缩放提示/切换与同步开关。workspace私有协调器以百分比、帧调度、按时间平滑追随与自身写入标记避免回环；支持另一侧接管、零范围、减少动态效果以及停用/卸载清理。片段追加以单次patch启用结尾。store成功复制定时2500ms复位、重复复制重计时，改稿/卸载取消并拒绝过期异步反馈；按钮绿色且颜色平滑过渡。

2026-10-08 Windows Node24.18.0/pnpm10.26.0：冻结严格peer安装、format/format:check、Lint（零error/既有225条warning）、TypeScript、模块/文档检查、构建、21项治理测试、commits:check和diff检查通过；归档CI为NOT_DUE。JS536.02kB/gzip193.08kB，保留原500kB提示。pnpm10切换需要重建node_modules，首次非TTY安装拒绝；设置仅该进程CI=true后按原onlyBuiltDependencies完成，网络ECONNRESET自动重试成功。配置/锁文件无变更。

未运行前端测试/浏览器自动化。视觉、滚动、刷新/复制与公众号人工验收待维护者，计划和日志保持pending_human_acceptance；百分比同步不保证段落对应，1:1指CSS像素而非系统物理像素。模型身份依据当前指令GPT-6，提交后核验trailer；关联提交由Git历史定位，维护者明确授权推送origin/master。

技术提交`6d58462bffa15e9b532fbd97358ba96887a34959`已推送origin/master，git ls-remote确认远端同SHA且工作区干净；真实GPT-6 trailer已用git log -1 --format=full核验。沿用本仓库最近提交的维护者作者，仅单次git -c配置，不改全局/仓库作者配置。此文档补记单独提交推送，远端CI/Pages及人工功能验收另行区分。

## 控件布局与交互修订

维护者要求缩放radio button及精简文案、与比例提示横排放手机上方，仅开壳手机显示；同步去掉图标，外壳改active按钮，统一预览按钮交互。开始工作区/暂存区为空，NOT_DUE；先读活动计划/现行设计。记忆提示Radio子组件需显式注册，当前main.ts已确认具备组件注册和样式。设计/本计划/日志先行，保留新增favicon已提交内容，沿用本会话提交推送授权，前端人工验收保留。

article-preview将缩放下拉框/比例迁入模型上方独立横排行，改现有radio button，文案与可见条件按指令；不进入zoom，ResizeObserver自动依据剩余stage高度算缩放。外壳改ui-button、disabled/aria-pressed与active，同步无图标，专注补active；手机/电脑及缩放radio使用浅蓝active/主色文字、同一hover逻辑，共用ui-button选中hover保留高亮。滚动算法/外壳逻辑尺寸/配置默认值不变。源码搜索确认旧checkbox/图标/select样式均移除；一次PowerShell正则转义搜索失败，改固定字符串搜索后确认。

format/format:check、Lint零error/221条warning、TypeScript、生产构建、模块/文档和diff检查通过；归档CI为NOT_DUE。JS534.39kB/gzip192.54kB，保留原500kB提示。未改治理脚本，无需重复治理测试，未执行前端自动化；人工确认手机上方布局、条件显示、窄栏/键盘/active/缩放效果。关联提交由Git历史定位，提交后核验真实GPT-6 trailer与远端SHA。

## 缩放选项文案修订

2026-10-08：维护者要求手机阅读外壳的比例切换文案改为「自适应 / 原始大小」。起始工作区与暂存区为空，归档检查NOT_DUE。仅替换两个选项文字并同步现行设计与前端说明，fit/actual值、显示条件及缩放行为不变。属于机械文案修订，继续现有计划与日志；原计划的人工验收状态保持不变。

文案修订验证：Lint、类型检查、生产构建、文档检查及归档CI通过；Lint保留既有warning，构建保留既有包体积提示。未执行前端自动化，界面由人类验收。关联提交由本文件Git历史定位。
