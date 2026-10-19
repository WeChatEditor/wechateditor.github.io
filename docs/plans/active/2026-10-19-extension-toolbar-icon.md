---
title: 插件工具栏图标按站点切换
status: pending_human_acceptance
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 插件工具栏图标按站点切换

## 目标、授权与设计依据

维护者要求当前标签是桀士排版或公众号后台时显示蓝色图标，其他网页显示灰色。此指令授权实现功能；之前发布咨询的“不改代码”不限制本次明确的功能修改。开始时工作区、暂存区均为空，无.codegraph；归档审计NOT_DUE，真实HEAD为3d1c93f97071c983d98891a781d031816a6a6887。依据[插件设计](../../design/wechat-transfer-extension.md)和[extension-shell边界](../../design/modules/extension-shell.md)。

## 实施步骤和退出条件

- [x] 核对当前图标、模块边界、Chrome官方API、Git与归档门禁，准备设计和日志。
- [x] 在extension-shell内维护每个标签的图标，以精确origin匹配桀士排版和公众号；默认灰色，匹配时使用现有蓝色logo。
- [x] 覆盖标签新建、激活、URL/加载更新、替换、安装、启动和worker重新加载；迟到读取不覆盖后续状态，已关闭标签的错误不影响传稿。
- [x] 保留storage/scripting及原站点权限、面板点击、协议和存储；开发包额外识别现有5175/4175本机origin。
- [x] 更新版本、打包资源、校验和使用说明，完成工程检查并准备本地提交。
- [x] 针对前序商店上传key报错，额外交付仅移除manifest.key的商店ZIP副本并核对其他资源完全相同。
- [ ] 维护者在真实Chrome验收蓝/灰切换、导航/返回/重启、多窗口、面板点击及既有传稿。

## 实际结果、偏差、遗留与提交

已实现0.1.13。工具栏私有服务通过既有extension-shell公共service导出，注册表和依赖不变；默认灰色32px PNG由原蓝色图标灰阶转换，1024像素RGB通道相等且alpha逐像素保持。每标签更新令牌阻断迟到读取，标签关闭释放令牌；使用Chrome事件，无轮询、日志或存储。图标仅表示站点匹配，不表示公众号已登录、传稿成功或保存成功。

2026-10-19工程检查：format/format:check、Lint（0 error，原有239 warning）、typecheck、modules:check、docs:check、build、diff及提交规范检查通过，归档CI为NOT_DUE。治理22/22、共享契约12/12通过；未新增或执行前端单元、组件、E2E或浏览器自动化。production打包/extension:check和development构建通过，开发包清单单独核对灰色默认图标、原权限和两个本机origin。原前端500kB构建体积提示保留。

本地ZIP为apps/extension/dist/jlab-wechat-transfer-0.1.13.zip（482209字节），production目录保留原开发身份。商店上传副本为同目录jlab-wechat-transfer-0.1.13-store.zip（481829字节），只移除manifest.key，其余清单属性和资源逐字节核对一致；未上传或发布，商店分配ID后仍需核对Web连接身份。既有打包命令继续生成本地稳定ID包，商店副本为本次额外交付。

维护者仍需验收两个生产站点蓝色、普通网页/Chrome内部页灰色、同标签跳转/返回/刷新、快速切换、新标签、多窗口、浏览器重启及灰色时面板点击；生产包本机页灰色、开发包两个本机origin蓝色。既有账号识别、复制和传稿保护需人工回归。计划与日志保持pending_human_acceptance，不归档。关联本地提交标题feat(extension): switch toolbar icon by site；实际SHA通过本计划Git历史查询，提交后核验真实模型trailer。
