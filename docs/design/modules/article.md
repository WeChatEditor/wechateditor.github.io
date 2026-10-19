---
title: article模块
status: accepted
created: 2026-10-08
updated: 2026-10-19
owner: project maintainers
---

# article模块

2026-10-19背景层次改为workspace提供的暖纸tokens：编辑器/阅读纸面用ui-paper，标题条/编辑工具用ui-surface，预览画板用ui-bg至ui-canvas轻渐变，手机导航/电脑工具条用ui-chrome，外壳边框/阴影改为暖灰。开关外壳、手机/电脑及既有尺寸/滚动/缩放规则保留。只修改组件私有CSS，不向文章DOM写入画板或纸面颜色；代码主题继续由typesetting公共服务提供，见[UI设计](../jlab-wechat-editor-ui.md)。

手机预览公开组件内使用375/390/414px内存档位，适应/原始大小按档位测量，关壳保留阅读视口宽度。原稿新增可选opening/ending字符串props（undefined表示未启用），上下只读文本块不写入markdown或参与正文锚点，单块独立滚动。辅助字号统一至少11px，保持48px标题栏和工具可达性。

## 职责与边界

Markdown 解析、正文位置映射、结构化颜色标注、快捷格式与预览。只拥有文章语义，不拥有完整工作台草稿。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/article。

## 公共接口与依赖

公共文件：`article.model.ts`、`article.service.ts`、`article-editor.vue`、`article-preview.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：typesetting；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。无效混合选区整体拒绝；改稿歧义标注失效；IME、撤销、长文与跨强调/链接选区由人类验收。

编辑器/预览组件通过scroll事件及getScrollElement公开当前滚动元素，预览通过scrollLayout报告容器/尺寸变化；协调逻辑归workspace，不互相引用组件。开壳且手机模式时，模型上方独立横排“自适应 / 原始大小”radio button与“当前缩放比例: N%”，原始大小为1:1 CSS像素；开壳取reader-content、关壳取preview-scroll。同步/外壳/专注按钮使用统一active背景及aria-pressed。缩放模式为临时UI状态，无存储格式变化。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。

## 块锚点接口

renderMarkdown在标题/段落/列表/引用/表格/代码等块上写入data-source-line。预览getScrollAnchors返回正文块源行与当前滚动容器中的纵向位置，排除头尾及隐藏块、同源行取首个可见块，并扣除手机zoom。原稿getScrollAnchors(lines)按textarea字体/宽度/换行规则用临时隐藏镜像测量对应源行，缓存随内容/尺寸/字体失效；镜像测量后立即移除。图片load、内容和尺寸变化报告scrollLayout。元数据仅服务预览，既有导出白名单清理剔除。
