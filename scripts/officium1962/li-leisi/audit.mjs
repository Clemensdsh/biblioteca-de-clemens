// 审计：列出最终数据里仍含「云云」的译文段（半成品），以及块内所有译文都只是首句的块。
// 用法：node scripts/officium1962/li-leisi/audit.mjs [--all]
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './do-data.mjs'

const d = JSON.parse(readFileSync(join(dataRoot, 'li-leisi.json'), 'utf8'))
let bad = 0
for (const [key, list] of Object.entries(d.blocks)) {
  for (const e of list) {
    for (const p of e.p) {
      if (/云云/.test(p.t)) {
        bad++
        console.log(`L${e.l} [${e.s}] ${p.k}${p.e ? '(首句)' : ''}: ${p.t.replace(/\s+/g, ' ').slice(0, 70)}`)
      }
    }
  }
}
console.log(`\n含「云云」的译文段：${bad}`)
if (bad && process.argv.includes('--check'))
  process.exitCode = 1
