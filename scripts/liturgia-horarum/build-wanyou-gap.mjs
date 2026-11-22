// Chinese for Latin rows our two sources lack, taken from day pages of 万有真原 scraped by
// scripts/liturgia-horarum/wanyou/ (Codex; see TASK-scrape.md), paired with the Latin rows.
//
//   node scripts/liturgia-horarum/build-wanyou-gap.mjs [--check]
//
// Output  public/data/liturgia-horarum/zh/wanyou-gap.json
//           { "<rowHash('wy', latin row, '')>": { "hans": "…", "hant": "…", "src": "…" } }
//         (data.ts looks a row up by that hash when neither source nor the book OCR has it.)
//         Written after build-data.mjs, which clears the folder.
// Pairing 1 (automatic): first and second readings (`*_cCIT1/2`) and their responsories (`…#R`).
//         A Latin reading is paired with a scraped reading whose scripture reference has the same
//         chapter/verse numbers (a patristic reading, which has none, by the numbers of its
//         responsory); the responsory by its numbers. Several candidates with different texts, or
//         none, leave the row unpaired (listed in the report).
// Pairing 2 (by hand): scripts/liturgia-horarum/wanyou-gap-manual.json, entries
//         { "id", "block", "row", "date", "stype", "section": <index in that page's sections>, "format": "plain"|"collect" , "note" }
//         for antiphons, collects and hymns, checked by reading Latin and Chinese side by side.
// The Chinese is the scraped text, character for character (only the layout is arranged).

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rowHash } from '../../features/liturgiaHorarum/manualAlign.ts'

const OpenCC = await import(pathToFileURL(join(process.cwd(), 'node_modules/opencc-js/dist/esm/full.js')).href)
const toHant = OpenCC.Converter({ from: 'cn', to: 'hk' })

const DATA = 'public/data/liturgia-horarum/'
const TEXT = 'scripts/liturgia-horarum/wanyou/out/text/'
const check = process.argv.includes('--check')
const readJson = p => JSON.parse(readFileSync(p, 'utf8'))
const plain = h => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim()

// ---- the scraped pages
const pages = new Map() // "date-stype" -> page
for (const f of readdirSync(TEXT).filter(f => f.endsWith('.json'))) {
  const p = readJson(TEXT + f)
  pages.set(`${p.date}-${p.stype}`, p)
}

/** Chapter/verse numbers of the references in a string, e.g. "5, 14 – 7, 2" / "5:14-7:2" -> [5,14,7,2]. */
function verseNumbers(s) {
  const out = []
  for (const m of s.matchAll(/\d+\s*[,:]\s*\d+[a-c]?(?:\s*[-–.,;:]\s*\d+[a-c]?)*/g))
    out.push(...m[0].match(/\d+/g).map(Number))
  return out
}
const sameNumbers = (a, b) => a.length > 0 && a.length === b.length && a.every((n, i) => n === b[i])
/** Responsories quote several verses, and the Chinese book sometimes cites other ones after the first: the first chapter:verse decides when no whole citation agrees. */
const sameStart = (a, b) => a.length >= 2 && b.length >= 2 && a[0] === b[0] && a[1] === b[1]

// chapter and verse alone can name two books (Eph 4, 1-16 and 1 Cor 4, 1-16): where the Latin
// title names one of these books, the Chinese reference must name it too
const BOOKS = [['corinth', '格林多'], ['ephes', '厄弗所'], ['galat', '迦拉达'], ['philipp', '斐理伯'], ['colossens', '哥罗森'],
  ['thessalonic', '得撒洛尼'], ['timoth', '弟茂德'], ['titum', '弟铎'], ['hebr', '希伯来'], ['roman', '罗马'], ['iacobi', '雅各伯'],
  ['petri', '伯多禄'], ['ioannis apostoli', '若望'], ['apocalyps', '默示录'], ['isai', '依撒意亚'], ['ieremi', '耶肋米亚'], ['ezechiel', '厄则克耳']]
const bare = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
function bookCompatible(latinText, ref) {
  const head = bare(latinText).slice(0, 90)
  return BOOKS.every(([lat, zh]) => !head.includes(lat) || ref.includes(zh))
}

/** Latin: the numbers of the first citation after the title words, e.g. "De libro Osée prophétæ 5, 14 – 7, 2 Vanitas" -> [5,14,7,2]. */
function latinReadingNumbers(text) {
  const tokens = text.split(/\s+/)
  const start = tokens.findIndex(t => /\d/.test(t))
  if (start < 0)
    return []
  const run = []
  for (const t of tokens.slice(start)) {
    if (/^[\d,.;:–\-a-c()]+$/.test(t) && /[\d–-]/.test(t))
      run.push(t)
    else
      break
  }
  return (run.join(' ').match(/\d+/g) ?? []).map(Number)
}

