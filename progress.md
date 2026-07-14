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
