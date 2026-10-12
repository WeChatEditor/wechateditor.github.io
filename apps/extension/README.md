# 桀士排版·公众号助手

Chrome MV3轻量传稿插件，0.1.4、协议2。Web点击“发送到公众号”即提交当前文字排版，立即调度打开后台尝试新建插入；未完成时可直接从插件面板复制正文排版或标题，无需回Web。用户检查后手动保存。

pnpm package:extension生成dist/production和dist/jlab-wechat-transfer-0.1.4.zip；pnpm build:extension:dev生成dist/development。生产/开发稳定ID一致，只安装一份。更新Web可使用优先打开后台的流程。

插件使用已选有效公众号或第一个可用账号；无账号时也打开后台登录页，登录后点击下拉右侧刷新图标自动继续。面板“复制到公众号”保留HTML/纯文字格式，“复制标题”单独复制标题；成功/失败/中断后快照仍保留，24小时到期或下次发送替换。界面有logo和并排小导航按钮，没有确认checkbox、启动/取消/恢复清理或发送状态轮询。内部去重、独立空图文及中断不重放保护保留。

见[安装与人工验收](../../docs/guides/wechat-transfer-extension.md)、[设计](../../docs/design/wechat-transfer-extension.md)、[协议](../../docs/reference/wechat-transfer-protocol.md)。工程构建不代表实际公众号插入/保存通过。
