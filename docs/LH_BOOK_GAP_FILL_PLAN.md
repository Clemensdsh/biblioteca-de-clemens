# 时辰礼仪中文缺口：从《每日颂祷》PDF 补齐的计划（交接文档）

写于 2026-11-22。给之后接手的 agent：先读本文件，再读 `progress.md` 末尾的相关几节。本文件自成一体，不需要读历史对话。

## 1. 目标与背景

站点「时辰礼仪」（`pages/liturgia-horarum/`）显示拉丁文（Liturgia Horarum 第二版 2014 年四卷本）与中文对照。中文来源有三层，页面按顺序取第一个有的：

1. 两个在线来源：万有真原（简体，`zh/wanyou/`）、香港本（繁体，`zh/hkdlc/`），由外部 zh 项目按拉丁行键（如 `14DEC_MODLITBA`）对齐，不在本仓库。
2. `zh/ocr-commons.json`：《每日颂祷》通用部份 OCR 配上的行（目前只有圣母周六纪念的两条禱詞）。
3. `zh/wanyou-gap.json`：从万有真原日页补抓的行（71 个拉丁行，见下）。

两个在线来源对少数日子缺中文。**本计划的目标：用《每日颂祷》扫描本（PDF）把剩下的缺口补上，只补中拉确实对得上的，对不上的不硬配。**

## 2. 当前状态（2026-11-22）

- 2026 年默认庆典（首个版本）带键的拉丁行 52215 行，**无中文 44 行**；所有庆典选项与版本合计，不同的无中文拉丁行 **314 个**（天主经引言 `_OTCENAS-UVOD_*` 不算，用户决定不补；星期六纪念圣母 `SPMVS*` 另有专门组件，不处理）。
- 缺口构成（按庆典）：2026 年 471 个庆典中 127 个有缺口，其中 **94 个是自由纪念**（缺的是该圣人专用的诵读二与集祷经，约 5 行一个），其余 33 个是必行日（圣诞期/复活期/将临期平日与主日、使徒庆日、若干必行纪念）。
- 已补：万有真原日页抓取与配对（`scripts/liturgia-horarum/build-wanyou-gap.mjs`），详见 `progress.md`「万有真原日页抓取补缺」一节。**站点按中国大陆历**（耶稣升天、主显节移到主日），个别日子的读经与拉丁相差一格，所以仍有缺口。

## 3. 剩下的缺口，分三类

重新生成清单：

```
node scripts/liturgia-horarum/build-wanyou-gap.mjs --check --core     # 必行日仍无中文的拉丁行（按日期与行键）
node scripts/liturgia-horarum/build-wanyou-gap.mjs --check --report   # 自动配对未成的读经/对答咏及原因
```

**A. 书里应当有（值得做，先做）**
- 圣诞期平日 1/7、1/10：诵读一二及答唱、赞主曲对经（拉丁：金言伯多禄 Sermo 160、依 63:19b–64:11、济利禄福音注释等）。
- 复活期第四、五主日（4/26、5/3）赞主曲/谢主曲对经（Ego sum pastor bonus；Ego sum via…），将临期第三主日 12/13、圣家庆日 12/27 的对经。
- 圣多明我 8/8 诵读一（欧 5:14–7:2）、6/25 撒上 21:2–10、9/6 耶 37:21; 38:14–28、常年期第 6/7 周四（箴 10；训 6:11–7:28）、将临期第一周四 12/…（民 12–13）等**平日诵读一**，及其对答咏。
- 圣西里尔 6/27、圣金十字若望之外的必行纪念的赞美诗（07DEC_rHYMNUS 等：站点译文与拉丁不对应）。

**B. 书里大概率没有（不用找，除非先验证）**：1969 年后才进礼历的圣人或升级的庆日——圣高比（8/14）、圣庇护（9/23）、圣玛利亚玛达肋纳庆日（7/22）、小德兰圣师（10/1 的拉丁诵读二）等。《每日颂祷》是 1971 年版的译本，`progress.md` 记过香港旧书没有这些圣人的简介。**先抽一页确认书里有没有，再决定做不做。**

**C. 自由纪念（量大，等 A 的命中率再定）**：94 个庆典、约 470 行（诵读二 + 集祷经 + 少数对经），键形如 `07JAN_cCIT2`、`07JAN_MODLITBA`。书里应有，圣人专用页码已知（见 §4）。

## 4. 书的结构与页码（已知）

