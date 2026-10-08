# 来源文档：桀士排版内部模块边界

2026-10-08从[Cyber-Sight固定提交](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/design/modules/wechat-editor.md)迁入的来源材料。以下日期、实施状态和验证结果属于来源仓库或当时调研，**不是目标工程的当前验收记录**。原稿保留细节；目标当前事实以[现行设计](../../design/README.md)为准。研究建议不自动成为目标功能。

---

# 桀士排版内部模块边界

独立交付边界为 apps/wechat-editor。六个实际模块均在 src/platform/modules 内；无 Foundation、后台、契约、路由和空目录。

| 模块          | 职责与数据所有权                                                                   | 登记公共文件                                                                                      | 依赖                                 | 失败模式与人工验证                                                                 |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| article       | Markdown语义、序列化正文标注、快捷格式和阅读UI；不拥有完整草稿                     | article.model.ts、article.service.ts、article-editor.vue、article-preview.vue                     | typesetting公开颜色控件              | 输入法/撤销、跨强调/链接/段落选区；拒绝代码/图片/结尾/装饰；改稿歧义失效           |
| typesetting   | 颜色角色、初始化六组、总计1至9组的可编辑配色、九种章节、间距字体、对比度和颜色控件 | typesetting.model.ts、typesetting.service.ts、typesetting-panel.vue、typesetting-color-picker.vue | 无其他模块                           | 低对比度、设备字体、最近色存储失败；配置共用于预览和复制                           |
| ending        | 独立 Markdown 和启用模型；不写正文、不编号                                         | ending.model.ts、ending.service.ts、ending-panel.vue                                              | article                              | 启停、只追加一次、设置保存、刷新恢复                                               |
| assets        | 浏览器图片准备/尺寸、稳定 id/Blob、临时 URL 生命周期                               | assets.model.ts、assets.service.ts                                                                | 无其他模块                           | 缺图、CORS、解码、格式、大小、过期结果和 URL 释放                                  |
| wechat-export | 显式只读快照、受控 DOM/内联、候选微信输出、剪贴板                                  | wechat-export.model.ts、wechat-export.service.ts                                                  | article、typesetting、ending、assets | 素材失败阻止复制；权限失败保留结果供重试；真实粘贴保存由人类验收                   |
| workspace     | Pinia 命令编排、配置 localStorage、文章 current/主动版本 IndexedDB；抽屉/分栏 UI   | workspace.store.ts、draft-storage.port.ts、workspace.page.vue                                     | 上述五模块                           | 配额/恢复异常显示失败；未知版本不覆盖；多页面冲突暂停；迁移/历史恢复和删除人工验收 |

Vue 公共文件是登记的呈现入口，使用 props/events 接受模型和命令，不读取其他模块的私有 store。App.vue 仅组装 workspace.page.vue，main.ts 注册 Vue/Pinia/Element Plus。workspace.service.ts、工作台子组件和 adapters/indexeddb-storage.ts 均为私有。

2026-10-06 UI改造补充：typesetting公开登记`typesetting-color-picker.vue`，article允许单向依赖此公开颜色控件，不读取其私有配置；typesetting不依赖article。公共`chapterPreview`复用章节装饰规则。`article.service.ts`新增`removeAnnotations`，仅剪除选区内有效颜色标注并保留两侧片段和其他语义。workspace私有`workspace-feedback.vue`和`workspace-theme.css`拥有稳定反馈与应用tokens，均不进入导出。类型、公共文件与单向依赖由应用边界检查同步登记。

初始配色调整为暖金、青绿、墨色、清透蓝、复古潮流、活力橙六组，所有配色均可改名、更新颜色和删除，总计1至9组，可重置为默认六组；旧配置补齐配色列表并保留实际颜色；新草稿默认清透蓝、便签引用底色。颜色控件的最多8个最近色属于可丢弃应用偏好，独立localStorage键，不参加文章版本。Element Plus新增ColorPicker及ColorPickerPanel/Input/Popper样式；配色改名使用ElMessageBox.prompt及显式MessageBox样式，通过既有change事件保存配置，入口显式注册ColorPicker；阅读外壳开关与气泡坐标为article临时UI状态。

Element Plus 在 main.ts 按需显式注册；模板使用 Button、Option、Select、Slider、Switch、Drawer、RadioGroup 和 RadioButton，入口同时导入对应 theme-chalk 样式。RadioGroup 和 RadioButton 是 withNoopInstall 子组件，不能用单独的 app.use 注册，必须使用 app.component 显式登记。Option 由 Select 的安装器一并注册。增加控件时必须核对实际安装器行为、入口注册与样式，不能只依赖 vue-tsc、构建或入口存在 .use 调用判断运行时可用。桌面显示仍由维护者人工验收。

