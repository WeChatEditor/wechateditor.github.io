# 依赖与许可

Node >=22.13.0（兼容即可，推荐 Node 22）、pnpm >=10.26.0；下表仅列本次所选工程的直接依赖范围，锁文件记录验证过的依赖图。使用 pnpm update -r 更新兼容版本后重新验证并提交锁文件；跨大版本需单独审查。保留依赖包自身许可声明。

| 包                 | 版本范围 | 许可证     |
| ------------------ | -------- | ---------- |
| @eslint/js         | ^10.0.1  | MIT        |
| @types/node        | ^22.20.5 | MIT        |
| @vitejs/plugin-vue | ^6.0.9   | MIT        |
| eslint             | ^10.12.0 | MIT        |
| eslint-plugin-vue  | ^10.11.1 | MIT        |
| prettier           | ^3.9.9   | MIT        |
| typescript         | ^6.0.3   | Apache-2.0 |
| typescript-eslint  | ^8.71.1  | MIT        |
| vite               | ^8.3.3   | MIT        |
| vue                | ^3.5.43  | MIT        |
| vue-eslint-parser  | ^10.4.1  | MIT        |
| vue-tsc            | ^3.3.12  | MIT        |
| yaml               | ^2.9.1   | ISC        |

模板采用 MIT，保留来源 2026 JTLab 声明。产品源码与相关现行文档来自Cyber-Sight，来源见迁移清单；不携带来源Git历史、环境配置或ledger。

## 迁入业务依赖

| 包                 | 范围    | 许可                  |
| ------------------ | ------- | --------------------- |
| pinia              | ^2.3.1  | MIT                   |
| element-plus       | ^2.14.3 | MIT                   |
| markdown-it        | ^15.0.2 | MIT                   |
| dompurify          | ^3.4.16 | MPL-2.0 OR Apache-2.0 |
| @types/markdown-it | ^14.2.0 | MIT                   |

2026-10-08官方registry元数据：Pinia2.3.1支持Vue ^3.5.11、TypeScript >=4.4.4，Element Plus2.14.3支持Vue ^3.3.7；与模板Vue3.5/TypeScript6静态验证。版本不追latest，锁文件与严格peer安装验证实际组合。[Pinia官方指南](https://pinia.vuejs.org/getting-started.html)、[Element Plus安装](https://element-plus.org/en-US/guide/installation.html)、[Vite指南](https://vite.dev/guide/)。
