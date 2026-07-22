# Officium 1962 翻译工作流

## 工作文件

翻译人员只编辑：

```text
resources/officium1962-latin/translation-template.zh-Hans.jsonl
```

`corpus.jsonl` 是 canonical 拉丁文语料；`by-type/`、`index.csv`、`source-map.json`、`occurrence-map.json` 和报告都是派生文件，不应手工修改。当前生产网站不读取翻译资源，也不会因为编辑模板而改变线上拉丁文。

## 逐条翻译

1. 通过 `index.csv` 或 `by-type/` 选择条目。
2. 在模板中按稳定 `id` 找到同一条记录。
3. 保持 `latin`、`type`、`subtype` 和 `id` 不变，只填写 `translation`、`status`、`translator`、`reviewer` 和 `notes`。
4. 保留段落、诗节、经句结构以及 `℣.`、`℟.`、`†`、`*` 等标记。
5. 运行 `pnpm officium1962:extract-corpus`，按 ID 把人工字段合并回 canonical 和派生视图。
6. 运行 `pnpm officium1962:validate-corpus`。

重新提取时，脚本按 ID 合并模板并保留全部人工字段。新 ID 以空译文追加；不再存在的 ID 进入 `reports/deprecated-translations.jsonl`，不会静默删除。

## 状态

- `untranslated`：尚无译文。
- `draft`：人工初稿，尚未独立审校。
- `machine-draft`：机器或 AI 辅助草稿，不能直接发布。
- `reviewed`：已由审校者核对拉丁文、上下文和格式。
- `approved`：已确认可进入未来网站翻译包。

任何机器或 AI 生成内容必须使用 `machine-draft`，并在 `notes` 说明工具、日期和人工改动。只有人工审校后的条目才可进入 `reviewed` 或 `approved`。

## 上下文和同文异义

不要只依据短句翻译。先查看 corpus 条目的代表性 `contexts`，再查看 `occurrence-map.json` 中的全部日期、时辰、顺序、夜课/读经编号及礼仪角色。

文本相同但 ID 不同的条目不得擅自合并。其来源、类型或礼仪语义可能不同；应参考 `duplicates.md` 和 `source-map.json` 分别审校。确实可共用译文时，也应在各自 ID 下独立记录，并在 `notes` 写明相互参照。

## Rubric

Rubric 必须翻译为明确的礼仪指示，不应改写为正文祈祷。保留动作、静默诵念、跪拜、十字、重复、略去和季节条件。遇到 `%Laudes%` 等上游标记时，在 `notes` 记录其技术含义，不要从拉丁文原文中删除。

## 圣经、圣咏和既有译本

使用现成中文圣经、圣咏、赞美诗或礼书译文前，必须确认版本、版权、许可和引用范围。在 `notes` 至少记录：

- 译本名称和版本；
- 出版者或权利人；
- 经文编号或页码；
- 许可状态；
- 是否为适配、重译或逐字引用。

未来可在模板 schema 中增加 `translationSources` 数组，但在该字段正式加入前统一写入 `notes`。不得自动复制本站 Prima 或 Martyrology 的中文译文，因为其历法、礼规、文本来源和许可边界不同。

## 审校与批准

1. 译者提交 `draft` 或 `machine-draft`。
2. 审校者核对 Latin、sourceRefs、代表性上下文和全部特殊字符。
3. 修正后填写 `reviewer`，状态改为 `reviewed`。
4. 负责发布的人核对译本许可和网站格式，状态改为 `approved`。
5. 每次批量修改后运行 corpus 校验，并在代码审查中检查仅有预期 ID 的人工字段变化。

单条译文回滚时，用 Git 恢复该 ID 的人工字段，不要恢复整个派生目录。随后重新运行提取和校验，以确保模板、canonical corpus 副本和未来翻译包一致。

## 未来网站回写接口

本轮不生成也不加载网站翻译包。未来实现应遵循：

1. 只读取 `approved` 条目。
2. 按语言生成独立 manifest 和内容哈希 chunk，例如 `translations/zh-Hans/`。
3. chunk 使用现有 Latin corpus ID 作为 key，不复制 occurrence resolver。
4. 页面先按 release shared ID 重建 Latin，再按相同 ID 可选叠加译文；缺失译文明确回退 Latin。
5. 翻译 manifest 必须记录 corpus manifest hash、语言、生成时间和条目状态统计。
6. 网站 chunk 生成器必须验证 `℣.`、`℟.`、`†`、`*` 和段落结构。
7. 其他语言使用独立模板，如 `translation-template.en.jsonl`，但共享同一 Latin ID，不修改 corpus ID。

## 上游或 Release 更新

若未来更新上游文本或增加年份：

1. 先完成新的 release 数据、oracle 和 checksum 验证。
2. 重新提取 corpus，并按稳定 ID 合并已有模板。
3. 审查新增 ID、消失 ID和同文不同来源组。
4. 任何 Latin 或 sourceRefs 改动都会形成新 shared ID；旧译文进入 deprecated，必须人工决定是否迁移。
5. 不得把旧译文仅按纯文本自动迁移到新 ID。
6. 重新生成语言 chunks，并允许通过 Git 或上一 translation manifest 原子回滚。

整个过程必须继续与 `features/prima1962/` 和 `/martyrology/` 保持数据、resolver、译本及许可隔离。
