# 首页按钮与 Valaxy 配置缓存排查记录

日期：2026-07-13

## 问题现象

- 浏览 `http://localhost:4859/` 时，首页底部仍显示旧按钮：
  - `博客文章`
  - `译稿`
  - `文献`
- 期望显示：
  - `文章`
  - `圣人录译稿`
  - `周年瞻礼经`
  - `关于`

## 关键结论

这次不是 `valaxy.config.ts` 没改，也不是浏览器缓存。

实际覆盖层在 Valaxy dev server 的虚拟运行时配置 `/@valaxyjs/config`。旧的 4859 进程仍在运行，它的 `themeConfig.pages` 还是旧值：

- `译稿` -> `/categories/?category=译稿`
- `文献` -> `/categories/?category=文献`
- `关于` -> `/about/`

而项目源码中的 `valaxy.config.ts` 已经是新值：

- `圣人录译稿` -> `/martyrologium-translation/`
- `周年瞻礼经` -> `/annual-feasts/`
- `关于` -> `/about/`

## 排查到的层级

1. `layouts/home.vue`
   - 已被 dev server 加载。
   - 虚拟模块路径是 `/@fs/Q:/Web-biblioteca/biblioteca-de-clemens/layouts/home.vue`。
   - 文件内 `homeLinks` 是硬编码的新按钮。

2. `@vite-plugin-vue-layouts-next/generated-layouts`
   - 同时列出了主题的 `home` layout 和项目的 `layouts/home.vue`。
   - 对象最后一项是项目的 `home`，按 JS 对象覆盖规则，项目 layout 会覆盖主题 layout。

3. 首页路由
   - `/` 路由的 meta 是 `layout: "home"`。
   - 首页确实应该走 `layouts/home.vue`。

4. `YunPrologue.vue`
   - 只是网格背景。
   - 不会再渲染旧的 `YunPrologueSquare` 按钮。

5. `/@valaxyjs/config`
   - 旧进程里仍是旧的 `themeConfig.pages`。
   - 停掉旧 PID 后重新启动，虚拟配置变为新值。

## 已执行修复

1. 停掉占用 4859 的旧 Valaxy 进程。
2. 清理生成缓存：
   - `.valaxy`
   - `node_modules/.valaxy/cache`
3. 用 `npm.cmd run dev -- --port 4859` 重新启动。
4. 重新访问 `/@valaxyjs/config` 验证：
   - 包含 `martyrologium-translation`
   - 包含 `annual-feasts`
   - 不再包含 `categories/?category=`
5. 执行 `npm.cmd run build`，构建通过。

## 以后复查命令

```powershell
netstat -ano | Select-String ':4859'
Invoke-WebRequest -Uri http://localhost:4859/@valaxyjs/config -UseBasicParsing -TimeoutSec 10 | Select-Object -ExpandProperty Content
```

如果 `/@valaxyjs/config` 里仍有旧 `pages`，先停掉 `netstat` 查到的 PID，再重启 dev server。

## 其他记录

- PowerShell 默认 `Get-Content` 可能把 UTF-8 中文显示成乱码；应使用 `Get-Content -Encoding UTF8`。
- 当前目录的 `.git` 是空目录，`git status` 和 `git rev-parse` 无法识别为 Git 仓库。
