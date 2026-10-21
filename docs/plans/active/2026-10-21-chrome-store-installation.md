---
title: 正式商店插件检测与安装引导
status: pending_human_acceptance
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 正式商店插件检测与安装引导

## 目标、授权与设计依据

维护者确认Chrome插件已审核通过并发布，ID为neeljhohndegbhaaaclmcdeenlebhicj，要求更新检测ID、安装说明并引导用户跳转安装。截图展示0.1.13及该ID；发布状态依据维护者确认，不把它当作完整功能验收。

初始HEAD为d8954d20cf7159bd1a79e205c76b3a1443708ca7，工作区及暂存区为空，无.codegraph。首次修改前暂存门禁通过，归档审计NOT_DUE。pnpm默认依赖检查尝试访问不可用的全局SQLite存储，初次归档检查使用--config.verify-deps-before-run=false运行。后续确认workspace依赖链接缺失，已冻结锁文件恢复依赖，未改变依赖声明或锁文件。

依据[插件设计](../../design/wechat-transfer-extension.md)、[搜索发现设计](../../design/search-discovery.md)及[插件决策](../../decisions/ADR-20261011-wechat-transfer-extension.md)。正式网页只连接商店ID；两个已有回环开发/预览origin使用现有公开key推导的本地ID，保持开发包可用。不从商店ID伪造公钥，不探测第二个插件或静默回退。

## 实施步骤和退出条件

- [x] 准备设计与协作记录。
- [x] 先更新共享契约的身份、商店链接和origin映射，再更新网页检测与安装入口。
- [x] 安装页及文档以商店安装为主，说明刷新/重新检测、旧手动包迁移和数据边界。
- [x] 更新打包身份检查，执行适用工程、契约/治理、静态产物与归档检查。
- [x] 记录实际结果与人类验收清单。
- [ ] 人类验收商店跳转、安装刷新后的实际连接、不兼容提示、旧包迁移及两个回环地址开发连接。

## 实际结果、偏差、遗留与提交

正式站点的PING、同步、手动发送和面板通信统一连接商店ID；精确回环开发/预览origin保留本地身份。发送抽屉提供直接商店安装/更新和官网说明，静态插件页首屏与步骤均指向同一商店条目。同步安装指南、README、现行设计/ADR、商店维护参考和sitemap日期。

实际验证：pnpm format、format:check、lint --quiet、typecheck、build、modules:check、docs:check通过；22项治理及13项共享契约测试通过；0.1.13本地生产ZIP、开发包构建与extension:check通过，分别核对本地key与正式storeId。五个构建HTML的本地链接/资源/锚点、JSON-LD、两个安全新标签商店链接及sitemap检查通过，未执行页面脚本。git diff检查及归档CI NOT_DUE通过。保留Web已有大chunk构建提示。

环境偏差：首次类型/契约检查因依赖缺失失败，使用冻结锁文件与严格peer选项恢复后重跑通过；默认沙箱禁止治理测试临时.git/config写入，获执行环境提权后22项通过。依赖声明、锁文件、模块边界、插件版本/权限/消息结构保持不变。

真实Chrome安装、连接、界面及公众号传稿留待上述人类验收，计划与记录保持pending_human_acceptance。未创建或运行前端单元、组件、E2E或浏览器自动化；未推送部署或修改商店。关联提交由本文件Git历史定位。
