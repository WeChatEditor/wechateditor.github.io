# 桀士排版轻量传稿插件

Chrome MV3、版本0.1.0、稳定ID `imiclghaaoleoggfhfdbanmaehamnpmg`。Web写作，插件接收文字快照并在用户确认账号后独立新建图文、插入；用户检查后手动保存。含图使用原复制流程。实际公众号仍待人类验收。

根目录执行`pnpm package:extension`输出production unpacked和ZIP；`pnpm build:extension:dev`输出支持127.0.0.1:5175/4175的development。两者同ID只装一份。安装、更新、恢复、人工验收见[指南](../../docs/guides/wechat-transfer-extension.md)，实现边界见[设计](../../docs/design/wechat-transfer-extension.md)。
