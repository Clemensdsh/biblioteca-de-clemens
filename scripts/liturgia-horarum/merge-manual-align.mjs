// Merge hand-made psalm pairings (one JSON per batch: { hash: groups | {skip} }) into
// public/data/liturgia-horarum/zh/align-<version>.json, keeping only pairings that pass the
// page's own check against the current data (features/liturgiaHorarum/manualAlign.ts).
//
//   node scripts/liturgia-horarum/merge-manual-align.mjs <batches dir> <inputs dir>
//
// <inputs dir> holds the batches as exported (each item with hash, latin_units, zh_body);
// a batch file "<version>-NN.json" in <batches dir> pairs the items of the same name.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [outDir, inDir] = process.argv.slice(2)
const { checkManual } = await import(pathToFileURL(join(process.cwd(), 'features/liturgiaHorarum/manualAlign.ts')).href)
const ROOT = 'public/data/liturgia-horarum/zh'
const merged = { hkdlc: {}, wanyou: {} }
const stats = { hkdlc: { ok: 0, skip: 0, bad: 0 }, wanyou: { ok: 0, skip: 0, bad: 0 } }
const skips = []
for (const f of readdirSync(inDir).filter(f => /^(hkdlc|wanyou)-\d+\.json$/.test(f))) {
  const version = f.split('-')[0]
  const items = JSON.parse(readFileSync(join(inDir, f), 'utf8'))
  let out = {}
  try { out = JSON.parse(readFileSync(join(outDir, f), 'utf8')) } catch {}
  for (const item of items) {
    const r = out[item.hash]
    if (!r) continue
    if (!Array.isArray(r)) {
      stats[version].skip++
      skips.push(`${version} ${item.key} ${item.hash}: ${r.skip}`)
      continue
    }
    // latin_units carry the same count and order as the page's latinUnits(); check against them
    const problems = checkManual(r, item.latin_units.map(u => u.text), item.zh_body)
    if (problems.length) {
      stats[version].bad++
      continue
    }
    merged[version][item.hash] = r.map(g => ({ la: g.la, zh: g.zh }))
    stats[version].ok++
  }
}
for (const version of Object.keys(merged))
  writeFileSync(join(ROOT, `align-${version}.json`), JSON.stringify(merged[version]))
console.log(JSON.stringify(stats))
if (skips.length) console.log(`skipped by the aligner:\n  ${skips.join('\n  ')}`)
