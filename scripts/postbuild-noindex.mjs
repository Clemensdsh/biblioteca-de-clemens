#!/usr/bin/env node
// 构建之后运行（package.json 的 build 脚本）：让搜索引擎不收录「标了 noindex 的页面」。
// 在 pages/**/*.md 的 frontmatter 里写 `noindex: true` 即可（整书拆分脚本加 --noindex 会给整本书的各页都加上）。
// 对这些页面：
//  1. 对应的 dist html 的 <head> 里加 noindex 等 meta（替换页面自带的 robots meta）；
//  2. 把它们从 dist/sitemap.xml 里去掉。
// 没标 noindex 的页面、robots.txt 都不动（robots.txt 不屏蔽抓取：Google 必须抓到页面才能看到 noindex）。
// 标了 noindex 的页面找不到对应 html，或没能加上 meta，就以非零状态退出，让构建失败而不是悄悄上线。
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('pages')
const dist = path.resolve('dist')
if (!fs.existsSync(dist)) { console.error('没有 dist 目录'); process.exit(1) }

const META = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">'

// ---- 1. 收集标了 noindex 的路由 ----
const routes = []
function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) scan(p)
    else if (e.name.endsWith('.md')) {
      const m = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)
      if (m && /^noindex:\s*true\s*$/m.test(m[1])) {
        let route = '/' + path.relative(root, p).replace(/\\/g, '/').replace(/\.md$/, '')
        route = route.replace(/\/index$/, '') || '/'
        routes.push(route)
      }
    }
  }
}
scan(root)

// ---- 2. 给对应 html 加 meta ----
const failed = []
let done = 0
for (const route of routes) {
  // 站点以 /x.html 和 /x/index.html 两种形式输出，都处理
  const files = route === '/'
    ? [path.join(dist, 'index.html')]
    : [path.join(dist, `${route}.html`), path.join(dist, route, 'index.html')]
  const existing = files.filter(f => fs.existsSync(f))
  if (!existing.length) { failed.push(`${route}（找不到 html）`); continue }
  for (const f of existing) {
    let html = fs.readFileSync(f, 'utf8')
    html = html.replace(/<meta[^>]+name=["']robots["'][^>]*>\s*/gi, '')
    const out = html.replace(/<head(\s[^>]*)?>/i, m => `${m}${META}`)
    if (out === html) { failed.push(`${route}（<head> 里没法加 meta）`); continue }
    fs.writeFileSync(f, out)
    done++
  }
}

// ---- 3. 从 sitemap 去掉 ----
const sitemap = path.join(dist, 'sitemap.xml')
let removed = 0
if (fs.existsSync(sitemap) && routes.length) {
  const xml = fs.readFileSync(sitemap, 'utf8')
  const hit = (loc) => {
    const p = loc.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/'
    return routes.includes(p)
  }
  const out = xml.replace(/<url>[\s\S]*?<\/url>\s*/g, (block) => {
    const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1] || ''
    if (hit(loc)) { removed++; return '' }
    return block
  })
  fs.writeFileSync(sitemap, out)
}

console.log(`noindex：${routes.length} 个路由，改写 ${done} 个 html，从 sitemap 去掉 ${removed} 条`)
if (failed.length) {
  console.error(`以下页面没能设成 noindex：\n${failed.join('\n')}`)
  process.exit(1)
}