/** Latin responsory: "RESPONSORIUM 1 Io 3, 16. 14a In hoc nóvimus" -> the numbers of its citation [3,16,14]. */
function latinRespNumbers(text) {
  const tokens = text.replace(/^RESPONSORIUM\s+/, '').replace(/^Cf\.\s+/, '').split(/\s+/)
  const lead = []
  for (const t of tokens) {
    if (/^(?:\d+[a-c]?[,.;:]*|\d+[a-c]?[-–]\d+[a-c]?[,.;:]*|[A-Z][a-z]{0,4}\.?|\(Vg\)|[-–;]|cf\.|Cf\.)$/.test(t))
      lead.push(t)
    else
      break
  }
  while (lead.length && !/\d/.test(lead.at(-1)))
    lead.pop()
  // a leading "1 Io": the book's own number is not a chapter
  if (/^\d+$/.test(lead[0] ?? '') && /^[A-Z]/.test(lead[1] ?? ''))
    lead.shift()
  return (lead.join(' ').match(/\d+/g) ?? []).map(Number)
}
// ---- the pool of scraped readings: { kind: 1|2, ref, heading, lines, resp: { ref, lines } | null }
const pool = []
for (const page of pages.values()) {
  if (page.stype !== 'let')
    continue
  page.sections.forEach((s, i) => {
    const kind = s.label === '诵读一' ? 1 : s.label === '诵读二' ? 2 : 0
    if (!kind)
      return
    const next = page.sections[i + 1]
    pool.push({ kind, or: !!s.or, ref: s.ref ?? '', heading: s.heading ?? '', lines: s.lines, date: page.date,
      resp: next?.label === '对答咏' ? { ref: next.ref ?? '', lines: next.lines } : null })
  })
}

// ---- the Latin rows without Chinese
const fixes = existsSync(`${DATA}zh/fixes.json`) ? readJson(`${DATA}zh/fixes.json`) : {}
const files = [...readdirSync(`${DATA}zh/rows/common`).map(f => `common/${f}`), ...readdirSync(`${DATA}zh/rows/titles`).map(f => `titles/${f}`)]
const gapRows = [] // { id, i, key, la }
for (const f of files) {
  const rows = readJson(`${DATA}zh/rows/${f}`)
  const zhs = ['hkdlc', 'wanyou'].map(v => existsSync(`${DATA}zh/${v}/${f}`) ? readJson(`${DATA}zh/${v}/${f}`) : {})
  for (const [id, lines] of Object.entries(rows)) {
    lines.forEach(([la, key], i) => {
      if (!key || key.startsWith('@') || plain(la).length < 25)
        return
      const has = zhs.some(z => (z.blocks ?? z)[id]?.[i]) || fixes[id]?.[i]
      if (!has)
        gapRows.push({ id, i, key, la })
    })
  }
}

// the dates of 2026 on which each block is used, for the pairing by date
const datesOfBlock = new Map()
{
  const year = readJson(`${DATA}years/2026.json`)
  const celBlocks = new Map()
  for (const [date, entry] of Object.entries(year)) {
    for (const [, celId] of entry.c) {
      if (!celBlocks.has(celId)) {
        const cel = readJson(`${DATA}cels/${celId}.json`)
        celBlocks.set(celId, new Set(cel.hours.flatMap(h => h.versions.flatMap(v => v.parts.flatMap(p => 'block' in p ? [p.block] : p.options.map(o => o.block))))))
      }
      for (const id of celBlocks.get(celId))
        (datesOfBlock.get(id) ?? datesOfBlock.set(id, new Set()).get(id)).add(date)
    }
  }
}
// rows whose pairing by date was checked by reading (wanyou-gap-approved.json: ["<row key>", ...])
const approvedPath = 'scripts/liturgia-horarum/wanyou-gap-approved.json'
const approvedList = existsSync(approvedPath) ? readJson(approvedPath) : []
// an entry is a row key, or { key, date } when the Chinese page that has the text is another date's (the mainland calendar)
const approved = new Map(approvedList.map(a => typeof a === 'string' ? [a, null] : [a.key, a.date]))
function byDate(row, kind, isResp) {
  const out = []
  const override = approved.get(row.key)
  for (const date of override ? [override] : datesOfBlock.get(row.id) ?? []) {
    const onDate = pool.filter(e => e.date === date && e.kind === kind && (!isResp || e.resp))
    // the day's own reading comes first on the page; an "or" alternative has variant > 1
    const first = onDate.find(e => !e.or) ?? onDate[0]
    if (first)
      out.push(first)
  }
  return out
}

