// 校验润色只改了允许的地方：对照 psalms-pre-polish/ 备份。
// 允许变：zh 里 **…** 内的字、fix 的新字（第二项）、note。其余必须逐字不变。
// 用法：node scripts/officium1962/psalms-zh-polish-check.mjs [--psalm=5,6]
import fs from 'node:fs'
import path from 'node:path'
import { root } from './psalms-zh-lib.mjs'

const dir = path.join(root, 'resources/officium1962-psalms-zh')
const only = process.argv.find((a) => a.startsWith('--psalm='))?.split('=')[1].split(',').map(Number)
const strip = (s) => s.replace(/\*\*(.*?)\*\*/gs, '\u0001')
const boldCount = (s) => (s.match(/\*\*/g) || []).length
const errs = []
let changed = 0

for (const f of fs.readdirSync(path.join(dir, 'psalms-pre-polish')).filter((x) => /^\d+\.json$/.test(x))) {
  const n = Number(f.slice(0, -5))
  if (only && !only.includes(n)) continue
  const a = JSON.parse(fs.readFileSync(path.join(dir, 'psalms-pre-polish', f), 'utf8'))
  const p = path.join(dir, 'psalms', f)
  let b
  try { b = JSON.parse(fs.readFileSync(p, 'utf8')) } catch (e) { errs.push(`${f}: JSON 不合法 ${e.message}`); continue }
  if (a.reviewed !== b.reviewed) errs.push(`${f}: reviewed 被改`)
  const ka = Object.keys(a.lines ?? {})
  const kb = Object.keys(b.lines ?? {})
  if (JSON.stringify(ka) !== JSON.stringify(kb)) { errs.push(`${f}: 行键集合或顺序变了`); continue }
  for (const k of ka) {
    const x = a.lines[k]
    const y = b.lines[k]
    const where = `${f} ${k}`
    if (JSON.stringify(Object.keys(x)) !== JSON.stringify(Object.keys(y))) errs.push(`${where}: 字段集合变了`)
    for (const field of Object.keys(x)) {
      if (['note'].includes(field)) { if (x.note !== y.note) changed++; continue }
      if (field === 'zh') {
        if (strip(x.zh) !== strip(y.zh)) errs.push(`${where}: zh 的非粗体部分被改（应逐字不变）`)
        if (boldCount(x.zh) !== boldCount(y.zh)) errs.push(`${where}: zh 的粗体数量变了`)
        if (x.zh !== y.zh) changed++
        continue
      }
      if (field === 'fix') {
        if (!Array.isArray(y.fix) || x.fix.length !== y.fix.length) { errs.push(`${where}: fix 条数变了`); continue }
        x.fix.forEach((pair, i) => {
          if (pair[0] !== y.fix[i][0]) errs.push(`${where}: fix 旧字被改`)
          if (strip(pair[1]) !== strip(y.fix[i][1])) errs.push(`${where}: fix 新字的非粗体部分被改`)
          if (pair[1] !== y.fix[i][1]) changed++
        })
        continue
      }
      if (JSON.stringify(x[field]) !== JSON.stringify(y[field])) errs.push(`${where}: ${field} 被改`)
    }
    if (y.note && /武加大|思高说|思高：/.test(y.note)) errs.push(`${where}: 注释仍含「武加大」或「思高说」`)
  }
}
console.log(`改动处 ${changed}；问题 ${errs.length}`)
for (const e of errs) console.log(e)
process.exitCode = errs.length ? 1 : 0
