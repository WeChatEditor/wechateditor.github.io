# 来源文档：桀士排版独立仓库迁移

2026-10-08从[Cyber-Sight固定提交](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/apps/jlab-wechat-editor-migration.md)迁入的来源材料。以下日期、实施状态和验证结果属于来源仓库或当时调研，**不是目标工程的当前验收记录**。原稿保留细节；目标当前事实以[现行设计](../../design/README.md)为准。研究建议不自动成为目标功能。

---

# 桀士排版独立仓库迁移

## 目标与授权边界

维护者确认将桀士排版迁入独立仓库和目录 `JLabWeChatEditor`，英文名称沿用 JLab WeChat Editor，完整保留当前功能与界面，先完成独立运行。目标采用 CoAIForge 0.2.0 前端工程和单项目协作规范，逐项验证业务依赖兼容性。首次打开原稿为空，保留默认配色和排版设置；不迁移源应用浏览器数据。

本轮交付设计与实施计划，不执行工程创建、代码迁移、远端仓库创建、推送或部署。本文保存在来源仓库，因此声明 `scope: platform`；目标工程使用单项目 docs，不携带 Foundation/Platform 所有权和 Forge 同步机制。部署平台与域名尚未确定，本阶段的实现交付为可独立安装、开发和静态部署的应用。

## 当前事实与来源基线

2026-10-08 核对来源 HEAD 为 `64a67f2fdcec0df8b2012359237e1aa8bd813216`。源应用在 `apps/wechat-editor/`，包名 `@jlab/wechat-editor`，共有六个业务模块。定向读取源码导入、入口、配置和存储适配器，未发现对 `apps/frontend`、`apps/backend` 或 API 契约包的业务导入。工程仍依赖根 TypeScript 配置、锁文件、Lint、格式与文档治理，不能只复制 src 就宣称独立。

目标模板基线采用 create-coaiforge 0.2.0，而不是随时间变化的 latest。CoAIForge 本地记录的发布快照来源为 `d07a9fcac33cbc1d40e57ab2c9de46cfaa8c80f9`；实施时核对实际包版本及生成清单，不将本轮读取发布记录当成再次执行 npm 消费验证。源应用若在实施前发生变化，重新审查差异并登记实际来源 SHA，不机械覆盖维护者改动。

现行产品、UI、存储和模块设计仍描述 Cyber-Sight 中的源应用。此设计不将它们提前改为“已迁移”，不把尚未完成的公众号人工验收写为通过。

## 范围与非目标

保留桌面纯前端单页、800px 最小宽度、52px 单层工具栏、五类覆盖抽屉、可拖拽双栏、手机/电脑阅读外壳和专注预览。保留 Markdown 编辑/快捷格式/导入、局部标注、配色总计 1 至 9 组、九种章节样式与独立编号、字体间距、固定结尾、本地保存、主动文章版本、诊断及 HTML/纯文本剪贴板输出。

仅首次初始化正文从示例文章改为空原稿。默认六组配色、当前默认排版参数、默认结尾片段及其启停规则沿用来源；首次历史为空，无旧标注或素材。空文在默认未启用结尾时显示 0 字/0 分钟。不将“空数据”解释为删除默认设置或移除本地持久化能力。

不增加账号、云同步、后端、共享 API 契约、手机工作台、AI 排版、文章包、插图或 Markdown 下载按钮。无跨 origin 的备份导入导出功能，不扫描、复制、删除旧浏览器存储，不修改源应用行为。业务模块不进入 CoAIForge 模板仓库；本阶段不设计通用模板升级工具，不迁移 Geo，不承诺微信输出保真。

## 目标工程与所有权

采用 frontend 预设，保留 `apps/frontend` workspace；迁入桀士排版时替换模板 App 与 introduction 页面，删除未使用的 introduction 模块、设计和注册项。两者是目标工程生成内容，不从 CoAIForge 维护仓库删除。目标 CLI 项目名使用小写 `jlab-wechat-editor`，与大小写目录名区分：

```sh
npm create coaiforge@0.2.0 JLabWeChatEditor -- --preset frontend --name jlab-wechat-editor
```

命令是未来实施步骤，本轮未运行。目标包名建议为 `@jlab-wechat-editor/frontend`，由生成结果确认并写入目标设计。本地父目录、远端地址、默认分支和仓库是否已创建在实施前核对；不凭目录名推断存在 GitHub 仓库。

