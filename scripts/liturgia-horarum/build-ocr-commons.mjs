// Chinese for Latin rows the two online sources lack, taken from the scanned 《每日颂祷》 (香港教区,
// vertical traditional print), transcribed by Codex (scripts/liturgia-horarum/codex/TASK-ocr-commons.md).
//
//   node scripts/liturgia-horarum/build-ocr-commons.mjs [--check]
//
// Input   scripts/liturgia-horarum/ocr-commons-pairs.json   the pairings (see below)
//         scripts/liturgia-horarum/codex/ocr-out/commons/*.jsonl   the transcription, one page per line
//         public/data/liturgia-horarum/zh/rows/…           the Latin rows of every block
// Output  public/data/liturgia-horarum/zh/ocr-commons.json
//           { "<rowHash('ocr', latin row, '')>": { "hant": "…", "hans": "…", "src": "…" } }
//         The page looks a row up by that hash (data.ts), so every block that holds the very same
//         Latin row gets the Chinese. Written after build-data.mjs, which clears the folder.
//
// A pairing:
//   { "id": "…", "kind": "preces", "block": "<block id>", "row": 1, "pages": [1268],
//     "from": "<first words of the Chinese>", "to": "<last words>", "note": "…" }
// The Chinese is cut out of the transcription of those PDF pages between "from" and "to"
// (whitespace and line ends ignored): it is never typed in, so it is exactly what the scan says.
// Only its layout changes (columns joined into the lines the Latin has). The result must pass the
// structure check of its kind. Traditional characters as printed; simplified by OpenCC for the
// simplified view, which the page labels as taken from the Hong Kong text.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rowHash } from '../../features/liturgiaHorarum/manualAlign.ts'

const OpenCC = await import(pathToFileURL(join(process.cwd(), 'node_modules/opencc-js/dist/esm/full.js')).href)
const toHans = OpenCC.Converter({ from: 'hk', to: 'cn' })

const DATA = 'public/data/liturgia-horarum/'
const OCR_DIRS = ['scripts/liturgia-horarum/codex/ocr-out/commons/', 'scripts/liturgia-horarum/codex/ocr-out/gaps/', 'scripts/liturgia-horarum/codex/ocr-out/gaps/saints/', 'scripts/liturgia-horarum/codex/ocr-out/gaps/pass3/']
const check = process.argv.includes('--check')
const readJson = p => JSON.parse(readFileSync(p, 'utf8'))

const pages = new Map()
for (const dir of OCR_DIRS) {
  for (const file of readdirSync(dir).filter(f => f.endsWith('.jsonl'))) {
    for (const line of readFileSync(dir + file, 'utf8').split('\n').filter(l => l.trim())) {
      const page = JSON.parse(line)
      if (page.pdf_page != null && page.text)
        pages.set(page.pdf_page, page)
    }
  }
}

// every Latin row of every block, found by block id (a block lives in one common chunk or title file)
const rowsOf = new Map()
for (const dir of ['common', 'titles']) {
  for (const file of readdirSync(`${DATA}zh/rows/${dir}`)) {
    for (const [id, rows] of Object.entries(readJson(`${DATA}zh/rows/${dir}/${file}`)))
      rowsOf.set(id, rows)
  }
}

const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim()

/** The text of the pages from the first words to the last words, whitespace ignored, line ends kept. */
function excerpt(pagesList, from, to) {
  const source = pagesList.map((n) => {
    const page = pages.get(n)
    if (!page)
      throw new Error(`PDF page ${n} is not in the transcription`)
    return page.text
  }).join('\n')
  const squashed = []
  const where = []
  for (let i = 0; i < source.length; i++) {
    if (!/\s/.test(source[i])) {
      squashed.push(source[i])
      where.push(i)
    }
  }
  const text = squashed.join('')
  const start = text.indexOf(from.replace(/\s/g, ''))
  if (start < 0)
    throw new Error(`"${from}" not found`)
  if (text.indexOf(from.replace(/\s/g, ''), start + 1) >= 0)
    throw new Error(`"${from}" is not unique on those pages`)
  const tail = to.replace(/\s/g, '')
  const end = text.indexOf(tail, start)
  if (end < 0)
    throw new Error(`"${to}" not found after "${from}"`)
  return source.slice(where[start], where[end + tail.length - 1] + 1)
}

/**
 * Preces: the book prints each column as a line; the Latin (and the other Chinese texts) have the
 * introduction, the response, and then each intercession with its answer after "—— ".
 * A line starts a new unit after a full stop or colon, or when it starts with a dash.
 */
