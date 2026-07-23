# Officium 1962 翻译工作流

Officium 1962 中文翻译采用双层结构。

第一层是 canonical translation memory：`resources/officium1962-translation/translations/zh-Hans.jsonl`。每个稳定 corpus ID 只保存一份默认中文译文。

第二层是 structured context workspace：`resources/officium1962-translation/structure/`、`usage/`、`workbooks/` 和 `context-views/`。它按真实日课结构展示每条文本的日期、时辰、部分、夜课、读经单元、对经重复和晚祷语境。

旧文件 `resources/officium1962-latin/translation-template.zh-Hans.jsonl` 保留为 legacy flat template。它仍可作为首次迁移和兼容输入，但不再是推荐的人工编辑入口。

## 推荐流程

1. 运行 `pnpm officium1962:translation-workspace`。
2. 从 `resources/officium1962-translation/workbooks/core/` 开始翻译。
3. 再按 `workbooks/by-type/`、`workbooks/by-season/` 或 `workbooks/by-source/` 推进。
4. 不编辑 `context-views/`，它们是派生审校视图。
5. 运行 `pnpm officium1962:translation-import --dry-run`。
6. 解决 `translations/conflicts.zh-Hans.jsonl` 和 `review/conflicts.md`。
7. 运行 `pnpm officium1962:translation-import` 正式回写 translation memory。
8. 运行 `pnpm officium1962:translation-render` 重新渲染 context views。
9. 在 `context-views/years/2026/MM/YYYY-MM-DD.md` 中检查完整日期和时辰上下文。
10. 只有 canonical 译文无法覆盖具体上下文时，才在 `translations/zh-Hans-overrides.jsonl` 建立 context override。
11. 运行 `pnpm officium1962:translation-validate`。
12. 未来生成网站 translation chunks 时，再从 approved canonical entries 和 approved overrides 导出。

## 编辑规则

- `translations/zh-Hans.jsonl` 是中文译文真源。
- primary workbooks 是人类编辑界面，每个 corpus ID 只在一个 primary workbook 中出现一次。
- context views 是审校界面，不作为 canonical 翻译源。
- override 只用于真实上下文差异，加载优先级为 `override > canonical translation > untranslated`。
- 不修改 Latin corpus、corpus ID、occurrence ID、structure ID 或 release 数据。
- 不自动复制现有 Prima 或 Martyrology 译文。
- 不自动引入版权不明确的圣经、圣咏或礼书译本。
- 不调用在线翻译服务。

## 冲突处理

导入脚本会检测：

- 同一 corpus ID 在两个 workbook 出现。
- 同一 ID 被填写不同中文。
- workbook 中的 Latin 被误改。
- workbook ID 不存在。
- translation memory 中存在旧 ID。
- override 指向无效 occurrence。
- 结构文件引用缺失 corpus。
- context view 与 canonical translation 不一致。

有冲突时，严格导入失败，不会静默选择最后一个译文。冲突记录写入：

```text
resources/officium1962-translation/translations/conflicts.zh-Hans.jsonl
resources/officium1962-translation/review/conflicts.md
```

## 当前状态

当前 workspace 不接入生产页面，不生成网站中文数据。`/officium-1962/` 仍只读取 `public/data/officium1962/` 的拉丁文 release 数据，页面标题仍为“1962罗马大日课”。
