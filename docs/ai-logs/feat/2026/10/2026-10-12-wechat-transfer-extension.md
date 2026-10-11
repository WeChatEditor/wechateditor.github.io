---
title: 轻量传稿插件实现记录
status: pending_human_acceptance
created: 2026-10-12
updated: 2026-10-12
owner: project maintainers
change_type: feat
---

# 轻量传稿插件实现记录

目标与授权：维护者要求执行[实施计划](../../../../plans/active/2026-10-11-wechat-transfer-extension.md)，实际公众号尚未验收。文字首版、独立新建、用户手动保存；图片回退现有复制。没有前端自动化、推送或上架授权。

起点：暂存和工作区为空，真实HEAD为68296bc7eb2fca4d805be7c0ed7b4971e211b740，无.codegraph；首次修改前暂存门禁通过，归档审计NOT_DUE。

选择：先共享Zod协议，再Web导出与连接、MV3任务仓储和官方JSAPI适配。公开原始文档确认invoke使用对象参数apiName/apiParam/sucCb/errCb，不能使用猜测的函数签名。账号/导航定位保守且未实测，缺失或不唯一时阻断。构建产物与真实后台验收分别记录。

实际改动：新增extension和wechat-transfer-contract，Zod严格协议/来源/digest/尺寸与parse5文字HTML校验；Web文字预检/发送面板/快照竞态；插件任务存储、100回执/24小时TTL、单写入者、租约/预写/uncertain恢复、可信popup和后台浮层；保守账号/导航/空编辑器/官方正文/标题/无媒体读回适配。模块注册升级为按workspace区分同名的schemaVersion2；新增治理检查、独立生产/开发包和ZIP/许可/ID/权限检查，CI接入。既有存储及图片剪贴板行为未改。

维护者确认生产为https://wechateditor.github.io/，同步当前部署事实与插件白名单；生产不含旧来源/本地地址，开发包只加5175/4175。ID由公开key生成，私钥未保存。没有额外工具安装、索引或浏览器操作。

实际验证：本机Node24.18.0/pnpm11.13.1；冻结严格peer安装、format/format:check、Lint（0错误，现行Vue排版规则警告）、类型、生产/开发构建、模块/文档、22治理/9契约检查、ZIP字节/公钥ID/权限/本地打包输入检查通过。Web大chunk提示保留。没有前端单元/组件/E2E/浏览器自动化，没有实际Chrome安装或公众号插入/保存证明；远端CI未执行。最终归档CI需在审查内容真实提交后登记基线，结果按后续收尾记录。

偏差与边界：按实现授权先完成工程，P0/P4真实验收待维护者。候选选择器不是实际页面证据；只顶层官方JSAPI和不同documentId的新建，缺失则阻断。浮层统一打开popup，避免content直接发起写入；旧内部阶段消息改为scripting直接返回。uncertain过期清除原标题/正文/绑定但保留匿名阻断。用户活动使租约失效；运行租约结束前禁止清理；不承诺公众号副作用与本地状态原子化。

遗留：能力定位、标题进入真实文章状态、文字样式/保存重开、安装/权限、竞态和中断恢复全部待人类验收。详见[指南](../../../../guides/wechat-transfer-extension.md)。本日志保持pending_human_acceptance，不推送或上架。关联实现提交通过本日志Git历史定位，收尾台账登记实际完整SHA。

收尾：实现提交ba7af69cb305fc08d6823f3384889c685832a783，核验真实GPT-6 co-author trailer，工作区清洁后登记为归档审查基线。docs:archive:check:ci最终NOT_DUE，台账和此实际结果另提交。31项纯治理/契约检查通过；没有前端功能验收。依赖安装曾因zod4.6.6未满足minimumReleaseAge被拒绝，维持策略选择4.6.5；显式构建批准仍仅esbuild/vue-demi。
