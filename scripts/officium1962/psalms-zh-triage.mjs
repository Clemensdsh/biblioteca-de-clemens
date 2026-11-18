// 列出尚未校订的圣咏及其待查行数，便于安排校订顺序。用法：node scripts/officium1962/psalms-zh-triage.mjs
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { root } from './psalms-zh-lib.mjs'

const out = execFileSync(process.execPath, [path.join(root, 'scripts/officium1962/psalms-zh-build.mjs'), '--check', '--worksheet=' + Array.from({ length: 150 }, (_, i) => i + 1).join(',')], { encoding: 'utf8', maxBuffer: 1 << 28 })
const rows = {}
let cur = null
for (const l of out.split('\n')) {
  const m = l.match(/^=== Ps (\d+)( \(已校订\))?/)
  if (m) { cur = +m[1]; rows[cur] = { reviewed: !!m[2], lines: 0, flagged: 0, missing: 0 }; continue }
  const k = l.match(/^(\d+):(\S+) (✓|\[(\w+)\])/)
  if (k && cur) {
    rows[cur].lines++
    if (k[3] !== '✓') { rows[cur].flagged++; if (k[4] === 'missing') rows[cur].missing++ }
  }
}
const occ = {}
import fs from 'node:fs'
for (const l of fs.readFileSync(path.join(root, 'resources/officium1962-latin/corpus.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const o = JSON.parse(l)
  if (o.type !== 'psalm') continue
  const n = +o.latin.match(/^Psalmus (\d+)/)[1]
  occ[n] = (occ[n] || 0) + o.occurrenceCount
}
const list = Object.entries(rows).filter(([, r]) => !r.reviewed).map(([n, r]) => ({ n: +n, ...r, occ: occ[n] || 0 })).sort((a, b) => b.occ - a.occ)
for (const r of list) console.log(`Ps ${r.n}\t出现${r.occ}\t行${r.lines}\t待查${r.flagged}\t缺中文${r.missing}`)
