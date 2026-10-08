---
title: assets模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# assets模块

## 职责与边界

稳定素材 id、Blob/URL、图片尺寸、准备与临时 object URL 生命周期。无服务端上传。

非目标：本模块不增加账号、云存储或服务端API，不访问其他模块私有文件。当前文件位于apps/frontend/src/modules/assets。

## 公共接口与依赖

公共文件：`assets.model.ts`、`assets.service.ts`。跨模块仅导入这些文件，禁止barrel。允许依赖：无其他模块；禁止反向依赖与循环。登记来源唯一为根.module-boundaries.json。

## 数据流与失败模式

界面props/events → workspace命令 → 本模块公共服务/模型 → 预览/输出或持久化端口。缺图、CORS、解码、GIF超尺寸或过期结果给出诊断；保留透明，不自动裁剪；释放旧object URL。

## 验证

格式、Lint、TypeScript、生产构建、modules:check；功能手工验收，不新增或运行前端自动化。完整流程见[产品](../jlab-wechat-editor.md)、[UI](../jlab-wechat-editor-ui.md)、[存储](../jlab-wechat-editor-storage.md)。
