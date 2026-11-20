// 校验 resources/officium1962-ot-canticles/lines.json：结构只读字段不变、标粗成对、注释格式、无禁用字样。
// 用法：node scripts/officium1962/ot-canticles-check.mjs [--ids=A-B]
import fs from 'node:fs'
import path from 'node:path'
import { root } from './psalms-zh-lib.mjs'

const file = path.join(root, 'resources/officium1962-ot-canticles/lines.json')
const lines = JSON.parse(fs.readFileSync(file, 'utf8'))
const base = path.join(root, 'resources/officium1962-ot-canticles/lines.base.json')
const orig = fs.existsSync(base) ? JSON.parse(fs.readFileSync(base, 'utf8')) : null
const idsArg = process.argv.find((a) => a.startsWith('--ids='))
const [lo, hi] = idsArg ? idsArg.slice(6).split('-').map(Number) : [1, 1e9]
const problems = []
if (orig && orig.length !== lines.length) problems.push(`条目数变了：${orig.length} → ${lines.length}`)
for (const e of lines) {
  if (e.id < lo || e.id > hi) continue
  const tag = `#${e.id} ${e.ref}`
  const o = orig?.find((x) => x.id === e.id)
  if (o) for (const k of ['ref', 'prefix', 'canticle', 'latin']) if (o[k] !== e[k]) problems.push(`${tag} 只读字段 ${k} 被改动`)
  if (typeof e.zh !== 'string' || !e.zh.trim()) { problems.push(`${tag} zh 为空`); continue }
  const stars = (e.zh.match(/\*\*/g) || []).length
  if (stars % 2) problems.push(`${tag} 粗体标记不成对`)
  if (/武加大|Vulgate|祢/.test(e.zh + (e.notes || []).join(''))) problems.push(`${tag} 含禁用字样（武加大/Vulgate/祢）`)
  const notes = e.notes || []
  if (stars && !notes.length) problems.push(`${tag} 有标粗但无注释`)
  for (const n of notes) if (!/思高本/.test(n) || !/拉丁通行本/.test(n)) problems.push(`${tag} 注释缺「思高本」或「拉丁通行本」：${n.slice(0, 30)}`)
  const lh = (e.latin.match(/ \* /g) || []).length
  const zh = (e.zh.match(/ \* /g) || []).length
  if (zh > lh) problems.push(`${tag} 半句分隔 ${zh} 多于拉丁 ${lh}`)
}
console.log(problems.length ? problems.join('\n') : '0 个问题', `（检查 id ${lo}–${Math.min(hi, lines.length)}）`)
process.exitCode = problems.length ? 1 : 0
