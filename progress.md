# 项目当前状态与交接

更新：2026-11-20。唯一当前状态入口；进入新会话先读本文件，按需读取所链接材料。状态随工作改变，操作前重新检查 Git 和文件；详细历史见 `docs/HISTORY_MIGRATION_REPORT.md`。
## 1962 日课中文：2026-11-20 本轮交接（已提交 `d44c589` 并推送 main，由 GitHub Actions 发布 Pages；线上页面未核对）

做完的（均已在本地开发服务 `pnpm run dev`，端口 4859 用无头 Edge 取渲染页验证过抬头/时辰按钮；其余页面内容未逐页浏览器核对）：

1. **固定句**（`psalms-zh-build.mjs` 的 `FIXED`）：开端经、Allelúja、天主经（含 ℣℟ 拆分）、Benedicámus/Deo grátias/Amen、Noctem quiétam、Misereátur、Dómine exáudi（取思高圣咏 101:2）、Fidélium ánimæ「凡诸信者灵魂，赖天主仁慈，息止安所。」与 Requiéscant in pace「息止安所。」。
2. **四首颂歌 + 序经正文**（`scripts/officium1962/canticles-zh.mjs`）：Te Deum、赞主曲、谢主曲、西默盎，沿用时辰礼仪（万有真原简体），严重意译处按 1962 拉丁改写、加粗，时辰礼仪原文进注释；序经 Ps 94 正文 8 行。
3. **旧约颂歌 213 行**：数据 `resources/officium1962-ot-canticles/lines.json`（`canticles-ot-zh.mjs` 读它），底本思高 epub（`sigao-epub-ot.json`），与拉丁通行本不同处加粗+注释。1–66 行 agy 打磨，67–213 行 Codex 打磨；校验 `ot-canticles-check.mjs`（结构）与 `ot-canticles-quotes.mjs`（注释里的思高引文须逐字出自 epub）。难解拉丁句见 `scripts/officium1962/codex/codex-out/ot-canticles-*.last.txt` 与本文件上方各组汇总，建议懂拉丁文者复核（亚纳之歌 2:5、哈巴谷 3 若干、出 15:15、申 32:5/32:12 等）。Codex 把友弟德传 16:15、多俾亚传 13:10/13:11 等行的 ` * ` 半句分隔合并了。
4. **抬头中文**：`gcatholic-headings.mjs` 抓 gCatholic 特殊形式历（2025–2027 已抓，站内数据只有 2026）→ `resources/officium1962-headings-zh/`；build 对齐出 `headings`（等级、礼仪名、当日纪念）与 `hourNames`（夜课经、赞美经、晨经、辰时经、午时经、申初经、申正经、晚经）；`Office1962Viewer.vue` 显示中文名、等级、时辰名、「当日纪念」，`pages/officium-1962/index.vue` 的时辰按钮下加中文小字。纪念取自 gCatholic（DO 导出的 `commemorations` 为空），与各时辰实际纪念不一定一致；「降临后」是 gCatholic 对「圣神降临后」的简称，原样保留。

**仍缺/待办**：
- `Canticum Quicumque`（亚大纳削信经，43 行）无中文；Laus tibi, Domine、Jube Dómine 及各祝福词、Divínum auxílium、旧式 Confiteor、Indulgéntiam、Te lucis 赞美诗、四首圣母经的 ℣℟/集祷经、读经、集祷经、对经等仍无中文（时辰礼仪与 1962 拉丁不同，见上文核查）。
- 未浏览器全面核对；`vitest run features/officium1962` 仍有此前已有的 5 项失败（homepageEntry、productionIsolation、productionPage、schema 各处），与本轮无关。
- agy 配额用尽（约 154 小时后重置）；`artifacts/` 为未跟踪草稿目录（CHM 解包、gCatholic 抓取 HTML 等），不入库。
- 若开发服务不显示新模板：杀掉占 4859 端口的进程重启（Vite 曾没有重编译 `Office1962Viewer.vue`）。

## 项目与当前状态

- 工作区 `Q:\Web-biblioteca`；网站 Git 仓库 `Q:\Web-biblioteca\biblioteca-de-clemens`。Valaxy 站点按礼仪、圣人、汉文、教父四馆组织，入口与配置见 `config/halls.ts`、`pages/guan/`；礼仪馆包括罗马大日课、时辰礼仪、哥特日课及星期六纪念圣母。
- **2026-11-14 本轮完成并上线**（用户明确要求提交、推送、上线）：① 修 `--sd/cd/wd start--` 源标记；② 补充圣咏核实为站点已含且中拉对应，无需导入；③ Codex 完成其余 11 个月圣人简介 OCR 并合并，`zh/bios.json` 169 项，手工配对在 `scripts/liturgia-horarum/bio-overrides.json`；④ 统计圣咏逐句对应现状（见下一步 4a）。验证：`vitest run features/liturgiaHorarum` 51 项通过，`pnpm run build` 本地成功（约 68 秒）；未在浏览器里看页面。上线方式：`lh-bilingual` 合并入 `main` 并推送，由 `.github/workflows/gh-pages.yml` 构建发布到 GitHub Pages；推送后的线上页面本轮未核实。`ocr-work/`（约 136 MB 渲染图）已加入 `.gitignore`，不入库。
- **2026-11-16 本轮（用户明确要求上线）**：整书分章（合集）、两本书上站、Reinink 一书不收录；分支 `main`，已推送并部署（提交 `3fe581f`、`31b0dee` 及本记录提交）。详见下节与 `docs/BOOKS_COLLECTIONS.md`。
- **2026-11-17 控制台报错修复（用户要求上线；`feb6555` 已推送 main 并部署，线上首页与 Reinink 章节页 HTML 已无图片 preload、noindex 仍在）**：① 每页 `<路径>.md` 404 —— 主题 `YunPostActions` 用 `useCopyMarkdown()` HEAD 探测 .md（需 `siteConfig.llms.files`，本站未开，也不该开），新增空覆盖 `components/YunPostActions.vue`；② 主题默认图 `bg-img.jpg`/`sidebar-bg-img.webp`/`none.jpg` 被 SSG 自动 preload 却不显示 —— 新增 `scripts/postbuild-strip-image-preload.mjs` 接在 build 后去掉 `as="image"` preload。验证：`pnpm run build` 成功，dist 中图片 preload 0 条（去掉 426 条/142 页）、JS 无 HEAD 探测；未在浏览器控制台复核。
- 此前核对时分支 `lh-bilingual`，HEAD `0e5236c`，`main` 为 `ed046df`（相差 5 个双语日课提交）。
- 已核实提交和文件存在：IA 四馆及夜间可读性/水合问题修复；中拉圣咏对照、错配保护和修正、中文标题与等级、GCatholic 名称、11 月圣人简介 OCR 接入。历史 Agent 报告曾通过构建和浏览器检查，**本次未重新运行**；具体覆盖率和逐条语义准确性仍需针对任务复核。
- 本次交接验证：Codex `debug prompt-input` 在工作区和仓库均发现入口规则；cc-remote 本地路径按当前源码模拟通过，尚未对运行中编译版本做端到端验证。旧进度全文归档后 SHA-256 与原文件一致；OCR 原文未更改。未运行网站业务测试或构建。

## 整书分章（合集）与按页面不收录（2026-11-16，已合并 main、推送并部署）

完整说明（形态、新增一本书的命令、踩过的坑、本次全部改动与未验证项）见 **`docs/BOOKS_COLLECTIONS.md`**，此处只留要点。

- 长文献改为：书目页（`/posts/<slug>/`，普通文章，首页/分馆里的入口）+ Valaxy 合集章节页（`/collections/<key>/NN`）。脚本 `scripts/split-book.mjs`；布局 `layouts/collection.vue`、`layouts/book.vue`；窄屏折叠目录 `components/BookToc.vue`；书目页侧栏 `components/BookSidebar.vue`。
- 已有两本：《赫拉克利德斯集市》14 章；Reinink《晚期萨珊与早期伊斯兰统治下的叙利亚基督教（正文中译本）》19 篇。重新生成需要的源文件位置见文档表格（《赫拉克利德斯集市》原稿只在 git 历史 `895214c`）。
- 不收录：页面 frontmatter 写 `noindex: true`，`scripts/postbuild-noindex.mjs`（接在 build 后）加 noindex meta 并从 sitemap 去掉；目前仅 Reinink 一书。首版曾误做成整站 noindex，已于同日（`31b0dee`）撤回。线上 robots.txt 前面的一大段是 Cloudflare 托管的（含对 Baiduspider、GPTBot、ClaudeBot 等的 Disallow），用户决定不改。
- **未验证**：窄屏折叠「本书目录」、书目页左侧栏、章节页外观与水合报错、手机加载速度、站内搜索是否索引章节，均未在浏览器核对；`pnpm run build` 通过（注意看输出，退出码不可靠）；`vitest run` 5 项失败均在 `features/officium1962`，与本次无关。
- 待办/待用户确认：Reinink 书的分类/日期/标签/描述为拟定；译文说明里提到的《术语表.md》站上没有；译稿是机器翻译、未经人工审读；版权风险已提示，由用户决定；《赫拉克利德斯集市》源文小节编号疑点；卷首是否单独拆页、合集封面。
## 1962 罗马大日课：圣咏中文（思高本）对照（2026-11-17，已提交推送 main；150 篇全部有中文，**语义未经人工复核**）

