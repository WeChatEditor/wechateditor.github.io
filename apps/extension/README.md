# 桀士排版·公众号助手

Chrome MV3轻量传稿插件，0.1.13、协议2。Web自动保存后同步当前文字排版到插件，打开插件面板即可复制正文排版或标题。点击“发送到公众号”才调度打开后台，依次进入“草稿箱 → 新的创作 → 文章”，在平台新开的文章标签尝试插入。用户检查后手动保存。创作菜单读取可见名称，避免隐藏同名tooltip导致“文章”定位失败。

维护者2026-10-21确认0.1.13已审核发布，普通用户从[Chrome应用商店安装](https://chromewebstore.google.com/detail/neeljhohndegbhaaaclmcdeenlebhicj)，安装/更新后刷新Web和公众号，在发送抽屉重新检测。正式站点只连接商店ID neeljhohndegbhaaaclmcdeenlebhicj。

pnpm package:extension生成dist/production和dist/jlab-wechat-transfer-0.1.13.zip；pnpm build:extension:dev生成dist/development。本地包使用原公开key及ID imiclghaaoleoggfhfdbanmaehamnpmg，Web仅在127.0.0.1:5175/4175连接此ID；本地连接需development包。两种ID的数据不自动迁移，旧包迁移前保存需要的快照，再停用旧包并安装商店版本。Web原稿不受影响，连接后可重新同步。

0.1.13按当前标签切换工具栏图标：https://wechateditor.github.io及https://mp.weixin.qq.com显示原蓝色logo，其他页面显示同形灰色logo，灰色仍可点击面板。新建、切换、导航、浏览器启动和worker唤醒自动更新，每个标签独立设置；不新增全局tabs权限、URL记录或轮询。开发包额外识别127.0.0.1:5175/4175，生产包不识别本机地址。图标只表示站点匹配，不表示登录或传稿成功，真实Chrome显示待人工验收。

0.1.12只更新用户场景摘要和homepage_url（https://wechateditor.github.io/extension/），权限、协议与传稿行为保持。[商店发布文案](../../docs/reference/chrome-web-store-listing.md)继续供后续维护；[公开隐私说明](../frontend/public/privacy/index.html)随Web静态发布。商店发布状态依据维护者确认，真实连接与传稿单独验收。

本次新文章页即使隐藏账号名称，也可在官方接口存在且唯一隐藏名称与原目标账号严格一致时继续；导航页仍要求可见账号，新标签和空正文保护继续适用。

0.1.11支持实际可见ProseMirror标题覆盖层，原生编辑后核对旧textarea同步；标题控件加载等待与真实标题/正文非空分别提示。实际标题同步、正文排版和手动保存仍待人类验收。

自动同步仅保存可复制快照，不打开后台、不创建发送任务、不写系统剪贴板，也不影响已发送任务。面板“复制到公众号”保留HTML/纯文字格式，“复制标题”单独复制标题；成功/失败/中断后快照仍保留，24小时到期或下次成功自动同步/手动发送替换。含图片仍整篇阻断，使用Web原复制流程；无插件或同步失败不妨碍本机草稿保存。

手动发送使用已选有效公众号或第一个可用账号；无后台标签时打开固定首页，已登录会识别账号后继续，未登录则等待登录页面就绪后继续。无法识别时可点击下拉右侧刷新图标。界面有logo和并排小导航按钮，没有确认checkbox、启动/取消/恢复清理或发送状态轮询。内部去重、独立空文章及中断不重放保护保留。

见[安装与人工验收](../../docs/guides/wechat-transfer-extension.md)、[设计](../../docs/design/wechat-transfer-extension.md)、[协议](../../docs/reference/wechat-transfer-protocol.md)。工程构建不代表实际公众号插入/保存通过。
