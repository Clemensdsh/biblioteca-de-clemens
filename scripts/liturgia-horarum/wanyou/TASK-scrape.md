# 任务：抓取万有真原《时辰礼仪》日页的中文文本（2026 年，指定日期）

站点：`https://www.wanyouzhenyuan.cn/index.php?m=daily&stype=<类型>&date=<YYYY-MM-DD>`。例如 `stype=let` 是「诵读日课」（诵读一、诵读二及各自的对答咏，页面中的「或：」是备选项）。本站已有的中文大多就来自这个站；现在发现个别日期的诵读、对经、集祷经在我们的数据里缺了，要把这些日期的页面文本抓下来，之后由我按经文出处与拉丁逐行配对。**你只负责抓取与结构化保存，不要做配对，不要改仓库里其他文件。**

## 输入

`scripts/liturgia-horarum/wanyou/gap-dates.json`：
- `mainDates`：107 个有缺口的日期（`celebrations` 里列出每个日期的庆典、等级、缺的部分 `kinds`，如 `LECTIO PRIOR`/`LECTIO ALTERA`=诵读一/二，`ORATIO`=集祷经，`CANTICUM EVANGELICUM`=赞主曲/谢主曲对经，`HYMNUS`=赞美诗，`PSALMODIA`=圣咏对经，`RESPONSORIUM BREVE`=短答唱）。
- `shiftCheckDates`：76 个邻近日期。本站按中国大陆历（耶稣升天、主显节等移到主日），个别日期的读经与普世历相差一格，所以也要抓。

## 先摸清站点（不超过 10 个请求）

1. 取 `index.php?m=daily&date=2026-07-25` 及其导航，弄清有哪些 `stype`（诵读、晨祷、晚祷、日间祈祷、夜祷、序经等）及对应参数值。2026-07-03、2026-07-25 的 `let` 页是已知有「诵读一 或：…」的样例，拿来检验你的解析。
2. 确定每种 `stype` 页的 HTML 结构（标题、出处、小标题、正文段落、「领：/答：」、「或：」备选），写解析器，把页面转成结构化 JSON。

## 抓取

- 脚本放 `scripts/liturgia-horarum/wanyou/scrape.mjs`（Node，使用内置 `fetch`，不要装新依赖）。
- 对 `mainDates` 与 `shiftCheckDates` 的每个日期，抓取：**诵读（let）、晨祷、晚祷**，以及能找到的其他时辰（午前/午时/午后/夜祷/序经）里与 `kinds` 相关的类型；若站点结构只需要少数几类就够，就只抓这些，不必全抓。先抓 `mainDates` 的 `let`、晨祷、晚祷，其余按需。
- 礼貌：**串行，每个请求之间至少停 1.5 秒**；UA 用普通的 `Mozilla/5.0 (compatible; personal-research)`；遇到 403/429/验证码立刻停止并报告，不要重试绕过；5xx 或网络错误最多重试 2 次。已存在的输出文件跳过，可重跑续做。
- 输出：
  - 原始 HTML：`scripts/liturgia-horarum/wanyou/out/raw/<date>-<stype>.html`（已 gitignore）。
  - 结构化文本：`scripts/liturgia-horarum/wanyou/out/text/<date>-<stype>.json`，格式：
    ```json
    {"date": "2026-07-25", "stype": "let", "url": "...", "title": "页面标题（如 圣雅各伯 宗徒 庆日）",
     "sections": [
       {"label": "诵读一", "variant": 1, "ref": "格前1:18-2:5", "heading": "使徒们宣讲十字架", "lines": ["段落1", "段落2"]},
       {"label": "对答咏", "after": "诵读一", "variant": 1, "ref": "玛10:18, 19, 20", "lines": ["领：…", "答：…"]},
       {"label": "诵读一", "variant": 2, "or": true, "ref": "格前4:1-16", "heading": "…", "lines": ["…"]}
     ]}
    ```
    `label` 取页面上的小标题原文（如 诵读一、诵读二、对答咏、赞美诗、圣咏、对经、短读经、短答唱、祈求、祷词、集祷经、结束祷词…）；「或：」备选用 `variant` 递增并标 `or: true`；`ref` 是页面上的经文出处原文；`lines` 是正文按段落的原文，保持简体与原标点，不要改写、不要合并段落、不要删「领：/答：」。
  - 一个汇总 `scripts/liturgia-horarum/wanyou/out/index.json`：每页的 date、stype、HTTP 状态、解析出的小标题列表、是否出错。
- 校验：解析后的 `lines` 去掉空白拼接，必须等于原始 HTML 去标签后对应部分的文本（至少对 2026-07-03、07-25 的 `let` 页逐字核对）。

## 结束时

用中文简短报告：站点有哪些 `stype`、实际抓了多少页（按类型）、失败/被限制的情况、解析上有疑问的版面（如嵌套「或：」、表格、缺小标题的页）、`out/index.json` 里异常条目数。