用户要求：150 篇圣咏的中文以**思高本**为准，按 1962 日课（Divinum Officium，DO）的分行重新切分、左右对照；拉丁通行本（Clementina）与思高不同处，在思高基础上改写并**加粗**，页面上设「注释」（悬停「注N」显示，块末另有折叠的「中文注释」）。不用时辰礼仪的圣咏中文。注释统一写“思高本作……，拉丁通行本作……”，不再写“武加大/思高说”。

- **底本**：`resources/officium1962-psalms-zh/sigao-epub.json`（《思高本.epub》，希伯来节号，繁体，读取时 OpenCC 转简体并去掉「（休止）」「第N首…」「卷二」等杂字；`overrides.json` 的 `typos` 现仅一条：摆捝→摆脱）。**旧底本**（`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`，有 OCR 错字和漏句）已弃用；基于它的第一版校订存于 `resources/officium1962-psalms-zh/psalms-v1-txt/`、`overrides-v1-txt.json`，仅供参考。
- **每篇数据**：`resources/officium1962-psalms-zh/psalms/NNN.json`（`reviewed:true` + `lines`，键 `篇:DO行标号`，同标号第二行记 `#2`）。润色前备份在 `psalms-pre-polish/`（对照校验用）。行规格字段：`from`/`to`（在思高整篇文字流里切）、`mk`（在若干字符串之后放拉丁行的 `* † ‡`）、`marks`（旧，按小句序号）、`fix`（[[旧,新]]，新含 `**` 则原样，否则整段粗体）、`zh`（整行手写，可含 `**`、` * `）、`note`。完整说明见 `scripts/officium1962/codex/TASK-psalm-zh.md`。
- **脚本**：`pnpm officium1962:psalms-zh`（= `node scripts/officium1962/psalms-zh-build.mjs`）生成 `public/data/officium1962/psalms-zh.json`（只收 reviewed 篇）；`--check` 只校验、`--worksheet=5,6 [--all]` 打印工作表、`--draft` 含未校订。**Codex/agy 并发时只许用 `--check`**。`psalms-zh-polish-check.mjs` 校验润色没动禁区；`psalms-zh-epubcheck.mjs`、`-triage.mjs`、`-sim.mjs`、`-analyze.mjs` 为分析用。Codex 任务/启动脚本在 `scripts/officium1962/codex/`（`TASK-psalm-zh.md`、`run-psalms-zh.ps1`；润色：`TASK-polish-psalm-zh.md`、`run-polish-psalms-zh.ps1`；日志在已 gitignore 的 `codex-out/`）。
- **前台**：`features/officium1962/psalmKey.mjs`（键＝篇号:节号:拉丁字母哈希）、`psalmsZh.ts`；`components/officium1962/LiturgicalBlockRenderer.vue`：有中文的圣咏行**左拉丁右中文**网格（窄屏上下叠放），粗体＝改动处，「注N」悬停浮层（浮层是中文行下的独立 `span`，不要放进 `sup`——主题给 `sup` 设了 `position: relative` 会把浮层挤成竖线）；`Office1962Viewer.vue` 并排时加宽到 62rem；页面工具栏「圣咏中文」开关（localStorage `officium1962.zh`）；`Officium1962Loader.loadPsalmsZh()`。圣三光荣经/亡者结句中文在 build 的 FIXED。
- **做法与流程**：本轮由 Codex（gpt-6.1-terra，high）按 TASK 逐篇做切分、半句符号、与通行本差异的改写和注释（~2400 行）；再由 agy（`gemini-3.8-flash-high`）润色：只改粗体、`fix` 新字、注释，思高未标粗原文逐字不变（校验：2516 处改动、0 违规）。agy 无头模式需在其 `settings.json` 里加 `"permissions":{"allow":["command(*)"]}`（已由用户设置）。
- **验证**：`vitest psalmsZh`（6 项）通过；`pnpm run build` 通过（66 秒）；浏览器里看过对照布局与悬停注释（用户确认）。`productionPage` 的 dark-theme 测试等 5 项失败为此前已有。
- **未做/需注意**：①**语义准确性没有人工复核**：Codex 标出的拉丁句义不确定处（如 4:5/8/9、15–18 篇若干处、118:20/38/53/83/138/150、77:21/46/69）建议由懂拉丁文者抽查；其余行只保证分行和半句位置合理，未逐节比对通行本与思高。②epub 疑似错字：6:7「鼻涕」（通行本为「眼泪」，不知是底本错字还是译本差异）。③1962 页面其他部分（对经、读经、集祷文等）仍只有拉丁文。④`public/data/officium1962/psalms-zh.json` 约 592 KB，一次性加载；未做分篇懒加载。⑤旧底本相关脚本函数 `readSigaoTxt` 保留但不再使用。
- **接下来可做**：抽查/复核语义；把 Codex 的“不确定处”汇总成清单供人工复核；对经、短读经、集祷文等其他部分的中文来源评估与做法（见本节之前的评估：简单/中等/困难分级）。

## 下一步（未完成或未验证）

1. **（2026-11-14 已修，未浏览器验证）`--sd start--` 标记**：万有真原源数据中共 13 处 `--sd/cd/wd start--`（sd 6、cd 5、wd 2；common 007/012/056 与 titles 5 个文件），均紧跟赞美诗末尾；其中 2 处 `--cd start--` 后还带出下一段赞主曲全文（`titles/b4d6acfb9b8e`、`f8a43c1de93d`）。代码原先不处理。已在 `features/liturgiaHorarum/zhFormat.ts` 的 `formatZh` 于首个标记行截断，并加测试；源 JSON 未改。验证：`npx vitest run features/liturgiaHorarum` 4 文件 51 项通过；未构建、未在浏览器核对 11/12 页面（该日具体用哪个文件未追踪）。工作区仍未提交。
2. **补充圣咏（2026-11-14 结论：站点已含，无需导入；上一版“节日时辰没挂补充圣咏”的判断是错的，已更正）**：用户决定沿用现有写“他”的 hkdlc/wanyou 文本。全量核对 `cels/` 中所有庆节、纪念、主日、平日的午前/午时/午后默认版：每个时辰的 PSALMODIA 均含 3 首带拉丁与中文的圣咏（含圣母无染原罪节三个时辰，Ps 119–127 已在）。唯一异常是圣母无染原罪节三处开头块里的内部提示 `<p class="warn">装配状态…complementary_psalmody_unresolved</p>`；这类 `装配状态` 提示共 17 处/7 个文件（`needs_editorial_or_calendar_review`、`not_in_37_item_audit` 等），代码未处理且经 `v-html` 输出，疑似直接显示给读者，**未处理，待用户决定是否隐藏**。用户强调“拉丁与中文必须对应：用补充圣咏就两种文本都用补充圣咏”，已核对：重跑 `check-zh-pairing.mjs`，`mismatch.json` 结果与原文件逐字节一致（5145 行圣咏，445 行中文对应了别的圣咏、均已在 `fixes.json` 改配或屏蔽；273 行无法判定）；`ZALM120–128` 的错配如“改用 128(129)/130(131)/78(79)”均已换成对应圣咏的中文。另做独立检查：所有庆节/纪念/主日/平日的午前、午时、午后，有拉丁标题的圣咏行（香港本 44251、万有真原 44257）中文编号与拉丁一致；仅 6 处“不一致”是圣咏 116:10-19 的标题格式差异（复活节八日庆期周三），实际对应无误。局限：13487 行拉丁无标题，只能靠检查脚本按首节认定，未逐行语义核对。下面三条是更正前的旧记录，仅供参考，不再是待办：
   - 拉丁 PDF（7114 页，有文字层）**收录**这些圣咏：希伯来编号 120–128 的正文在诗篇各处出现（如 Ps 123 `Ad te levávi` 约在全文提取第 35465 行），说明“补充圣咏”三组（I：119–121，II：122–124，III：125–127，希腊编号）即 Psalmodia complementaris，目录指第 I 册 950 页。但我没有定位并核对 950 页那一节的组合与对经原文；此提取是临时文件，未入库。
   - 站点数据已有 Ps 120–128 的中文：`ZALM120`–`ZALM128` 行在 hkdlc、wanyou 两版全部有中文（14–37 次/篇），措辞与用户 OCR 近似但有差异（OCR 用“祂/祢”，现有为“他”等）。所以缺的不是圣咏正文，而是**节日日间时辰没有挂补充圣咏**：数据里目前只在 `titles/b6fb60f32649`（圣母无染原罪节）见到 `complementary_psalmody_unresolved`（午前/午时/午后三处）。其他节日是否同样缺失未查。
   - 待决定：(a) 为这类节日时辰补三组圣咏及对经（需改 `build-data.mjs`，并取得拉丁对经）；(b) 是否用用户 OCR 的《每日颂祷》文本作为第三个中文版本，还是沿用现有 hkdlc/wanyou 文本。未做。
   - 原指引：按 `docs/SUPPLEMENTAL_PSALMS_OCR_SOURCE.md` 中用户提供的《每日颂祷》597–603 页原始转录，与上下文及原书核对后，再设计中文入库和中拉配对；本轮没有导入。检查 `Q:\文库\新礼拉丁日课进度\Liturgia Horarum (LIBRERIA EDITRICE VATICANA) (2014).pdf` 是否含对应拉丁文；文件存在但内容未核验。