```text
JLabWeChatEditor/
├─ AGENTS.md
├─ apps/frontend/
│  ├─ src/main.ts / App.vue / app.config.ts
│  ├─ src/modules/
│  │  ├─ article/
│  │  ├─ typesetting/
│  │  ├─ ending/
│  │  ├─ assets/
│  │  ├─ wechat-export/
│  │  └─ workspace/adapters/
│  └─ package.json / index.html / vite.config.mts / tsconfig.json
├─ .module-boundaries.json
├─ docs/design/modules/及产品、UI、存储设计
├─ docs/decisions/、plans/active/、ai-logs/、archive/
├─ scripts/及 .github/workflows/
└─ package.json / pnpm-workspace.yaml / pnpm-lock.yaml
```

应用入口只组装 Vue、Pinia 和 Element Plus 实际使用的组件及样式。应用配置放入 `src/app.config.ts`，按目标检查器登记为组装文件；不复建 `src/platform`。目标 repo 不包含 backend、api-contract、管理壳、PRISM、Cesium、Forge 同步文件、来源 Git 历史或来源 ledger SHA。

## 模块公共接口与依赖

迁移保留职责和服务名，路径由 `src/platform/modules/<module>` 改为 `src/modules/<module>`。具体公共文件沿用[现行模块设计](wechat-editor.md)，实施时登记到 `.module-boundaries.json` 并为六个模块分别建立目标设计。

| 模块          | 主要公共能力                                        | 允许模块依赖                         |
| ------------- | --------------------------------------------------- | ------------------------------------ |
| article       | article.model/service、article-editor/preview       | typesetting 的公共颜色组件           |
| typesetting   | typesetting.model/service、panel、color-picker      | 无                                   |
| ending        | ending.model/service、ending-panel                  | article                              |
| assets        | assets.model/service                                | 无                                   |
| wechat-export | wechat-export.model/service                         | article、typesetting、ending、assets |
| workspace     | workspace.store、draft-storage.port、workspace.page | 其他五模块                           |

workspace 拥有本地草稿、配置、历史版本与保存编排，仓储适配、workspace.service、历史面板和状态仍为私有。不得为了迁移方便公开全部文件或引入 barrel。组件使用 props/events；业务服务不反向依赖 store。

目标使用 CoAIForge 的 `modules:check` 作为单一注册来源，移植源应用检查器中的产品禁止依赖约束时先检查目标工具覆盖，避免保留两套漂移的公共文件清单。验收检查器是否覆盖 `.vue`、字面量动态导入、私有导入、未登记模块和循环；仅治理工具可运行适用自动化测试，不因此扩大前端测试边界。

## 数据模型、初始化与 origin

保留现有 ArticleDocument、Annotation、TypesettingConfig、FixedEnding、PreparedAsset 和 WorkspaceDraft 模型。数据库版本 2 与草稿格式 2、配置格式 1 继续使用，保留未知格式保护、多页面冲突、串行写入与旧格式兼容分支；不需要旧数据搬迁不等于授权重写存储协议。

| 数据                             | 当前键/库                                         | 目标规则                                  |
| -------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| 排版、配色、结尾、分栏与预览偏好 | localStorage `jlab-wechat-editor:settings`        | 保留键名及即时保存语义                    |
| 最近颜色                         | localStorage `jlab-wechat-editor:recent-colors`   | 保留能力，首次为空                        |
| 当前文章与素材                   | IndexedDB `jlab-wechat-editor` / drafts / current | 保留 450ms 防抖、事务确认和 writeId       |
| 主动文章版本                     | 同库 versions                                     | 首次为空，继续使用时间戳键与明确恢复/删除 |
| 文章变化通知                     | BroadcastChannel `jlab-wechat-editor-draft`       | 保留现有并发通知，writeId 不依赖通知      |

浏览器存储按 origin 隔离，路径或仓库目录变化不提供隔离。目标本地建议使用 `127.0.0.1:5175` 开发、`127.0.0.1:4175` 预览并启用 strictPort，避开源应用 5174/4174；实施前确认端口空闲。生产使用独立 HTTPS origin。未定 origin 前不能宣称新站已安全隔离；不要在源站同 origin 测试“空数据”，也不通过清空源存储实现空初始化。保留键名用于协议稳定，不意味着自动继承源数据。

数据流仍为：入口初始化 → workspace 加载配置/current → article 解析与标注 → typesetting/ending 生成样式内容 → assets 准备素材 → wechat-export 受控清洗及复制。UI 临时状态不持久化，阅读外壳不参与标注或输出。

## 工具链、依赖与许可

