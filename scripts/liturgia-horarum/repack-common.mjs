// Re-cut public/data/liturgia-horarum/common/ (and the zh/rows/common and zh/<version>/common
// chunks that follow the same numbering) into the layout of common-chunks.mjs, without rerunning
// build-data.mjs (which needs the lh exports and clears the folder, zh/fixes.json etc. included).
// Block texts are unchanged; only the chunk files, common/index.json and the manifest's
// commonChunks and version are rewritten.
//
//   node scripts/liturgia-horarum/repack-common.mjs [--check]

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { chunkCommon, orderByUse } from './common-chunks.mjs'

const OUT = join('public', 'data', 'liturgia-horarum')
const checkOnly = process.argv.includes('--check')
const read = path => JSON.parse(readFileSync(join(OUT, path), 'utf8'))
const name = n => `${String(n).padStart(3, '0')}.json`

const manifest = read('manifest.json')
const oldIndex = read('common/index.json')
const dirs = ['common', ...(manifest.zh ? ['zh/rows/common', ...manifest.zh.map(v => `zh/${v}/common`)] : [])]

// every block of every chunk set, by id
const sets = Object.fromEntries(dirs.map((dir) => {
  const all = {}
  for (let n = 0; n < manifest.commonChunks; n++)
    Object.assign(all, read(`${dir}/${name(n)}`))
  return [dir, all]
}))
const latin = sets.common
const ids = Object.keys(latin)
if (ids.length !== Object.keys(oldIndex).length)
  throw new Error(`index has ${Object.keys(oldIndex).length} blocks, chunks ${ids.length}`)

// the common blocks each day uses, in date order
const celBlocks = new Map()
const days = []
for (const year of manifest.years) {
  const entries = Object.entries(read(`years/${year}.json`)).sort(([a], [b]) => a.localeCompare(b))
  for (const [, entry] of entries) {
    const list = []
    for (const [, cel] of entry.c) {
      if (!celBlocks.has(cel)) {
        const data = read(`cels/${cel}.json`)
        celBlocks.set(cel, data.hours.flatMap(h => h.versions.flatMap(v => v.parts.flatMap(p => 'block' in p ? [p.block] : p.options.map(o => o.block)))).filter(id => id in latin))
      }
      list.push(...celBlocks.get(cel))
    }
    days.push(list)
  }
}

const order = orderByUse(ids, days)
const { index, count } = chunkCommon(order.map(id => [id, latin[id]]))

function bytesPerDay(chunkOf, files) {
  const size = new Map()
  for (const dir of dirs)
    for (const [n, text] of files(dir)) size.set(`${dir}/${n}`, (size.get(`${dir}/${n}`) || 0) + text)
  let total = 0
  for (const list of days) {
    for (const n of new Set(list.map(id => chunkOf[id]))) {
      for (const dir of dirs)
        total += size.get(`${dir}/${n}`) || 0
    }
  }
  return Math.round(total / days.length / 1024)
}
const sizesOf = chunkOf => dir => Object.entries(sets[dir]).map(([id, value]) => [chunkOf[id], JSON.stringify(value).length + id.length + 4])
console.log(`${ids.length} common blocks, ${days.length} days: ${manifest.commonChunks} chunks -> ${count}; `
  + `common text a day loads with Chinese (raw, all chunk sets): ${bytesPerDay(oldIndex, sizesOf(oldIndex))} KB -> ${bytesPerDay(index, sizesOf(index))} KB`)
if (checkOnly)
  process.exit(0)

for (const dir of dirs) {
  for (const file of readdirSync(join(OUT, dir))) {
    if (/^\d{3}\.json$/.test(file))
      rmSync(join(OUT, dir, file))
  }
  const chunks = Array.from({ length: count }, () => [])
  for (const id of order) {
    if (id in sets[dir])
      chunks[index[id]].push([id, sets[dir][id]])
  }
  chunks.forEach((items, n) => writeFileSync(join(OUT, dir, name(n)), JSON.stringify(Object.fromEntries(items))))
}
writeFileSync(join(OUT, 'common', 'index.json'), JSON.stringify(Object.fromEntries(order.map(id => [id, index[id]]))))

// the page adds the version to every request: a new one, so no browser mixes old and new chunks
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(path)
    else
      yield path
  }
}
const version = createHash('sha256')
for (const path of walk(OUT)) {
  const rel = relative(OUT, path).split(sep).join('/')
  if (rel !== 'manifest.json')
    version.update(rel).update(readFileSync(path))
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ ...manifest, commonChunks: count, version: version.digest('hex').slice(0, 12) }))
console.log('written')
