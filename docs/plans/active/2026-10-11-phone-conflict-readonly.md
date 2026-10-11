---
title: 手机档位、冲突阻断与固定头尾只读展示
status: pending_human_acceptance
created: 2026-10-11
updated: 2026-10-11
owner: project maintainers
---

# 手机档位、冲突阻断与固定头尾只读展示

维护者要求手机375/390/414px标准档位、多标签冲突Modal禁止操作、原稿上下展示启用头尾、全站最小11px及布局适配。确认冲突按钮关闭当前标签页，浏览器拒绝时提示手动关闭并保持锁定。依据[UI](../../design/jlab-wechat-editor-ui.md)、[存储](../../design/jlab-wechat-editor-storage.md)、[article](../../design/modules/article.md)、[workspace](../../design/modules/workspace.md)及现行存储/头尾ADR。起始Git和暂存为空、无CodeGraph、归档NOT_DUE（19个有效提交）。

设计：手机档位为页面内存偏好，默认390×844，375×812、414×896；宽度指阅读视口，壳体另加边框，适应/原始及关壳均按同一档位。控件在手机模式显示，窄栏横向滚动。冲突独立状态覆盖BroadcastChannel、storage和事务writeId失败；取消待保存、禁止新写/命令/异步晚到应用，原工作台inert，原生dialog顶层模态且禁止Esc/遮罩关闭。只读头尾用文本呈现Markdown、不执行HTML，启用时显示、过长块内部滚动，正文textarea与锚点保持独立。所有显式字号低于11提升，标题辅助行和组件small变量调整；文章逻辑字号不变，手机模拟zoom仍按档位缩放。

- [x] 检查现行实现、文档与门禁，准备设计/计划/日志。
- [x] 完成四项修改和适用静态检查。
- [x] 完成文档归档复核；真实内容提交后登记审计基线。
- [ ] 人工验收三个手机档位/开关外壳/缩放/分栏；头尾启用空内容/长文/正文编辑与同步；鼠标键盘/抽屉/异步导入在冲突后均锁定、确认关闭或手动关闭提示；字号增大后800px及浏览器缩放布局。

不运行前端自动化；技术完成自动提交、不推送，人类验收前保留活动计划。

阈值复核见[归档复核](../../archive/plans/2026-10-11-ui-storage-archive-review.md)，不以归档复核完成代替产品功能人工验收。

实际验证：format/format:check、Lint（0错误/228警告）、typecheck、build、modules:check、docs:check、21项治理测试与diff检查通过。源码字体扫描无低于11px的显式font-size；标题辅助行33px适配48px栏高，手机控制行横向滚动，头尾块内部80px滚动上限，正文ResizeObserver负责尺寸后重建锚点。生产JS544.92kB/gzip196.53kB，保留已有500kB提示。没有运行浏览器或前端自动化，真实UI/跨标签/公众号验收仍待人工确认。原生dialog顶层阻断，确认浏览器拒绝关闭时保持锁定；已开始事务无法撤销，既有writeId保护仍有效。关联提交通过本文件Git历史定位。
