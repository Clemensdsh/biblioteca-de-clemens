# 罗马弥撒经书（新礼）组件：目标、现状与续做指引

页面 `/missale-romanum/`（礼仪馆入口「罗马弥撒经书」）。本文件是这个组件的总说明，新会话接手时先读本文件，再看 `progress.md` 对应小节。

## 一、最终希望做成的样子

用户的设想（2026-11-24 对话中确定的方向，标「用户定」者为用户明说的决定，其余为据此整理的目标，做之前可再与用户确认）：

1. **新礼（保禄六世弥撒经书，拉丁现行第三版）每日弥撒的中拉对照**，与站上「时辰礼仪」「罗马大日课」同一类的每日在线组件：选日期 → 显示当天整台弥撒。（用户定：先做新礼；旧礼拉丁全开源、搬运价值低，旧礼中文已有凤翔教区本但手头没有、不宜乱做，均暂不做。）
2. **整台弥撒按顺序排出**：弥撒常规（固定经文）为骨架，当天要换的部分填进去——进堂咏、集祷经、读经一、答唱咏、读经二、福音前欢呼、福音、献礼经、颂谢词、领主咏、领圣体后经，必要时隆重降福或为民祈祷；当日若有多种可选（任选纪念、多式颂谢词、多台弥撒如圣诞子夜/黎明/白天、守夜弥撒），在原处切换。（用户定：从固定经文框架做起，每日更换的先留空；颂谢词先挂钩礼历。）
3. **日期 → 礼仪日由礼历决定**：与时辰礼仪共用同一份普世礼历数据，两页对同一天的称呼一致；显示季节、周次、主日甲乙丙年与平日一二年（读经要用）。（用户定：设日期—礼仪日换算、挂钩礼仪历法。）
4. **拉丁与中文逐段对照**，可只看拉丁或只看中文；红字礼规可开关；中文与拉丁不一致处只加注、不改译文；没有可信中文的地方留空或只列拉丁，不自行翻译（沿用全站约定：使用明确可信的来源，不用非官方独立译本）。
5. **之后**：读经（拉丁新拉丁通行本 + 中文思高本，按读经表 Ordo Lectionum Missae 编排）；圣人通用、各种需要弥撒、追思弥撒、仪式弥撒等可作后续扩展。

## 二、现状（2026-11-24，提交见 git log）

| 部分 | 状态 | 文件 |
|---|---|---|
| 弥撒常规（有信友参与）+ 感恩经一至四式 | 已做，246 组对照全有中文 | `resources/missale/ordo-missae.txt` |
| 颂谢词 52 篇（常规所附 50 + 天使、圣若瑟） | 已做；殉道者（二）无中文 | `resources/missale/praefationes.txt` |
| 隆重降福 20 式 + 邀请词 | 已做；常年期六无中文 | `resources/missale/benedictiones.txt` |
| 日期 → 季节/周次/读经年份 | 已做，与时辰礼仪数据 2021–2036 逐日核对一致 | `features/missale/calendar.ts` |
| 当日庆典（名称、等级、任选纪念） | 读时辰礼仪数据 `public/data/liturgia-horarum/` | `MissaleCalendar`（同上） |
| 颂谢词挂钩 | 已做，按各篇所附礼规；圣人按庆日名称推定类别 | `features/missale/praefatio.ts` |
| 隆重降福建议 | 已做（可选，默认收起） | `features/missale/benedictio.ts` |
| 专用颂谢词（约 20 个日子，印在当日弥撒中） | **未做**，页面只列名称 | 见 `praefatio.ts` 的 `PROPER` 与四旬期主日 |
| 为民祈祷（oratio super populum） | **未做**（拉丁 26 / 中文 24，需按内容配对；2002 年版四旬期平日用） | PDF p.379–382；《感恩祭典》卷一附录四 |
| 每日专有经文（进堂咏、集祷经、献礼经、领主咏、领圣体后经） | **未做**，常规中为空位 | — |
| 读经、答唱咏、福音前欢呼 | **未做** | — |

页面与组件：`pages/missale-romanum/index.vue`；`components/missale/OrdoItems.vue`（递归渲染条目；空位是具名插槽 `slot-<id>`，页面可填入当日经文）；`components/missale/DayChoice.vue`（当日可选的一组经文：建议各式按钮 + 「其他」下拉 + 理由）。类型 `features/missale/ordo.ts`。测试 `features/missale/*.test.ts`。

## 三、底本

- **拉丁**：用户提供 `Q:\下载\latin_missal2002.pdf`——*Missale Romanum, editio typica tertia*, 2002，828 页重排文字层（非扫描）。弥撒常规 PDF 第 303–370 页，颂谢词 311–346，隆重降福 370–379，为民祈祷 379–382，各日专有经文在 Proprium de Tempore / de Sanctis 各页。2008 年修订重印本另增少量内容（如遣散词三式、若干圣人），本站目前据 2002 年版，差异加注。annas-archive 上标「2008 第三版」的那条实为 1962 年旧礼弥撒经书，不要用。
  - 文字层导出：`python -I artifacts/scratch/pdf-dump.py <pdf> <起页> <止页> <输出txt>`；查页：`pdf-find.py <pdf> 词…`（需 PyMuPDF，用户机器的 anaconda 已有；`artifacts/` 未入库，脚本很短，缺了可重写）。PDF 有时把礼规排成字母间隔（"S e q u e n s …"），抽取后要人工还原。
