// Attach the Chinese biographical notes transcribed from 《每日颂祷》(香港教区礼仪委员会) to the
// Latin notes of the site's data, and write public/data/liturgia-horarum/zh/bios.json:
//   { "<Latin note, letters only, first 80>": { "hant": "…", "hans": "…", "date": "MM-DD",
//      "title": "<as printed>", "pdf_pages": [..] } }
//
//   node scripts/liturgia-horarum/build-bios.mjs <transcription.jsonl> [more.jsonl …]
//
// The book's note is a translation of the Latin one, so their years agree: an entry is matched
// to a Latin note of a celebration on the same date when the years (digits in the Latin,
// 一五八〇-style numerals in the Chinese) agree; with several notes on one date the one sharing
// the most years wins, and a tie or no shared year leaves the entry unmatched (reported).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = 'public/data/liturgia-horarum'
const load = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const OpenCC = await import(pathToFileURL(join(process.cwd(), 'node_modules/opencc-js/dist/esm/full.js')).href)
const toHans = OpenCC.Converter({ from: 'hk', to: 'cn' })

export const bioKey = latin => latin.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[^A-Za-z]/g, '').toLowerCase().slice(0, 80)
const latinYears = t => new Set([...t.matchAll(/\b(\d{3,4})\b/g)].map(m => Number(m[1])))
const ZH_DIGIT = { 〇: 0, 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
const chineseYears = t => new Set([...t.matchAll(/[〇零一二三四五六七八九]{3,4}/g)].map(m => Number([...m[0]].map(c => ZH_DIGIT[c]).join(''))))

// Latin notes by date (MM-DD), from every year of the data
const BIO = /^\s*((?:<div class="small">[\s\S]*?<\/div>\s*(?:<div><\/div>\s*)?)+)/
const index = load('common/index.json')
const titleCache = new Map()
const chunkCache = new Map()
function block(titleKey, id) {
  if (!titleCache.has(titleKey)) titleCache.set(titleKey, load(`titles/${titleKey}.json`).blocks)
  const t = titleCache.get(titleKey)
  if (id in t) return t[id]
  const n = index[id]
  if (n === undefined) return ''
  if (!chunkCache.has(n)) chunkCache.set(n, load(`common/${String(n).padStart(3, '0')}.json`))
  return chunkCache.get(n)[id] ?? ''
}
const notesByDate = new Map() // MM-DD -> Map(key -> { text, title })
for (const y of readdirSync(join(ROOT, 'years'))) {
  for (const [date, e] of Object.entries(load(`years/${y}`))) {
    for (const [titleKey, celId] of e.c) {
      const cel = load(`cels/${celId}.json`)
      for (const h of cel.hours) {
        for (const v of h.versions) {
          const p = v.parts[0]
          const html = block(titleKey, 'block' in p ? p.block : p.options[p.default].block)
          const m = BIO.exec(html)
          if (!m) continue
          // a note may hold two saints' paragraphs; each paragraph is its own note
          for (const para of m[1].matchAll(/<div class="small">([\s\S]*?)<\/div>/g)) {
            const text = para[1].replace(/<[^>]+>/g, '').trim()
            const map = notesByDate.get(date.slice(5)) ?? new Map()
            map.set(bioKey(text), { text, title: cel.title_la })
            notesByDate.set(date.slice(5), map)
          }
        }
      }
    }
  }
}

const bios = (() => { try { return load('zh/bios.json') } catch { return {} } })()
const entries = process.argv.slice(2).flatMap(file => readFileSync(file, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l))).filter(e => e.bio)
const claimed = new Set()
const pending = []
let matched = 0
const take = (key, e) => {
  bios[key] = { hant: e.bio, hans: toHans(e.bio), date: e.date, title: e.title, pdf_pages: e.pdf_pages }
  claimed.add(key)
  matched++
}
// 0. hand-checked pairings (bio-overrides.json): the Chinese text matched to a Latin celebration by its
//    saint, for entries whose notes carry no years or are split into several Latin paragraphs. A Chinese
//    note answering to several Latin paragraphs is cut (not altered) at the given phrases, one piece per paragraph.
const overrides = JSON.parse(readFileSync(join(import.meta.dirname, 'bio-overrides.json'), 'utf8'))
const overridden = new Set()
for (const o of overrides) {
  const e = entries.find(x => x.date === o.date && x.title === o.zh)
  if (!e) continue
  const keys = [...(notesByDate.get(o.date)?.entries() ?? [])].filter(([, n]) => n.title.includes(o.la)).map(([key]) => key)
  const cuts = (o.splitAt ?? []).map(p => e.bio.indexOf(p))
  if (cuts.includes(-1) || keys.length !== cuts.length + 1)
    throw new Error(`bio-overrides ${o.date} ${o.zh}: ${keys.length} Latin notes, cuts ${JSON.stringify(cuts)}`)
  const bounds = [0, ...cuts, e.bio.length]
  keys.forEach((key, i) => take(key, { ...e, bio: e.bio.slice(bounds[i], bounds[i + 1]) }))
  overridden.add(e)
}
// 1. by the years both notes give
for (const e of entries) {
  if (overridden.has(e))
    continue
  const cands = [...(notesByDate.get(e.date)?.entries() ?? [])]
  const zy = chineseYears(e.bio)
  const scored = cands.map(([key, n]) => [key, n, [...latinYears(n.text)].filter(y => zy.has(y)).length]).sort((a, b) => b[2] - a[2])
  const best = scored[0]
  const ok = best && (best[2] > 0 ? (scored.length < 2 || best[2] > scored[1][2]) : scored.length === 1 && zy.size === 0)
  if (ok)
    take(best[0], e)
  else
    pending.push([e, cands])
}
// 2. by elimination: the one note of that date nobody else took, for a Chinese note that gives
//    no year (one that gives years which the Latin lacks is another saint, e.g. a local Blessed)
const unmatched = []
for (const [e, cands] of pending) {
  const left = cands.filter(([key]) => !claimed.has(key))
  if (left.length === 1 && chineseYears(e.bio).size === 0)
    take(left[0][0], e)
  else
    unmatched.push(`${e.date} ${e.title}: ${cands.length ? `candidates ${cands.map(([, n]) => n.title).join(' | ')}` : 'no Latin note that day'}`)
}
writeFileSync(join(ROOT, 'zh/bios.json'), JSON.stringify(bios))
console.log(`matched ${matched}; zh/bios.json now holds ${Object.keys(bios).length} notes`)
if (unmatched.length) console.log(`unmatched:\n  ${unmatched.join('\n  ')}`)
