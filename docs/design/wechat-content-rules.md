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

共享包独立/content入口提供Web专用的官方静态诊断及文字输出校验；传输根入口不依赖parse5或内容规则。wechat-export预览/两类导出、Web提交前复用内容规则；error阻止复制/提交，建议及布局风险为warning。插件接收、复制和页面读回不执行格式、媒体或标签白名单校验。诊断按规则合并。

可静态检查：透明光标、text-align:start/end、有文字的height:0、深层冗余嵌套；渐变文字背景、字体族、!important、行高风险、固定宽高、定位/变形文本及pre换行风险提供建议。空装饰与无文字渐变不误报。普通span不得包含块元素；项目不生成leaf/nodeleaf或SVG组件，相应属性/媒体仍受传稿安全规则限制，不新增这类编辑器内部结构。

官方页面旧说明仍写10层，指定权威文件已于2026-10-19改为根节点深度0、从15层检查可精简冗余，不能把所有15层内容一概拒绝。静态检查仅识别同标签、同内联声明、无其他信息的单子元素重复结构；不自动改写正文。

## 验证边界与升级

没有真实布局的parse5检查不能证明跨屏宽度/溢出、实际多行叠字、内容裁剪或深色算法的最终对比度。相关提示说明需人工在公众号保存后检查；官方CLI需真实浏览器，本轮不安装或运行前端/浏览器自动化。媒体/SVG、平台专用组件不扩大产品范围。来源摘要及覆盖矩阵见[核对记录](../reference/wechat-content-rules.md)。

0.1.15起按维护者要求改为[插件纯转发](extension-update-boundaries.md)。Web检测稳定html-relay@1能力，取消排版规则对应的版本门槛；0.1.13/0.1.14缺少该能力，需一次迁移更新。普通网页样式/规则更新不再要求发布插件。协议2和操作保护保持，功能待人类验收。
