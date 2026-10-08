# 独立迁移技术验证

2026-10-08 Windows，Node24.19.0/pnpm11.22.0：冻结且严格peer安装、format/format:check、Lint、TypeScript、生产构建、模块和文档检查通过；21项治理测试通过，其中新增CSS边界回归。Lint零error，保留222条格式和受控v-html提示；生产JS524.41kB（gzip188.37kB），保留500kB chunk警告，不修改阈值掩盖。

六模块25个文件与固定来源逐文件核对，除空原稿初始化和等价全角空格HTML实体外，无意外内容差异。静态HTTP验证根路径/子路径各HTML200及2个相对assets可取，未启动浏览器，不等于UI验收。目标实际Vue3.5.43、Pinia2.3.1、Element Plus2.14.7、Markdown-it15.0.2、DOMPurify3.4.16、Vite8.3.3、TypeScript6.0.3、vue-tsc3.3.12；Element Plus按兼容范围解析到2.14.7。

初次安装拒绝vue-demi postinstall，读取脚本后仅显式批准该依赖自身Vue适配生成；清除pnpm本次自动生成的批准占位。CSS检查器保留私有/公共边界并新增治理测试。Lint补齐实际浏览器globals，全角空格使用等价实体，不关闭语义检查。

仅Windows本地实际执行；Windows/Linux CI矩阵保留并严格peer安装，未推送，因此远端CI未执行。桌面UI、存储交互、公众号复制/保存/明暗等维护者人工验收待执行，域名与正式发布待定。

初始模板20项治理测试及静态检查通过，真实首提交b86bf90444a12ae7560eecc2ae03f7b65a6b3ff0；台账初始化提交fa254111d6863d79746f31693da1c9b5781afc98。技术迁移提交由本文件Git历史的feat(editor)定位，真实复核基线在该提交创建后登记，不使用未来SHA。

技术交付提交及真实复核基线：`e8332edf5885c91a9b8546c60cc47cd2c4b7298b`；最终正常归档CI为NOT_DUE。提交trailer已由git log核验。
