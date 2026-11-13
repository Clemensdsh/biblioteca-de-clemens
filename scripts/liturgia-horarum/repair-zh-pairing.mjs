// Give the alternative psalmodies the Chinese of the text the Latin actually prints.
//
//   node scripts/liturgia-horarum/check-zh-pairing.mjs     (finds the wrongly paired rows)
//   node scripts/liturgia-horarum/repair-zh-pairing.mjs    (writes zh/fixes.json)
//
// Every wrongly paired row found so far sits in an alternative version of an hour, where the
// engine correctly substitutes another psalm (or the psalms and antiphons) as the rubrics allow,
// but keeps the anchor keys of the default version, by which the Chinese was chosen:
//   - GILH 34: Ps 95 replaces an invitatory psalm (100, 67, 24) said elsewhere that day;
//   - the complementary psalmody's own rubric: "loco psalmi 121 (122) psalmum 128 (129) adhibere";
//   - Holy Thursday, Office of Readings: psalms and antiphons of Friday of Lent III;
//   - Daytime Prayer: "psalmodiam secundum tres hebdomadas Psalterii (currentem, præcedentem,
//     succedentem)".
// So the Latin is right and the Chinese follows it: for each row of such a block, the Chinese
// is taken from another row whose Latin is identical (letter for letter, markup aside) and which
// is not itself in a wrongly paired block. Rows with no such twin keep the mismatch mark.
//
// zh/fixes.json: { "<blockId>": { "<row>": { "hkdlc": ZhText|null, "wanyou": ZhText|null } } }
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'public/data/liturgia-horarum'
const VERSIONS = ['hkdlc', 'wanyou']
const load = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const mismatch = load('zh/mismatch.json')
const badBlocks = new Set(Object.keys(mismatch))
const latinKey = la => la.replace(/<sup>[^<]*<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;|&#8239;|\s/g, '')

// every row: Latin, key, Chinese in each version
const rows = [] // { id, i, la, key, zh: {hkdlc, wanyou} }
for (const dir of ['titles', 'common']) {
  for (const f of readdirSync(join(ROOT, 'zh/rows', dir))) {
    if (f === 'index.json')
      continue
    const latin = load(`zh/rows/${dir}/${f}`)
    const zh = {}
    for (const v of VERSIONS) {
      try {
        const z = load(`zh/${v}/${dir}/${f}`)
        zh[v] = z.blocks ?? z
      }
      catch { zh[v] = {} }
    }
    for (const [id, list] of Object.entries(latin)) {
      list.forEach(([la, key], i) => rows.push({ id, i, la, key, zh: Object.fromEntries(VERSIONS.map(v => [v, zh[v][id]?.[i] ?? null])) }))
    }
  }
}

// donors: rows outside the wrongly paired blocks, by identical Latin
const donors = new Map()
for (const r of rows) {
  if (badBlocks.has(r.id) || !r.key || !latinKey(r.la))
    continue
  const k = latinKey(r.la)
  const list = donors.get(k) ?? []
  list.push(r)
  donors.set(k, list)
}

// Ps 95 said in place of an invitatory psalm (GILH 34) is printed whole, with its heading, while
// the Chinese has it only as the Invitatory's strophes (FIX:INV_PS95#1..#5, #G). Join those.
// A version whose strophes are shorter than the other version's is incomplete (the 香港 text
// drops each strophe's first line) and is not used: the row keeps its mark there.
const PS95_KEYS = ['FIX:INV_PS95#1', 'FIX:INV_PS95#2', 'FIX:INV_PS95#3', 'FIX:INV_PS95#4', 'FIX:INV_PS95#5', 'FIX:INV_PS95#G']
const ps95 = {}
{
  const byKey = new Map()
  for (const r of rows) {
    if (PS95_KEYS.includes(r.key) && !badBlocks.has(r.id) && !byKey.has(r.key))
      byKey.set(r.key, r)
  }
  if (PS95_KEYS.every(k => byKey.has(k))) {
    for (const v of VERSIONS) {
      const parts = PS95_KEYS.map(k => byKey.get(k).zh[v])
      if (parts.every(p => p && p[0] === 't'))
        ps95[v] = parts.map(p => p[1]).join('\n')
    }
    const lines = v => ps95[v]?.split('\n').length ?? 0
    const most = Math.max(...VERSIONS.map(lines))
    for (const v of VERSIONS) {
      if (lines(v) < most)
        delete ps95[v]
    }
  }
}
const isPs95 = la => /Psalmus\s+94\s*\(95\)/.test(la.replace(/<[^>]+>/g, ' '))

const fixes = {}
const stats = { psalmRows: 0, psalmFixed: 0, ps95: 0, otherChanged: 0, unrepaired: [] }
for (const r of rows) {
  if (!badBlocks.has(r.id) || !r.key)
    continue
  const isFlagged = mismatch[r.id].includes(r.i)
  const candidates = donors.get(latinKey(r.la)) ?? []
  if (isFlagged)
    stats.psalmRows++
  if (!candidates.length) {
    if (isFlagged && isPs95(r.la) && Object.keys(ps95).length) {
      // 'm' keeps the mark in a version without a complete text
      ;(fixes[r.id] ??= {})[r.i] = Object.fromEntries(VERSIONS.map(v => [v, ps95[v] ? ['t', ps95[v]] : ['m', '']]))
      stats.ps95++
      continue
    }
    if (isFlagged)
      stats.unrepaired.push(`${r.key} ${r.id}#${r.i}`)
    continue
  }
  // A row not flagged itself (an antiphon, a responsory) changes only when its Latin was
  // substituted too: the twins carry another key. Twins with the same key are the same text
  // in another translation or script, and the row's own Chinese is kept.
  if (!isFlagged && candidates.some(d => d.key === r.key))
    continue
  const out = {}
  let differs = false
  for (const v of VERSIONS) {
    // all donors with this Latin should agree on the Chinese; take the commonest
    const counts = new Map()
    for (const d of candidates) {
      const z = d.zh[v]
      const k = JSON.stringify(z)
      counts.set(k, (counts.get(k) || 0) + 1)
    }
    const best = JSON.parse([...counts].sort((a, b) => b[1] - a[1])[0][0])
    out[v] = best
    if (JSON.stringify(best) !== JSON.stringify(r.zh[v]))
      differs = true
  }
  if (!differs)
    continue
  ;(fixes[r.id] ??= {})[r.i] = out
  if (isFlagged)
    stats.psalmFixed++
  else
    stats.otherChanged++
}
writeFileSync(join(ROOT, 'zh/fixes.json'), JSON.stringify(fixes))
console.log(`wrongly paired psalm rows: ${stats.psalmRows}, given the right Chinese: ${stats.psalmFixed}`)
console.log(`other rows in those blocks whose Chinese also changes (antiphons etc.): ${stats.otherChanged}`)
console.log(`Ps 95 in place of an invitatory psalm, joined from the Invitatory strophes: ${stats.ps95} (complete in: ${Object.keys(ps95).join(', ') || 'none'})`)
console.log(`no twin found (stay marked): ${stats.unrepaired.length}`)
for (const u of stats.unrepaired.slice(0, 20)) console.log('   ' + u)
