# 整书分章（合集）：设计、用法与改动记录

2026-11-16。长文献（整书译稿）一页放不下（单页 700 KB 以上会加载慢、手机上易卡），所以改为：**一个书目页 + 按章拆开的若干页面**。当前状态见 `progress.md`；本文件记录做法、用法和这次会话的全部改动。

## 1. 形态

- **书目页**：一篇普通文章 `pages/posts/<slug>/index.md`。首页、`/posts/`、归档、分馆页里的入口就是它，卡片与普通文章完全一样（标题、日期、字数、阅读时间、分类、标签）。正文是译本说明 + 章节目录。frontmatter 有 `layout: book`、`book: <合集 key>`，字数/阅读时间由脚本算好写入（`wordCount`、`readingTime`）。
- **章节页**：Valaxy 自带 Collections。`pages/collections/<key>/NN.md`，路径 `/collections/<key>/NN`；配置在 `pages/collections/<key>/index.ts`（`collapse: false`，所以列表里不另出合集卡片；`items` 是章节目录）。
- `/collections/<key>/`（`index.md`）只做跳转到书目页（章节侧栏的书名链接指向这里）。
- 布局：
  - `layouts/collection.vue` 覆盖主题 collection 布局：宽屏（≥1024px）左侧是主题的合集侧栏；窄屏在标题下加折叠的「本书目录」（`components/BookToc.vue`）。主题右侧「文章目录」抽屉不接受追加内容，所以不往那里放。
  - `layouts/book.vue` + `components/BookSidebar.vue`：书目页左侧栏显示全书章节（否则是站点头像卡片）。
- 页内目录：按本章实际出现的标题层级设置 `outline`；完全没有标题的章设 `aside: false`（不显示右侧目录及手机上的目录按钮）。
- 样式：`--marker <类名>` 往每页注入一个标记 div，供 `styles/index.scss` 里 `body:has(.类名)` 的专属样式使用。通用类名 `book-page-marker`（表格横向滚动、右侧目录折叠）；《赫拉克利德斯集市》用旧类名 `nestorius-bazaar-page-marker`。

## 2. 新增一本书（用法）

脚本：`scripts/split-book.mjs`（源文件不修改）。

```
node scripts/split-book.mjs <源.md> <key> --post-slug <书目页slug> --marker book-page-marker \
  [--level 2] [--chapter-re 正则] [--drop 小节名,…] [--min-chars 1200] [--max-kb 90] \
  [--title …] [--date YYYY-MM-DD] [--categories 馆,栏目] [--tags a,b] [--description …] \
  [--titles 章名.json] [--noindex] [--dry] [--force]
```

- `--dry` 先看章节划分；已存在的目录需 `--force` 才覆盖。
- 按 `--level` 级标题切章（默认 `##`）；`--chapter-re` 限定哪些标题算章首（其余同级标题留在章内并降一级）；`--drop` 从前置说明里去掉某些小节（如与章节目录重复的「篇目」）。
- 过短的章并入下一章（只有标题没有正文的包装小节直接丢弃）；过长的章依次按下一级、再下一级标题再切（每页 ≤ `--max-kb`）。
- 源文 frontmatter 缺 `date/categories/tags/description` 时用命令行补；缺 `date` 会报错。`description` 缺省取源文 `subtitle`。
- `--titles`：与章节顺序对应的字符串数组，覆盖自动章名（先 `--dry` 看自动章名）。
- `--noindex`：给书目页、跳转页、各章 frontmatter 加 `noindex: true`（见 §4）。
- 分类要符合 `config/halls.ts`：`categories[0]` 是馆名、`[1]` 是栏目，分馆页据此显示。
- 脚本输出可重复生成；**改译文内容要改源文再重跑**，不要手改拆出来的章节（下次重跑会覆盖）。

### 已有两本

| 书 | 书目页 | 章节 | 重新生成所需源 |
|---|---|---|---|
| 聂斯多略《赫拉克利德斯集市》中文全译（校订版），14 章 | `/posts/nestorius-bazaar-of-heracleides-zh/` | `/collections/nestorius-bazaar-of-heracleides/01–14` | 原整篇稿只在 git 历史里：`git show 895214c:pages/posts/nestorius-bazaar-of-heracleides-zh/index.md`；章名覆盖 `scripts/books/nestorius-bazaar.titles.json`；`--marker nestorius-bazaar-page-marker` |
| Reinink《晚期萨珊与早期伊斯兰统治下的叙利亚基督教（正文中译本）》，19 篇（前置 + 第 I–XVII 篇 + 增补与勘误），**不收录** | `/posts/reinink-syriac-christianity-zh/` | `/collections/reinink-syriac-christianity/01–19` | `Q:\文库\文献翻译\Syriac Christianity under Late Sasanian and Early Islamic Rule\译文\Reinink_Syriac_Christianity_中译本_天主教译名版.md`；参数 `--level 1 --chapter-re '^(前置部分|第[IVXL]+篇|增补与勘误)' --drop 篇目 --min-chars 0 --noindex --marker book-page-marker`，分类 教父馆/教父导读，标签含 译稿 |

## 3. 踩过的坑（避免再犯）

