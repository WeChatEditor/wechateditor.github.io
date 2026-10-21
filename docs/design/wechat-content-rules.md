---
title: 微信内容规范与传稿校验
status: accepted
created: 2026-10-21
updated: 2026-10-21
owner: project maintainers
---

# 微信内容规范与传稿校验

## 依据与范围

维护者要求按[微信官方插件规范](https://developers.weixin.qq.com/doc/service/guide/product/plugin_spec.html#_4-1-2)修复传稿误报。2026-10-21核对官方页面及其指定的[权威规则文件](https://github.com/wechatjs/verify-article-structure-spec/blob/ab0a16a0ae07cfc128c7f3fc2d061cf9c7dbff78/verify_article_structure.md)。官方没有公布完整CSS接收白名单；项目受控HTML/CSS集合、文字首版媒体限制、2MiB保护均为项目安全策略，不称为微信不支持。

§4.1.2不推荐文字背景使用渐变，§4.1.3允许无文字的纯渐变背景；渐变不是图片URL，也不是一概禁止。总结卡改用主题纯色，封面阴影与列表样式保留。允许受控box-shadow/background-image/list-style及浏览器边框简写序列化产生的border-image:none；媒体URL和未知属性继续拒绝，错误指出具体属性。

## 数据流与边界

共享wechat-transfer契约提供官方静态诊断及原有文字传稿安全校验。wechat-export新增对契约公共入口的单向依赖；预览与两类导出复用诊断。官方明确可静态判定的问题为error，建议及需布局确认的问题为warning；复制遇error停止，传稿在Web及插件接收/复制端独立复核。告警按规则合并，避免每个span重复提示。

可静态检查：透明光标、text-align:start/end、有文字的height:0、深层冗余嵌套；渐变文字背景、字体族、!important、行高风险、固定宽高、定位/变形文本及pre换行风险提供建议。空装饰与无文字渐变不误报。普通span不得包含块元素；项目不生成leaf/nodeleaf或SVG组件，相应属性/媒体仍受传稿安全规则限制，不新增这类编辑器内部结构。

官方页面旧说明仍写10层，指定权威文件已于2026-10-19改为根节点深度0、从15层检查可精简冗余，不能把所有15层内容一概拒绝。静态检查仅识别同标签、同内联声明、无其他信息的单子元素重复结构；不自动改写正文。

## 验证边界与升级

没有真实布局的parse5检查不能证明跨屏宽度/溢出、实际多行叠字、内容裁剪或深色算法的最终对比度。相关提示说明需人工在公众号保存后检查；官方CLI需真实浏览器，本轮不安装或运行前端/浏览器自动化。媒体/SVG、平台专用组件不扩大产品范围。来源摘要及覆盖矩阵见[核对记录](../reference/wechat-content-rules.md)。

插件升至0.1.14，两端共用同一实现；Web检测低于0.1.14的版本提示更新，防止Web放行后旧插件继续拦截。消息协议2、存储、来源、权限、自动新建与人工保存边界不变；不自动发布网页或商店更新。实际验证和人工验收见[修复计划](../plans/active/2026-10-21-wechat-content-rules.md)。
