// Layout of public/data/officium1962/shared/: the text blocks every day file points to.
//
// The page loads, for one hour, every chunk holding one of its blocks. Blocks are kept in order of
// first use (by date, then hour), so the blocks of one hour sit close together; chunks are cut at
// about SHARED_CHUNK_BYTES of compact JSON. With the earlier 450 blocks (~750 KB) per chunk an
// hour pulled 2–4 chunks, about 2.5 MB on average; at 64 KB it is about 0.3 MB in ~5 requests.
// Used by build-year.mjs and repack-shared.mjs.

export const SHARED_CHUNK_BYTES = 64 * 1024

export function chunkSharedBlocks(blocks, limit = SHARED_CHUNK_BYTES) {
  const chunks = []
  let current = []
  let size = 0
  for (const block of blocks) {
    const bytes = Buffer.byteLength(JSON.stringify(block), 'utf8') + 1
    if (current.length && size + bytes > limit) {
      chunks.push(current)
      current = []
      size = 0
    }
    current.push(block)
    size += bytes
  }
  if (current.length)
    chunks.push(current)
  return chunks.map((items, index) => ({
    file: `blocks-${String(index).padStart(3, '0')}.json`,
    blocks: items,
  }))
}

// The shared manifest's entry for a block. It used to repeat the block's 64-digit contentHash,
// which made up most of the manifest (~370 KB of ~420 KB compressed) that every page view loads.
// The hash stays in the chunk; the block's id is `shared-` + its first 20 digits, and each chunk
// file is checksummed in the manifest, so the runtime checks the block against its id instead.
export function sharedIndexEntry(file, block) {
  return { chunk: file, type: block.type }
}

export function stableObject(value) {
  if (Array.isArray(value))
    return value.map(stableObject)
  if (!value || typeof value !== 'object')
    return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableObject(item)]),
  )
}

/** Shared chunks and the shared manifest are fetched by the page: no indentation. */
export function compactJson(value) {
  return `${JSON.stringify(stableObject(value))}\n`
}
