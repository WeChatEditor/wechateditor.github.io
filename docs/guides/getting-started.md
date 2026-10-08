# 新工程与真实归档基线

1. 安装指定 Node/pnpm，执行 pnpm install --frozen-lockfile。
2. 执行 pnpm format:check、pnpm lint、pnpm typecheck、pnpm build、pnpm test、pnpm modules:check、pnpm docs:check。空模板维护工程用 pnpm templates:verify 验证应用组合。
3. 尚无 Git 时 git init，然后 pnpm prepare。首提交前执行 pnpm docs:archive:check:bootstrap；输出 INITIALIZATION_REQUIRED 是明确初始化状态，只有结构通过且无首提交时该命令成功。
4. 创建真实首提交，标题满足提交类型；AI 提交须真实模型 trailer。用 git rev-parse HEAD 读取完整 SHA，执行 pnpm docs:archive:init -- --baseline <完整 SHA>。该操作要求干净工作树，将已审查提交和文档集合登记为基线。
5. 提交台账，再执行 pnpm docs:archive:check:ci。CI 不接受未登记基线或未完成复核。日常开发按 AGENTS 与文档治理执行。

归档达到 DUE 时先创建 type: documentation-archive-review 的活动计划，更新当前设计/ADR 后归档完成记录并提交审查内容。对这个真实提交执行 pnpm docs:archive:complete -- --baseline <完整 SHA>，然后提交台账。复核脚本拒绝活动复核未完成、虚构提交或脏工作树。

Git hooks 仅格式化已暂存完整文件，遇到部分暂存直接报错，不擅自覆盖未暂存内容。提交检查无法识别人类没有标记的 AI 身份；AI 应使用 AI_COMMIT=1 启用缺失 trailer 硬检查，并在提交后人工读取日志核验。CI 校验所有可识别 trailer 与标题。
