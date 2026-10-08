---
title: 桀士排版数据存储与文章版本
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 桀士排版数据存储与文章版本

固定头尾扩展沿用格式1和ending旧enabled/markdown结尾字段，增加可选opening（enabled/markdown）。缺失补空且关闭；已有但损坏或超过50万字符的opening拒绝读写。开头与结尾均属于localStorage配置，不进入current/主动文章版本；恢复历史保留当前头尾及引用的必要素材。见[决策](../decisions/ADR-20261008-fixed-head-tail.md)。

## 数据所有权和键

workspace拥有仓储编排，draft-storage.port为公共端口；adapters、workspace.service与历史面板私有。无服务端，无跨库原子事务。

| 数据                                                     | 存储                                                         | 更新                              |
| -------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------- |
| 配色/章节/字号间距/字体/结尾/比例/预览/局部色偏好        | localStorage jlab-wechat-editor:settings，格式1              | 同步覆盖，无历史                  |
| 最近色                                                   | localStorage jlab-wechat-editor:recent-colors                | 最多8色，可丢弃偏好               |
| ArticleDocument/标注/必要Blob                            | IndexedDB jlab-wechat-editor版本2，drafts/current，草稿格式2 | 450ms防抖串行保存，事务完成才成功 |
| 主动文章版本                                             | 同库versions，毫秒数字键                                     | 不可变文章快照，无配置/结尾       |
| Range/抽屉/focus/复制结果/历史预览/手机缩放模式/同步滚动 | 内存                                                         | 不持久化                          |

## 保存和恢复

启动配置先校验再current，新origin无current时加载原版示例稿“把想法，排成好文章”，无历史标注素材，默认设置保留；已有current（包括空正文）优先恢复，不以正文是否为空判断首次打开。示例稿沿用修改后自动保存规则，初始化不主动创建历史版本。文章schemaVersion1，草稿schemaVersion2含writeId，配置schemaVersion1。修改配置不写current/历史；正文不写配置。主动新增版本同事务写current与versions，只含正文引用素材；同毫秒或时钟回退使用已有最大键加一，add避免覆盖。列表本地时区倒序；读取失败不冒充空列表。

恢复/删除需确认；恢复替换正文/标注/旧素材，保持当前配置和结尾，不自动创建版本；合并结尾仍引用的必要素材。恢复期间禁用编辑、旧选区失效，失败保留内存文章；删除不改current。关闭页补保存是尽力操作，不保证浏览器退出前事务完成。

## 兼容与失败

旧完整格式1兼容分支保留：已有localStorage配置优先，没有配置时先保证旧配置写入成功，再拆分为草稿2。配置失败保留旧current；未知/损坏记录暂停相应写入而不覆盖。本次不搬源数据，opening仅扩展配置可选字段，不变更IndexedDB文章协议。

文章事务比较writeId，其他页面写入拒绝覆盖；BroadcastChannel jlab-wechat-editor-draft用于通知，事务检查不依赖通知。配置storage事件检测变化并暂停本页写入，提示备份/刷新；失败保留编辑和重试。新字段缺失补默认值，但损坏字段不默认覆盖。旧超限配色完整读，写入严格总计1至9。

## 隔离与验证

origin包含协议、主机、端口；路径和仓库名不能隔离。开发127.0.0.1:5175、预览4175 strictPort避开源站5174/4174。生产独立HTTPS待定，源数据不读取/清理。IndexedDB/权限/配额/隐私模式仍可能失败或丢失。当前/历史/并发/旧格式分支由维护者手工验证，不运行前端自动化。

见[来源细节](../reference/source-designs/jlab-wechat-editor-storage.md)、[存储ADR](../decisions/ADR-20261005-jlab-local-storage-history.md)。
