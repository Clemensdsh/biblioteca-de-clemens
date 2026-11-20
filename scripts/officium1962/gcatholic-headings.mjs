// 抓取 gCatholic 特殊形式（1962）礼仪历的中文页，转成简体，存入
// resources/officium1962-headings-zh/gcatholic-<年>.json（每天若干行：等级、弥撒名、纪念）。
// 用法：node scripts/officium1962/gcatholic-headings.mjs 2025 2026 2027
// 来源页：https://gcatholic.org/calendar/<年>/Extraordinary-zt（繁体；英文名只在链接提示里）。
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { root } from './psalms-zh-lib.mjs'

const require = createRequire(import.meta.url)
const OpenCC = require('opencc-js')
const toCn = OpenCC.Converter({ from: 'hk', to: 'cn' })
const outDir = path.join(root, 'resources/officium1962-headings-zh')

const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

export function parseGcatholic(html, year) {
  const segs = html.split(/<tr id="(\d{4})">/).slice(1)
  const out = {}
  for (let i = 0; i < segs.length; i += 2) {
    const id = segs[i]
    const body = segs[i + 1].split(/<tr class="tbhd/)[0]
    const rows = [...('<tr>' + body).matchAll(/<tr[^>]*>([\s\S]*?)(?=<tr|$)/g)].map((m) => m[1])
    const subs = []
    for (const r of rows) {
      const cells = [...r.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)].filter((m) => !/zdate|season/.test(m[2]) && !/rowspan="\d+" style/.test(m[1]))
      if (cells.length < 2) continue
      const txt = cells.map((c) => strip(c[2]))
      if (!/等/.test(txt[0])) continue
      // 八日庆期等：等级文字与弥撒名连在一起（「一等复活週瞻礼二」）
      const m = /^([一二三四])等(.*)$/.exec(txt[0])
      let rank = txt[0]
      let mass = txt[1] || ''
      if (m && m[2]) { rank = `${m[1]}等`; mass = m[2] + mass }
      subs.push({
        rank: toCn(rank),
        mass: toCn(mass),
        com: toCn(txt[2] || ''),
        eng: [...(cells[1]?.[2] || '').matchAll(/title="([^"]+)"/g)].map((x) => x[1]),
      })
    }
    out[`${year}-${id.slice(0, 2)}-${id.slice(2)}`] = subs
  }
  return out
}

const years = process.argv.slice(2).filter((x) => /^\d{4}$/.test(x))
if (process.argv[1]?.endsWith('gcatholic-headings.mjs') && years.length) {
  fs.mkdirSync(outDir, { recursive: true })
  for (const y of years) {
    const url = `https://gcatholic.org/calendar/${y}/Extraordinary-zt`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`${url} ${res.status}`)
    const data = parseGcatholic(await res.text(), y)
    fs.writeFileSync(path.join(outDir, `gcatholic-${y}.json`), JSON.stringify({ source: url, year: Number(y), days: data }, null, 1))
    console.log(y, Object.keys(data).length, '天')
  }
}