const result = {}
const report = { paired: [], unpaired: [] }
const put = (row, text, src, label) => {
  result[rowHash('wy', row.la, '')] = { hans: text, hant: toHant(text), src }
  report.paired.push(`${label} ${row.key}`)
}

// ---- pairing 1: readings and responsories
const seen = new Set()
for (const row of gapRows) {
  const k = rowHash('wy', row.la, '')
  if (seen.has(k))
    continue
  seen.add(k)
  const isResp = /#R$/.test(row.key)
  const m = /_cCIT([12])/.exec(row.key) ?? /c_?CIT([12])/.exec(row.key)
  if (!m)
    continue
  const kind = Number(m[1])
  const latin = plain(row.la)
  const candidates = []
  if (!isResp) {
    const own = latinReadingNumbers(latin)
    if (own.length) {
      for (const e of pool) {
        if (e.kind === kind && sameNumbers(own, verseNumbers(e.ref)) && bookCompatible(latin, e.ref))
          candidates.push(e)
      }
    }
    else {
      // a patristic reading: found through its responsory, the next row of the block
      const rows = readJson(`${DATA}zh/rows/${files.find(f => readJson(`${DATA}zh/rows/${f}`)[row.id])}`)[row.id]
      const respLatin = plain(rows[row.i + 1]?.[0] ?? '')
      const respNumbers = latinRespNumbers(respLatin)
      for (const e of pool) {
        if (e.kind === kind && e.resp && (sameNumbers(respNumbers, verseNumbers(e.resp.ref)) || sameStart(respNumbers, verseNumbers(e.resp.ref))))
          candidates.push(e)
      }
    }
    let texts = new Set(candidates.map(e => e.lines.join('').replace(/\s+/g, '')))
    if (texts.size !== 1 && approved.has(row.key)) {
      candidates.length = 0
      candidates.push(...byDate(row, kind, false))
      texts = new Set(candidates.map(e => e.lines.join('').replace(/\s+/g, '')))
    }
    if (texts.size !== 1) {
      report.unpaired.push(`${row.key}: ${candidates.length ? 'several different candidates' : 'no scraped reading'} | ${latin.slice(0, 70)}`)
      continue
    }
    const e = candidates[0]
    const text = [e.ref ? `${e.ref}` : '', e.heading, ...e.lines].filter(Boolean).join('\n')
    put(row, text, `万有真原 ${e.date} 诵读`, 'reading')
  }
  else {
    const respNumbers = latinRespNumbers(latin)
    for (const e of pool) {
      if (e.kind === kind && e.resp && (sameNumbers(respNumbers, verseNumbers(e.resp.ref)) || sameStart(respNumbers, verseNumbers(e.resp.ref))))
        candidates.push(e)
    }
    let texts = new Set(candidates.map(e => e.resp.lines.join('').replace(/\s+/g, '')))
    const exact = candidates.filter(e => sameNumbers(respNumbers, verseNumbers(e.resp.ref)))
    if (exact.length && texts.size !== 1) {
      candidates.length = 0
      candidates.push(...exact)
      texts = new Set(candidates.map(e => e.resp.lines.join('').replace(/\s+/g, '')))
    }
    if (texts.size !== 1 && approved.has(row.key)) {
      candidates.length = 0
      candidates.push(...byDate(row, kind, true))
      texts = new Set(candidates.map(e => e.resp.lines.join('').replace(/\s+/g, '')))
    }
    if (texts.size !== 1) {
      report.unpaired.push(`${row.key}: ${candidates.length ? 'several different responsories' : 'no scraped responsory'} | ${latin.slice(0, 70)}`)
      continue
    }
    const e = candidates[0]
    put(row, ['对答咏', e.resp.ref, ...e.resp.lines].filter(Boolean).join('\n'), `万有真原 ${e.date} 诵读`, 'responsory')
  }
}