function formatPreces(raw, breaks = []) {
  const out = []
  for (const line of raw.split('\n').map(l => l.trim()).filter(Boolean)) {
    const dash = /^[—─-]+/.test(line)
    const body = line.replace(/^[—─-]+\s*/, '')
    if (dash) {
      out.push(`—— ${body}`)
    }
    else if (!out.length || breaks.some(b => line.startsWith(b)) || /[。：！？]$/.test(out.at(-1)) || out.at(-1).startsWith('—— ') && /[。！？]$/.test(out.at(-1))) {
      out.push(body)
    }
    else {
      out[out.length - 1] += body
    }
  }
  return out.join('\n')
}

function checkPreces(latin, zh) {
  const problems = []
  const answers = (latin.match(/<p class="partV">/g) ?? []).length
  const lines = zh.split('\n')
  const dashes = lines.filter(l => l.startsWith('—— ')).length
  if (answers !== dashes)
    problems.push(`${answers} intercessions in Latin, ${dashes} answers in Chinese`)
  const intro = (latin.match(/<p class="intro">/g) ?? []).length
  const resp = (latin.match(/<p class="resp">/g) ?? []).length
  if (intro !== 1 || resp !== 1 || lines.length !== 2 + 2 * answers)
    problems.push(`expected ${2 + 2 * answers} Chinese lines (introduction, response, ${answers} × 2), found ${lines.length}`)
  return problems
}

/** Responsory: "對答詠" then every 領：/答： on its own line. */
function formatResponsory(raw, versicle = false) {
  const flat = raw.split('\n').map(l => l.trim()).filter(Boolean).join('')
  const lines = flat.replace(/([領答][：:])/g, '\n$1').split('\n').map(l => l.trim()).filter(Boolean)
  if (versicle)
    return lines.join('\n')
  // text before the first 領： is the heading with its reference ("對答詠 依六一，1；若八，42")
  const head = /^[領答][：:]/.test(lines[0]) ? '' : lines.shift().replace(/^對答詠/, '').trim()
  return [`對答詠${head ? ` ${head}` : ''}`, ...lines].join('\n')
}

/** Reading: first line = "選讀…" heading, second = title, the rest joined into paragraphs. */
function formatReading(raw, headLines = [1, 1]) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  // headLines: how many printed columns each heading line (title line, subtitle) spans
  const head = headLines.map(n => lines.splice(0, n).join(''))
  const width = Math.max(...lines.map(l => l.length))
  const paragraphs = []
  let open = false
  for (const line of lines) {
    if (open) paragraphs[paragraphs.length - 1] += line
    else paragraphs.push(line)
    open = !(/[。！？」]$/.test(line) && line.length < width * 0.8)
  }
  return [...head, ...paragraphs].join('\n')
}

const oneLine = raw => raw.split('\n').map(l => l.trim()).filter(Boolean).join('')

/**
 * Hymn: the book prints stanzas numbered "一、…"; the Latin row (and the other Chinese texts) have no
 * numbers. A "○○" in the text is where the book prints the saint's name: the page puts the
 * celebration's name there (LhHour.vue).
 */
function formatHymn(raw) {
  return raw.split('\n').map(l => l.trim().replace(/^[一二三四五六七八九十]+、/, '')).filter(Boolean).join('\n')
}

/**
 * The book abbreviates a repeated response ("答：因為天⋯"): complete it from the first full response
 * of the responsory, which must begin with the printed words.
 */
function completeResponses(lines) {
  const answers = lines.filter(l => /^答[：:]/.test(l) && !/[⋯…]/.test(l)).map(l => l.replace(/^答[：:]/, ''))
  return lines.map((line) => {
    const m = /^(答[：:])(.*?)[⋯…]+。?$/.exec(line)
    if (!m)
      return line
    // the printed opening may differ slightly from the full response ("他們要……" for "他們帶着禮品…");
    // a responsory has one response, so a single full one is the one meant
    const full = answers.find(a => a.startsWith(m[2])) ?? (answers.length === 1 ? answers[0] : null)
    if (!full)
      throw new Error(`no full response begins with "${m[2]}" to complete "${line}"`)
    return m[1] + full
  })
}

/**
 * The book leaves out the closing formula of a collect ("以上所求是靠…"); the Latin row has it,
 * so the Chinese gets the formula the 香港本 prints for that Latin conclusion.
 */
