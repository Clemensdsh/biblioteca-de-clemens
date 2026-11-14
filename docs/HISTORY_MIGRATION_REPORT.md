# 网站工作历史迁移报告

更新：2026-11-13。**核心范围已完成**：会话 `fcb21c05-fede-4af1-84fe-870cc36a7e11` 中 11 月 10–13 日有关网站的主要成果、用户决定和中断时待办已整理到本报告与 `../progress.md`。其中提交与文件存在性已核实；历史 Agent 报告的完整测试、页面效果及文字语义没有在本轮重新执行或逐条复核。其他独立项目仅保留背景，不作为完成本次迁移的前提。

## 来源、方法与范围

目标会话远端原件：`/home/ccrunner/.claude/projects/-home-ccrunner--cc-remote-ws-Celestina-Q-Web-biblioteca/fcb21c05-fede-4af1-84fe-870cc36a7e11.jsonl`；本机镜像：`C:\Users\Cleme\.config\cc-remote\claude\projects\Q--Web-biblioteca\fcb21c05-fede-4af1-84fe-870cc36a7e11.jsonl`。以下会话行号以此前只读复制的 VPS 原件为准，文件可能随原始存储变动。原始 JSONL 不修改、不自动加载；`SESSION_ARCHIVE_INDEX.md` 提供会话定位，离线逐记录索引与本机只读副本保存在 `C:\Users\Cleme\ccremote-quota-audit-2026-11-13\project-migration\`（含私人信息，勿公开）。

此前对 VPS 及本机候选逐行扫描、对同会话 UUID 归并镜像；宽松筛选得 8 个主会话候选、53 个上游子代理单位，不能把它们都当网站项目。不同副本中同 UUID 可能有路径重写等序列化差异；本次不追求将所有候选逐条整理。一个上游 VPS 副本末行截断，但同 ID 本机行完整且具有相同前缀。不会因为其他项目仍可研究而阻止本项目交接。

## 2026-11-10：信息架构与展示

用户要求先保存基线，在不删除文章、不改正文的前提下对比三种结构（会话行 4、504）：

- `ia-themes`：按主题建馆，文献/译稿作为来源标签；`ia-library`：书库、系列、卷章；`ia-dual`：日课与文库分离。用户在预览后选择主题分馆，并要求首页去掉重复的“文章”入口、改善馆页目录（行 524、718）。
- 最终改为礼仪馆、圣人馆、汉文馆、教父馆；采用“教父馆”是因为原“教父与训导”材料主要属于教父学，文言教会文献归入汉文馆。馆名、入口、分类集中在 `config/halls.ts`；`components/IaHall*.vue`、`pages/guan/` 为卡片目录和分馆页。提交 `65f0492`、`2160906` 可核实对应文件变更。
- 星期六纪念圣母原为文章架构，作为礼仪馆工具入口与罗马大日课、时辰礼仪、哥特日课并列，避免作为文章卡片重复显示；对不齐的手机/夜间阅读问题调整文字、馆页颜色和背景可读性（行 721、847；提交 `8af9b49`）。
- X 链接改为 `@clemens_iqisyi`，缩小侧栏字体（`a8809fc`）；红字跟随站内明暗模式，并处理日期/水合及空广告位异常（`ed046df`）。历史会话报告对多个页面进行浏览器与构建检查（行 1183），本轮未重跑，不能当作当前验收结果。
- 用户要求旧版作为本地归档，仅发布实际使用的网站分支（行 1186、1224）。会话末报告称只推送 `main`、实验和归档分支保留本地，且为避 GitHub 单文件大小限制取消跟踪可再生的 full-occurrences 导出（行 1221、1273）；本地 `main`、`archive/pre-ia-2026-11-11` 和 `ia-*` 分支存在，**远端和线上当前状态本轮未查询**。不要仅凭历史陈述假设部署状态，也不要删除分支/工作树。

## 2026-11-12–13：双语时辰礼仪

用户希望节日标题和等级中拉对照，圣咏按语义细分以便手机对照；圣人简介不应在每个时辰重复（行 1283）。后续明确：错配圣咏优先按礼规和实际拉丁文本纠正，不能只隐藏；赞美诗不拆；必行与自由纪念应区分；中文圣人名优先 GCatholic，不使用用户现有圣人录译稿（行 2019、2022）。

- `6281875`：`features/liturgiaHorarum/align.ts`、`LhHour.vue`、`data.ts` 实现对照与匹配保护，简介按首次出现时辰显示，错配数据有说明。`eaca4f9` 增加标题与时辰中文；`f9eac0f` 建立 `zh/fixes.json` 和配对修复脚本，并移除标准版不支持的“前周或后周”选项；`3826623` 增加庆典中文名和必行/自由纪念；`0e5236c` 加入人工对齐及十一月简介。这些提交和文件均在当前 `lh-bilingual` 分支存在。
- 编辑原则：只在意思对应时配对；分段不一致可合并，内容不同就标注而非硬配；中文文字和标点必须能原样拼回，拉丁单元按顺序覆盖。人工任务及形式验证见 `scripts/liturgia-horarum/codex/TASK-align.md`、`check-align.mjs`；形式检查不能保证语义。赞美诗有不同中文诗作及缺分段等问题，依用户要求暂不自动拆分。
- 历史交接（行 2801）称：可选版本中 445 处错配经分类修正；香港本序经圣咏 95 第 2–5 段各缺首行，36 处仍无法可靠对应；人工对齐 278 项经脚本检查。提交和产物已核实存在，上述数量及礼规、语义结论没有逐项重新证明，缺行问题保留为待核验。
- 圣人名按日期、等级和名称配对 GCatholic；历史报告称使用 2024–2029 页面，平日命名与站点普世历发生差异时保留站点历。数据及逻辑见 `features/liturgiaHorarum/celebrationNamesZh.json`、`titleZh.ts`；不把不同地方历的特殊文本混入普世历。

## 圣人简介 OCR 方法与结果

用户允许从《每日颂祷》扫描 PDF 个别提取简介，其他月份交给 Codex，避免在长 Claude 会话中进行大量图片识读（行 2019、2807）。既有 `scripts/liturgia-horarum/codex/TASK-ocr.md` 描述只读渲染、按竖排原样转录、保留页码/不确定字并逐项复核；`build-bios.mjs` 将符合条件的条目配入 `zh/bios.json`。不要把 OCR 当作已校对的真值。

此次只读解析确认十一月 OCR JSONL 有 21 条、19 条 `bio` 非空，`uncertain` 字段合计 0；`bios.json` 顶层 16 项。历史 Agent 称按日期与年份配对 16 条，地方真福不强行挂入普世礼历，香港本保留繁体、万有真原显示注明来源的简体（行 2801）。本轮未重新读图，0 个不确定标记不等于零识别错误。

## 中断时的未完成任务

2026-11-13 17:25:49 UTC 用户在会话行 2807 要求：查 11/12 诵读日课赞美诗中 `--sd start--`；以用户提供的《每日颂祷》597–603 页 OCR 为材料，核对后补充中文圣咏；查指定 2014 年拉丁日课 PDF 是否收录对应内容；其他月份简介 OCR 交给 Codex。此后只有两次 PowerShell 检查和额度错误，未见完成证据。

原始用户 OCR 与要求保留在 `SUPPLEMENTAL_PSALMS_OCR_SOURCE.md`，本轮未重提取或导入。只读扫描现有中文原始数据：万有真原 712 文件中 6 个含 `--sd start--`，香港本 712 文件中无；源数据标记可能合法，仍需复现显示问题、查清解析边界。用户指定的 PDF 文件存在，但内容是否包含对应拉丁文未查。香港本缺行、其他月份 OCR、对齐语义、最终构建与部署均是待办或待验证，详见当前入口。

## 关联项目背景（非本次详细审计）

- **LH-Local-Handoff / 新礼上游**：生成和整理普世礼历的拉丁日课，网站使用导出数据；用户曾收缩过度扩大的第四阶段审计，以可读日课和正确历法/选项为目标。网站 `public/data/liturgia-horarum/` 与 `scripts/liturgia-horarum/` 是集成入口；独立项目完整状态本轮未重审。
- **哥特日课**：独立的历史日课整理工程，网站提供试验页面 `pages/breviarium-gothicum/`；源文本、小时辰和跨日逻辑曾被用户指出需改进，独立项目现状未核实。
- **1962 罗马大日课**：网站已有 `pages/officium-1962/`、`features/officium1962/` 和发行数据；旧阶段记录与翻译方法见 `officium1962/PROGRESS.md`、`officium1962/TRANSLATION_WORKFLOW.md`。这些旧文档的时间和范围不同于网站当前状态。
- **Android App**：另一主机/仓库的日课客户端，参考网站内容；不在本网站仓库内，其状态本轮未核验。
- **域名、VPS 与部署基础设施**：另有会话和独立状态；本项目只保留相关来源索引，不迁移认证或私人基础设施内容，也不把历史部署结论当成当前线上事实。

## 文档驱动工作方式

`../progress.md` 是唯一简短当前状态入口；`AGENTS.md` 和 `CLAUDE.md` 在网站仓库及其上级工作区设置相应入口。新会话先读本地状态并核对 Git，仅按需读取本报告或专题材料；阶段完成/中断时写明实际结果、验证和下一步。约 25 万 Token 或长时间闲置的长会话优先先交接再新建会话，不默认恢复旧 JSONL。25 万只是建议阈值，不是自动压缩或计费边界。

验证：Codex `debug prompt-input` 在两个目录运行且未调用模型，输出分别包含工作区和仓库规则以及 `progress.md` 引用；从仓库启动可发现仓库规则。对 cc-remote `src/prompt.ts` 的本地 CLAUDE.md 祖先遍历和 `src/tools/util.ts` 的本地相对路径解析，使用离线 mock 检查了两个目录均可定位并读取同一状态入口；没有运行真实 Claude 或端到端二进制，新旧源码与已运行构建是否完全一致仍未确认。原 `progress.md` 存入下方后的 SHA-256 与原始文件一致；OCR 材料哈希未变，Git `diff --check` 通过。以上只验证交接路径，不代表网站业务测试或真实模型已理解文档。

没有触发 Claude 推理、修改业务代码或数据库、推送、部署或重启服务。原 `progress.md` 的 2026-07-13 内容完整保留在本报告末尾，仅是历史快照，不再代表当前状态；其中旧端口、PID、命令和 Git 状态不得直接执行或当成现状。

## 附录：原 progress.md（2026-07-13 历史快照）

以下原文原样保留，用于历史追溯；与上文冲突时以日期和当前实际文件为准。

# 项目进度记录

日期：2026-07-13

## 当前用户可见状态

- 用户反馈：`http://localhost:4859/` 现在什么内容都加载不出来。
- 当前先暂停继续修复，保留进度，之后再处理。
- 端口 `4859` 最后一次检查时仍有监听进程：
  - PID: `19636`
  - 命令来源应是之前尝试启动的 Valaxy dev server。