// ---- pairing 2: by hand
const manualPath = 'scripts/liturgia-horarum/wanyou-gap-manual.json'
if (existsSync(manualPath)) {
  const rowsOf = new Map()
  for (const f of files) {
    for (const [id, rows] of Object.entries(readJson(`${DATA}zh/rows/${f}`)))
      rowsOf.set(id, rows)
  }
  for (const entry of readJson(manualPath)) {
    try {
      // by row key (every Latin row of the block family with that key), or by block and row
      const targets = entry.key
        ? gapRows.filter(r => r.key === entry.key).map(r => ({ la: r.la, key: r.key }))
        : [rowsOf.get(entry.block)?.[entry.row]].filter(Boolean).map(r => ({ la: r[0], key: r[1] }))
      if (!targets.length)
        throw new Error('no such Latin row without Chinese')
      const page = pages.get(`${entry.date}-${entry.stype}`)
      const section = page?.sections[entry.section]
      if (!section)
        throw new Error('scraped section not found')
      // the site prints some antiphons after a stray full-width colon
      const lines = section.lines.map((l, i) => (i === 0 ? l.replace(/^：/, '') : l))
      const text = (entry.format === 'collect' ? lines : [section.ref, section.heading, ...lines]).filter(Boolean).join('\n')
      for (const target of targets)
        put(target, text, `万有真原 ${entry.date} ${section.label}`, `manual ${entry.id}`)
    }
    catch (error) {
      report.unpaired.push(`manual ${entry.id}: ${error.message}`)
    }
  }
}

// --review: what pairing by date would give for the rows still without Chinese, to be read side by side
if (process.argv.includes('--review')) {
  const seenKey = new Set()
  for (const row of gapRows) {
    const m = /_cCIT([12])/.exec(row.key)
    const h = rowHash('wy', row.la, '')
    if (!m || seenKey.has(h) || result[h])
      continue
    seenKey.add(h)
    const isResp = /#R$/.test(row.key)
    const found = byDate(row, Number(m[1]), isResp)
    if (!found.length)
      continue
    if (process.argv.includes('--core-only')) {
      const core = new Set(readJson('scripts/liturgia-horarum/wanyou/gap-dates.json').celebrations.filter(c => !c.optional).map(c => c.date))
      if (![...(datesOfBlock.get(row.id) ?? [])].some(d => core.has(d)))
        continue
    }
    const zh = found.map(e => `[${e.date}] ${isResp ? `${e.resp.ref} ${e.resp.lines.join('').slice(0, 40)}` : `${e.ref} ${e.heading} ${e.lines.join('').slice(0, 24)}`}`).join(' | ')
    console.log(`${row.key}\n  LA: ${plain(row.la).slice(0, 110)}\n  ZH: ${zh}`)
  }
}
// --core: the rows still unpaired that the obligatory (not optional) celebrations of the gap list use
if (process.argv.includes('--core')) {
  const core = new Set(readJson('scripts/liturgia-horarum/wanyou/gap-dates.json').celebrations.filter(c => !c.optional).map(c => c.date))
  const shown = new Set()
  for (const row of gapRows) {
    const h = rowHash('wy', row.la, '')
    if (result[h] || shown.has(h) || !/_c?CIT|MODLITBA|BENEDIKTUS|MAGNIFIKAT|HYMNUS|ANT|RESP/.test(row.key) || row.key.startsWith('FIX:'))
      continue
    const dates = [...(datesOfBlock.get(row.id) ?? [])].filter(d => core.has(d))
    if (!dates.length)
      continue
    shown.add(h)
    console.log(`${dates.join(',')} ${row.key} | ${plain(row.la).slice(0, 80)}`)
  }
}
// --dump-gaps <file>: every Latin row still without Chinese (distinct by html), with its dates, block and row number, as JSON
const dumpAt = process.argv.indexOf('--dump-gaps')
if (dumpAt >= 0) {
  const seen = new Map()
  for (const row of gapRows) {
    if (result[rowHash('wy', row.la, '')] || row.key.startsWith('FIX:') || row.key.startsWith('@'))
      continue
    const h = rowHash('ocr', row.la, '')
    const entry = seen.get(h) ?? seen.set(h, { key: row.key, la: plain(row.la), blocks: [], dates: new Set() }).get(h)
    entry.blocks.push([row.id, row.i])
    for (const d of datesOfBlock.get(row.id) ?? []) entry.dates.add(d)
  }
  writeFileSync(process.argv[dumpAt + 1], JSON.stringify([...seen.values()].map(e => ({ ...e, dates: [...e.dates].sort() }))))
  console.log(`dumped ${seen.size} rows`)
}
console.log(`paired ${report.paired.length} distinct Latin rows; unpaired ${report.unpaired.length}`)
const byType = {}
for (const p of report.paired) byType[p.split(' ')[0]] = (byType[p.split(' ')[0]] ?? 0) + 1
console.log(byType)
if (process.argv.includes('--report'))
  console.log(report.unpaired.join('\n'))
if (!check) {
  writeFileSync(`${DATA}zh/wanyou-gap.json`, JSON.stringify(result))
  console.log(`wrote zh/wanyou-gap.json (${Object.keys(result).length} rows)`)
}
