// 覆盖检查：对每个参考日期/时辰，列出圣咏、圣歌、赞美诗、谢主词等块里还没有译文的。
// 用法：node scripts/officium1962/li-leisi/coverage.mjs [--types psalm,canticle,hymn]
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { blockContentKey } from '../../../features/officium1962/psalmKey.mjs'
import { dataRoot, loadHourBlocks } from './do-data.mjs'

const dir = join(import.meta.dirname, '../../../resources/officium1962-li-leisi')
const config = JSON.parse(readFileSync(join(dir, 'segments.json'), 'utf8'))
const data = JSON.parse(readFileSync(join(dataRoot, 'li-leisi.json'), 'utf8')).blocks
const arg = process.argv.indexOf('--types')
const types = new Set((arg > 0 ? process.argv[arg + 1] : 'psalm,canticle,hymn,te-deum,capitulum').split(','))

const seen = new Set()
let missing = 0
for (const s of config.segments) {
  const id = `${s.ref.date}/${s.ref.hour}`
  if (seen.has(id))
    continue
  seen.add(id)
  const blocks = loadHourBlocks(s.ref.date, s.ref.hour)
  const lack = blocks.filter(b => types.has(b.type) && !data[blockContentKey(b.text)])
  if (lack.length) {
    missing += lack.length
    console.log(`${id}: ${lack.map(b => `#${b.order} ${b.type} ${(b.text.find(l => !/\{[^}]*\}/.test(l)) || '').slice(0, 24)}`).join(' | ')}`)
  }
}
console.log(`\n参考时辰 ${seen.size} 个，缺译文块 ${missing} 个`)
