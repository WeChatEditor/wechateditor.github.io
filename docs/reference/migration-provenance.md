# 迁移来源清单

来源Cyber-Sight提交2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4；人类目标首提交b86bf90444a12ae7560eecc2ae03f7b65a6b3ff0，模板/CLI0.2.0，快照d07a9fcac33cbc1d40e57ab2c9de46cfaa8c80f9。源码保留MIT版权/许可。

| 来源                                       | 目标与处理                                     |
| ------------------------------------------ | ---------------------------------------------- |
| apps/wechat-editor/src/platform/modules    | apps/frontend/src/modules，六模块复制适配      |
| src/platform/app.config.ts                 | src/app.config.ts，仅移路径、去示例原稿        |
| src/main.ts、App.vue、index.html、env.d.ts | 迁入目标应用组装/产品标题                      |
| 原package/tsconfig/Vite/锁                 | 合并目标工具链，重新解析锁；不复制源锁         |
| 原产品/UI/存储/模块/迁移设计               | 重写目标当前规范，并保留source-designs详情快照 |
| 三份桀士ADR                                | 迁入decisions，保留日期、适配事实与来源        |
| 公众号兼容与原站研究/截图                  | 迁入reference，保持研究证据，不继承通过结论    |
| 来源历史计划/AI日志/ledger/scope/Forge     | 不迁入，链接固定来源查证                       |

- [docs/platform/design/apps/jlab-wechat-editor.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/apps/jlab-wechat-editor.md) → [目标](source-designs/jlab-wechat-editor.md)
- [docs/platform/design/apps/jlab-wechat-editor-ui.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/apps/jlab-wechat-editor-ui.md) → [目标](source-designs/jlab-wechat-editor-ui.md)
- [docs/platform/design/apps/jlab-wechat-editor-storage.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/apps/jlab-wechat-editor-storage.md) → [目标](source-designs/jlab-wechat-editor-storage.md)
- [docs/platform/design/modules/wechat-editor.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/modules/wechat-editor.md) → [目标](source-designs/wechat-editor.md)
- [docs/platform/design/apps/jlab-wechat-editor-migration.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/apps/jlab-wechat-editor-migration.md) → [目标](source-designs/jlab-wechat-editor-migration.md)
- [docs/platform/design/wechat-editor-wechat-compatibility.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/wechat-editor-wechat-compatibility.md) → [目标](wechat-editor-wechat-compatibility.md)
- [docs/platform/design/wechat-editor-research.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/wechat-editor-research.md) → [目标](wechat-editor-research.md)
- [docs/platform/design/assets/wechat-editor-research.png](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/assets/wechat-editor-research.png) → [目标](assets/wechat-editor-research.png)
- [docs/platform/decisions/ADR-20261004-jlab-wechat-editor-standalone-app.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/decisions/ADR-20261004-jlab-wechat-editor-standalone-app.md) → [目标](../decisions/ADR-20261004-jlab-wechat-editor-standalone-app.md)
- [docs/platform/decisions/ADR-20261005-jlab-local-storage-history.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/decisions/ADR-20261005-jlab-local-storage-history.md) → [目标](../decisions/ADR-20261005-jlab-local-storage-history.md)
- [docs/platform/decisions/ADR-20261008-jlab-independent-repository.md](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/decisions/ADR-20261008-jlab-independent-repository.md) → [目标](../decisions/ADR-20261008-jlab-independent-repository.md)
