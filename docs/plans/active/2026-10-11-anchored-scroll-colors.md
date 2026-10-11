---
title: 锚点同步与配色交互修正
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 锚点同步与配色交互修正

## 改名输入双焦点框修正

维护者截图显示输入内层方形outline与Element Plus圆角wrapper高亮叠加。沿用本计划，仅对MessageBox内层el-input__inner的focus-visible关闭通用outline，保留wrapper焦点及校验错误边框。起始暂存区为空，归档NOT_DUE，既有人类workspace配置保留。人工确认鼠标/键盘聚焦只有单框、无效名称错误状态及保存/取消；静态检查结果记入本日志。

## 底栏存储提示调整

维护者指出底栏“数据仅保存在当前浏览器”突兀，本次移入顶栏保存状态title说明。底栏回到左侧统计、右侧作者/GitHub；保存状态正文及错误提示保留。暂存区为空，归档NOT_DUE，保留既有workspace配置；只改展示，无存储行为变化。静态验证结果见关联日志，悬停说明与底栏视觉等待人工确认。

按维护者七项要求修改顶栏强调色、选区手动调色、电脑677px正文宽度、块锚点同步、配色更新/删除确认、改名弹层及作者/GitHub。依据[UI设计](../../design/jlab-wechat-editor-ui.md)、[article](../../design/modules/article.md)、[workspace](../../design/modules/workspace.md)、[typesetting](../../design/modules/typesetting.md)。暂存区为空、无CodeGraph，归档NOT_DUE。既有pnpm-workspace.yaml改动保留并排除格式化和提交。

实现方案：Markdown块携带源行号，编辑器使用同字体/宽度/换行的隐藏镜像测量源行位置；组件公开行号/纵向位置，workspace按相邻块插值双向同步。头尾与阅读元信息不参与正文锚点；顶部/底部作为边界，图片加载与尺寸/内容改变重建映射。保留防回环、减少动态效果与关闭清理。元数据不进入公众号输出。配色弹窗共享Element Plus递增层级，取消不修改，确认后按最新配置执行。无需新增依赖或存储格式。

- [x] 核对实现、文档与门禁，准备设计/计划/日志。
- [x] 实现七项调整及静态工程验证。
- [ ] 人工验收：强调色保存与导出；选区HEX/色板/取色器确认取消；电脑开关外壳和宽窄栏；长段落/标题/列表/代码/图片/头尾双向同步及模式尺寸变化；配色确认取消与改名层级；作者及GitHub链接。

前端不创建或运行自动化测试。完成技术检查后自动提交本轮文件，不推送；人工验收前保留活动计划。

## 技术结果

已实现七项调整。改名遮挡的源码原因是按需样式未引入el-overlay.css，补齐固定定位样式，MessageBox自身在显示时递增层级；无需不受支持的zIndex选项。正文块源行、镜像换行测量和预览zoom坐标实现局部映射，无新增依赖或存储字段，导出原白名单剔除锚点属性。

format（临时ignore隔离人类workspace配置）/format:check、Lint（0错误/227警告）、typecheck、build、modules:check、docs:check、21项治理测试和diff检查通过；归档CI为NOT_DUE。JS539.56kB/gzip194.84kB，保留已有500kB提示。所有前端交互仍待人工验收；关联提交由本文件Git历史定位，技术提交后核验trailer与提交规范，不推送。
