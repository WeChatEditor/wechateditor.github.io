---
title: 正式商店插件检测与安装引导记录
status: pending_human_acceptance
change_type: fix
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 正式商店插件检测与安装引导记录

## 用户目标、授权与关键指令

维护者确认Chrome插件已发布，指定neeljhohndegbhaaaclmcdeenlebhicj，授权更新插件检测、安装说明和跳转入口。截图用于核对ID与版本，不继承为公众号实际传稿验收。初始工作区及暂存为空，暂存门禁通过，无CodeGraph索引；归档NOT_DUE。

## 假设、选择与实际改动

现有网页ID来自本地公开key，和商店分配ID不同。共享契约集中定义正式ID、商店URL及仅两个已支持回环origin的本地身份映射；不修改已发布插件协议、权限或版本。身份文件登记storeId，打包检查分别核对正式ID与本地key，不把旧key声称为商店身份。网页安装链接由用户点击在新标签打开，安装后刷新并重新检测；公开静态页改为商店安装流程。详细步骤见[计划](../../../../plans/active/2026-10-21-chrome-store-installation.md)。

## 验证、偏差、未决事项和提交

实际改动完成：网页所有插件命令使用按origin选择的目标身份，未安装/不兼容时直接跳转商店安装/更新；安装说明改到官网。公开安装页首屏与步骤均提供商店按钮，补充安装后刷新和检测、权限排查、旧手动包数据处理，开发安装移至指南。身份文件和打包检查同时校验正式storeId与原本地key，契约新增正式/本地origin映射检查；更新现行设计、模块、ADR、协议参考、安装/收录指南、README及sitemap。

验证通过：pnpm format及format:check、lint --quiet、typecheck、生产build、模块/文档检查、22项治理测试、13项共享契约测试、0.1.13生产ZIP和开发包构建、extension:check、git diff检查及归档CI NOT_DUE。五个构建HTML的本地链接/资源/锚点与JSON-LD、两个新标签商店链接、复制后的安装页及sitemap日期静态核对通过，没有执行页面脚本。Web保留既有大chunk提示。

环境处理：默认pnpm依赖预检因全局SQLite存储不可用失败，初次归档检查关闭自动依赖预检后通过。后续类型/契约检查发现workspace依赖缺失，使用--frozen-lockfile --strict-peer-dependencies恢复依赖后检查通过，未改依赖声明或锁文件；治理测试的临时.git/config受沙箱保护，执行环境提权后22项通过。所有验证均记录实际边界，不运行前端自动化。

遗留：真实商店安装/更新、刷新后的生产PING、安装提示布局、旧包迁移及本地两origin连接由人类验收，计划/记录保持pending_human_acceptance。不改变已发布插件版本、权限或协议，无需为本次网页修正重新上架。未推送部署或修改商店。关联提交由本文件Git历史定位。
