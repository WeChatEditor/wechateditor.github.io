# 轻量传稿插件来源与证据

核验日期：2026-10-11至12。区分公开能力、工程设计和公众号实测。本轮没有使用维护者公众号登录态，也没有运行浏览器或前端自动化。10月12日进一步读取官方原始HTML中的代码块，确认invoke使用对象apiName/apiParam/sucCb/errCb；状态为isReady/isNew、正文为content；isNew表示新编辑器版本，不证明新建文章。官方文档存在不代表本账号/编辑器页面已经验收。微信页面通过agent-reach网页读取路径及官方原始网页读取，Chrome页面直接读取官方文档。

| 编号  | 官方来源                                                                                                                                                                         | 支持的判断                                                                  | 仍需验证                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| WT-W1 | [MP编辑器JS拓展](https://developers.weixin.qq.com/doc/subscription/guide/product/mp_editor_jsapi.html)                                                                           | window.__MP_Editor_JSAPI__提供状态、正文读写和插入；正文操作要求isNew=true  | 实际账号页面、invoke/返回结构、所在frame、标题及正文保存后保真 |
| WT-W2 | [公众号编辑器插件开发规范](https://developers.weixin.qq.com/doc/subscription/guide/product/plugin_spec.html)                                                                     | HTML结构、CSS、字体、Dark Mode需遵循平台规则                                | 当前章节装饰、表格、代码、局部颜色等实际接收/阅读效果          |
| WT-C1 | [Chrome Web消息通信](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#send-messages-from-web-pages)                                                       | Web可经externally_connectable向指定扩展ID发送消息；Chrome消息采用JSON序列化 | 开发/生产ID、实际部署路径、应答丢失与版本协商                  |
| WT-C2 | [externally_connectable声明](https://developer.chrome.com/docs/extensions/reference/manifest/externally-connectable)                                                             | manifest声明允许连接的网页和扩展                                            | 同origin项目路径运行时复核及生产移除localhost                  |
| WT-C3 | [内容脚本](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) / [scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting)    | ISOLATED环境不能直接访问宿主页JS全局；可执行内置MAIN桥接                    | 公众号CSP、文档/frame定位、就绪与导航刷新                      |
| WT-C4 | [tabs权限](https://developer.chrome.com/docs/extensions/reference/api/tabs)                                                                                                      | 创建/导航标签通常不需tabs权限；限定host权限支持相应标签查询                 | 权限被禁用、多个标签/窗口、关闭标签与目标确认                  |
| WT-C5 | [storage](https://developer.chrome.com/docs/extensions/reference/api/storage)                                                                                                    | 任务可本地存储；content script访问级别可收紧                                | 配额、损坏记录、更新兼容、单写入者与TTL                        |
| WT-C6 | [MV3 worker生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)                                                                    | worker可能休眠，内存变量不能承担任务恢复                                    | 回执丢失、执行中休眠/重启与禁止副作用重放                      |
| WT-C7 | [远程代码限制](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code) / [popup行为](https://developer.chrome.com/docs/extensions/develop/ui/add-popup) | 插件执行代码随包打包；popup离开会关闭                                       | 清洗依赖、构建产物、安装/更新与本地资源CSP                     |

不采用HTTP草稿API：维护者明确此路线无法使用，不再要求启用AppSecret、配置服务器或查接口权限。MP编辑器JSAPI属于登录后台页面提供的插件能力，和HTTP草稿API是不同接入边界。

草稿箱新建导航、标题写入、账号/文档识别，以及公开JSAPI在本账号是否存在，均为尚待P0人工能力验证的实现前提，不伪造微信入口URL、选择器、私有接口或测试结果。若官方JSAPI不可用，第一版降级出口是现有手动复制，不读取私有编辑器实例。

2MiB消息保护、24小时TTL、Chrome120最低版本、30秒导航/就绪超时、10秒JSAPI超时、64码点标题保护及单待传任务是项目设计选择，不能归因于微信官方限制或已经验证的性能指标。