3. **圣人简介 OCR（2026-11-14 Codex 11 个月全部跑完，已合并，逐字复核仅抽样）**：页码——一月 1549–1591、二月 1592–1642、十二月 1492–1548（均第一册）；三月 3289–3335、四月 3335–3371、五月 3371–3418（第二册）；六月 5152–5211、七月 5212–5261、八月 5262–5344、九月 5345–5419、十月 5420–5473。各月 `ocr-out/<月>.jsonl` 条数/有简介：01 19/18，02 18/17，03 11/9，04 14/14，05 19/17，06 18/16，07 21/21，08 24/20，09 17/13，10 19/18，12 16/12；不确定字仅六月 1 处（06-05〔參?〕）。已运行 `build-bios.mjs`：`zh/bios.json` 由 16 项增至 155 项，`vitest run features/liturgiaHorarum` 51 项通过。**文本/日期/圣人核对（用户要求不再抽查原图，只看文本）**：逐条对照 155 项（现 169 项）的中文名称、简介与对应拉丁庆日名、拉丁简介首句，人物与日期均对得上；之前未配上的普世礼历条目已按人物手工配对，写入新文件 `scripts/liturgia-horarum/bio-overrides.json`（`build-bios.mjs` 先读它，再走年份/排除法）：思天（Sebastianus）、七位会祖、达义（Stanislaus，中文称约 1030 年、拉丁 1036，译文自带差异未改）、乔治、迪仁/齐礼、邦康、德宜（Dionysius）；以及一份中文对应多段拉丁简介的，按句子边界原文切开：费舍与穆安（三段）、西满与达德（两段）、01-02 西略/国瑞、09-16 高略/启廉（后两者之前整段挂在第二段、第一段无中文，已更正）。结果 `zh/bios.json` 169 项，测试 51 项通过。仍无中文的 30 条拉丁简介基本是 1969 年后增补的圣人（如 Bakhita、Kolbe、Newman、若望廿三世等）或香港旧书没有，属预期；中国地方真福/纪念不配对。未处理：12-12 聖若安（尚达尔）为香港本地，拉丁无对应。以下为较早的抽查记录：抽查两页原图：九月 5345 页（聖國瑞）与转录逐字一致；七月 5236 页发现原书把 07-20 与 07-21 的**名称印反**（日期、简介、“經文見”相符），已在 `07.jsonl` 把两条名称对调（07-20 真福任德芬等、07-21 聖樂倫），note 已说明，匹配恢复。**未验证**：其余条目未逐字对原图复核；05 月 `05-00 中華聖母`（浮动日期）未配入；未配对项主要是中国地方真福/地方纪念（日历无对应拉丁简介，按约定不硬挂），另有候选歧义的 01-20 聖思天、02-17、04-11、04-23、05-12×2、06-22、07-20、09-28、10-09、10-28、12-12 等，脚本报告可重跑查看，未手工处理。未浏览器核对简介显示，未构建。以下为启动时的旧记录：新增 `scripts/liturgia-horarum/codex/TASK-ocr-month.md` 与 `run-ocr-months.ps1`，对 01–10、12 月各起一个 `codex exec`（并行 3），输出 `ocr-out/<月>.jsonl`、日志 `<月>.log`；由 Codex 自行在 PDF 内定位各月页码（十一月为 5465–5537 页附近；第三册圣人部分 5121–5537，十二月可能不在其中）。Claude 后台任务 ID 28564（会话结束即停止，可重跑，脚本会续做）。**待验收**：每月 jsonl 完成后抽查原图逐字、核对页码，再运行 `node scripts/liturgia-horarum/build-bios.mjs ocr-out/*.jsonl` 合并进 `zh/bios.json`（注意看报告的未配对项），最后跑测试。以下为旧记录：现有 `scripts/liturgia-horarum/codex/TASK-ocr.md` 是十一月试做；21 条、19 条有简介，`zh/bios.json` 16 项。其他月份由 Codex 分批处理，保留原文、页码和不确定标记；原图逐字及配对仍需相应复核。
4a. **圣咏逐句对应现状（2026-11-14 只读统计，未改数据）**：自动对齐失败的圣咏文本共 278 篇（万有真原 65、香港本 213），**全部**已有人工对齐（`zh/align-*.json`，均通过页面自带校验），无缺失、无“放弃”项。但其中偏粗的有：序经圣咏 95 的 `FIX:INV_PS95#1/#4/#G`（两版各 1 组，整块）；`ZALM22_CELY`（圣咏 22，两版均为 1 组覆盖 24 个拉丁单位，等于没拆）；香港本 `ZALM17`（最大一组 18 单位）、`ZALM10_I`/`ZALM71_I`（8）、`CHVAL_DAN3,26`（12）。另有约 25 篇含“只有中文、无拉丁对应”的组（多为标题/引言，但香港本 ZALM46 叠句、ZALM86,1-10、ZALM135,1-12、ZALM35_III 及万有真原 CHVAL_SIR36 含正文行）。香港本另有 32 行因中文是另一首圣咏而只显示拉丁（`fixes.json` 类型 `m`）。以上是脚本统计，未逐篇人工看语义。
4. **遗留核验**：历史记录称香港本序经圣咏 95 第 2–5 段缺首行，导致 36 处无法可靠对应；是否仍存在须核对。对齐校验只能证明结构和文本保真，不能代替语义校订。
5. **发布前**：按实际变更运行合适测试/构建和浏览器检查，复核部署目标与分支，再根据用户当前指令处理；不要从旧报告推断线上或当前测试状态。

## 约定和入口

- 普世礼历优先；地方日历特殊文本不混入。使用明确可信的来源，不使用非官方独立译本；中拉语义对不上时宁可合组或标明不匹配，不得硬配。中文文字与标点应原样保留；赞美诗暂不拆分。详见 `docs/HISTORY_MIGRATION_REPORT.md`。
- 整书分章/按页面不收录：`docs/BOOKS_COLLECTIONS.md`（用法、踩坑、改动记录）。
- 日课：`pages/liturgia-horarum/`、`components/liturgiaHorarum/`、`features/liturgiaHorarum/`、`public/data/liturgia-horarum/zh/`、`scripts/liturgia-horarum/`；人工对齐和 OCR 任务分别在 `scripts/liturgia-horarum/codex/TASK-align.md`、`TASK-ocr.md`。
- 1962 大日课旧阶段与翻译方法：`docs/officium1962/PROGRESS.md`、`docs/officium1962/TRANSLATION_WORKFLOW.md`（标注日期，不能代替本文件）。历史会话仅查索引 `docs/SESSION_ARCHIVE_INDEX.md`，不自动载入原始 JSONL。
- 阶段完成或中断时更新本文件的完成、未验证、未完成和验证结果。长会话约 25 万 Token，或长时间闲置后上下文很大时，先写好交接再新建会话；这是建议，不是硬限制。

- 第 77 篇本轮按 EPUB 思高底本重新逐行校订，写入 `resources/officium1962-psalms-zh/psalms/077.json`；已运行该篇 worksheet 和全量 `--check`，均通过，已校订篇无缺行。77:21、46、69 等拉丁措辞的理解仍宜由拉丁文专家复核；未生成 public 数据、未做浏览器检查或部署。

### 圣咏 1–6 本轮复核（2026-11-16）

- 按 `scripts/officium1962/codex/TASK-psalm-zh.md` 使用 EPUB 底本及 DO 拉丁逐行重做 `psalms/001.json` 至 `006.json`，均标记 reviewed；人工逐行安排半句、粗体与注释。此前本文件所述 1–6 的旧底本校订不能视为本轮成果的底本。
- 验证：运行六篇 `--check --worksheet=1,2,3,4,5,6 --all` 核对输出，修正后重跑并检查修改行；最终 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出码 0，已校订篇内缺中文 0。该命令只检查，未生成 public 数据，也未进行浏览器或独立拉丁专家复核。
- 待特别复核：4:5 的 `quae dicitis ... compungimini` 句法、4:8 的 `multiplicati sunt` 指代、4:9 `in idipsum` 的解释；6:7 EPUB「鼻涕」与拉丁「眼泪」不一致，尚不能判定是否底本错误。其他篇与生成文件由各自负责人处理；本轮未提交、推送或部署。

### 圣咏 13–18 本轮校订（2026-11-16）

- 按 `scripts/officium1962/codex/TASK-psalm-zh.md` 对照 EPUB 思高底本和 DO 拉丁分行，逐行写入 `psalms/013.json`–`018.json` 并标记 reviewed；第 13 篇增补及与思高的差异以粗体和注释处理。
- 各篇运行 `--check --worksheet=N --all` 查看输出；最终 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出码 0，报告已校订篇内缺中文 0。结构校验不能证明拉丁释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议拉丁专家复核：15:3–4a 的句法；16:4、13–14b 的句法和意象；17:12、46 的理解；18:4 双重否定及 18:13 的 aliénis。未发现可确认的 EPUB 文字错漏。