- PDF：`Q:\下载\每日颂祷扫描测试\每日颂祷（1-3合集）.pdf`，5547 页，竖排繁体影印，**无可用文字层**（乱码），必须看图。只读，不要修改。
- **圣人专用部份（按日期排）**：此前做圣人简介 OCR 已记下每个条目的页码，在 `scripts/liturgia-horarum/codex/ocr-out/<月>.jsonl`（`01`…`10`、`12`，十一月是 `november.jsonl`），字段 `date`（月-日）、`title`、`pdf_pages`、`book_pages`。例：12-03 圣方济·沙勿略在 PDF 1492 页。约范围：十二月 1492–1548、一月 1549–1591、二月 1592–1642（第一册）；三月 3289–3335、四月 3335–3371、五月 3371–3418（第二册）；六月 5152–5211、七月 5212–5261、八月 5262–5344、九月 5345–5419、十月 5420–5473、十一月 5465–5537（第三册）。每个圣人的条目含：名称、简介、（经文见通用或）专用诵读、对答咏、集祷经、赞主曲/谢主曲对经。**用这些页码定位，不用再二分查找。**
- **通用部份**：PDF 1202–1481（已全部 OCR：`scripts/liturgia-horarum/codex/ocr-out/commons/b*.jsonl`，每页一行，字段 `pdf_page`、`book_page`、`header`、`text`…，转录规则见 `scripts/liturgia-horarum/codex/TASK-ocr-commons.md`）。书页码 = PDF 页码 − 596 附近（PDF 1203 = 书 607）。通用部份对 B/C 类帮助有限，但「經文見……」会指向它。
- **季节与圣咏集周（时间专用）部份**：位置**未知**，需要定位（见 §5.1）。按卷大致：第一册（PDF 约 1–1200，含补充圣咏、将临期与圣诞期）、第二册（四旬期、复活期）、第三册（常年期各周、圣人专用在 5121–5537）。页眉写着「將臨期第三主日」「聖誕期」之类，可凭页眉二分。

## 5. 计划

### 5.1 第一步：定位页码（不转录，只产一张表）

1. 准备条目清单（给 agent 用）：从 `--core` 输出、`artifacts/` 里的统计（可重新生成，见 §7）挑出 A 类条目，每条：日期、庆典、缺什么（诵读一/二、对答咏、对经 X、集祷经）、拉丁出处或首句。
2. 圣人专用条目：直接用 §4 的 jsonl 查 `pdf_pages`，核对一页（渲染 100 dpi 看页眉）。
3. 季节条目：用 PyMuPDF（`import fitz`，已安装）按页码渲染页眉小图（如 70 dpi 裁上部），二分查找目标周/日。每个目标约 10 次查看。
4. 产出 `scripts/liturgia-horarum/book-gap-pages.json`：`[{ "date", "title", "need": [...], "pdf_pages": [...], "note" }]`。
5. **先抽验 B 类**：对圣高比、圣庇护、玛达肋纳等各看一页，确认书里有没有；没有就从清单划掉。

### 5.2 第二步：转录并提出配对

对 `book-gap-pages.json` 里定位到的页，逐页转录（规则同 `TASK-ocr-commons.md`：竖排右到左、每栏一行、块间空行、保留 ※＋☆ 等符号、看不清写〔?〕、不改字不补字），写到 `scripts/liturgia-horarum/codex/ocr-out/gaps/`，格式同 commons 的 jsonl。然后对每个缺口行提出配对，写成 `ocr-commons-pairs.json` 格式的条目：

```json
{ "id": "...", "kind": "reading|responsory|collect|antiphon|preces", "block": "<拉丁块 id>", "row": 1,
  "key": "14DEC_cCIT2", "pages": [5xxx], "from": "中文首几个字", "to": "中文末几个字", "note": "..." }
```

`scripts/liturgia-horarum/build-ocr-commons.mjs` 会：从转录里按首尾词截取（忽略空白与断行，必须唯一命中，不手打）、按 kind 排版、做结构校验、OpenCC 转简体、写 `zh/ocr-commons.json`（键 `rowHash('ocr', 拉丁行, '')`，内容相同的拉丁行共用）。**目前只实现了 `preces`**；这一步要给它加：
- `reading`：行文 = `恭读/选读…出处\n标题\n正文各段`（照 `zh/wanyou` 现有格式，见下）；
- `responsory`：`对答咏\n出处\n领：…\n答：…`；
- `collect` / `antiphon`：正文一行（集祷经含结语“以上所求…阿们”）。
参考现有格式：`public/data/liturgia-horarum/zh/wanyou/common/*.json` 里 `LECTIO PRIOR/ALTERA` 行的文本。`features/liturgiaHorarum/zhFormat.ts` 的 `formatZh` 规定了页面怎样解析这些行（`恭读/选读` 开头行、`对答咏`、`领：/答：`）。
**配对的拉丁块与行号**用 `node scripts/liturgia-horarum/build-wanyou-gap.mjs --check --core`、`--report`、`--review` 输出（行键、拉丁首句），或直接读 `public/data/liturgia-horarum/zh/rows/…`。

### 5.3 第三步：核对

