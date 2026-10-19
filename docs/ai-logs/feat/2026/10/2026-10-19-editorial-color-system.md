---
title: 编辑式标题与十八套配色系统
status: pending_human_acceptance
change_type: feat
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 编辑式标题与十八套配色系统

目标：按维护者授权重设计文章标题、配色卡片及首次示例，默认18套、总上限24套，选择有编辑设计表现力的默认方案。

事实与假设：工作树/暂存区为空，未建立CodeGraph；归档审计NOT_DUE。指定参考标签页已读取，花生原选优雅简约，比较金融时报后恢复原选择；md2wechat只展开设置和精选列表，未改文章。现有默认9套、标题8款、配置读取曾有15套硬上限，需要随总上限修正。参考只提取层级/留白/色彩角色，不复制源码或专用Markdown语法。

选择：青黛朱砂作为默认，标题深青黛、强调朱砂、引用暖纸；18套分为编辑/自然/数字/撞色方向，原九id保留。新增杂志刊头、色签标题、双线专栏、极简细线；新配置默认杂志刊头和编号，已有配置保持原样。所有样式由typesetting公共服务生成内联样式，供卡片、预览与输出共用。

实际改动：默认18套/总计24套，保留原九套全部数据；新增四款标题、共享内联输出、三列配色小样与两列标题卡片。默认青黛朱砂/editorial/编号开启/段距18px；旧配置原样恢复。新示例开场展示全部五角色和三级标题，教程尾部逐字保留。workspace读取上限随maxPalettes修正，公开产品/教程和设计文档同步。提供由配色字面量绘制的可编辑SVG色票与输出PNG、Markdown，目视检查色票，无前端运行证据冒充。

实际验证：Windows Node24.18.0/pnpm11.13.1，format/format:check、Lint（0 error/243 warning）、typecheck、build、modules:check、docs:check、治理22/22、共享契约12/12、diff及归档CI（NOT_DUE）通过。JS802.90kB/gzip265.70kB，保留既有体积提示；静态颜色最低对比度约4.67，18个唯一id，旧九套完整保留。示例9346字符/565行/60行代码围栏，教程尾部与原稿一致；构建产品页18个色票与源数据一致。未执行产品前端测试、浏览器自动化或公众号验收，未部署或推送。

偏差与未决：18套默认给用户保留6套自定义空间，符合超过9套且上限24套的授权。人类仍需检查首屏、12款标题/换行/对齐、24套刷新读写、重置和公众号效果，保持pending_human_acceptance。无需新ADR，未改变存储所有权、模块边界、原解析器或current恢复。关联提交feat(typesetting): add editorial color system，通过Git历史定位；本会话模型从turn_context核验为gpt-6.1-sol，提交后核验实际trailer。完整清单见[计划](../../../../plans/active/2026-10-19-editorial-color-system.md)。
