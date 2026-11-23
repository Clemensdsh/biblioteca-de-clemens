// 读取已发布的 1962 日课数据（public/data/officium1962），还原某天某时辰的块列表。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const dataRoot = join(import.meta.dirname, '../../../public/data/officium1962')
const json = p => JSON.parse(readFileSync(join(dataRoot, p), 'utf8'))

let manifest
const chunks = new Map()

function sharedBlock(id) {
  manifest ??= json('shared/manifest.json')
  const entry = manifest.blocks[id]
  if (!entry)
    throw new Error(`shared manifest has no block ${id}`)
  if (!chunks.has(entry.chunk))
    chunks.set(entry.chunk, new Map(json(`shared/${entry.chunk}`).blocks.map(b => [b.id, b])))
  return chunks.get(entry.chunk).get(id)
}

/** 返回 [{order, type, title, text}]，与前台 reconstructHour 的块一致。 */
export function loadHourBlocks(date, hour) {
  const day = json(`years/${date.slice(0, 4)}/days/${date}.json`)
  const h = day.hours[hour]
  if (!h)
    throw new Error(`${date} has no ${hour}`)
  return h.occurrences.map((occ) => {
    const b = sharedBlock(occ.blockId)
    return {
      order: occ.order,
      type: b.type,
      title: occ.occurrenceMetadata?.title ?? b.title ?? '',
      text: b.text || [],
    }
  })
}