- 脚本只证明中文确实出自转录、结构合格，**不证明语义对得上**。逐条读拉丁与中文：读经看经文出处和首句；教父文看作者与作品名、对答咏出处；集祷经、对经看大意。
- **中文与拉丁对不上就不配**（约定见 `progress.md`「约定和入口」：宁可合组或标明不匹配，不得硬配）。已知易错点：香港本译的是 1971 年版，新版拉丁的读经范围、集祷经措辞可能不同（如圣多明我诵读一欧 5:14–7:2 对 6:1–7:2）。范围明显更短的中文可以不配。
- 配好后：`node scripts/liturgia-horarum/build-ocr-commons.mjs`，再 `npx vitest run features/liturgiaHorarum`，再跑 §7 的覆盖统计看缺口降了多少。

### 5.4 第四步（视 5.2–5.3 命中率再定）：自由纪念 C 类

用 §4 的 jsonl 页码，按月分批，让 agent 转录各条目的诵读二、对答咏、集祷经，再同 5.2 配对。先抽一个月试做，看命中率（拉丁与香港本是否同一篇）。量估计 94 个庆典 × 约 2–3 页。

## 6. 要点与坑

- **万有真原已有的不重做**：`wanyou-gap.json` 已覆盖 71 行；本计划只补它仍缺的。优先级：`ocr-commons.json` 排在 `wanyou-gap.json` 之前（见 `features/liturgiaHorarum/data.ts` 的 `chinese()`：`zh ?? bioZh ?? ocrZh ?? wanyouGapZh`），所以新补入不会被覆盖，也不会覆盖两个在线来源。
- **重建数据会清空覆盖文件**：`build-data.mjs` 会清空 `public/data/liturgia-horarum/`；重建后要重跑 `build-ocr-commons.mjs`、`build-wanyou-gap.mjs`、`build-bios.mjs`。
- **简繁**：OCR 是香港繁体；简体视图显示 OpenCC（hk→cn）转出的简体并标「取自香港本」。注意 OpenCC 不改「祢/祂」。
- **Codex 额度**：写本文件时 5 小时限额已接近用完。OCR 做法见 `scripts/liturgia-horarum/codex/run-ocr-commons.ps1`（每批 10 页、并行 3、可重跑续做、`model_reasoning_effort="medium"` 已够用，质量抽查很好）。定位页码用缩略图，量小。
- **别碰**：天主经引言（用户决定不补）、星期六纪念圣母 `SPMVS*`（另有专门组件，以后需要再搬回）。
- 工作流约定：先读 `progress.md` 与 `CLAUDE.md`；阶段完成后更新 `progress.md`；不擅自提交、推送或部署。

## 7. 重新测覆盖率（临时脚本）

仓库里没有保留覆盖统计脚本，需要时临时建 `features/liturgiaHorarum/zzcov.test.ts`（用完删除）：用 `LiturgiaHorarumLoader` + 本地 `fetch`（照 `data.test.ts`），遍历 `years/2026.json` 的每天、所有庆典选项、所有版本、所有块，对 `loader.chinese(date, 'hkdlc')` 返回的每个有实质拉丁（`plain(row.la).length >= 25`）、有键、键不以 `@` 开头、不含 `OTCENAS-UVOD` 的行，统计 `row.zh` 为空的行；默认路径只算默认庆典的首个版本。基线：默认路径 52215 行、缺 44；全部合计不同的缺失拉丁行 314。

## 8. 相关文件速查

| 作用 | 路径 |
|---|---|
| 中文回退与格式 | `features/liturgiaHorarum/data.ts`、`zhFormat.ts` |
| 覆盖机制与配对脚本 | `scripts/liturgia-horarum/build-ocr-commons.mjs`、`ocr-commons-pairs.json`、`build-wanyou-gap.mjs`、`wanyou-gap-approved.json`、`wanyou-gap-manual.json` |
| 圣人专用页码 | `scripts/liturgia-horarum/codex/ocr-out/*.jsonl`（`01`–`10`、`12`、`november`） |
| 通用部份转录 | `scripts/liturgia-horarum/codex/ocr-out/commons/` |
| OCR 任务模板与启动脚本 | `scripts/liturgia-horarum/codex/TASK-ocr-commons.md`、`run-ocr-commons.ps1` |
| 万有真原抓取 | `scripts/liturgia-horarum/wanyou/`（`gap-dates.json`、`TASK-scrape.md`、`scrape.mjs`、`out/text/`） |
| 拉丁行数据 | `public/data/liturgia-horarum/zh/rows/{common,titles}/*.json`（块 id → `[拉丁 html, 键]` 行） |
| 进度与约定 | `progress.md`、`CLAUDE.md` |

> 2026-11-22 收工：结果与未补项见 docs/LH_BOOK_GAP_FILL_RESULT.md。
