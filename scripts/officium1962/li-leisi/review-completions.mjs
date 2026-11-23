// 列出所有按书中他处补全的「云云」单元，供人工核对：行号、补全后的文字、依据。
// 用法：node scripts/officium1962/li-leisi/review-completions.mjs
import { build } from './build.mjs'

const { reports } = build()
let n = 0
for (const { pairs } of reports) {
  for (const { unit, block } of pairs) {
    if (!unit.completed)
      continue
    n++
    console.log(`L${unit.line} ${unit.kind}${block ? '' : '(未配块)'} | ${unit.text.replace(/\s+/g, ' ').slice(0, 130)} | ${(unit.fillNotes || []).join('；')}`)
  }
}
console.log(`\n补全单元共 ${n} 个`)
