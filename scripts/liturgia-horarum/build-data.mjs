// Convert the lh project's day exports (format lh-day/1) into the site's data.
//
//   node scripts/liturgia-horarum/build-data.mjs <lh>/export/days
//
// Output, public/data/liturgia-horarum/ (format lh-site/1):
//   manifest.json         years, date range, number of common chunks, and a version
//                         (hash of all the other files) the page adds to each request,
//                         so a browser never mixes files from two builds
//   years/YYYY.json       per date: mass year, default celebration, [titleKey, celebrationId] list
//   cels/<id>.json        one celebration as it falls in some year (psalter week, weekday
//                         and options differ between years, so one title has several)
//   titles/<key>.json     the text blocks only this title (or one or two others) uses
//   common/index.json     block id -> common chunk, for blocks used by many titles
//   common/NNN.json       those blocks, in order of first use, about 128 KB per chunk
// A day loads its year file, one to three celebration and title files, and the common
// chunks it needs.
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const COMMON_TITLES = 3
const CHUNK_BYTES = 128 * 1024
const OUT = 'public/data/liturgia-horarum'

const source = process.argv[2]
if (!source)
  throw new Error('usage: build-data.mjs <lh>/export/days')

const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 12)
const version = createHash('sha256')
const write = (path, data) => {
  const text = JSON.stringify(data)
  mkdirSync(join(OUT, path, '..'), { recursive: true })
  writeFileSync(join(OUT, path), text)
  if (path !== 'manifest.json')
    version.update(path).update(text)
}

// Marks the printed book leaves to the reader, applied to the engine's text
// (General Instruction 266): the sign of the cross at "Deus, in adiutorium" and
// at the start of the Gospel canticles, the small cross on the lips at
// "Domine, labia mea aperies". Placed as Divinum Officium places them.
const CROSS = '<span class="lh-cross">✠</span>'
const LIPS = '<span class="lh-cross">✙</span>'
const MARKS = [
  ['<p class="respV">Deus, in adiutórium', `<p class="respV">Deus, ${CROSS} in adiutórium`],
  ['<p class="respV">Dómine, lábia mea apéries.', `<p class="respV">Dómine, lábia ${LIPS} mea apéries.`],
  ['<sup>68</sup>Benedíctus Dóminus Deus Israel', `<sup>68</sup>Benedíctus ${CROSS} Dóminus Deus Israel`],
  ['<sup>46</sup>Magníficat', `<sup>46</sup>Magníficat ${CROSS}`],
  ['<sup>29</sup>Nunc dimíttis', `<sup>29</sup>Nunc dimíttis ${CROSS}`],
]
// A <br> inside a psalm line is the printed book's line end; the page wraps
// lines itself with a hanging indent.
const VERSE_BREAK = /(<p class="verse[^"]*">)([\s\S]*?)(<\/p>)/g

function present(html) {
  for (const [from, to] of MARKS)
    html = html.replaceAll(from, to)
  return html.replace(VERSE_BREAK, (_, open, text, close) => open + text.replace(/\s*<br\s*\/?>\s*/g, ' ') + close)
}

function* partBlocks(parts) {
  for (const part of parts) {
    if ('block' in part)
      yield part.block
    else
      yield* part.options.map(option => option.block)
  }
}

const blocks = new Map() // id -> html, in order of first use
const blockTitles = new Map() // id -> Set of title keys
const titles = new Map() // key -> { title, cels: Map(id -> celebration), blocks: Set }
const years = new Map() // year -> { date: entry }

const files = readdirSync(source).sort().flatMap(year => readdirSync(join(source, year)).sort().map(name => join(source, year, name)))
for (const file of files) {
  const day = JSON.parse(readFileSync(file, 'utf8'))
  if (day.format !== 'lh-day/1')
    throw new Error(`${file}: unexpected format ${day.format}`)
  const refs = day.celebrations.map((cel) => {
    const key = hash(cel.title_la)
    if (!titles.has(key))
      titles.set(key, { title: cel.title_la, cels: new Map(), blocks: new Set() })
    const entry = titles.get(key)
    const celId = hash(JSON.stringify(cel))
    entry.cels.set(celId, cel)
    for (const hour of cel.hours) {
      for (const version of hour.versions) {
        for (const id of partBlocks(version.parts)) {
          if (!blocks.has(id))
            blocks.set(id, present(day.blocks[id]))
          if (!blockTitles.has(id))
            blockTitles.set(id, new Set())
          blockTitles.get(id).add(key)
          entry.blocks.add(id)
        }
      }
    }
    return [key, celId]
  })
  const year = day.date.slice(0, 4)
  if (!years.has(year))
    years.set(year, {})
  years.get(year)[day.date] = { m: day.mass_year, d: day.default_celebration, c: refs }
}

rmSync(OUT, { recursive: true, force: true })

const common = new Set([...blockTitles].filter(([, keys]) => keys.size >= COMMON_TITLES).map(([id]) => id))
const index = {}
let chunk = []
let chunkSize = 0
let chunkCount = 0
const flush = () => {
  write(`common/${String(chunkCount).padStart(3, '0')}.json`, Object.fromEntries(chunk))
  chunkCount++
  chunk = []
  chunkSize = 0
}
for (const [id, html] of blocks) {
  if (!common.has(id))
    continue
  const size = Buffer.byteLength(html)
  if (chunk.length && chunkSize + size > CHUNK_BYTES)
    flush()
  chunk.push([id, html])
  chunkSize += size
  index[id] = chunkCount
}
if (chunk.length)
  flush()
write('common/index.json', index)

for (const [key, entry] of titles) {
  for (const [celId, cel] of entry.cels)
    write(`cels/${celId}.json`, cel)
  write(`titles/${key}.json`, {
    title: entry.title,
    blocks: Object.fromEntries([...entry.blocks].filter(id => !common.has(id)).map(id => [id, blocks.get(id)])),
  })
}

for (const [year, days] of years)
  write(`years/${year}.json`, days)

const dates = [...years.values()].flatMap(days => Object.keys(days)).sort()
write('manifest.json', {
  format: 'lh-site/1',
  from: dates[0],
  to: dates.at(-1),
  years: [...years.keys()].map(Number),
  commonChunks: chunkCount,
  version: version.digest('hex').slice(0, 12),
})

console.log(`${dates.length} days, ${titles.size} titles, ${[...titles.values()].reduce((n, entry) => n + entry.cels.size, 0)} celebrations, ${blocks.size} blocks (${common.size} common in ${chunkCount} chunks)`)
