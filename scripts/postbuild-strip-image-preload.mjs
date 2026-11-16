#!/usr/bin/env node
// 构建之后运行（package.json 的 build 脚本）：去掉 dist/**/*.html 里的 <link rel="preload" ... as="image">。
// Valaxy SSG 会按 SSR manifest 给页面用到的模块所引用的图片加 preload。实际命中的只有主题 Yun 的默认图
// （light/bg-img.jpg、light/sidebar-bg-img.webp、none.jpg）：本站 bg_image 换成了自己的图，这些图并不显示，
// 浏览器因此在控制台警告“preloaded but not used”，还白白多下载几百 KB。
// 去掉 preload 不影响功能：图片若真的被用到，CSS/JS 照常加载。
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
if (!fs.existsSync(dist)) { console.error('没有 dist 目录'); process.exit(1) }

const RE = /<link rel="preload" href="[^"]*" as="image">\s*/g
let files = 0
let links = 0

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8')
      let n = 0
      const out = html.replace(RE, () => { n++; return '' })
      if (n) { fs.writeFileSync(p, out); files++; links += n }
    }
  }
}
walk(dist)

console.log(`去掉图片 preload：${files} 个 html，共 ${links} 条`)
