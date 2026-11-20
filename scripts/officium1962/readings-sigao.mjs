// 查思高本经文：node scripts/officium1962/readings-sigao.mjs "Sir 1:11-15" [前后各多看几节：--pad=2]
// 引文书名用拉丁通行本缩写（同 lines.json 的 ref）；也可直接写思高书名，如 "德训篇 1:11-15"。
import fs from 'node:fs'
import path from 'node:path'
import { expandRanges, parseCitation } from './readings-extract.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const { bible } = JSON.parse(fs.readFileSync(path.join(root, 'resources/officium1962-readings/sigao-bible.json'), 'utf8'))
const arg = process.argv[2]
const pad = Number((process.argv.find(a => a.startsWith('--pad=')) || '--pad=0').slice(6))
if (!arg) {
  console.log('用法：node readings-sigao.mjs "Sir 1:11-15" [--pad=2]')
  process.exit(1)
}
let book
let ranges
const parsed = parseCitation(arg)
if (parsed) { book = parsed.book; ranges = parsed.ranges }
else {
  const m = /^(\S+)\s+(.+)$/.exec(arg)
  book = m?.[1]
  ranges = m?.[2]
}
if (!bible[book]) { console.log('找不到书：' + book); process.exit(1) }
for (const { c, from, to } of expandRanges(ranges)) {
  const ch = bible[book][String(c)]
  if (!ch) { console.log(`${book} ${c}：无此章`); continue }
  const vs = Object.keys(ch).map(Number).sort((a, b) => a - b)
  for (const v of vs) {
    if (v >= from - pad && v <= to + pad)
      console.log(`${c}:${v}${v < from || v > to ? '（邻）' : ''} ${ch[String(v)]}`)
  }
}