### 圣咏 19–24 本轮校订（2026-11-16）

- 按 `scripts/officium1962/codex/TASK-psalm-zh.md` 对照 EPUB 思高与 DO 拉丁，逐篇写入 `psalms/019.json` 至 `024.json`，均标记 reviewed；处理跨节、重复行、半行符号及判断出的语义差异，并注明差异。
- 验证：逐篇运行 `--check --worksheet=N --all`，最终六篇合并 worksheet 及修正后的 19、21 worksheet 均退出 0；全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，已校订篇内缺中文 0。检查不能证明语义无误；未生成 public 数据，未浏览器验证、提交或部署。
- 待拉丁文专家复核：20:13 的 `in reliquiis tuis praeparabis vultum eorum`；21:3 的 `non ad insipientiam mihi`、21:21–22 的 `unicam` 和 `humilitatem`、21:32 的句法；23:7、9 的 `principes`；24:12 的选择主体。EPUB 疑似字误：21:11「巳」疑为「已」，23:6「苖裔」疑为「苗裔」，23:10「万军之军的上主」疑有重复；尚未核纸本，保留底本（23:10 因武加大差异另译）。

### 圣咏 25–30 本轮校订（2026-11-16）

- 按 `scripts/officium1962/codex/TASK-psalm-zh.md` 以 EPUB 思高文本及 DO 拉丁逐行校订 `psalms/025.json` 至 `030.json`，均标记 reviewed；处理重复行号、跨节分行，并对判断为武加大差异之处加粗和注释。此前第 30 篇的旧版本已依现底本重做。
- 分篇运行 worksheet 检查；最终 `--check --worksheet=25,26,27,28,29,30 --all` 与全量 `--check` 均退出 0，显示已校订篇内缺中文 0。检查是结构校验，不能证明拉丁释义无误。未生成 public 数据、未浏览器检查、未提交或部署。
- 拉丁难点有待独立复核：26:12 的 `mentita est iniquitas sibi`；28:6 的 `dilectus`、28:9 的 `praeparantis cervos`、28:10 的 `diluvium inhabitare facit`；29:6、29:13 的句义；30:7 的 `supervacue`、30:12 的比较关系、30:24 的 `veritatem requiret`。本组未发现可确认的 EPUB 底本错漏。

### 圣咏 31–36 本轮校订（2026-11-16）

- 按 `scripts/officium1962/codex/TASK-psalm-zh.md` 对照 EPUB 思高底本及 DO 拉丁，逐篇校订 `psalms/031.json`–`036.json`，均标记 reviewed；按拉丁分行安排中文，差异加粗并注释。
- 验证：六篇各运行 `--check --worksheet=N --all` 并检查输出，修正后重查 31、33、34、36；最终 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，报告已校订篇内缺中文 0。结构检查不证明释义准确；未生成 public 数据，未浏览器检查、提交、推送或部署。
- 待熟悉拉丁文者复核：31:4 的荆棘句、31:7 的呼语；34:14–16、20 的句法；35:2–3 的句法与代词；36:22 的祝福主体、36:37 的 reliquiae。EPUB 35:13「巳经」疑为「已经」、36:7「暴燥」疑为「暴躁」，未核纸本，保留底本。

### 圣咏 37–42 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行写入 `psalms/037.json`–`042.json`，均标记 reviewed；跨行、断句与判断出的武加大差异已处理并附注。
- 验证：各篇运行 `--check --worksheet=N --all` 并检查；最后六篇合并 worksheet 和全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，报告已校订篇内缺中文 0。结构检查不能证明释义准确；未生成 public 数据、未浏览器检查或部署。
- 建议拉丁专家复核 37:8 的 illusionibus、37:12 的 adversum me、38:12#2 的 araneam 与 38:14 的 remitte mihi、39:7 的 perfecisti、40:9–10 的句法和意象、41:5 的时态以及 42:3 的完成时。39:7#2 的 EPUB「巳」疑为「已」，未核纸本，照原文保留。

### 圣咏 43–48 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁分行，逐篇校订 `psalms/043.json`–`048.json`，均标记 reviewed；处理重复行号、跨节、半行及判断出的武加大差异，改译处加粗并记注。
- 六篇各自运行 `--check --worksheet=N --all`，退出码均为 0，无缺行或错误；全量 `--check` 通过、已校订篇内缺中文 0。该检查不能证明拉丁释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 需独立拉丁复核：43:19 的 declinasti 主语与语境；44:9 的 ex quibus 及 gutta，44:14 的 ab intus；46:10 的 dii fortes 和 elevati sunt；47:3 的 fundatur，47:14 的 distribuite；48:8–11 的句法与标点，48:15#2 的 auxilium 与 a gloria。未发现可确认的 EPUB 文字错漏。

### 圣咏 55–60 本轮校订（2026-11-16）

- 对照 EPUB 思高底本及 DO 拉丁逐行写入 `psalms/055.json`–`060.json` 并标记 reviewed；处理跨节、重复行号、半行及判断出的武加大差异，附粗体和注释。
- 逐篇查看 worksheet；修正后合并复查相关行，全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，报告已校订篇内缺中文 0。结构校验不能证明释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议熟悉拉丁文者复核 55:4、8 的句法；56:4#2、5 的断句；57:10 的艰涩句；58:5、13#2 的句法；59:9#2 的意象及 60:8 的指代。EPUB 57:11「巳报」疑为「已报」，尚未核纸本，保留原文。

### 圣咏 49–54 本轮校订（2026-11-16）

- 按 `scripts/officium1962/codex/TASK-psalm-zh.md` 对照 EPUB 思高及 DO 拉丁逐篇校订 `psalms/049.json`–`054.json`，均标记 reviewed；处理跨节、重复行号、半行及判断出的武加大差异，改译加粗并注释。
- 验证：逐篇运行 worksheet 检查，最终六篇合并 worksheet 和全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 无错误，已校订篇内缺中文 0。结构检查不能证明拉丁释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 待拉丁文专家复核：49:1#2、23 的句法；50:6 的 cum judicáris、50:14 的 spíritu principáli；51:4 的剃刀比喻；52:6#2 的 qui homínibus placent；53:7 的 avérte mala；54:9、19–21 的句法和指代。未发现可确认的 EPUB 底本错漏。

### 圣咏 61–66 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁分行，逐行校订 `psalms/061.json`–`066.json` 并标记 reviewed；处理跨节、重复行号与半行，判断出的武加大差异加粗并注释。
- 六篇 worksheet 复读及全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，报告已校订篇内缺中文 0；结构检查不能证明拉丁释义准确。未生成 public 数据，未浏览器检查、提交或部署。
- 建议独立复核 61:4、5、10 的句法和意象，62:3 的 appárui，63:7–8 的句法，64:12、14 的意象。EPUB 63:5「击挝」疑为文字错误，未经纸本核实；该处另按武加大改译。

### 圣咏 73–76 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁，逐行校订 `psalms/073.json`–`076.json`，标记 reviewed；处理跨节、重复行号、半行及判断出的武加大差异，改译处加粗并附注。
- 各篇及四篇合并运行 `--check --worksheet=... --all` 并检查输出；末次修订后复查 74、76。全量 `--check` 退出 0，已校订篇内缺中文 0。结构检查不能证明拉丁释义准确；未生成 public 数据、未浏览器检查、提交或部署。
- 待熟悉拉丁文者复核：73:5 的 non cognovérunt sicut in éxitu super summum、73:9 主语、73:20 的句法；74:7、9 省略与倒酒意象；75:5–6、8、11 的句义；76:3、5、11、14 的句义。EPUB 76:5「烦燥」疑为「烦躁」，未核纸本，保留底本。

### 圣咏 67–72 本轮校订（2026-11-16）

- 对照 EPUB 思高底本及 DO 拉丁逐篇处理 `psalms/067.json`–`072.json`，均标记 reviewed；逐行检查分行、半行和判断出的异文，改译加粗并记注。
- 六篇各运行 `--check --worksheet=N --all` 并检查输出，修正后合并复查；全量 `--check` 最后退出 1，报范围外 84:5、85:2 的 mk 找不到字符串，67–72 未报错，已校订篇内缺中文 0。其他篇可能正在并行修改，检查结果反映运行时状态；结构检查不能证明译义准确。未生成 public 数据，未浏览器检查、提交、推送或部署。
- 建议独立复核 67:7b、13、15、19b、31a 的艰涩句；68:21 的 exspectavit；70:16 的 litteraturam；71:16 的 firmamentum；72:4、10、18、20–21 的句法。EPUB 72:26「巳」疑为「已」，未核纸本，保留原文。

### 圣咏 78–83 本轮校订（2026-11-16）

