---
title: 代码随主题配色与暖纸工作台
status: pending_human_acceptance
change_type: fix
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 代码随主题配色与暖纸工作台

目标与指令：修复代码块不跟随配色；按维护者认可的设计板/现行About背景重设计工作台与右侧预览画板。参考图片已读取；本地About CSS底色#f6f5f1，设计板#f7f5f1。没有互联网研究或前端自动化授权。

事实：初始只有sources/未跟踪截图，保持隔离；暂存区为空，无CodeGraph，归档NOT_DUE。pre的背景/正文/边框/三圆点和行内代码灰底为固定字面量，符合此前设计但未随新增主题变化；本次按用户授权更新最终设计。

选择：复用现有五颜色角色，代码浅底取background，正文与行内代码取可读主题前景，边框混合强调与浅底，终端装饰取强调/标题/引用色。低对比度自定义前景回退至可读主题正文或黑白。UI新增暖纸/画板/外壳tokens，保留蓝色交互和所有布局；暖纸背景只用于UI，输出规则仍由typesetting提供。

实际改动：typesetting.service中的代码块/行内代码背景取主题background，可读前景、混色边框、2px顶线与三圆点同主题；PRE内CODE显式继承。workspace-theme.css新增paper/canvas/chrome并映射Element Plus背景/边框/文字，article编辑和预览私有CSS使用暖纸层次，手机/电脑外壳同步。辅助文字加深为#5e6966。原18套默认数据、配置/解析/接口/依赖不改。新增可编辑SVG与输出PNG设计示意，目视检查后修正示意字体回退，不冒充实际页面截图。

验证：Windows Node24.18.0/pnpm11.13.1，format/format:check、Lint（0 error/243 warning，与本次修改前一致）、typecheck、build、模块/文档、治理22/22、契约12/12、diff及归档CI通过（NOT_DUE）。JS803.51kB/gzip265.81kB，保留既有体积提示。静态颜色计算18套代码最低约4.67，UI辅助文字最低约4.62；构建CSS包含暖纸tokens，配色数据与提交前一致。没有执行产品前端自动化、页面或公众号验收。

偏差与未决：没有增加语法高亮、新角色、配置、协议或模块依赖，无需新ADR。代码主题输出和应用纸面保持职责分离；人类仍需检查主题切换/长代码/代码复制、各预览档位/外壳/抽屉及公众号效果。计划和日志保持pending_human_acceptance，详见[清单](../../../../plans/active/2026-10-19-themed-code-warm-workspace.md)。本次提交fix(typesetting): theme code and warm workspace，真实SHA通过Git历史定位，提交后核验trailer；不推送或部署，不操作sources/截图。
