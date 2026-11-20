// 从《思高本.epub》（全本圣经）抽出逐节文本 → resources/officium1962-readings/sigao-bible.json
// 结构：{ 书名(思高简体): { 章: { 节: 文 } } }，同时写 books 顺序。繁体经 OpenCC(hk→cn) 转简体。
// 用法：node scripts/officium1962/readings-sigao-extract.mjs <epub 解压目录>
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const OpenCC = require('opencc-js')
const toCn = OpenCC.Converter({ from: 'hk', to: 'cn' })

const dir = process.argv[2]
if (!dir)
  throw new Error('用法：node readings-sigao-extract.mjs <epub 解压目录>')
const root = path.resolve(import.meta.dirname, '../..')
const outDir = path.join(root, 'resources/officium1962-readings')
fs.mkdirSync(outDir, { recursive: true })

const files = fs.readdirSync(dir).filter(f => /^Bible_split_.*\.html$/.test(f)).sort()
const bible = {}
const order = []

function clean(s) {
  return toCn(s
    .replace(/<br[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .trim())
}

for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8')
  // 书名：class="calibre4" 的锚点，后面紧跟「NN.」章导航
  const bookRe = /<span class="calibre7"><a id="filepos\d+" class="calibre4">([^<]+)<\/a><\/span>/g
  const marks = [...html.matchAll(bookRe)].map(m => ({ name: clean(m[1]), index: m.index }))
  // 上一文件的延续（本文件开头没有书名标记）归入上一本书
  const segments = []
  const lead = html.slice(0, marks.length ? marks[0].index : html.length)
  if (order.length)
    segments.push({ name: order[order.length - 1], seg: lead })
  marks.forEach((mk, i) => segments.push({ name: mk.name, seg: html.slice(mk.index, i + 1 < marks.length ? marks[i + 1].index : html.length) }))
  segments.forEach(({ name, seg }) => {
    if (!bible[name]) { bible[name] = {}; order.push(name) }
    // 每个 <span class="calibre11">c:v</span> 后到下一个 <br 为一节
    for (const m of seg.matchAll(/<span class="calibre11">(\d+):(\d+)<\/span>\s*([\s\S]*?)(?=<br|<span class="calibre11">)/g)) {
      const [, c, v, text] = m
      const t = clean(text)
      if (!t)
        continue
      bible[name][c] ||= {}
      // 同一节号出现多次（如分行）则拼接
      bible[name][c][v] = bible[name][c][v] ? `${bible[name][c][v]}${t}` : t
    }
  })
}

const summary = order.map(n => `${n}:${Object.keys(bible[n]).length}`)
fs.writeFileSync(path.join(outDir, 'sigao-bible.json'), JSON.stringify({ order, bible }, null, 0), 'utf8')
console.log(`${order.length} 本书`, summary.join(' '))