- 对照 EPUB 思高底本及 DO 拉丁逐篇写入 `psalms/078.json`–`083.json`，均标记 reviewed；处理跨节、重复行号、半行及判断出的武加大差异，改译加粗并附注。六篇各自运行 worksheet 并检查，之后复查六篇及全量 `--check`；本组未报告缺中文或单独错误。
- 最终两次检查退出码 1：并行工作中的 `84:5 mk 找不到「复兴我们，」`、`85:2 mk 找不到「热爱你，」`，不属本组，未改动。结构检查不能证明释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 待独立拉丁复核：78:1 的 pomorum custodiam、78:11 的 filios mortificatorum；79:10–11、16–17 的句法和指代；80:6–7 人称、80:15 的 pro nihilo forsitan、80:16 的 tempus eorum；82:2、10、14；83:6 的句法及 83:8 的 virtute 与 videbitur。EPUB 80:12「没有我的呼声」疑漏「听从」；82:10「米德杨克雄河对待息色辣和雅宾」疑有脱字，均未核纸本，依拉丁另译并附注。

### 圣咏 84–89 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/084.json`–`089.json`，均标记 reviewed；处理跨节、重复行号、半行及判断出的武加大差异，改译处加粗并附注。
- 验证：逐篇查看 worksheet，修正结构错误后重查；最终 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，报告已校订篇内缺中文 0。结构检查不能证明语义准确；未生成 public 数据，未浏览器检查、提交或部署。
- 建议拉丁专家复核 84:2 的 captivitatem、84:14 的主语；86:5–7 句法；87:5 的 inter mortuos liber、87:11 的 medici、87:19 的 a miseria；88:3、19、37、39、45、52；89:3、5、9#2、10#2、12、15 的句法与意象。EPUB 85:17（思高第 18 节）「缓助」疑为「援助」笔误，未核纸本，该处按拉丁改译。

### 圣咏 90–95 本轮校订（2026-11-16）

- 对照 EPUB 思高与 DO 拉丁，逐行校订 `psalms/090.json`–`095.json`，均标记 reviewed；处理跨节分行、半行标记及判断出的异文，改译加粗并附注。
- 六篇合并 worksheet 逐行复读，修订后复查受影响行；全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，已校订篇内缺中文 0。结构检查不能证明释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议熟悉拉丁文者复核 90:6 的 negotium 和 daemonium，91:11、15 的老年与丰饶意象，92:3b–4b 的句法，93:1 的 libere egit、93:15、20 的句法，以及 94:8 的 irritatione。未发现可确认的 EPUB 错漏。

### 圣咏 96–101 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/096.json`–`101.json`，均标记 reviewed；处理重复行号、跨节及半行，判断出的武加大异文以粗体和注释说明。
- 六篇分别运行 `--check --worksheet=N --all`，并合并阅读逐行输出；最终全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，已校订篇内缺中文 0。结构校验不证明译义准确；未生成 public 数据、未浏览器检查或部署。
- 建议独立拉丁复核 96:5 的重复短语、98:3 的 honor regis、100:4 的 declinantem a me malignum、101:21 的 filios interemptorum 和 101:24 的句法。未发现可确认的 EPUB 文字错漏。

### 圣咏 102 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/102.json`，标记 reviewed；处理跨节和重复行号，判断出的武加大差异加粗并附注。
- 两次查看 `--check --worksheet=102 --all`，修订后全量 `--check` 退出 0，已校订篇内缺中文 0。结构检查不能证明释义准确；未生成 public 数据或浏览器检查。
- 建议独立复核 102:16 的 non cognoscet 主语和 102:20 的 ad audiendam 句法；未发现可确认的 EPUB 文字错漏。

### 圣咏 103 本轮校订（2026-11-16）

- 按任务对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/103.json`，标记 reviewed；处理跨节、半行及判断出的武加大差异，改译加粗并附注。
- 复查 `--check --worksheet=103 --all`，并运行全量 `--check`，两者均退出 0，报告已校订篇内缺中文 0；结构校验不能证明释义准确。未生成 public 数据、未浏览器检查、未提交或部署。
- 建议熟悉拉丁文者复核 103:4 的 spiritus、103:17 的 herodii domus dux est eorum 句法，以及 103:27 的 ad illudendum ei；未发现可确认的 EPUB 文字错漏。

### 圣咏 104 本轮校订（2026-11-16）

- 对照 EPUB 思高底本及 DO 拉丁逐行校订 `psalms/104.json`，标记 reviewed；处理 18–19 跨节分行、半行及判断出的武加大差异，改译处加粗并附注。
- 逐行查看 `--check --worksheet=104 --all`；修订后重跑该命令及全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，报告已校订篇内缺中文 0。结构检查不能证明释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议独立拉丁复核 104:18–19 的意象、104:22 的 sicut semetípsum、104:27 的 in eis 与 verba signorum、104:28 的主语及 non exacerbavit、104:36 的 primítias omnis labóris。未发现可确认的 EPUB 文字错漏。

### 圣咏 105 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/105.json`，标记 reviewed；处理重复行号、跨节分行与半行，并为判断出的武加大异文加粗及附注。
- 逐行复读 `--check --worksheet=105 --all`；最终该命令和全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，已校订篇内缺中文 0。结构检查不能证明拉丁释义准确；未生成 public 数据、未浏览器检查或部署。
- 建议独立复核 105:5 的 ut lauderis、105:7#2 的 ascendentes、105:15 的 saturitatem、105:33 的 distinxit 及 105:39 的主语。EPUB 105:2 第一问句末为句号，可能是标点错误；未核纸本，保留原文。

### 圣咏 106 本轮校订（2026-11-16）

- 对照 EPUB 思高底本及 DO 拉丁逐行校订 `psalms/106.json`，标记 reviewed；处理跨节分行、半行及判断出的武加大差异，改译加粗并附注。
- 复查 `--check --worksheet=106 --all`，全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，已校订篇内缺中文 0。结构检查不能证明拉丁释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议独立复核 106:11 的 irritaverunt、106:17 的 suscepit 和 106:43 的句法。EPUB 106:40「徊徘」疑为「徘徊」字序错误，未核纸本，保留底本。

### 圣咏 113–117 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/113.json`–`117.json`，均标记 reviewed；处理跨节分行、半行和判断出的异文，改译处加粗并附注。
- 五篇合并 worksheet 逐行检查并在修订后重跑；最终合并 worksheet 与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，已校订篇内缺中文 0。初次检查范围外 106 篇有错误，最终检查时已不再出现。结构检查不能证明译义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议独立拉丁复核 113:7 的 mota est，114:1 的 diléxi，115:2 的 in excéssu meo，以及 117:10–12 的 ultus sum 和 117:27b 的 in condénsis。未发现可确认的 EPUB 底本错漏。

### 圣咏 119–125 本轮校订（2026-11-16）

- 对照 EPUB 思高底本和 DO 拉丁逐行校订 119–125，写入各篇 JSON 并标记 reviewed；处理跨节、拆行与判断出的武加大差异，改译附粗体及注释。
- 合并 worksheet 逐行检查，修订后复查受影响行；全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 退出 0，已校订篇内缺中文 0。结构校验不能证明释义准确；未生成 public 数据，未浏览器检查、提交或部署。
- 建议独立拉丁复核 119:3–5、120:1、121:3–5、122:4、123:3b–5、124:1 和 125:4 的句法及译义。未发现可确认的 EPUB 文字错漏。

### 圣咏 107–112 本轮校订（2026-11-16）

- 对照 EPUB 思高和 DO 拉丁逐行校订 `psalms/107.json`–`112.json`，均标记 reviewed；处理跨节、重复行号、半行及判断出的武加大异文，改译加粗并附注。
- 各篇 worksheet 逐行检查，最后合并运行六篇 worksheet、全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，已校订篇内缺中文 0；修改 107:9 后复查该篇 worksheet 退出 0。结构检查不能证明译义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议独立拉丁复核 107:9–10 的意象、108:4、17、20、24、31 的句法及指代、109:3、6 的艰涩句、110:2、3、10b、111:4–5 与 112:5 的解释。本组未发现可确认的 EPUB 文字错漏。

### 圣咏 126–132 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/126.json`–`132.json`（实际文件名为三位篇号），均标记 reviewed；处理跨节、半行、语序与判断出的武加大异文，并为改译加粗、记注。
- 七篇工作表逐行检查，修订后再次运行合并 worksheet 与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`，均退出 0，已校订篇内缺中文 0。结构校验不证明译义准确；未生成 public 数据，未浏览器检查、提交或部署。
- 建议独立复核 126:2a 的命令式和 126:4 的 excussorum；128:3 的 fabricaverunt；130:2a–b 的誓言句法与 retributio；131:15 的 viduam。未发现可确认的 EPUB 文字错漏。

### 圣咏 133–138 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/133.json`–`138.json`，标记 reviewed；处理跨节、拆行及判断出的武加大异文，改译加粗并附注。
- 六篇合并 worksheet 逐行检查并修正；全量 `--check` 曾退出 0、已校订篇内缺中文 0。最后修改 138:12 后复查该行；末次全量检查退出 1，报范围外 141:3、143:15、144:5、144:21 的 mk 找不到，133–138 未报错，可能与其他并行修改有关。结构检查不能证明拉丁释义准确；未生成 public 数据、未浏览器检查、未提交或部署。
- 建议独立拉丁复核 134:14 的 deprecabitur、136:5 的 oblivioni detur，以及 138:3、11、16–17、19–21 艰涩句。EPUB 135:22「巳仆」疑为「己仆」，138:16「衮录」疑为「登录」或「载录」之误；未核纸本，保留底本（138:16 依拉丁另译）。