## 已完成的主要内容

### 内容迁移与目录整理

- WordPress 内容已迁移到 Valaxy。
- 文章目录已改为英文 slug。
- Markdown 转义问题已处理。
- 背景图、头像、社交链接、烟花特效已配置。
- 语言切换按钮曾隐藏，后来因语言切换状态问题，决定可回到主题原本按钮形态。
- 头像徽章已隐藏。
- 文章右侧 TOC 目录面板曾恢复。

### 首页底部按钮目标

期望首页底部按钮为：

- `文章` -> `/posts/`
- `圣人录译稿` -> `/martyrologium-translation/`
- `周年瞻礼经` -> `/annual-feasts/`
- `关于` -> `/about/`

相关源码位置：

- `valaxy.config.ts`
  - `themeConfig.nav` 中 `文章`
  - `themeConfig.pages` 中 `圣人录译稿`、`周年瞻礼经`、`关于`
- `layouts/home.vue`
  - 自定义首页 layout，硬编码了 `homeLinks`

### 单独页面

已创建或保留：

- `pages/martyrologium-translation/index.md`
  - 首页 `圣人录译稿` 的目标页面。
- `pages/annual-feasts/index.md`
  - 首页 `周年瞻礼经` 的目标页面。

### 分类整理

已按用户要求调整的大方向：

