# Officium 1962 完整 occurrence 翻译 JSONL

`full-occurrences-by-hour-and-source.zh-Hans.jsonl` 是一个单一 JSONL 文件：每一行对应 2026 年日课中一次真实出现的 occurrence。它允许同一段 Latin 和同一个 canonical ID 多次出现，因为翻译者需要看到文本在不同日期、时辰、出处和结构位置中的实际用法。

这个文件不是去重语料库，不替代 `translations/zh-Hans.jsonl` canonical translation memory，也不是生产网站运行时数据。生产页面仍只读取 `public/data/officium1962/` 的 release Latin 数据。

## 排序

记录按确定性顺序排列：

1. 时辰：`matutinum`、`laudes`、`prima`、`tertia`、`sexta`、`nona`、`vesperae`、`completorium`、`calendar-metadata`
2. 出处类别：`Psalterium`、`Tempora`、`Sancti`、`Commune`、`Tabulae`、`Rules`、`Other`
3. `primarySourcePath`
4. `primarySourceSection`
5. `date`
6. `blockOrder`
7. `occurrenceId`

## 关键字段

- `occurrenceId`：一次真实使用的稳定 ID，每行唯一。
- `canonicalId`：去重 canonical corpus ID；同一个 ID 可以出现在很多行。
- `recordKind`：区分 release 礼文 occurrence、calendar title、rank、commemoration/display metadata。
- `date`、`hour`、`sectionPath`、`sectionPathText`：说明文本出现的礼仪上下文。
- `primarySourcePath`、`primarySourceSection`、`sourceCategory`、`sourceRefs`：说明出处。
- `latin`、`latinHash`：只读，不应修改。
- `translation`、`translationStatus`、`translator`、`reviewer`、`notes`：可编辑字段。
- `canonicalTranslation`、`canonicalTranslationStatus`：当前 canonical memory 中的统一译文状态。
- `overrideTranslation`、`overrideId`：当前 occurrence 是否已有专用 override。

生成时 `translation` 的默认填充顺序是：occurrence override、canonical translation、空字符串。重新生成时，如果旧记录的 `latinHash` 未变，会保留已经填写的 `translation`、`translationStatus`、`translator`、`reviewer` 和 `notes`；如果 Latin hash 改变，会写入冲突报告，不静默沿用旧译文。

## 命令

```bash
pnpm officium1962:export-full-occurrences
pnpm officium1962:validate-full-occurrences
pnpm officium1962:import-full-occurrences --dry-run
pnpm officium1962:import-full-occurrences
```

## jq 示例

```bash
# 只看 Matutinum
jq -c 'select(.hour=="matutinum")' resources/officium1962-translation/full-occurrences-by-hour-and-source.zh-Hans.jsonl

# 只看 Tempora
jq -c 'select(.sourceCategory=="Tempora")' resources/officium1962-translation/full-occurrences-by-hour-and-source.zh-Hans.jsonl

# 只看某一天
jq -c 'select(.date=="2026-07-22")' resources/officium1962-translation/full-occurrences-by-hour-and-source.zh-Hans.jsonl

# 只看未翻译
jq -c 'select(.translationStatus=="untranslated")' resources/officium1962-translation/full-occurrences-by-hour-and-source.zh-Hans.jsonl
```

## 交给另一个 AI 翻译

可以按时辰、出处或日期用 `jq` 切出一段 JSONL，交给另一个 AI 对话逐行填写 `translation` 和 `translationStatus`。返回后先运行 `pnpm officium1962:validate-full-occurrences`，再用 `pnpm officium1962:import-full-occurrences --dry-run` 检查是否能合并回 canonical memory。

不要修改 `occurrenceId`、`canonicalId`、`latin`、`latinHash`、`sourceRefs` 或 `sortKey`。如果同一个 `canonicalId` 的 occurrence 出现不同译文，导入脚本不会自动选择，会写入 `review/full-occurrence-import-conflicts.jsonl`；只有一个 occurrence 明显不同的情况会进入 `review/full-occurrence-override-candidates.jsonl`，仍需人工确认后再建立 override。
