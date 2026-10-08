# AI 协作规则

本文件适用于整个仓库。详细规范以 [docs 入口](docs/README.md)及其现行设计为唯一来源。

## 人类内容与 Git 门禁

- 当前人类指令、维护者写入或确认的内容优先。开始时既有未提交改动视为人类内容；未经授权不得改写、回退、删除、重命名或代为提交。无法隔离时停止询问。
- 首次修改前执行 `git diff --cached --quiet`。已有暂存差异时立即停止，请维护者先提交，不得取消暂存或代为提交来绕过门禁。未初始化 Git 时先报告；无首提交时 Git 的空暂存区检查仍适用。
- 与现行实现冲突时先说明当前事实。明确授权的文档同步可修正含义明确的失配；行为意图、风险或范围不明确时询问。

## 开始与完成

- 先读 docs/README.md、活动计划，再按索引选择直接相关设计和有效 ADR。归档默认不读；排查回归、兼容性、历史或恢复方案时先读归档索引，再选一至两份。
- 非简单改动包括行为、API、数据模型、依赖、模块、跨模块数据流、架构、部署、安全、兼容性及多模块或分阶段任务。写代码前必须准备设计、`docs/plans/active/YYYY-MM-DD-<topic>.md` 和 `docs/ai-logs/<type>/YYYY/MM/` 记录；长期决定进入 ADR。
- 涉及上述内容或文档治理时，首次修改前执行 `pnpm docs:archive:check`。DUE/IN_PROGRESS 时创建或继续同一归档复核计划；BLOCKED 时保留证据并询问。未建基线按[治理设计](docs/design/documentation-governance.md)处理，不伪造 SHA。
- 完成后使设计描述最终事实，记录实际验证、偏差、遗留事项和关联提交。完成计划和日志标记 completed，移入 docs/archive 对应目录并更新索引；人类验收未完成的计划保持 pending_human_acceptance。
- 纯拼写、注释、排版或不改行为的单文件机械修改可不新建设计和计划。

## 工程与验证

- 能力放入各 workspace 的 `src/modules/<module>/`，模块名跨层一致。登记职责、边界、公共文件、依赖、数据流、失败模式及验证策略；使用 `.module-boundaries.json` 与对应模块设计维护同一边界。
- 跨模块只能导入登记的公共文件，依赖单向、显式、无循环；禁止跨模块私有状态、仓储或表操作。组装入口只组装；业务规则放入可测试模块。新功能不得扩大遗留结构耦合。
- 有名称的函数优先使用 function 声明。格式仅取根 `.prettierrc.json`；代码完成后运行 `pnpm format`，最终运行 `pnpm format:check`。已有非本任务改动存在时不得借格式化覆盖，先隔离或询问。
- 存在共享 API 契约时，Zod 运行时 Schema 为结构来源，类型由 z.infer 推导；先改契约再改调用方，后端运行时校验输入。HTTP、分页与错误约定见[模块规范](docs/design/module-boundaries.md)。
- 前端不创建或运行单元、组件、E2E、浏览器自动化测试，除非用户明确要求。AI 执行格式、Lint、类型和生产构建；前端功能由人类验收。后端、契约和治理脚本执行适用测试。
- 最终执行适用检查和 `pnpm docs:archive:check:ci`。首提交前仅可使用明确的 bootstrap 检查；有真实提交后登记真实基线再运行正常审计。

## 提交与记录

- 允许提交类型和 AI 日志分类：chore、docs、feat、fix、refactor、style、test、ci、build、revert。标题使用 `<type>(<topic>)?!: <summary>`；topic 为可选提交标签。
- 完成且适用验证通过后默认自动提交，用户明确暂不提交时除外。失败、任务未完成或改动归属不明时不勉强提交。
- 每个 AI 提交末尾在空行后添加 `Co-Authored-By: -AI- [真实模型名称] <ai@scaffold-proj.com>`。方括号为说明占位，不得照抄；不得填产品名、简称或猜测身份。身份不明确时停止提交。用 `git log -1 --format=full` 核验实际 trailer。
- 日志记录目标、指令、假设、选择、实际改动、验证和未决事项，不复制完整聊天，不写敏感信息；日志不能代替现行设计。

## 可选工具

已有 `.codegraph/` 且 CodeGraph 可用时，定位代码优先用 codegraph explore；缺失或结果不相关时用 rg 和定向读取。RTK 已安装时可使用；缺失时用标准命令。不自动安装辅助工具或创建索引。