- 带“罗马殉道圣人录”的文章放入：
  - `译稿`
  - `罗马殉道圣人录`
- `文献` 下不应包含圣人录分类。
- `星期六纪念圣母` 放入：
  - `文献`
  - `时辰礼仪`
- `谢恩祈祷公经` 放入：
  - `文献`
  - `四样经`
- `周年瞻礼经` 分类及其内容整体移到 `文献` 下。
- 华楞定那篇单独放入未分类。
- `司铎课典` 及其下文章已删除。

## 已排查出的重要问题

### 首页按钮覆盖层

之前首页仍显示旧按钮：

- `博客文章`
- `译稿`
- `文献`

排查结论写在：

- `home-pages-debug-log.md`

关键发现：

- 项目源码 `valaxy.config.ts` 已经是新值。
- `layouts/home.vue` 也已被 dev server 加载。
- 首页路由 `/` 的 meta 是 `layout: "home"`。
- 旧按钮来自 Valaxy dev server 的虚拟运行时配置 `/@valaxyjs/config` 中残留的旧 `themeConfig.pages`。
- 清理 `.valaxy` 和 `node_modules/.valaxy/cache` 后，新启动的 config 曾显示正确：
  - 包含 `martyrologium-translation`
  - 包含 `annual-feasts`
  - 不再包含 `categories/?category=`

