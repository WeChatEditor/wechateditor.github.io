---
title: 模块与 API 边界
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 模块与 API 边界

能力进入各 workspace 的 src/modules/<module>/，同一能力跨层同名。空应用不创建业务模块。入口只组装。每个模块设计说明职责、非目标、公共文件、依赖、数据流、失败模式和适用验证。

`.module-boundaries.json` 登记组装文件、模块设计、公共文件和允许依赖。跨模块导入只使用公共文件，不访问其他模块私有组件、状态、数据库实现或仓储。依赖不得循环；跨模块协议通过公共类型、应用服务、事件或端口。必要包导出例外必须登记，禁止无差别 barrel。数据库实现隔离于模块基础设施层。

检查器解析 TypeScript、JavaScript 和 Vue script 的静态及字面量动态导入；内部相对路径、workspace 包导出及 tsconfig paths 均解析。不能静态定位的动态模块导入需先改为明确边界；不得以别名绕过检查。测试覆盖合法公共依赖、私有导入、未登记模块、路径别名和循环。

有 API 契约包时以 Zod Schema 为唯一结构来源，类型通过 z.infer 推导，先改契约，再更新调用方；请求、查询和路径参数由后端运行时校验。没有现实外部互操作需求时不维护第二份手写 OpenAPI。health 无输入，不预装未使用的输入校验或 Swagger 基础设施。

成功业务响应为 `{ status: 0, data?: T }`，失败为 `{ status: 非零错误码, err: string }`。未认证、资源不存在、内部异常分别使用 HTTP 401、404、500，其他业务失败使用 HTTP 200。未来分页接受可选 pageNum/pageSize，默认 1/10，返回 `{ status, list, total, err? }`。错误码须在 docs/reference 登记，禁止散落无说明数字。前端共享拦截器若引入，统一处理 401/404/500；非零业务 status 由发起模块处理。空工程不预装拦截器。