- Valaxy 在每个 Markdown 页面里已声明 `router`、`useRoute`、`useRouter`；页面内 `<script setup>` 再声明会报「重复声明」，开发服务器弹红色浮层盖住页面。
- `pnpm run build` 失败时退出码可能仍是 0：**要看输出里有没有 error**，不能只看退出码。
- 开发服务器对任何路径都返回同一个 SPA 外壳（HTTP 200），不能用状态码判断页面能否编译；以 `pnpm run build` 的输出和 `dist/` 为准。
- 新增 `layouts/*.vue` 后要重启开发服务器才生效。
- 手机上没有左侧栏，主题的右侧「文章目录」抽屉（`YunAside`）不接收 `aside-custom` 插槽内容，所以「本书目录」只能放在页面里。
- 《赫拉克利德斯集市》原先因水合问题被强制设为「仅客户端渲染」（整页由浏览器渲染，更慢），拆章后已从 `vite.config.ts` 的 `isClientOnlyRoute` 去掉。
- 源文疑点（未改）：《赫拉克利德斯集市》第一卷第一部小节编号 `6.`→`9.`→`8.`→`9.`（应为 7？）、叙利亚译者序缺 `5.`，待对照英译本。

## 4. 不被搜索引擎收录（按页面）

- 在页面 frontmatter 写 `noindex: true`。`scripts/postbuild-noindex.mjs`（`package.json` 的 `build`、`build:ssg` 在 `valaxy build --ssg` 之后运行）给对应 `dist` html 的 `<head>` 写 `noindex, nofollow, noarchive, nosnippet, noimageindex`（替换页面自带的 robots meta），并把这些页面从 `sitemap.xml` 去掉；找不到对应 html 或加不上 meta 就让构建失败。
- 不改 `robots.txt`（默认允许抓取；Google 必须抓到页面才看得到 noindex，屏蔽抓取反而可能让已收录条目留下）。其他页面和 sitemap 不动。
- 目前只有 Reinink 一书（书目页 + 19 章 + 跳转页，共 21 个路由、23 个 html）。《赫拉克利德斯集市》**没有**设不收录。
- 已被收录过的旧页面要等 Google 重抓才会消失；可在 Search Console 用「移除网址」加速（需站长自己操作）。
- 线上 `robots.txt` 前面有一大段 **Cloudflare 托管的内容**（不在仓库里）：`Content-Signal: search=yes, ai-train=no, use=reference`，并对 31 个爬虫 `Disallow: /`——GPTBot、ClaudeBot、anthropic-ai、Claude-Web、CCBot、Google-Extended、GoogleOther、Google-CloudVertexBot、Applebot-Extended、Amazonbot、cohere-ai、MistralAI-Training、meta-externalagent、Bytespider、KimiBot、Diffbot、omgili、**Baiduspider**、PetalBot、SemrushBot-SWA 等。Googlebot、Bingbot 等放行。要放行百度/花瓣，只能在 Cloudflare 后台改，或关掉托管 robots.txt 后由仓库自己写；本次**决定不改**。

## 5. 本次会话的改动记录（2026-11-16）

提交（均在 `main`，已推送并由 GitHub Actions 部署成功）：

- `3fe581f` 整书分章（合集）全套：两本书的拆分页、布局与组件、脚本、样式；同时**误做了整站 noindex**。
- `31b0dee` 撤回整站 noindex，改为按页面 `noindex: true`；恢复 `sitemap.xml` 与其他页面（含三个 Vue 页面的 `index,follow`）。
- 本文件及 `progress.md` 的记录更新（见 git 日志最新一条）。

文件：

- 新增：`scripts/split-book.mjs`、`scripts/postbuild-noindex.mjs`、`scripts/books/nestorius-bazaar.titles.json`、`components/BookToc.vue`、`components/BookSidebar.vue`、`layouts/collection.vue`、`layouts/book.vue`、`pages/collections/**`、`pages/posts/reinink-syriac-christianity-zh/`、本文件。
- 修改：`pages/posts/nestorius-bazaar-of-heracleides-zh/index.md`（整篇 → 书目页）、`vite.config.ts`（去掉该页的客户端渲染例外）、`styles/index.scss`（增加 `.book-page-marker`）、`package.json`（build 脚本后接 noindex 步骤）、`progress.md`。
- 曾尝试后撤销：`useHallPosts` 合集卡片方案（分馆页单独显示合集条目）。改为让书目页本身是一篇普通文章后不再需要。

验证与未验证：

- `pnpm run build` 通过（逐次检查了输出中的 error）；线上抽查 `/`、两本书的书目页、Reinink 第 05 章、`/officium-1962/` 的 robots meta 与 `sitemap.xml` 符合预期。
- `vitest run` 有 5 项失败，全在 `features/officium1962`；暂存本次改动后同样失败，与本次无关。
- **未在浏览器里核对**：窄屏折叠「本书目录」的实际外观与跳转、书目页左侧栏、章节页外观与水合报错、手机上的加载速度、站内搜索是否索引章节。
- 未验证译文内容：Reinink 译文是机器翻译 + 术语复查，未经人工审读；已知问题见该译文目录下的《排版交接说明.md》（第 X 篇开头缺半句、前置部分目录表格列错位、29 处伊斯兰语境译名未通读核对）。译本说明里仍写着译者/模型信息，是否保留待用户定。

未决：

- Reinink 书的分类（教父馆/教父导读）、日期（2026-11-16）、标签、描述均为拟定，待用户确认；译文说明里提到的《术语表.md》站上没有，需放上去或改措辞。
- 版权：该书是 2005 年出版的现代学术著作，译稿全文公开的风险已向用户提示，由用户决定。
- 卷首（术语表、编者序、导论）是否单独拆页；合集封面；`/collections/` 总览页是否保留。