### 当前新问题

- 尽管最后一次 HTTP 检查曾显示 `/@valaxyjs/config` 返回正确配置，用户随后反馈网站完全不加载。
- 因此当前状态应视为：dev server 或前端运行状态仍有问题，不能认为修复完成。

## 验证记录

已执行过：

```powershell
npm.cmd run build
```

结果：

- 构建通过。
- 有预期警告：RSS 跳过草稿 `pages/posts/_drafts/id-65/index.md`。

## 后续建议

下次继续时，建议先不要改内容文件，先做最小恢复：

1. 停掉当前 4859 进程。

```powershell
netstat -ano | Select-String ':4859'
Stop-Process -Id <PID> -Force
```

2. 前台启动 dev server，看完整报错。

```powershell
npm.cmd run dev -- --port 4859
```

3. 如果页面仍空白，检查浏览器控制台和以下虚拟模块：

```powershell
Invoke-WebRequest -Uri http://localhost:4859/@valaxyjs/config -UseBasicParsing -TimeoutSec 10
Invoke-WebRequest -Uri http://localhost:4859/@vite-plugin-vue-layouts-next/generated-layouts -UseBasicParsing -TimeoutSec 10
```

4. 若需要快速回退首页按钮改动，优先检查或临时移走：

- `layouts/home.vue`

让主题回到默认 `home` layout，再只从 `valaxy.config.ts` 处理 `themeConfig.pages`。

## 其他注意

- PowerShell 默认 `Get-Content` 可能把 UTF-8 中文显示成乱码；读取中文文件应使用：

```powershell
Get-Content -Encoding UTF8 <file>
```

- 当前 `.git` 是空目录，`git status` 和 `git rev-parse` 不能识别为 Git 仓库。
