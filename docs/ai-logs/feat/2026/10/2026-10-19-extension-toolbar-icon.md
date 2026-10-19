---
title: 插件工具栏图标按站点切换
status: pending_human_acceptance
change_type: feat
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 插件工具栏图标按站点切换

## 用户目标、授权与关键指令

维护者要求桀士排版或公众号后台标签显示蓝色工具栏图标，其他网页显示灰色。开始时Git工作区及暂存为空，归档NOT_DUE。功能修改获明确授权；工程检查后按仓库规则自动本地提交，真实Chrome功能保留人工验收，不执行前端自动化。

## 假设、选择与实际改动

先准备[实施计划](../../../../plans/active/2026-10-19-extension-toolbar-icon.md)，更新插件与extension-shell设计。使用chrome.action.setIcon的tabId隔离每标签图标，host权限足以读取允许站点的URL，不增加全局tabs或额外站点权限。生产精确匹配https://wechateditor.github.io及https://mp.weixin.qq.com，开发包沿用127.0.0.1:5175/4175；缺失URL与其他origin按灰色处理。复用蓝色logo，新增同形灰色工具栏资源；面板和浮层品牌logo继续使用原资源。图标仅表达站点匹配。

## 验证、偏差、未决事项和提交

已交付0.1.13：新增私有工具栏服务，既有公共service显式导出，worker只注册。默认灰色资源来自原logo的灰阶转换；原蓝色资源和popup/浮层logo不改。Chrome标签新建/激活/更新/替换/关闭、安装/启动和worker初始化均接入；tabId隔离和最新令牌保护迟到结果。打包清单设置灰色默认图标，ZIP增加对应PNG；校验检查默认图标、面板仍可点击、尺寸和完整ZIP资源。版本与README、静态安装页、指南、商店文案同步，模块注册与依赖未变。

2026-10-19：format/format:check通过，Lint 0 error/原有239 warning，typecheck、modules:check、docs:check、build、diff和提交规范检查通过，docs:archive:check:ci为NOT_DUE。治理22/22、契约12/12通过，没有新增或执行前端测试或浏览器自动化。PNG产物检查1024灰阶像素及原alpha一致。production打包/extension:check通过（482209字节）；development构建及灰色默认图标、原权限和两个本机origin的清单核对通过。原有前端500kB体积提示保留。

针对维护者前序商店上传key错误，额外从已校验ZIP生成jlab-wechat-transfer-0.1.13-store.zip（481829字节），只删除manifest.key，复核ZIP条目、其余清单属性和资源与原包一致。保留原本地安装/开发稳定身份，不改源码身份或擅自上传发布；商店生成ID后，Web与本地开发身份仍需单独对齐。常规打包命令继续输出原稳定ID包，本次商店副本是单独准备的发布产物。

真实Chrome切换、导航/返回/重启、多窗口、灰色时面板点击、开发/生产本机页差异及既有传稿由维护者验收。没有新增协议、持久化字段、依赖或架构决定；不推送、不部署、不发布。计划和日志保持pending_human_acceptance，不把工程检查写作运行验收。关联本地提交feat(extension): switch toolbar icon by site，实际SHA通过本文件Git历史查询；提交后核验真实模型trailer。
