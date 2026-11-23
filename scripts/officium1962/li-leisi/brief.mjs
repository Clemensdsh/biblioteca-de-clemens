// 简表：某天某时辰里非圣咏正文的块（对经/应答/节目/赞美诗/读经等）的首句，用来对照译本决定配对。
// 用法：node scripts/officium1962/li-leisi/brief.mjs 2026-01-06 matutinum laudes ...
import { loadHourBlocks } from './do-data.mjs'

const [date, ...hours] = process.argv.slice(2)
for (const h of hours) {
  console.log(`##### ${date} ${h}`)
  for (const b of loadHourBlocks(date, h)) {
    if (['dialogue', 'blessing', 'absolution', 'rubric', 'heading', 'martyrology', 'pretiosa', 'chapter-office', 'conclusion'].includes(b.type))
      continue
    if (/repetita/i.test(b.title))
      continue
    const line = b.text.filter(l => !/\{[^}]*\}/.test(l)).join(' / ').replace(/\s+/g, ' ')
    console.log(`${b.order}. ${b.type.slice(0, 7)} ${line.slice(0, 70)}`)
  }
}