### 圣咏 139–144 本轮校订（2026-11-16）

- 对照 EPUB 思高底本及 DO 拉丁逐行校订 `psalms/139.json`–`144.json`，均标记 reviewed；拆分跨节、重复行号及半行，判断出的武加大异文加粗并记注。
- 六篇合并 worksheet 逐行检查并修正断句；第一次全量 `--check` 通过，最后一次全量 `--check` 报范围外 `145:9 mk 个数(1)与断句符(2)不符`，本组六篇无报错，已校订篇内缺中文 0。其他篇可能同时变更；结构检查不证明译义准确。未生成 public 数据，未浏览器检查、提交或部署。
- 建议独立拉丁复核 139:9 的 a desiderio meo 句法、139:10 的 caput circuitus；140:4–7、10 的艰涩句及 143:3 的 innotuisti ei。本组未发现可确认的 EPUB 文字错漏。

### 圣咏 145–150 本轮校订（2026-11-16）

- 对照 EPUB 思高底本与 DO 拉丁逐行校订 `psalms/145.json`–`150.json`，标记 reviewed；处理跨节、半行和判断出的武加大异文，改译加粗并附注。
- 六篇 worksheet 逐行检查并修正，最终合并 worksheet 与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0，已校订篇内缺中文 0。结构检查不能证明释义准确；未生成 public 数据，未浏览器检查、提交或部署。
- 建议独立复核 145:4 的 eorum 指代、146:1 的句法、148:14a–b 的 confessio 与 hymnus 所指、150:1 的 in sanctis。EPUB 147:5「尘宵」和 148:12「儿童侣」疑有文字错误，未核纸本，保留底本。

### 圣咏 118 本轮校订（2026-11-17）

- 保留原有 118:1–10 规格，逐批阅读 `--check --worksheet=118 --all` 的全部 176 行，对照 DO 拉丁与思高底本；为半行位置、语序与判断出的武加大异文补写规格、粗体和注释，其余使用自动整节，现标记 `reviewed:true`。
- 完成后重跑该篇 worksheet 和全量 `node scripts/officium1962/psalms-zh-build.mjs --check`，均退出 0，已校订篇内缺中文 0。结构检查不能证明释义准确；未生成 public 数据、未浏览器验证、未提交或部署。
- 建议独立复核 118:20、38、53、83、138、150 的拉丁句义；118:134 EPUB「摆捝」（此前记录作「擺挩」）疑为「摆脱」错字，未核纸本，保留底本。

### 圣咏 11–20 本轮润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/011.json` 至 `020.json` 逐篇修缮语言表达：只改动 `zh` 粗体部分及 `note` 全文，统一采用「拉丁通行本」称谓并简化规范注释句式，消除生硬欧化与口语，未改动任何思高原文、分行或符号。
- 逐篇运行 `node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=NN` 校验；最终 10 篇全量 polish-check（改动处 189，问题 0）与 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0。未提交、推送或部署。


### 圣咏 1–10 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/001.json` 至 `010.json` 逐篇完成语言表达润色：仅调整粗体另译片段使语体庄重简练、贴合礼仪与思高文风，完全保留思高未标粗原文；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，去除「武加大」与口语化句式。
- 逐篇运行 `node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=N`，并在完成后运行 1–10 合并校验及全量 `psalms-zh-build.mjs --check`，校验均退出 0，改动处 113，问题 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 21–30 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/021.json` 至 `030.json` 逐篇润色语言表达：保留未标粗思高原文逐字不变；将粗体改译修葺为庄重、简练之礼仪与思高圣咏文体；重写所有 `note`，统一使用「拉丁通行本」与「思高本」，消除「武加大」称谓与欧化口语。
- 逐篇运行校验：21 篇改动 32 处、22 篇改动 9 处、23 篇改动 10 处、24 篇改动 21 处、25 篇改动 12 处、26 篇改动 16 处、27 篇改动 10 处、28 篇改动 7 处、29 篇改动 19 处、30 篇改动 27 处，各篇问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=21,22,23,24,25,26,27,28,29,30`（改动处 163，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 41–50 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/041.json` 至 `050.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、分行或半句符号；修缮 `zh` 粗体另译片段及 `fix` 替换文字，消除翻译腔与生硬口语，使之庄重简练、契合思高与礼仪语体；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范句式并去除「武加大」及口语表述。
- 逐篇校验与改动：41 篇改动 24 处、42 篇改动 9 处、43 篇改动 31 处、44 篇改动 28 处、45 篇改动 15 处、46 篇改动 7 处、47 篇改动 23 处、48 篇改动 31 处、49 篇改动 29 处、50 篇改动 18 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=41,42,43,44,45,46,47,48,49,50`（改动处 215，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 31–40 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/031.json` 至 `040.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔与生硬白话（如“受愚人的耻笑侮慢”、“说了夸大的话”、“大肆施行欺骗”等），使其更庄重、典雅并契合礼仪与思高语体；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：31 篇改动 16 处、32 篇改动 13 处、33 篇改动 14 处、34 篇改动 33 处、35 篇改动 15 处、36 篇改动 31 处、37 篇改动 24 处、38 篇改动 25 处、39 篇改动 28 处、40 篇改动 16 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=31,32,33,34,35,36,37,38,39,40`（改动处 215，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 51–60 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/051.json` 至 `060.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行或半句符号；修缮 `zh` 粗体另译片段，消除欧化生硬白话（如“对我说大话”、“饥饿如犬”、“街市上不断有”等句式修整），使语言表达更加庄重、典雅、合乎思高圣咏与天主教礼仪风格；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：51 篇改动 12 处、52 篇改动 10 处、53 篇改动 5 处、54 篇改动 35 处、55 篇改动 25 处、56 篇改动 12 处、57 篇改动 18 处、58 篇改动 26 处、59 篇改动 18 处、60 篇改动 11 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=51,52,53,54,55,56,57,58,59,60`（改动处 172，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 61–70 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/061.json` 至 `070.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔与生硬口语，使表达典雅庄重、合乎思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」及口语化表述。
- 逐篇校验与改动：61 篇改动 20 处、62 篇改动 11 处、63 篇改动 19 处、64 篇改动 21 处、65 篇改动 14 处、66 篇改动 6 处、67 篇改动 59 处、68 篇改动 35 处、69 篇改动 7 处、70 篇改动 28 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=61,62,63,64,65,66,67,68,69,70`（改动处 220，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 71–80 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/071.json` 至 `080.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔与生硬口语，使表达典雅庄重、合乎思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」及口语化表述。
- 逐篇校验与改动：71 篇改动 16 处、72 篇改动 43 处、73 篇改动 29 处、74 篇改动 16 处、75 篇改动 22 处、76 篇改动 21 处、77 篇改动 80 处、78 篇改动 15 处、79 篇改动 25 处、80 篇改动 18 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=71,72,73,74,75,76,77,78,79,80`（改动处 285，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check` 均退出 0。未生成 public 数据、未浏览器验证、未提交或部署。

