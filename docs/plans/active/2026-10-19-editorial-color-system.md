---
title: 编辑式标题与十八套配色系统
status: pending_human_acceptance
created: 2026-10-19
updated: 2026-10-19
owner: project maintainers
---

# 编辑式标题与十八套配色系统

## 目标与授权

维护者要求阅读md2wechat与花生排版器，重设计标题、配色与默认文章，以简历作品标准呈现美学；配色总上限24套，由设计者选择默认配色。现行依据为[排版模块](../../design/modules/typesetting.md)、[UI](../../design/jlab-wechat-editor-ui.md)及[存储](../../design/jlab-wechat-editor-storage.md)。

## 实施与退出条件

- [x] 初始工作树/暂存区为空，无.codegraph，归档审计NOT_DUE；读取现行设计和有效存储ADR。
- [x] 在维护者指定的两个Chrome标签页阅读主题设置与实际版式，记录[参考依据](../../reference/editorial-color-study.md)。
- [x] 写设计、本计划和AI日志，确定18套默认配色、24套总上限、4款新标题和首屏样张。
- [x] 保留原九个配色id和八种标题，扩展默认数据、标题公共输出和选择卡片；配置校验读写均接受24套。
- [x] 默认使用青黛朱砂、杂志刊头和独立编号；重写示例开场，保留后续多语言和代码内容及已有current恢复语义。
- [x] 格式、Lint、类型、生产构建、模块/文档、治理/契约测试、diff和归档CI通过；交付提交与trailer在提交后核验。
- [ ] 人工验收手机/电脑首屏、12款标题长文换行/三种对齐/编号/紧贴、18套配色、24套保存刷新、重置取消/确认和公众号复制。

## 边界与兼容

不新增依赖、存储字段、公共文件或跨模块依赖。标题枚举增加值，配置仍为格式1；旧值和用户颜色/列表原样恢复，不自动覆盖。默认内容仅在没有current时加载。配色和标题继续独立选择。实际UI与公众号效果依仓库规则由人类验收，不执行产品前端自动化。

## 结果

已交付18套默认配色、24套总上限、12款标题、三列配色小样与两列标题卡片。默认青黛朱砂以冷色标题/暖色强调/暖纸引用分工；表头同步浅底，优化主标题、引用与段距。修正workspace读取15套限制；保留原九套全部id/名称/色值、原八款标题及已保存配置恢复规则。同步公开产品页/教程的数量、色票和静态默认示意。内置示例为9346字符/565行，开场191字符集中展示五角色及三级标题；原“让文字自然呼吸”之后的教程逐字保留，含60行代码围栏/30种代码示例。工作台存储与解析器未改。

已提供[可编辑设计色票](../../reference/palette-atlas.svg)，由现行颜色字面量绘制并目视检查；另在本次输出目录提供PNG与可导入Markdown。这些是设计材料，不是实际页面截图或运行证据。

2026-10-19 Windows Node24.18.0/pnpm11.13.1：format、format:check、Lint（0 error/243 warning）、typecheck、build、modules:check、docs:check、22项治理与12项共享契约测试、git diff --check和归档CI（NOT_DUE）通过。Lint仍有Vue格式与v-html规则提示，未称为零warning；生产JS802.90kB/gzip265.70kB，保留既有500kB提示。静态字面量核对18个唯一id、原九套完整保留、全部文字角色在白底/本组浅底及行内代码对比度≥4.5，最低约4.67；构建about页18个色票与现行标题色一致。不加载或执行前端模块进行测试，未执行产品前端自动化、公众号粘贴或部署。

人工验收未完成，计划与AI日志保持pending_human_acceptance，不归档为完成。关联提交标题feat(typesetting): add editorial color system，实际SHA通过本文件Git历史定位；模型身份从本会话turn_context核验为gpt-6.1-sol，使用该真实标识填写trailer。