const CONCLUSIONS = [
  [/Per D(?:ó|&#243;)minum nostrum Iesum Christum, F(?:í|&#237;)lium tuum, qui tecum vivit et regnat in unit(?:á|&#225;)te Sp(?:í|&#237;)ritus Sancti, Deus, per (?:ó|&#243;)mnia s(?:ǽ|&#509;)cula s(?:æ|&#230;)cul(?:ó|&#243;)rum/, '因祢的聖子、我們的主耶穌基督，他和祢及聖神，是唯一天主，永生永王。亞孟。'],
  [/Per Christum D(?:ó|&#243;)minum nostrum/, '以上所求是靠我們的主基督。亞孟。'],
  [/Qui tecum vivit et regnat in unit(?:á|&#225;)te Sp(?:í|&#237;)ritus Sancti, Deus, per (?:ó|&#243;)mnia s(?:ǽ|&#509;)cula s(?:æ|&#230;)cul(?:ó|&#243;)rum/, '他和祢及聖神，是唯一天主，永生永王。亞孟。'],
]
function addConclusion(latin, hant, id) {
  if (/[亞阿]孟。?$|阿們。?$/.test(hant))
    return hant
  const found = CONCLUSIONS.find(([re]) => re.test(latin))
  if (!found) {
    if (/\bPer\b|\bQui\b/.test(latin.replace(/<[^>]+>/g, ' ')))
      console.warn(`note ${id}: Latin has a closing formula that is not in CONCLUSIONS; Chinese left as printed`)
    return hant
  }
  return `${hant}${found[1]}`
}

function checkResponsory(latin, zh, versicle = false) {
  const lines = zh.split('\n').slice(versicle ? 0 : 1)
  // a line with the next antiphon in it means the cut ran past the end of the responsory
  const bad = lines.filter(l => !/^[領答][：:]/.test(l) || /對經[：:]/.test(l))
  return bad.length || lines.length < 2 ? [`responsory lines malformed (${lines.length} lines, ${bad.length} unlabelled)`] : []
}
const pairs = [...readJson('scripts/liturgia-horarum/ocr-commons-pairs.json'), ...readJson('scripts/liturgia-horarum/ocr-gap-pairs.json')]
const result = {}
let bad = 0
for (const pair of pairs) {
  try {
    const row = rowsOf.get(pair.block)?.[pair.row]
    if (!row)
      throw new Error(`block ${pair.block} row ${pair.row} not in the data`)
    if (pair.key && row[1] !== pair.key)
      throw new Error(`row key is ${row[1]}, not ${pair.key}`)
    const raw = excerpt(pair.pages, pair.from, pair.to)
    const format = { preces: r => formatPreces(r, pair.breaks), responsory: formatResponsory, versicle: r => formatResponsory(r, true), reading: r => formatReading(r, pair.head), collect: oneLine, antiphon: oneLine, hymn: formatHymn }[pair.kind]
    if (!format)
      throw new Error(`unknown kind ${pair.kind}`)
    let hant = format(raw)
    // len: how many characters (whitespace ignored) the pairing expects; catches a 	o that matches too early
    if (pair.len && hant.replace(/\s/g, '').length !== pair.len)
      throw new Error(`cut is ${hant.replace(/\s/g, '').length} characters, expected ${pair.len}`)
    if (pair.kind === 'collect')
      hant = addConclusion(row[0], hant, pair.id)
    if (pair.kind === 'responsory') {
      const [heading, ...rest] = hant.split('\n')
      hant = [heading, ...completeResponses(rest)].join('\n')
    }
    const problems = pair.kind === 'preces' ? checkPreces(row[0], hant) : ['responsory', 'versicle'].includes(pair.kind) ? checkResponsory(row[0], hant, pair.kind === 'versicle') : []
    if (problems.length)
      throw new Error(problems.join('; '))
    const same = [...rowsOf.values()].reduce((n, rows) => n + rows.filter(r => r[0] === row[0]).length, 0)
    const src = `《每日颂祷》PDF ${pair.pages.join('–')}`
    result[rowHash('ocr', row[0], '')] = { hant, hans: toHans(hant), src }
    console.log(`ok   ${pair.id}: ${hant.split('\n').length} lines, ${same} identical Latin rows`)
  }
  catch (error) {
    bad++
    console.error(`FAIL ${pair.id}: ${error.message}`)
  }
}
if (!check && !bad) {
  writeFileSync(`${DATA}zh/ocr-commons.json`, JSON.stringify(result))
  console.log(`wrote zh/ocr-commons.json (${Object.keys(result).length} rows)`)
}
process.exit(bad ? 1 : 0)


