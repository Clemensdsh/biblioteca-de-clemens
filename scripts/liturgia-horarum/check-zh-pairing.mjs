// Find psalm rows where the Chinese text is a different psalm than the Latin, and write
// public/data/liturgia-horarum/zh/mismatch.json: { "<blockId>": [rowIndex, ...] }.
// The page hides the Chinese of those rows (the Latin stays). Run after build-data.mjs:
//
//   node scripts/liturgia-horarum/check-zh-pairing.mjs
//
// The Chinese of a row was chosen by the engine's anchor key (ZALM<n>… = Hebrew psalm n),
// but on some days the engine prints another psalm under that key. The Latin psalm is
// identified by its heading "Psalmus V (H)"; a row without a heading is identified by its
// first verse, looked up among the rows that do carry a heading.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'public/data/liturgia-horarum'
const load = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))

const text = html => html.replace(/<sup>[^<]*<\/sup>/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;|&#8239;/g, ' ').replace(/&#\d+;|&[a-z]+;/g, '').replace(/\s+/g, ' ').trim()
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zæœ]/g, '')

/** Hebrew psalm number(s) of a Latin heading "Psalmus 143 (144)" / "Psalmus 113 A" */
function latinHebrew(la) {
  const m = /Psalmus\s+(\d+)\s*(?:[A-Z]\s*)?(?:\((\d+)\s*[A-Z]?\))?/.exec(text(la))
  if (!m)
    return null
  if (m[2])
    return [Number(m[2])]
  const v = Number(m[1]) // no Hebrew number given: Vulgate = Hebrew (1–8, 148–150) or a split psalm
  return { 9: [9, 10], 113: [114, 115], 114: [116], 115: [116], 146: [147], 147: [147] }[v] ?? [v]
}
const keyBase = key => /^(?:ZALM|FIX:INV_PS)(\d+)/.exec(key || '')?.[1] ?? null
const keyHebrew = key => {
  const m = /^(?:ZALM|FIX:INV_PS)(\d+)/.exec(key || '')
  return m ? Number(m[1]) : null
}
const firstVerse = la => {
  const m = /<p class="verse[^"]*">([\s\S]*?)<\/p>/.exec(la)
  return m ? norm(text(m[1])).slice(0, 60) : null
}

const files = []
for (const dir of ['titles', 'common'])
  for (const f of readdirSync(join(ROOT, 'zh/rows', dir)))
    if (f !== 'index.json') files.push(`zh/rows/${dir}/${f}`)

// pass 1: first verse -> Hebrew numbers, from rows with a heading
const byVerse = new Map()
for (const f of files) {
  for (const list of Object.values(load(f))) {
    for (const [la] of list) {
      const h = latinHebrew(la)
      const v = firstVerse(la)
      if (h && v && !byVerse.has(v))
        byVerse.set(v, h)
    }
  }
}

// pass 1b: what each key really stands for = its most common first verse. Catches a wrong
// section of the same psalm (e.g. Ps 119 MEM printed under the key of SADE), which the
// psalm number cannot. Used only when the majority is clear (≥3 rows and ≥2× any other).
const PSALM_ROW = /^(?:ZALM|CHVAL_|FIX:INV_PS)/
const keyVerses = new Map()
for (const f of files) {
  for (const list of Object.values(load(f))) {
    for (const [la, key] of list) {
      const v = PSALM_ROW.test(key || '') ? firstVerse(la) : null
      if (!v)
        continue
      const m = keyVerses.get(key) ?? new Map()
      m.set(v, (m.get(v) || 0) + 1)
      keyVerses.set(key, m)
    }
  }
}
const canonical = new Map()
for (const [key, m] of keyVerses) {
  const [[top, n], second] = [...m].sort((a, b) => b[1] - a[1])
  if (n >= 3 && (!second || n >= 2 * second[1]))
    canonical.set(key, top)
}

// pass 2: compare with the key the Chinese was chosen by
const mismatch = {}
let checked = 0
let unknown = 0
for (const f of files) {
  for (const [id, list] of Object.entries(load(f))) {
    // a psalm's later sections (…_II, …_III) carry no heading: they continue the psalm\n    // identified earlier in the same block under the same key number
    const seenInBlock = new Map()
    list.forEach(([la, key], i) => {
      const fv = firstVerse(la)
      if (canonical.has(key) && fv && fv !== canonical.get(key)) {
        (mismatch[id] ??= []).push(i)
        return
      }
      const k = keyHebrew(key)
      if (k === null)
        return
      const h = latinHebrew(la) ?? byVerse.get(firstVerse(la)) ?? seenInBlock.get(keyBase(key))
      if (h)
        seenInBlock.set(keyBase(key), h)
      if (!h) {
        unknown++
        return
      }
      checked++
      if (!h.includes(k))
        (mismatch[id] ??= []).push(i)
    })
  }
}
writeFileSync(join(ROOT, 'zh/mismatch.json'), JSON.stringify(mismatch))
const rows = Object.values(mismatch).reduce((n, l) => n + l.length, 0)
console.log(`checked ${checked} psalm rows (${unknown} unidentified), ${rows} rows in ${Object.keys(mismatch).length} blocks pair a different psalm -> zh/mismatch.json`)
