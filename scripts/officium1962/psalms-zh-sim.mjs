import fs from 'node:fs'
import path from 'node:path'
import { root } from './psalms-zh-lib.mjs'

const DO = path.join(root, 'vendor/divinum-officium/web/www/horas')
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ|ǽ/g, 'ae').replace(/œ/g, 'oe').replace(/j/g, 'i').replace(/v/g, 'u').replace(/\(\d+[a-z]?\)/g, ' ').replace(/[^a-z\s]/g, ' ')
const stems = (s) => new Set(norm(s).split(/\s+/).filter((w) => w.length > 2).map((w) => w.slice(0, 4)))

function read(dir, n) {
  const f = path.join(DO, dir, 'Psalterium/Psalmorum', `Psalm${n}.txt`)
  const rows = []
  for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^(\d+):(\d+)([a-z]?)\s(.*)$/)
    if (m) rows.push({ v: +m[2], l: m[3], text: m[4] })
  }
  return rows
}

const buckets = { hi: 0, mid: 0, lo: 0 }
const lo = []
let tot = 0
for (let n = 1; n <= 150; n++) {
  const c = read('Latin', n)
  const b = read('Latin-Bea', n)
  const byV = {}
  for (const x of b) (byV[x.v] ??= []).push(x.text)
  const cByV = {}
  for (const x of c) (cByV[x.v] ??= []).push(x.text)
  for (const v of Object.keys(cByV)) {
    tot++
    const A = stems(cByV[v].join(' '))
    // 允许 Bea 的邻节（Clementina 一节可对 Bea 相邻节）
    let best = 0
    for (const dv of [-1, 0, 1]) {
      const bb = byV[+v + dv]
      if (!bb) continue
      const B = stems(bb.join(' '))
      const inter = [...A].filter((x) => B.has(x)).length
      const sc = inter / Math.max(1, Math.min(A.size, B.size))
      if (dv === 0) best = Math.max(best, sc)
      else best = Math.max(best, sc * 0.9)
    }
    if (best >= 0.6) buckets.hi++
    else if (best >= 0.4) buckets.mid++
    else { buckets.lo++; lo.push(`${n}:${v} ${best.toFixed(2)}`) }
  }
}
console.log(tot, buckets)
console.log(lo.slice(0, 40).join(' | '))
