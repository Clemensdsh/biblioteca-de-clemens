// Re-cut public/data/officium1962/shared/ into the chunk layout of shared-chunks.mjs, without
// rebuilding the year (which needs the raw Divinum Officium exports). Blocks, their order, ids and
// hashes, and the day files are unchanged; only the chunk files, the shared manifest, and the
// shared manifest checksum in the root manifest are rewritten.
//
//   node scripts/officium1962/repack-shared.mjs [--check]
//
// Then run: node scripts/officium1962/validate-year.mjs --year=2026

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chunkSharedBlocks, compactJson, sharedIndexEntry, stableObject } from './shared-chunks.mjs'

const releaseRoot = join('public', 'data', 'officium1962')
const sharedRoot = join(releaseRoot, 'shared')
const checkOnly = process.argv.includes('--check')

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

const root = readJson(join(releaseRoot, 'manifest.json'))
const manifest = readJson(join(sharedRoot, 'manifest.json'))
const { schemaVersion, upstreamCommit } = manifest

// the blocks in their present order (= order of first use)
const blocks = manifest.chunks.flatMap(chunk => readJson(join(sharedRoot, chunk.file)).blocks)
if (blocks.length !== manifest.blockCount)
  throw new Error(`expected ${manifest.blockCount} blocks, read ${blocks.length}`)

const chunks = chunkSharedBlocks(blocks)
const sizes = chunks.map(chunk => Buffer.byteLength(compactJson({ schemaVersion, upstreamCommit, blocks: chunk.blocks })))
console.log(`${blocks.length} blocks: ${manifest.chunks.length} chunks -> ${chunks.length} chunks (largest ${Math.round(Math.max(...sizes) / 1024)} KB)`)
if (checkOnly)
  process.exit(0)

function write(path, text) {
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, text, 'utf8')
  renameSync(temp, path)
  return sha256(Buffer.from(text, 'utf8'))
}

for (const file of readdirSync(sharedRoot)) {
  if (/^blocks-\d+\.json$/.test(file))
    rmSync(join(sharedRoot, file))
}

const index = {}
const entries = chunks.map((chunk) => {
  const checksum = write(join(sharedRoot, chunk.file), compactJson({ schemaVersion, upstreamCommit, blocks: chunk.blocks }))
  for (const block of chunk.blocks)
    index[block.id] = sharedIndexEntry(chunk.file, block)
  return { file: chunk.file, blockCount: chunk.blocks.length, checksum }
})

const sharedChecksum = write(join(sharedRoot, 'manifest.json'), compactJson({
  schemaVersion,
  upstreamCommit,
  chunkCount: chunks.length,
  blockCount: blocks.length,
  chunks: entries,
  blocks: index,
}))

root.shared = { ...root.shared, checksum: sharedChecksum }
write(join(releaseRoot, 'manifest.json'), `${JSON.stringify(stableObject(root), null, 2)}\n`)
console.log('written; shared manifest checksum updated in manifest.json')
