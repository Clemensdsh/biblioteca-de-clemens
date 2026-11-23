// 列出某天各时辰的块大纲（类型、标题、首行拉丁），用来给利类思文本找拉丁锚点。
// 用法：node scripts/officium1962/li-leisi/dump-day.mjs 2026-12-25 [时辰] [--full]
import { loadHourBlocks } from './do-data.mjs'
import { office1962HourNames } from './hours.mjs'

const [date, hourArg] = process.argv.slice(2).filter(a => !a.startsWith('--'))
const full = process.argv.includes('--full')

for (const hour of office1962HourNames) {
  if (hourArg && hour !== hourArg)
    continue
  let blocks
  try { blocks = loadHourBlocks(date, hour) }
  catch { continue }
  console.log(`\n=== ${hour} (${blocks.length} blocks)`)
  for (const b of blocks) {
    console.log(`${b.order}. [${b.type}] ${b.title} (${b.text.length} lines)`)
    for (const l of full ? b.text : b.text.slice(0, 1))
      console.log(`     ${String(l).slice(0, full ? 400 : 110)}`)
  }
}