数据流：正文/设置事件 → workspace 命令 → 各模块公共领域服务 → 同一快照的预览/输出。配置/固定结尾/偏好 → 私有 local-settings-storage 适配 → localStorage 同步覆盖；文章/标注/必要 Blob → draft-storage.port → IndexedDB current，主动新增版本才写 versions。文章操作排队、事务内检查 writeId；历史恢复只替换文章，配置不回滚。设置事件不写文章，结尾修改不触发素材清理。临时 DOM Range、抽屉、复制结果和 focus 不入库。预览渲染不持久化生成 HTML。完整模型和旧格式迁移见[存储设计](jlab-wechat-editor-storage.md)。

标注采用正文可着色文本的渲染偏移。每个 Markdown 文本 token 的 span 登记起止位置；选区转换为跨 token 的文本区间。纯样式修改不改变偏移；正文变更计算公共前后缀，仅迁移确定的区间，重复锚点或改动区间失效。源码不嵌入颜色标签，重叠后写优先、相邻同色合并。未采用模糊匹配或纯 DOM 包裹。

新增本地插图和 Markdown 下载命令已移除。旧草稿图片通过 asset:id 恢复；数据库保存 Blob，预览临时 object URL。HTTPS 图片可预览，导出 fetch/CORS 失败阻止复制。PNG/JPEG/WebP 大图等比缩到 1440×2400；WebP 转 PNG，保留透明；GIF 保持动画，大 GIF 超尺寸阻止导出。相对路径不扫描文件夹。原始 HTML 禁用，作为文本显示；所有预览/复制 HTML 来自受控解析和代码生成样式，经 DOMPurify 清洗。站外链接复制成可见网址。

应用内 scripts/check-boundaries.mjs 用 TypeScript AST 检查源文件依赖、公开文件、注册模块和依赖方向，覆盖 .ts/.vue 及字面量动态导入。仓库旧 architecture:check 不覆盖新应用；新应用 build 自动执行应用边界检查，因此根递归 build 也会覆盖它，或单独运行应用 architecture:check。共享检查器继续由 Forge 拥有。本轮不引入前端自动化测试。

手工验证清单见 [应用说明](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/apps/wechat-editor/README.md)。产品和范围见 [独立应用设计](jlab-wechat-editor.md)。

工作台使用 Element Plus 覆盖左抽屉（章节、文字、配色、结尾、历史），不影响主栏宽度。章节列表点击即时更新排版配置；导入由 article-editor 事件交给 workspace 执行；article-preview 通过 mode/focus 事件通知 workspace 更新宽度与专注状态，不读取私有 store。分隔图标绝对定位在两栏边界，无占位列。失败备份提示统一指导手动复制原稿。历史面板为 workspace 私有组件，使用 props/events，不直接访问仓储。技术验证见本次实施计划；功能仍由维护者人工验收。

现行UI详见[工作台UI与阅读交互](jlab-wechat-editor-ui.md)。顶栏52px，配色、结尾、章节样式和历史版本抽屉最大520px并可覆盖部分预览；文字设置抽屉最大320px并钳制到编辑栏宽度，打开设置退出专注并恢复原分栏偏好。预览手机/电脑外壳和模拟信息位于文章根外，未进入标注或输出。选区捕获保留revision锚点，气泡只发送颜色/清除命令；重渲染、滚动、尺寸变化或Escape清除临时锚点。保存异常仍保留顶栏状态，Toast隐藏不消除可查看的诊断。输出终端装饰/便签/表格均通过既有受控清洗；终端装饰和章节装饰不进入纯文本剪贴板。结尾片段显式追加，不自动启用、不替换既有内容。

article.service.ts 的 articleStatistics 公共函数统计受控 Markdown 渲染文字的非空白字符（含代码文字、标点，不含 Markdown 语法和图片），按 600 字/分钟估算阅读时长。workspace 合并正文与启用结尾后调用，结果仅作 UI 统计，不写入草稿。网格行与两栏内部 flex 使用零最小高度，原稿 textarea、预览容器独立滚动。保存状态仅在顶栏显示，结尾面板仅发出 change；所有持久化继续由 workspace 自动保存命令负责。

人工验收调整交付见[完成计划](https://github.com/tanghaojie/Cyber-Sight/blob/2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4/docs/platform/archive/plans/2026-10-06-jlab-acceptance-fixes.md)。关联实现提交：`40df307ddefd128a6700a90bbe2c569b6b091bd2`；格式、ESLint、TypeScript、生产构建、六模块边界（28文件/94导入）、仓库所有权和归档CI检查通过。构建仍有VueUse PURE注释及509.53kB主包提示。未运行前端自动化或浏览器测试；本轮外壳滚动、125%缩放、配色重载和公众号粘贴需维护者再次人工验收。

配色管理公共服务：maxPalettes、saveColorPreset、deleteColorPreset、updateColorPreset、resetColorPresets，由typesetting统一负责总数边界和配色快照；Vue面板发出patch，workspace编排与持久化。默认库可编辑、删除，重置后恢复六组。读旧列表允许至十五组，新写入严格1至9组，超限不静默丢数据。
