---
title: 网站 favicon 设计与接入
status: pending_human_acceptance
change_type: feat
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 网站 favicon 设计与接入

维护者要求设计生成网站 favicon；[计划](../../../../plans/active/2026-10-08-site-favicon.md)规定蓝白纸页/J 图形与相对资源路径。当前 HTML 无图标，UI 主色为 #2563EB，Vite base 为 ./。历史记忆仅提示保持中文品牌，事实以当前仓库为准。起始 Git 干净、暂存区为空，无 CodeGraph 索引。

内置 imagegen 负责图像生成；后续仅转换尺寸/格式，不使用 Python 重新绘制或编辑图像。源图及提示词落入仓库，产物供 Vite public/ 使用。无新业务模块或依赖，不改变页面品牌文案和数据协议。

默认 pnpm11 在沙箱内 realpath 失败，沙箱外隐式安装遭非TTY拒绝；corepack pnpm10.26 与项目一致，归档门禁 NOT_DUE。沙箱内直接 node 的 Git 子进程误报 unborn，沙箱外正式门禁确认真实 HEAD 和基线；未修改台账。

已用内置 imagegen 生成蓝白圆角纸页/J 图标，源图1254×1254 RGBA保存在 docs/reference/brand/favicon-source.png，同目录README保留最终提示词。Pillow仅将原图等比例缩小/转换格式，产出public内16/32/48/64px ICO、32px/192px PNG及180px Apple图标；index.html以相对路径引用，Vite生产dist包含全部资源。查看了原图及32px实际图像，小尺寸下J和纸页可识别。

Windows Node24.18.0/pnpm10.26.0：format、Lint（零error/225条既有warning）、TypeScript、modules:check、docs:check、生产构建及diff检查通过，归档CI为NOT_DUE。JS536.02kB/gzip193.08kB，保留既有500kB提示，JS/CSS文件名未变化。最终格式与文档复核见关联提交；不新增或运行前端自动化测试。浏览器标签页、收藏夹及移动端图标由维护者人工确认，计划/日志保持pending_human_acceptance；未授权推送。提交模型trailer使用当前指令真实身份GPT-6。

最终format:check、docs:check和21项治理测试通过，归档CI仍为NOT_DUE。四个public图标与dist对应文件SHA-256一致。技术提交及实际trailer通过Git历史关联核验。