- **中文**：《感恩祭典》（台湾地区主教团礼仪委员会 1982 年译本，据 1975 年拉丁第二版；信德社 2005 年简体横排版），OCR 文本 `Q:\文库\宗教\公教\天主教术语库\cleaned\Missal_{1,2,3}.clean.md`。卷一：弥撒常规与颂谢词约 L4824–6420，附录三隆重降福 L19632 起，附录四为民祈祷其后；卷二、卷三为平日与圣人，同一常规节重复出现，可互相核对 OCR（例：卷二有「接受这赎罪的牺牲」，卷一卷三脱「赎」）。OCR 常见问题：页眉混入行内（「（12）颂谢词」「弥撒常用经文（9）」）、破折号识成「一」、答句标记「答：」识成「图/留/囧/餐」、共祭者旁注插进正文、`$\bigcirc \bigcirc$`（应为「○○」）。
- **每日经文的网上参照**（尚未使用，供核对）：iBreviary 网页版 `https://www.ibreviary.com/m2/`（选项里语言设 Latino、可设日期；`letture.php?s=antifona_e_colletta|letture|sulle_offerte|prefazio|antifona_ed_orazione_dopo_comunione`，读经为新拉丁通行本；领主咏被误标为 Antiphona ad introitum；一日多台弥撒默认给哪台须核对，如 12-25 给的是守夜弥撒）；Catholic Cross Reference 第三版祷文与颂谢词索引。抓取请控制频率、存本地，版权属梵蒂冈出版社，是否采用由用户定。
- 读经表：archive.org 有 1969 年 *Ordo lectionum Missae* 拉丁原版；中文读经可用站上已有的思高本（圣咏工作已用 `resources/officium1962-psalms-zh/sigao-epub.json`）。底本未定，做之前问用户。

## 四、源文件格式与构建

三个源文件同一格式（详见 `ordo-missae.txt` 文件头）：`§` 大段、`¶` 小节、`~ 拉丁 | 中文` 副题、`? … ?end` 可选形式组、`[ id | 拉丁 | 中文 | 说明 ]` 当日经文空位、`R:/r:` 礼规、`S/P/D/O/L/T:` 说话人（大写拉丁、小写中文，连续同类大写行合为一段）、`N:` 注释、`= 名 … =end` 与 `@名` 共用段落。

- 改源文件后：`node scripts/missale/build-missale.mjs` 生成 `features/missale/{ordoMissae,praefationes,benedictiones}.json`；`--check` 校验并比对 JSON 是否最新（测试也会跑）。
- `scripts/missale/extract-praefationes.mjs`、`extract-benedictiones.mjs` 是一次性抽取草稿的工具，源文件已人工校读定稿，**不要重跑覆盖**（有 `--force` 保护）。新内容（如专用颂谢词、为民祈祷）可仿照它们写新的抽取脚本 → 草稿 → 人工校读。
- 构建链（`pnpm run build`）上的 node 脚本不得 import `.ts`（Cloudflare Pages 与 CI 固定 Node 22.16，见 `.node-version`）；本组件的 JSON 是提交入库的生成物，构建时不重新生成。

## 五、续做建议（按次序）

1. **专用颂谢词**：约 20 个日子（主受洗、献主、四旬期第一至五主日、圣枝、圣油弥撒、五旬节、圣三、耶稣圣心、基督君王、预报、若翰诞辰、伯多禄保禄、显圣容、圣母升天、光荣十字架、诸圣、拉特朗奉献、无染原罪）。拉丁在 PDF 各日弥撒内（如基督君王 p.302、耶稣圣心 p.300，格式「Præfatio: De …」后接「Textus sine cantu」与正文）；中文在《感恩祭典》相应日子。加进 `praefationes.txt`（新 id，如 `prop-rex`），`praefatio.ts` 的 `PROPER` 改为给出该 id。注意 2002 版与 1975 版专用颂谢词的增减（如四旬期主日在 1975 已有）。
2. **为民祈祷**：按内容配对拉丁 26 / 中文 24，接到四旬期平日与 `benedictio.ts`。
3. **每日专有经文**（进堂咏、集祷经、献礼经、领主咏、领圣体后经）：先定底本与做法（PDF 抽取全年 Proprium + 《感恩祭典》中文，规模大，宜分季节分批；或以 iBreviary 拉丁作核对）。需要一份「礼仪日 → 弥撒」对照（时辰礼仪数据的庆典名称可作键），注意一天多台弥撒与任选纪念。
4. **读经**：先定读经表来源与中文底本，再设计数据（按甲乙丙年、平日一二年）。
5. 一直要做的：中拉逐句复核（请懂拉丁文者）；圣人类别推定的特例；暗色与打印样式细看。

## 六、验证方法

- `npx vitest run features/missale`（11 项）：源文件与 JSON 一致；季节/周次与 2021–2036 时辰礼仪数据逐日一致；每日每个庆典的颂谢词与降福 id 都存在；样例日按礼规。
- 页面：`pnpm run build` 后用本地静态服务看 `/missale-romanum/?date=YYYY-MM-DD`（`artifacts/scratch/serve-gzip.mjs`、`shot.mjs` 为无头 Edge 截图脚本，未入库）。