### 圣咏 81–90 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/081.json` 至 `090.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk` 或半句符号；修缮 `zh` 粗体另译片段及 `fix` 新字项，消除欧化翻译腔与生硬口语，使表达典雅庄重、合乎思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」及口语化表述。
- 逐篇校验与改动：81 篇改动 9 处、82 篇改动 16 处、83 篇改动 13 处、84 篇改动 7 处、85 篇改动 6 处、86 篇改动 11 处、87 篇改动 17 处、88 篇改动 36 处、89 篇改动 22 处、90 篇改动 11 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=81,82,83,84,85,86,87,88,89,90`（改动处 148，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。


### 圣咏 91–100 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/091.json` 至 `100.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk` 或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔、堆叠语与生硬口语，使表达典雅庄重、合乎思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」及口语化表述。
- 逐篇校验与改动：91 篇改动 19 处、92 篇改动 8 处、93 篇改动 22 处、94 篇改动 13 处、95 篇改动 7 处、96 篇改动 7 处、97 篇改动 9 处、98 篇改动 6 处、99 篇改动 3 处、100 篇改动 12 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=91,92,93,94,95,96,97,98,99,100`（改动处 106，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。

### 圣咏 101–110 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/101.json` 至 `110.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk` 或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔与生硬口语（如「神风」、「把涕泪搀在饮料里」、「自己力量的道路」等），使表达庄重典雅、契合思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：101 篇改动 26 处、102 篇改动 21 处、103 篇改动 29 处、104 篇改动 31 处、105 篇改动 36 处、106 篇改动 27 处、107 篇改动 10 处、108 篇改动 30 处、109 篇改动 8 处、110 篇改动 9 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=101,102,103,104,105,106,107,108,109,110`（改动处 227，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。

### 圣咏 111–120 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/111.json` 至 `120.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk` 或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔与生硬口语（如「使我得到宽广」、「连同毁灭性的炭火」、「我同刻达尔的居民住在一起」、「在你的右手边」等），使表达典雅庄重、契合思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：111 篇改动 8 处、112 篇改动 2 处、113 篇改动 18 处、114 篇改动 9 处、115 篇改动 2 处、116 篇改动 0 处（纯思高原文，无注释与改动）、117 篇改动 23 处、118 篇改动 118 处、119 篇改动 8 处、120 篇改动 9 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=111,112,113,114,115,116,117,118,119,120`（改动处 197，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。

### 圣咏 121–130 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/121.json` 至 `130.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk` 或半句符号；修缮 `zh` 粗体另译片段，消除欧化翻译腔与生硬口语（如「站立著」、「一起带走」、「充满喜乐」、「要说」、「吃劳苦之饼的人，你们坐下以后才起来吧」、「受到这样的报应」等），使表达典雅庄重、契合思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：121 篇改动 13 处、122 篇改动 3 处、123 篇改动 10 处、124 篇改动 5 处、125 篇改动 8 处、126 篇改动 6 处、127 篇改动 2 处、128 篇改动 9 处、129 篇改动 4 处、130 篇改动 6 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=121,122,123,124,125,126,127,128,129,130`（改动处 66，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。

### 圣咏 131–140 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/131.json` 至 `140.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk`、`fix` 旧字或半句符号；修缮 `zh` 粗体另译片段及 `fix` 新字项，消除欧化翻译腔与生硬口语（如「树林的田野」、「油流在头上」、「主管白昼/黑夜」、「可怜的巴比伦女子」、「日子将被形成，而其中没有一个」、「以罪恶作为犯罪的借口」、「求你留心我的声音」等），使表达典雅庄重、契合思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：131 篇改动 22 处、132 篇改动 3 处、133 篇改动 7 处、134 篇改动 11 处、135 篇改动 19 处、136 篇改动 11 处、137 篇改动 9 处、138 篇改动 35 处、139 篇改动 10 处、140 篇改动 16 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=131,132,133,134,135,136,137,138,139,140`（改动处 143，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。

### 圣咏 141–150 语言表达润色（2026-11-17）

- 依 `scripts/officium1962/codex/TASK-polish-psalm-zh.md` 对 `psalms/141.json` 至 `150.json` 逐篇完成语言表达润色：严格遵循禁区规则，未改动任何思高未标粗原文、行键、分行、`mk`、`fix` 旧字或半句符号；修缮 `zh` 粗体另译片段及 `fix` 新字项，消除生硬口语与翻译腔，使表达典雅庄重、契合思高圣咏语体与礼仪传统；重写所有 `note` 字段，统一称谓为「拉丁通行本」与「思高本」，规范说明句式并去除「武加大」称谓与口语表述。
- 逐篇校验与改动：141 篇改动 4 处、142 篇改动 5 处、143 篇改动 15 处、144 篇改动 5 处、145 篇改动 4 处、146 篇改动 6 处、147 篇改动 3 处、148 篇改动 9 处、149 篇改动 5 处、150 篇改动 1 处，各篇校验问题均为 0。
- 最终校验：`node scripts/officium1962/psalms-zh-polish-check.mjs --psalm=141,142,143,144,145,146,147,148,149,150`（改动处 57，问题 0）、全量 polish-check（改动处 2516，问题 0）与全量 `node scripts/officium1962/psalms-zh-build.mjs --check`（DO 行 auto 139 / 人工 2474 / 无中文 0；已校订 150/150 篇）均退出 0。未生成 public 数据、未浏览器验证、未提交、推送或部署。






### 1962 常用句子中文：从时辰礼仪数据库取用的可行性核查（2026-11-20，只读，未改数据/代码）

- **结论**：时辰礼仪数据按固定块（`public/data/liturgia-horarum/zh/rows/common/*.json` 的 `FIX:*` 标签）存拉丁，`zh/hkdlc|wanyou/common/*.json` 同键同下标存中文。拉丁逐字相同、可直接取用：开端经（`FIX:INV_OPENING`、`FIX:OPENING+ALLELUIA`）、天主经（`FIX:PATER`）、赞美天主（`FIX:TE_DEUM`，仅少 2 处礼仪注记）、赞主曲/谢主曲/西默盎（`FIX:BENEDICTUS/MAGNIFICAT/NUNC_DIMITTIS`，见下差异）、`Benedicámus Dómino`（`FIX:CONCLUSIO_MINOR`）、夜祷结语 `Noctem quiétam`、四首圣母经（仅经文）、`Misereátur`、收束经 `In manus tuas`/`Custódi nos`/`Salva nos` 等。**没有**：`Jube, Dómine`与各祝福词、`Fidélium ánimæ`、`Laus tibi, Dómine`、`Dómine exáudi`（对话，但同句即圣咏 101:2，站内思高已有）、夜祷的 `Te lucis` 赞美诗（LH 是另一首）、`Benedícat et custódiat`、`Divínum auxílium`、旧式 Confiteor/Indulgéntiam、Te Deum 的鞠躬/跪注记。
- 拉丁差异需留意：赞主曲 `plebis/plebi`、`nostrórum`、`visitávit/visitábit`；谢主曲 `salutári/salvatóre` 等；夜祷短读经 1 Pt 5:8-9 与 Jer 14:9 在 LH 里略短（缺 `Fratres`/`et`/`quia`/`sanctum`）；`Vísita`、`Grátiam tuam` 两首集祷经 LH 用短结语，1962 用长结语/`Per eúmdem`。
- 取用方式：renderer 对任意块的每行都先查 `lookupFixedLine`（`psalms-zh-build.mjs` 的 `FIXED`，键为整行字母哈希），所以补固定句只需扩 `FIXED`；Te Deum、赞主曲等需逐行/逐半句重新配对，LH 中文句序与 1962 拉丁行不完全一一对应。LH 数据有 hkdlc（繁体）与 wanyou（简体，且与现有 `FIXED` 光荣经用字一致），建议 wanyou 为主。
- 草稿与核查脚本在 `artifacts/scratch/`（未跟踪）。
- **2026-11-20 已落实**：FIXED 新增 17 条完全匹配的固定句（开端经、Allelúja、天主经（含 ℣℟ 拆分与夜祷整段）、Benedicámus/Deo grátias/Amen、Noctem quiétam、Misereátur、Dómine exáudi（取思高圣咏 101:2）、Fidélium ánimæ（用户指定译文）），已重跑 psalms-zh-build.mjs 生成 public 数据；未浏览器核对。赞主曲/谢主曲/Te Deum/西默盎待用户确认后做。
- **2026-11-20 四首颂歌**：新增 scripts/officium1962/canticles-zh.mjs（Te Deum 29 行、赞主曲 12、谢主曲 10、西默盎 4，共 55 行，全部与 1962 拉丁行匹配），psalms-zh-build.mjs 输出 canticles/canticleNotes，前台 lookupCanticleLine + 渲染器注释（psalm=0 取 canticleNotes）。中文沿用时辰礼仪万有真原，严重意译处按 1962 拉丁改写并加粗，原文存注释（共 10 条，Te Deum 8、赞主曲 1:73、西默盎 2:30）；Te Deum 两处取香港本繁体。已重跑 build，psalmsZh 6 项通过；itest run features/officium1962 仍有此前已有的 5 项失败；未浏览器核对。
- **2026-11-20 序经正文与旧约颂歌**：序经 Ps 94 的拉丁与圣咏 94 本文有出入，已在 canticles-zh.mjs 末尾逐段译出（8 行）；旧约颂歌（三童歌、依 12/45/38、德训 36、编上 29、友弟德 16、耶 31、多俾亚 13、哈 3、亚纳、出 15、申 32，共 217 行）在新文件 scripts/officium1962/canticles-ot-zh.mjs，底本为思高圣经（Q:\下载\天主教圣经思高版V4.3.CHM，GB18030 简体，每章一个 htm，已解到 rtifacts/scratch/chm/，未入库），与拉丁通行本不同处加粗并注释；构建按「节号+拉丁行首」定位拉丁行，数据里 275 行颂歌全部有中文（含前面 4 首，共 110 条注释）。**《亚大纳削信经》（Canticum Quicumque）仍无中文**。思高 CHM 的 32:16 无标号、3:10 有乱码，已手工处理。未浏览器核对、未提交。
- **2026-11-20 gCatholic 抬头中文**（只做了可行性）：gcatholic.org/calendar/<年>/Extraordinary-zt（繁体）每个日期有「等级、弥撒名、纪念」，按日期与 calendar.json 的 liturgicalTitle 对齐：2026 年 365 天中 319 天唯一匹配，34 天是平日+纪念（取首行即可），12 天是八日庆期（等级文字并入名称）。2025/2026/2027 三年固定日圣人名一致，差异只来自移动节日。

### 1962 旧约颂歌中文打磨（ids 1–27，三童歌 Canticum Trium Puerorum）（2026-11-20）

- 按 `scripts/officium1962/codex/TASK-polish-ot-canticles.md`，对 `resources/officium1962-ot-canticles/lines.json` 中负责的 id 1–27（含两端，全属三童歌）逐行比对拉丁通行本与思高底本（`sigao-epub-ot.json` 达 3:52–88, 56），严格遵循并行编辑原则，只改动 1–27 的 zh 与 notes，未触动任何只读字段或范围外条目。
- 重点校订与修改（本组共 27 条，修订 7 条，其余 20 条思高原文与通行本完全一致）：
  1. #9 (3:65)：补齐此前遗漏的注释（思高本作「闪」，通行本作 fúlgura 闪电）。
  2. #11 (3:67)：统一注释译文措辞（「地上一切生长的」），与正文标粗完全呼应。
  3. #15 (3:71)：恢复思高 epub 原文「以色列子民，请赞美上主」（去除非底本字「愿」）。
  4. #19 (3:75)：将代词由「他们」更正为「他」（拉丁文 eum，指向三位一体唯一天主），规范礼仪所加三一颂注释并补齐称谓。
  5. #20 (3:56)：补出思高遗漏的呼号「上主」（Dómine）与第三重赞词「备受颂扬」（superexaltátus），增补 1 对 1 注释。
  6. #22 (3:52)：标粗改译「天主」（Deus，思高作上主），补全思高遗漏的「应受光荣」（gloriósus），增补 1 对 1 注释。
  7. #26 (3:56)：通行本作 superexaltátus（应受颂扬），改写思高「应受光荣」（源自希腊底本 ὑπερένδοξος），与第 27 条的 gloriosus 准确区分，并增补注释。
- 验证：运行 `node scripts/officium1962/ot-canticles-check.mjs --ids=1-27`，结果 0 个问题，退出码 0。无禁用字，粗体成对且与注释严格对应；未触及外部范围。未提交、推送或部署。

### 1962 旧约颂歌中文打磨（ids 28–66，依撒意亚之歌与德训篇之歌）（2026-11-20）

- 按 `scripts/officium1962/codex/TASK-polish-ot-canticles.md`，对 `resources/officium1962-ot-canticles/lines.json` 中负责的 id 28–66（含两端，共 39 条，涵盖依 12:1–7、依 45:15–30、德 36:1–16）逐行比对拉丁通行本与思高底本（`sigao-epub-ot.json`），严格遵循并行编辑原则，只改动 28–66 的 zh 与 notes，未触动任何只读字段或范围外条目。
- 重点校订与修改（本组共 39 条，改写修缮 18 条，其余 21 条保持思高原文或结构对应）：
  1. #31 (依 12:4)：去掉思高原本就有的首半句「你们」误标粗，仅保留「你要说」改「**你们要说**」（dicetis）并对应注释。
  2. #36 (依 45:16)：补出此前遗漏的标粗与注释（思高将「制造偶像的人」置于句首，未独立译出 omnes「众人都」）。
  3. #38 (依 45:18)：规范「他是天主，形成大地，创造大地，是大地的塑造者」（ipse plastes ejus）的标粗与注释对应。
  4. #39 (依 45:19)：纠正此前漏标粗改写；拉丁通行本作 Non in vanum creavit eam...（他创造大地并非徒然，而是为使人居住才形成了它），思高本作「他并非创造了一团混沌，而是为使人居住才造了它」，改写标粗并加注。
  5. #41 (依 45:21)：恢复思高 epub 原文「惟讲公理」（去除非底本字「只」）。
  6. #42 (依 45:22)：补齐拉丁文 accédite simul（一同走近罢）与 qui salváti estis ex géntibus（从列国中得救的人），标粗并设 2 条 1 对 1 注释。
  7. #43 (依 45:23)：拆分并规范 2 处标粗与注释：levant lignum sculpturae suae（抬着自己雕刻木偶，思高作抬过偶像）与 et rogant（且祈求，思高作敬拜过），注释引文完全匹配 epub。
  8. #44 (依 45:24)：补齐 3 处与拉丁通行本的差异标粗并设 3 条注释：et venite（前来）、ab initio（起初）、ex tunc praedixit illud（从那时预言了它）。
  9. #45 (依 45:25)：补齐通行本 non est ultra Deus absque me（再没有别的天主，思高作没有别的）的标粗与注释。
  10. #47 (依 45:27)：规范 egredietur de ore meo justitiae verbum（公义的话一出我口，思高作真理一出我口）整句标粗与注释对应。
  11. #49 (依 45:29)：改写 qui repugnant ei（抗拒他的，思高作向他发怒），标粗并加注。
  12. #50 (依 45:30)：精简标粗范围为改写的前半句「必在上主内得称义，且受赞美：」（思高作必要因上主获胜夸耀），后半句「以色列所有的后裔」保留思高原文不标粗。
  13. #52 (德 36:2)：补齐此前漏标粗改写：Et immitte timorem tuum super gentes, quae non exquisierunt te（求你使敬畏你的心临于万民，就是那些不寻找你的异邦），对应 2 条注释。
  14. #57 (德 36:7)：补上正文此前遗漏的粗体标记「**显耀你的手和你的右臂。**」（Glorifica manum, et brachium dextrum）。
  15. #58 (德 36:8)：补出 Excita furorem（求你激起义愤，思高作求你大发雷霆）的标粗与注释。
  16. #59 (德 36:9)：补上正文此前遗漏的粗体标记，并拆分 2 处标粗与注释：Festina tempus, et memento finis（求你使时日急速来临，记念终局）与 ut enarrent mirabilia tua（好叫他们传扬你的奇事）。
  17. #60 (德 36:10)：补齐此前漏标粗改写：In ira flammae devoretur qui salvatur（愿那得救的人，也被烈火的怒气吞灭）与 pessimant plebem tuam（残害你百姓），对应 2 条注释。
  18. #63 (德 36:13)：恢复思高 epub 原文「以他们作产业」（去掉多余字「你的」）。
  19. #66 (德 36:16)：补上正文此前遗漏的整句粗体标记，并拆分 2 条注释：Reple Sion inenarrabilibus verbis tuis（求你以你难以言喻的话语充满熙雍）与 et gloria tua populum tuum（以你的光荣充满你的百姓）。
- 难点与建议人工复核：
  - #38 (依 45:18)：plastes（希腊借词 πλάστης，塑造者/模造者），此处译作「塑造者」。
  - #39 (依 45:19)：Non in vanum（非徒然），与思高依据希伯来文本的「一团混沌」（ṯōhû）有差异，已改从拉丁文。
  - #59 (德 36:9)：memento finis（记念终局/终末），与思高依据希腊文本的「记念你的誓约」有差异，已改从拉丁文。
  - #66 (德 36:16)：inenarrabilibus verbis tuis（以你难以言喻的话语），拉丁通行本与希腊本「充满你的威严」差异较大，已忠实依通行本改写。
- 验证：运行 `node scripts/officium1962/ot-canticles-check.mjs --ids=28-66`，结果 0 个问题，退出码 0。无禁用字，粗体成对且与注释 1 对 1 严格对应，半句符与拉丁文一致；全量文件未触动外部范围。未提交、推送或部署。



### 1962 旧约颂歌中文打磨（ids 165–213）

- 按 `scripts/officium1962/codex/TASK-polish-ot-canticles.md` 逐条核对梅瑟之歌（出 15、申 32），修订负责范围内 40 行的中文或注释；其他条目及只读字段未动。补正思高底本措辞、拉丁文差异的标粗与逐条注释。
- 拉丁难句建议人工复核：#179 `Ascenderunt populi, et irati sunt` 暂直译「万民上来，就发怒」；#191 `non filii ejus in sordibus` 暂译「在污秽中已非他的子女」；#198 `funiculus hereditatis` 暂译「产业的分额」。
- 验证：`node scripts/officium1962/ot-canticles-check.mjs --ids=165-213` 为 0 个问题；`node scripts/officium1962/ot-canticles-quotes.mjs` 报 `bad quotes 0`。未做浏览器验证，未提交、推送或部署。

### 2026-11-20 总述（抬头中文 + 旧约颂歌重做底本）

- **抬头中文**：scripts/officium1962/gcatholic-headings.mjs <年…> 抓 gCatholic 特殊形式历（繁体→OpenCC 简体）存到 esources/officium1962-headings-zh/gcatholic-<年>.json（已抓 2025–2027）；psalms-zh-build.mjs 按 calendar.json 的等级对齐出 headings（等级、当日礼仪名、当日纪念）与 hourNames（夜课经、赞美经、晨经、辰时经、午时经、申初经、申正经、晚经）写进 psalms-zh.json；Office1962Viewer.vue 在拉丁抬头下显示中文名与等级、时辰名、「当日纪念」。纪念取自 gCatholic（DO 导出的 commemorations 字段是空的）。「降临后」是 gCatholic 对「圣神降临后」的简称，保持原样。2026 全年 365 天均有。未浏览器核对。
- **旧约颂歌改用思高 epub 底本**：esources/officium1962-ot-canticles/sigao-epub-ot.json（《思高本.epub》，繁→简，Jer 在 split_027+028）；条目数据改为 lines.json（canticles-ot-zh.mjs 只读它）；ot-canticles-check.mjs 校验结构，lines.base.json 为原始只读字段备份，lines.pre-codex.json 为 Codex 前版本。先由 agy 打磨 1–66（之后 agy 配额用尽，约 154 小时后重置），67–213 由 Codex 打磨；所有「思高本作」引文已核对为逐字出自 epub。难解拉丁句见各组 log（codex/codex-out/ot-canticles-*）。
