# Officium 1962 结构化中文翻译工作区

旧的 `resources/officium1962-latin/translation-template.zh-Hans.jsonl` 是 legacy flat template：它按 canonical ID 去重，适合机器合并，但人工很难看到某条拉丁文在完整日课中的位置、时辰、夜课、对经重复、读经-祝福-答唱咏关系或第一/第二晚祷语境。

本目录建立双层系统：

- Canonical Translation Memory：`translations/zh-Hans.jsonl`，每个稳定 corpus ID 只有一份默认中文译文。
- Primary Workbooks：`workbooks/core/`、`workbooks/by-type/`、`workbooks/by-season/`、`workbooks/by-source/`，人工主要编辑入口；每个 ID 只出现一次。
- Context Views：`context-views/years/2026/MM/YYYY-MM-DD.md`，派生审校视图，按完整日课上下文注入 canonical 译文或 override；不要直接编辑。
- Context Overrides：`translations/zh-Hans-overrides.jsonl`，仅在 canonical 译文无法覆盖具体上下文时使用，加载优先级设计为 override > canonical translation > untranslated。
- Structure 与 Usage Graph：`structure/`、`usage/` 保存 2026 年 365 天、2920 个时辰、occurrence 与关系边。

## 命令

```text
pnpm officium1962:translation-workspace
pnpm officium1962:translation-import --dry-run
pnpm officium1962:translation-import
pnpm officium1962:translation-render
pnpm officium1962:translation-validate
```

## 人工流程

1. 运行 `translation-workspace`。
2. 从 `workbooks/core/` 开始，再按 `by-type`、`by-season` 或 `by-source` 翻译。
3. 只编辑 marker 中的中文、备注和 status 注释；不要修改 Latin、ID、structure IDs 或 context views。
4. 运行 `translation-import --dry-run`。
5. 解决 `translations/conflicts.zh-Hans.jsonl` 和 `review/conflicts.md` 中的冲突。
6. 正式 import 后运行 `translation-render`。
7. 在 `context-views/years/2026/` 按日期和时辰审校完整上下文。
8. 真有上下文差异时，在 `translations/zh-Hans-overrides.jsonl` 建立 override。
9. 运行 `translation-validate`。

当前不接入网站，不生成中文译文，不复制 Prima 或 Martyrology 译文，也不引入版权不明确的圣经、圣咏或礼书译本。生产页面仍只读取 `public/data/officium1962/` 的拉丁文 release 数据。

拉丁文来源为固定 Divinum Officium commit `515a213f79951c563be4f599ca591c63aa63bb6d`。禁止直接修改 Latin、corpus ID、occurrence ID 或结构 ID。
