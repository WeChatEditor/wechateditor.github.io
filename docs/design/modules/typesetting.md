---
title: typesetting模块
status: accepted
created: 2026-10-08
updated: 2026-10-11
owner: project maintainers
---

# typesetting模块

## 职责与边界

字号、间距、字体、颜色角色、配色列表、八种章节样式与颜色控件。规则供预览和导出共用。

共用颜色控件用Popover承载ColorPickerPanel，保留HEX输入、色板、横排常用/最近色。footer新增屏幕取色按钮，通过安全上下文中的浏览器EyeDropper响应用户点击；不支持时禁用并提示原因。取色与面板编辑仅更新内存草稿，确定才执行原change通道及最近色写入；取消或外部关闭放弃草稿。Esc取消取色保留草稿，非取消失败显示面板提示。关闭、禁用与卸载用AbortController中止操作，晚到结果拒绝应用。弹层保留el-color-picker__panel类以兼容局部正文选区保护，不访问其他模块私有状态。

章节样式为下划线/粗下划线（2/5px底线）、竖线/粗竖线（4/8px）、末尾斜线、围住完整标题的方括号/双圆/点阵。点阵左右各两列三行3px圆点，列间距3px、行间距2px，整体9×13px。序号可独立启用，位于装饰内并在标题前。紧贴标题默认启用，下划线跟随标题主体宽度（含启用的序号），其他装饰邻接标题主体；关闭时下划线为整行宽度，单侧装饰在对应行边、双侧装饰在左右行边。紧贴下划线由inline-block主体绘制，保留原底部间距，最大宽度100%，多行时按主体整体宽度绘制底线。标题主体包含序号和原始内联节点，按左/中/右对齐（默认左），长标题可换行；原始节点不重建，装饰用data-decoration标记，纯文字复制剔除装饰但保留正文。文章主标题和头尾不添加章节装饰。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/typesetting。

## 公共接口与依赖

公共文件：`typesetting.model.ts`、`typesetting.service.ts`、`typesetting-panel.vue`、`typesetting-color-picker.vue`。跨模块仅导入这些文件，禁止barrel。允许依赖：无其他模块；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。配色总计1至9组，默认六组可修改/删除/重置；旧超限列表完整保留，写入先拒绝。最近颜色偏好失败不阻断改色；设备字体和低对比度由人类验收。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。

## 配色确认与弹层

更新和删除卡片配色需MessageBox二次确认，取消不写入；确认时使用最新配置，删除仍须保留至少一组。待确认时禁止重复打开操作。名称prompt预填并保留原校验，body中的Overlay需显式导入el-overlay.css提供fixed定位，使用MessageBox自身递增z-index，避免位于配色抽屉下方。
