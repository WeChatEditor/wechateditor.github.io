---
title: 锚点同步与配色交互修正
status: pending_human_acceptance
change_type: feat
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 锚点同步与配色交互修正

目标为维护者七项UI与滚动调整。读取入口、活动计划、UI/模块/存储ADR/治理/验证设计；记忆只用于既有选区、存储与人工验收约束，当前独立仓库为事实来源。确认原算法为全文高度比例、自定义颜色已有但气泡隐藏标签、配色更新删除直接生效。作者采用项目品牌“桀士”，GitHub指向已核验origin仓库。

选择Markdown源行与可测量块锚点、textarea隐藏镜像、workspace私有映射协调器，保留模块依赖方向。顶栏只改accent，localColor保留为气泡颜色偏好；电脑正文与元信息居中最大677px，外壳可更宽。配色确认及改名共用动态层级。

暂存检查通过，归档NOT_DUE；保留既有pnpm-workspace.yaml，限定格式化与提交文件。前端功能由人类验收，不运行前端自动化。验证和实际偏差待补记。

实际修改顶栏accent通道、气泡手动调色标签、桌面content-box最大677px及居中留白、块解析data-source-line、textarea同宽/字体隐藏镜像、预览块/zoom坐标、workspace相邻锚点插值、防回环与布局重对齐。图片load和内容更新重建映射，隐藏块与头尾不参与正文锚点。配色更新/删除异步确认，取消不写、最新配置校验、禁止重复弹窗；作者桀士与origin GitHub链接加入底栏。现行设计和人工清单同步，无新增ADR/依赖/存储字段。

首次类型检查拒绝MessageBox的zIndex选项，检查安装源码确认其自行递增z-index；遮挡原因是main缺少el-overlay.css，补齐后移除显式层级选项。首次Lint的getComputedStyle未登记全局，改用window.getComputedStyle。没有扩大配置或使用组件私有状态。

pnpm format用临时ignore保留人类workspace文件；format:check、Lint（0错误/227警告）、typecheck、build、modules:check、docs:check、21项治理测试和diff检查通过，归档CI为NOT_DUE。JS539.56kB/gzip194.84kB，保留已有体积提示。人工视觉、滚动、选区、公众号和刷新恢复未验证，计划保持pending_human_acceptance。提交只包括本轮文件并核验真实GPT-6 trailer，不推送，关联提交由本文件Git历史定位。
