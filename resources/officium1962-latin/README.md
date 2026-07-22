# Officium 1962 拉丁文翻译资源

本目录是 2026 年 Officium Romanum 1962 发布数据的离线翻译工作区，不是网站运行时数据。规范来源为 `public/data/officium1962/`，固定 Divinum Officium commit 为 `515a213f79951c563be4f599ca591c63aa63bb6d`。

## 文件用途

- `corpus.jsonl`：唯一 canonical 拉丁文语料；一行一个稳定 ID。
- `translation-template.zh-Hans.jsonl`：翻译人员唯一应编辑的文件。
- `index.csv`：带 UTF-8 BOM 的浏览索引；完整正文以 JSONL 为准。
- `source-map.json`：每个 corpus ID 的完整上游或本站显示来源。
- `occurrence-map.json`：每个 ID 的全部日期、时辰、顺序与礼仪角色。
- `calendar-titles.jsonl`：逐日标题、rank、纪念、季节与来源映射。
- `by-type/`：由 canonical corpus 生成的只读派生视图。
- `validation-report.json` 和 `reports/`：覆盖、重复、优先级和 roundtrip 结果。

## 提取与校验

```text
pnpm officium1962:extract-corpus
pnpm officium1962:validate-corpus
```

提取器只读 release JSON，不访问网络，也不需要 Perl、Docker、vendor 或 experimental 数据。它先生成到临时目录并严格校验，再原子替换本目录。重复提取会按 ID 保留模板中的 `translation`、`status`、`translator`、`reviewer` 和 `notes`；已移除 ID 进入 deprecated 报告。

## 翻译填写

只编辑 `translation-template.zh-Hans.jsonl` 的人工字段，不修改 `id`、`latin`、`type` 或 `subtype`：

- `untranslated`：尚未翻译。
- `draft`：人工初稿。
- `machine-draft`：机器或 AI 草稿，必须人工审校。
- `reviewed`：已由审校者检查。
- `approved`：可进入未来网站翻译包。

填写后先运行 `pnpm officium1962:extract-corpus`，让人工字段按 ID 合并回 canonical 和派生视图，再运行 `pnpm officium1962:validate-corpus`。保留 `℣.`、`℟.`、`†`、`*`、重音、段落和诗节结构。在 `notes` 中记录译本、版权、上下文选择或争议。未来回写流程见 `docs/officium1962/TRANSLATION_WORKFLOW.md`。当前生产网站不读取本目录，仍只显示拉丁文。

## 来源与许可

拉丁文礼文和礼规计算源自 MIT 许可的 Divinum Officium 固定提交；结构化转换和语料索引由本站完成。不要把 Prima 或 Martyrology 的中文译文自动混入本语料。
