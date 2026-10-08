---
title: 固定头尾沿用配置存储与模块边界
status: accepted
created: 2026-10-08
updated: 2026-10-08
owner: project maintainers
---

# 固定头尾沿用配置存储与模块边界

维护者明确要求把固定结尾扩展为固定头尾，新增固定开头的配置与功能。继续使用ending模块的公共模型/服务/面板，不新增跨模块依赖；旧enabled/markdown保持结尾含义，新增可选opening对象（enabled/markdown）。旧记录缺少opening时补空字符串和关闭状态，已有但损坏的opening拒绝读写，不覆盖原记录。

头尾各自启用、编辑和清空，默认开头为空且关闭。预览与复制共用开头→正文→结尾组合，头尾不参与正文章节编号和局部标注，统计包含启用部分。配置沿用localStorage格式1即时覆盖，无配置历史；正文current/主动版本仍不包含头尾。恢复版本保持当前头尾，并保留其引用的必要素材。

这是[配置存储决策](ADR-20261005-jlab-local-storage-history.md)的功能扩展，未替代其存储取舍。实现与验收见[计划](../plans/active/2026-10-08-ui-fixed-head-tail.md)。
