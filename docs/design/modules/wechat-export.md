---
title: wechat-export模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# wechat-export模块

## 职责与边界

接受显式只读快照，构建受控HTML、内联样式、DOMPurify清洗及HTML/纯文字剪贴板输出。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/wechat-export。

## 公共接口与依赖

公共文件：`wechat-export.model.ts`、`wechat-export.service.ts`。跨模块仅导入这些文件，禁止barrel。允许依赖：article、typesetting、ending、assets；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。图片失败阻止复制，权限拒绝保留已准备结果供重试；改稿不复制过期快照。候选wechat-clipboard@0.1-candidate仍需公众号粘贴/保存/明暗人工验收。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
