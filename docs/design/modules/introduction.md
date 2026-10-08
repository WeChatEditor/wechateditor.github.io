---
title: 项目介绍模块
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 项目介绍模块

## 职责、边界和公共接口

introduction 是纯前端项目介绍模块。公共文件 apps/frontend/src/modules/introduction/introduction.vue 提供 Vue 组件，接受 projectName: string 与 preset: frontend | fullstack。service 插槽由应用入口组装健康状态展示；本模块不依赖 health，不请求服务或外部字体资源，不保存数据。项目入口只传参和组装。

## 数据流与依赖

仅依赖 Vue、原生浏览器 scroll、requestAnimationFrame、ResizeObserver 和媒体查询。章节几何位置进入 0..1 进度，驱动 AI 与人节点汇合、项目出现和主要目录逐行揭示；反向滚动回退。目录根据预设裁剪，前端工程不包含 backend/api-contract；目录是介绍摘要，不是运行时扫描的完整文件列表。

## 失败模式和资源生命周期

减少动画偏好及高度不超过 570px 的视口显示最终合体和完整目录，取消长滚动舞台；窄屏重排。媒体查询可动态切换，resize 更新布局。滚动使用被动监听与单帧调度；卸载释放 scroll/resize/media 监听、observer 和待执行帧。初次挂载读取当前位置，支持锚点或历史滚动恢复。服务状态的加载/成功/失败及请求取消归属 health 调用方。

## 验证策略

执行格式、Lint、类型、构建与模块/文档检查，不创建前端自动化测试。桌面/移动布局、正反滚动、节点汇合、目录展开、减少动画、短视口和键盘导航由人类验收；全栈另验收 health 的加载、成功、失败与刷新。静态验证不证明浏览器验收。
