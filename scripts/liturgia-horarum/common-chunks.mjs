// Layout of public/data/liturgia-horarum/common/: blocks used by many titles, in chunks.
//
// A day loads every chunk holding one of its blocks, and in the Chinese and parallel views the
// matching zh/rows/common and zh/<version>/common chunks too. With blocks in order of first use and
// 128 KB chunks, a day used about a tenth of what it downloaded (~1.1 MB of Latin for an ordinary
// weekday, three times over with Chinese). Blocks are now ordered so that blocks kept on the same
// days sit together: those used on many days (the ordinary, the four-week psalter's most frequent
// texts) first, the rest by the list of days that use them; chunks are cut at COMMON_CHUNK_BYTES.
// Used by build-data.mjs and repack-common.mjs.

export const COMMON_CHUNK_BYTES = 32 * 1024

/** ids: the common block ids; days: for each day in date order, the block ids it uses. */
export function orderByUse(ids, days) {
  const uses = new Map(ids.map(id => [id, []]))
  days.forEach((list, day) => {
    for (const id of new Set(list))
      uses.get(id)?.push(day)
  })
  const hot = days.length * 0.08
  const lexical = (a, b) => {
    const x = uses.get(a)
    const y = uses.get(b)
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      if (x[i] !== y[i])
        return x[i] - y[i]
    }
    return x.length - y.length
  }
  const tier = id => (uses.get(id).length > hot ? 0 : 1)
  return [...ids].sort((a, b) => tier(a) - tier(b) || lexical(a, b))
}

/** entries: [id, html] in order; returns id -> chunk number and the chunk count. */
export function chunkCommon(entries, limit = COMMON_CHUNK_BYTES) {
  const index = {}
  let count = 0
  let size = 0
  for (const [id, html] of entries) {
    const bytes = Buffer.byteLength(html)
    if (size && size + bytes > limit) {
      count++
      size = 0
    }
    index[id] = count
    size += bytes
  }
  return { index, count: entries.length ? count + 1 : 0 }
}
