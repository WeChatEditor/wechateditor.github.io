---
title: typesetting模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# typesetting模块

## 职责与边界

字号、间距、字体、颜色角色、配色列表、八种章节样式与颜色控件。规则供预览和导出共用。

章节样式为下划线/粗下划线（2/5px整行底线）、竖线/粗竖线（4/8px）、末尾斜线、围住完整标题的方括号/双圆/点阵。点阵左右各两列三行5px圆点。序号可独立启用，位于装饰内并在标题前。紧贴标题默认启用，除两种下划线外，装饰邻接标题主体；关闭时单侧装饰在对应行边、双侧装饰在左右行边。标题主体包含序号和原始内联节点，按左/中/右对齐（默认左），长标题可换行；原始节点不重建，装饰用data-decoration标记，纯文字复制剔除装饰但保留正文。文章主标题和头尾不添加章节装饰。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/typesetting。

## 公共接口与依赖

公共文件：`typesetting.model.ts`、`typesetting.service.ts`、`typesetting-panel.vue`、`typesetting-color-picker.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：无其他模块；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。配色总计1至9组，默认六组可修改/删除/重置；旧超限列表完整保留，写入先拒绝。最近颜色偏好失败不阻断改色；设备字体和低对比度由人类验收。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
