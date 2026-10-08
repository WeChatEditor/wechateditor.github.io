# jlab-wechat-editor

由 CoAIForge 组合生成的独立启动工程。先阅读 [AGENTS.md](AGENTS.md) 和 [文档入口](docs/README.md)。

使用兼容 Node（^22.13.0 || >=24.0.0，推荐 24）和 pnpm（>=11.13.1 <13），执行 pnpm install --frozen-lockfile。直接依赖使用兼容版本范围；pnpm update -r 更新后重新检查并提交锁文件。工程只包含选择的应用，根 package.json 列出适用开发命令。pnpm typecheck、pnpm build、pnpm test 和 pnpm lint 执行实际 workspace 的检查，前端功能仍由人类验收。

初始归档台账未登记。按[启动指南](docs/guides/getting-started.md)完成首提交前结构验证、真实首提交和显式基线登记；没有基线时 CI 会明确失败。

项目没有预置业务、数据库或管理功能。MIT 来源声明见 LICENSE；后续升级通过版本说明与显式迁移，不覆盖现有项目。
