# Officium Romanum 1962 最终上线存档

存档日期：2026-07-22

## 正式部署

- 正式 URL：`https://clemensdsh.xyz/officium-1962/`
- Cloudflare Pages URL：`https://biblioteca-de-clemens.pages.dev/officium-1962/`
- Production commit：`10d951f5901a6d2991063763d7b7d471566c688a`
- Divinum Officium commit：`515a213f79951c563be4f599ca591c63aa63bb6d`
- Feature flag：`config/features.ts` 中 `officium1962: true`

Cloudflare Pages 首次部署在 clone 阶段超时；Retry deployment 后构建成功。正式域名与 pages.dev 地址均已人工打开，并确认 Officium 页面和线上 `officium1962.v1` manifest 可访问。

## Release 数据

- 当前年份：2026
- 天数：365
- Date/hour 输出：2920
- Block occurrences：55184
- Shared blocks：8713
- Shared chunks：20
- SourceRefs：完整
- Orphan blocks：0
- HTML leakage：0
- Spanish / Martyrologium1960 / missa：0

Oracle 结果保持 exact：Completorium 7/113、Minor hours 28/305、Major hours 14/234、Matutinum 29/1632、年度抽样 192/3826；mismatch 0，unresolved 0。

## 翻译资源

- 工作区：`resources/officium1962-latin/`
- Canonical corpus：`corpus.jsonl`
- 中文翻译入口：`translation-template.zh-Hans.jsonl`
- 翻译工作流：`docs/officium1962/TRANSLATION_WORKFLOW.md`
- Corpus 条目：9102
- Shared block 条目：8713
- Metadata/display 条目：389（含 2 个 production 静态拉丁文标题）
- Calendar：365 天 / 354 个去重标题
- Release occurrences：55184
- Latin 字符：3937984
- Latin 词数：552136
- SourceRefs 完整率：100%
- Needs classification：0
- Duplicate groups / audit groups：607 / 607
- Translation template 条目：9102

提取器只读已发布 release JSON，不访问网络，不依赖 Perl、Docker、vendor、experimental 或 raw 数据。输出使用稳定 ID、UTF-8、LF、Unicode NFC，并通过 checksum、roundtrip、确定性和翻译合并校验。

## 测试和构建

- `pnpm officium1962:extract-corpus`：通过
- `pnpm officium1962:validate-corpus`：通过
- `pnpm officium1962:validate`：通过，7 files / 169 tests 及全部 oracle
- `pnpm officium1962:validate-year --year=2026`：通过
- `node scripts/officium1962/compare-year-sample.mjs`：通过
- `pnpm test`：通过，12 files / 215 tests
- `pnpm build`：通过

## 边界和限制

- 当前只支持 2026。
- 当前网站仍只显示 Latin，不读取 `resources/officium1962-latin/`。
- 语料尚无自动生成的中文译文；所有新模板条目为 `untranslated`。
- 607 组同文本不同来源记录保留不同 ID，需要翻译阶段人工审计。
- Prima 与 `/martyrology/` 的逻辑、resolver、数据和中文译文未混入本模块。

## 回滚

- 页面：将 `config/features.ts` 中单一 flag 设为 `false`，重新构建部署。
- Release：原子恢复上一提交中的 root manifest、`shared/` 和 `years/2026/`，清理 CDN 缓存。
- 翻译：按 ID 回滚 `translation-template.zh-Hans.jsonl` 的人工字段，然后重新提取和校验。当前翻译资源不影响生产页面。

## 可选下一步

下一阶段可以从 `translation-template.zh-Hans.jsonl` 开始中文翻译、来源登记和人工审校；这不是当前上线收尾的一部分。只有 `approved` 译文才应进入未来网站 translation chunks。
