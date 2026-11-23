// 找参考日期：按“夜课/赞美/申正第一条对经”的首句，列出 2026 年有哪些日子用同一套共同礼。
// 用法：node find-ref.mjs [时辰=matutinum] [关键词]   （关键词=对经首句里的拉丁片段，如 "In lege"）
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot, loadHourBlocks } from './do-data.mjs'

const hour = process.argv[2] || 'matutinum'
const needle = process.argv[3]
const dir = join(dataRoot, 'years/2026/days')
const groups = new Map()
for (const f of readdirSync(dir).sort()) {
  const date = f.replace('.json', '')
  let blocks
  try { blocks = loadHourBlocks(date, hour) }
  catch { continue }
  const ant = blocks.find(b => b.type === 'antiphon' && !/repetita/i.test(b.title))
  const head = ant ? (ant.text.find(l => !/\{[^}]*\}/.test(l)) || '').slice(0, 50) : '(无对经)'
  if (needle && !head.includes(needle)) continue
  if (!groups.has(head)) groups.set(head, [])
  groups.get(head).push(date.slice(5))
}
for (const [head, dates] of [...groups].sort((a, b) => b[1].length - a[1].length))
  console.log(`${String(dates.length).padStart(3)}  ${head}\n     ${dates.join(' ')}`)
