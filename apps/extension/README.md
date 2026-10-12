# 桀士排版·公众号助手

Chrome MV3轻量传稿插件，0.1.3、协议2。Web点击“发送到公众号”即提交当前文字排版并自动新建插入；用户检查后手动保存。

pnpm package:extension生成dist/production和dist/jlab-wechat-transfer-0.1.3.zip；pnpm build:extension:dev生成dist/development。生产/开发稳定ID一致，只安装一份，Web和插件需同时更新。

插件使用已选有效公众号或第一个可用账号；无账号时登录后台后点击下拉右侧刷新图标自动继续。界面有logo和并排小导航按钮，没有确认checkbox、启动/取消/恢复清理或发送状态轮询。内部去重、独立空图文及中断不重放保护保留。

见[安装与人工验收](../../docs/guides/wechat-transfer-extension.md)、[设计](../../docs/design/wechat-transfer-extension.md)、[协议](../../docs/reference/wechat-transfer-protocol.md)。工程构建不代表实际公众号插入/保存通过。