使用 CoAIForge 0.2.0 的 Node/pnpm 兼容策略、Vue/Vite/TypeScript、Lint、格式、hooks、CI 和治理脚本。来源 package 声明为 Vue ^3.4、Pinia ^2.2、Element Plus ^2.14.3、Markdown-it 15.0.2、DOMPurify 3.4.16，Vite ^5.4、TypeScript ^5.5、vue-tsc ^2.1；目标模板使用 Vite ^8.3.3、TypeScript ^6.0.3、vue-tsc ^3.3.12。这些是本地声明快照，不是最新版本推荐。

迁入 Pinia、Element Plus、Markdown-it、DOMPurify 及实际类型依赖时，核对官方兼容资料和 peer 要求，选择与目标工具链兼容的明确范围并登记理由。不一概升级业务依赖到 latest，也不关闭严格 peer、类型或 Lint 检查来迁就冲突。无法兼容时报告具体证据，重新确认方案。

以目标生成配置为基准合并配置，不复制源 monorepo 锁文件。更新目标锁并进行严格 peer 安装、冻结安装验证；保留按需 Element Plus 注册和主题样式，特别检查 Drawer、RadioGroup/RadioButton 和 MessageBox。保留 Vite 相对 base 与 ES2022 构建目标，验证根路径和子路径静态服务。

保留 MIT 来源版权，逐项登记迁入代码、依赖和素材许可。旧来源设计、ADR 仅按当前适用规则重写为目标现行规范，不复制已完成计划、AI 日志、验收结论、所有权 frontmatter 或审计基线。目标 README 明确产品、命令、纯前端数据边界与人工验收状态。

## 失败模式与验证

| 风险                                 | 处理与退出标准                                                    |
| ------------------------------------ | ----------------------------------------------------------------- |
| 框架升级造成类型、插件或 UI 变化     | 分开验证工具链和业务依赖；静态检查通过后仍需人工验收              |
| 机械移路径遗漏私有导入或根配置       | 全量目标模块注册与构建；脱离源仓库安装运行，不使用源 node_modules |
| 同 origin 误读旧数据                 | 先确认独立 origin；原稿空、历史空、无旧素材，保留源存储           |
| 源/目标双处修改                      | 固定来源 SHA 和提取清单；迁移期产品修改逐项记录，不自动双向同步   |
| Clipboard、IndexedDB、图片 CORS 失败 | 沿用诊断、拒绝复制和保存暂停规则，不能用成功提示掩盖失败          |
| 历史人工验收未完成                   | 目标重新逐项验收，不将源构建成功继承为公众号验收                  |
| 静态资源子路径或部署配置失配         | 本地静态服务验证根路径与子路径，正式发布 origin 与平台另行确认    |

AI 可执行冻结/严格 peer 安装、格式、Lint、TypeScript、生产构建、模块、文档、治理脚本测试、bootstrap/归档和提交规范检查。未授权前端自动化，因此不创建或运行前端单元、组件、E2E 或浏览器自动化。

维护者验收 800×720、1280×720、1440×900 与 125% 缩放，覆盖初始化、刷新恢复、中文 IME/撤销、抽屉与拖拽、选区标注、历史新增/恢复/删除、并发与失败、配色边界、结尾、阅读外壳及剪贴板。公众号粘贴、保存再打开、微信明暗阅读为单独人工关卡，记录浏览器/微信版本与实际缺失项，不将候选输出 profile 直接升为已验收。

## 交付、切换与回滚

迁移先复制并适配到目标，保留 Cyber-Sight 源应用及其现行文档，源数据不动。目标通过静态检查并形成带真实模型 trailer 的技术交付提交后，功能未验收时计划保留 `pending_human_acceptance`；待人类验收后完成归档与来源交接。默认自动提交不等于授权推送、发布或删除源应用。

生产域名未定，不执行正式访问切换。未来切换失败时恢复旧访问入口并使用保留的源应用；源/目标新写数据彼此独立，本阶段不提供自动合并或回写，不能承诺零数据损失回滚。删除源应用、停止维护或改变其菜单/构建入口须另行明确授权。

## 未决事项与关联

实施前核对目标父目录、仓库实际状态、远端与分支；部署时确认平台、域名和 base。这些不阻碍本轮设计交付，但分别阻止未经确认的目标写入与正式发布。

- [迁移决策](../../decisions/ADR-20261008-jlab-independent-repository.md)
- [实施计划](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/plans/active/2026-10-08-jlab-independent-migration.md)
- [源产品设计](jlab-wechat-editor.md)、[UI](jlab-wechat-editor-ui.md)、[存储](jlab-wechat-editor-storage.md)
- [独立协作模板路线](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/ai-collaboration-starter.md)

设计与计划编制的实际验证、偏差和关联提交由 Platform 归档索引中的本轮协作记录追溯。
