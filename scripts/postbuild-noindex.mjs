#!/usr/bin/env node
// 构建之后运行（package.json 的 build 脚本）：让搜索引擎不收录本站。
//  1. dist 下每个 .html 的 <head> 里加 noindex 等 meta（含「仅客户端渲染」的外壳页）；
//  2. 重写 dist/robots.txt：不屏蔽抓取——Google 必须能抓到页面才会看到 noindex，
//     屏蔽抓取反而可能让已收录的条目继续留在结果里；
//  3. 删除 dist/sitemap.xml，不向搜索引擎提供页面清单。
// 任何 html 没能加上 meta 就以非零状态退出，让构建失败而不是悄悄上线。
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
if (!fs.existsSync(dist)) { console.error('没有 dist 目录'); process.exit(1) }

const META = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">'
let total = 0
let injected = 0
const failed = []

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.html')) fix(p)
  }
}

function fix(file) {
  total++
  let html = fs.readFileSync(file, 'utf8')
  // 页面自带的 robots meta（部分页面是 index,follow）一律替换为 noindex 版本
  const existing = /<meta[^>]+name=["']robots["'][^>]*>/gi
  const had = existing.test(html)
  if (had) {
    if ([...html.matchAll(/<meta[^>]+name=["']robots["'][^>]*>/gi)].every(m => /noindex/i.test(m[0]))) return
    html = html.replace(/<meta[^>]+name=["']robots["'][^>]*>\s*/gi, '')
  }
  const out = html.replace(/<head(\s[^>]*)?>/i, m => `${m}${META}`)
  if (out === html) { failed.push(file); return }
  fs.writeFileSync(file, out)
  injected++
}

walk(dist)
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n')
fs.rmSync(path.join(dist, 'sitemap.xml'), { force: true })

console.log(`noindex：共 ${total} 个 html，新加 ${injected} 个；robots.txt 已重写，sitemap.xml 已删除`)
if (failed.length) {
  console.error(`以下 ${failed.length} 个页面没能加上 noindex：\n${failed.join('\n')}`)
  process.exit(1)
}
