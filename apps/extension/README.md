# 桀士排版·公众号助手

Chrome MV3轻量传稿插件，0.1.5、协议2。Web自动保存后同步当前文字排版到插件，打开插件面板即可复制正文排版或标题。点击“发送到公众号”才调度打开后台尝试新建插入。用户检查后手动保存。

pnpm package:extension生成dist/production和dist/jlab-wechat-transfer-0.1.5.zip；pnpm build:extension:dev生成dist/development。生产/开发稳定ID一致，只安装一份。自动同步需要更新插件并刷新Web；旧0.1.4快照兼容保留。

自动同步仅保存可复制快照，不打开后台、不创建发送任务、不写系统剪贴板，也不影响已发送任务。面板“复制到公众号”保留HTML/纯文字格式，“复制标题”单独复制标题；成功/失败/中断后快照仍保留，24小时到期或下次成功自动同步/手动发送替换。含图片仍整篇阻断，使用Web原复制流程；无插件或同步失败不妨碍本机草稿保存。

手动发送使用已选有效公众号或第一个可用账号；无账号时打开后台登录页，登录后点击下拉右侧刷新图标自动继续。界面有logo和并排小导航按钮，没有确认checkbox、启动/取消/恢复清理或发送状态轮询。内部去重、独立空图文及中断不重放保护保留。

见[安装与人工验收](../../docs/guides/wechat-transfer-extension.md)、[设计](../../docs/design/wechat-transfer-extension.md)、[协议](../../docs/reference/wechat-transfer-protocol.md)。工程构建不代表实际公众号插入/保存通过。
