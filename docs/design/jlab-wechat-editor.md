---
title: 桀士排版·公众号助手
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 桀士排版·公众号助手

## 产品和范围

桀士排版，英文JLab WeChat Editor，是独立仓库apps/frontend中的Vue/Pinia/Element Plus纯前端桌面单页。无需Router、认证、后端或HTTP业务契约。浏览器标题“桀士排版·公众号助手”，顶栏“桀士排版”/“公众号助手”。完整保留源产品界面与能力，首次无本地草稿时加载原版示例稿，已有草稿（包括空稿）优先恢复；默认六组配色、排版与结尾启停规则沿用。

## 工作流

左Markdown原稿 → article受控解析/序列化局部标注 → typesetting公共规则与ending片段 → article预览 → assets准备 → wechat-export清洗/内联 → HTML和纯文字剪贴板。workspace编排命令并拥有草稿仓储；App/main只组装。原始HTML禁用并显示为文本，不将输入直接插入预览。

保留UTF-8单个.md/.txt导入（2MB/50万字符）、Markdown快捷格式/IME/撤销、实时预览、正文/局部颜色、九种章节/独立编号、字号/间距/字体、六组默认/总计1至9配色、固定结尾、双栏比例/专注/阅读宽度、历史和保存诊断。数学、Mermaid、复杂SVG、插图和下载、文章包、IP/提色/教程、账号/云同步/AI排版不在范围。

## 布局和存储

桌面最小宽度800px，52px单层顶栏，小于800px页面横向滚动，不做手机工作台。文字设置最大320px，其余章节/配色/结尾/历史最大520px左覆盖抽屉。左右独立滚动、无占位分隔线与键盘操作；阅读手机/电脑外壳属于预览模拟，永不进入文章、标注或复制。底部统计包含启用结尾，按600字/分钟向上取整。

配置与结尾localStorage即时覆盖；正文/标注/Blob IndexedDB current 450ms串行防抖；用户主动新增时间戳文章版本，恢复不回滚配置。未知格式、损坏或冲突暂停对应写入并保留原记录。浏览器存储按origin隔离，源数据不搬迁。

## 输出和失败模式

本地旧素材使用稳定asset:id与Blob；HTTPS图片可预览，远程fetch/CORS失败阻止复制。PNG/JPEG/WebP等比限制1440×2400，WebP转PNG、保留透明；GIF保留动画，超限拒绝。相对图片不扫描目录。站外链接输出可见URL。默认公众号字体省略font-family，显式字体选择共用于预览与导出但不保证设备安装。

受控DOM和DOMPurify清洗保留，UI外壳/临时诊断不参与输出。复制快照过期不可用，权限失败可重试已准备内容；保存成功以事务完成为准。候选输出profile不承诺微信保真。

## 规范和验证

详见[UI](jlab-wechat-editor-ui.md)、[存储](jlab-wechat-editor-storage.md)、[模块](modules/README.md)、[来源细节](../reference/source-designs/jlab-wechat-editor.md)。当前迁移技术检查与人工验收在[计划](../plans/active/2026-10-08-jlab-independent-migration.md)分别记录；不得继承来源历史通过结论。
