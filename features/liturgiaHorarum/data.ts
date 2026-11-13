// Loads the Liturgy of the Hours (new rite, Latin) from public/data/liturgia-horarum/,
// written by scripts/liturgia-horarum/build-data.mjs (format lh-site/1).

export const HOURS = [
  { code: 'mi', slug: 'invitatorium', la: 'Invitatorium', zh: '序经' },
  { code: 'mpc', slug: 'officium-lectionis', la: 'Officium lectionis', zh: '诵读日课' },
  { code: 'mrch', slug: 'laudes', la: 'Laudes', zh: '晨祷' },
  { code: 'mpred', slug: 'tertia', la: 'Tertia', zh: '午前祷' },
  { code: 'mna', slug: 'sexta', la: 'Sexta', zh: '午时祷' },
  { code: 'mpo', slug: 'nona', la: 'Nona', zh: '午后祷' },
  { code: 'mv', slug: 'vesperae', la: 'Vesperae', zh: '晚祷' },
  { code: 'mk', slug: 'completorium', la: 'Completorium', zh: '夜祷' },
] as const

export type HourSlug = typeof HOURS[number]['slug']

export interface Manifest {
  format: string
  from: string
  to: string
  years: number[]
  commonChunks: number
  version: string
  zh?: string[]
}

export type ZhVersion = 'hkdlc' | 'wanyou'
// kind 'm': the Chinese chosen for this row is another psalm than the Latin (zh/mismatch.json)
export type ZhText = [kind: 't' | 's' | 'o' | 'c' | 'm', text: string, borrowedFrom?: string]

export type Part
  = | { title: string | null, block: string }
    | { choice: string, default: number, options: Array<{ label: string, block: string }> }

export interface Celebration {
  title_la: string
  rank: string
  optional: boolean
  hours: Array<{
    code: string
    name_la: string
    name_zh: string
    versions: Array<{ label: string, parts: Part[] }>
  }>
}

export interface Day {
  date: string
  massYear: string
  defaultCelebration: number
  celebrations: Celebration[]
  blocks: Record<string, string>
}

export type ZhRow = { la: string, key: string | null, zh: ZhText | null }
export type ZhBlocks = Record<string, ZhRow[]>
type LatinRows = Record<string, Array<[string, string | null]>>
type ChineseRows = Record<string, Array<ZhText | null>>

interface YearEntry {
  m: string
  d: number
  c: Array<[string, string]>
}

const ROOT = '/data/liturgia-horarum/'

// Versions of an hour the engine (breviar.sk) offers that the Latin typical edition does not:
//   "psalmodiam secundum tres hebdomadas Psalterii (currentem, præcedentem, succedentem)" for
//   the Daytime Prayer. GILH 81 and the Ordinarium (2014 ed., Ad Horam mediam) give only the
//   current psalmody, and the complementary psalmody for the other daytime hours.
const NON_TYPICAL_VERSIONS = /可取本周、前周或后周/

function typicalOnly(cel: Celebration): Celebration {
  return {
    ...cel,
    hours: cel.hours.map(hour => ({ ...hour, versions: hour.versions.filter(v => !NON_TYPICAL_VERSIONS.test(v.label)) })),
  }
}

export function blockIds(cel: Celebration): string[] {
  return cel.hours.flatMap(hour => hour.versions.flatMap(version => version.parts.flatMap(part =>
    'block' in part ? [part.block] : part.options.map(option => option.block))))
}

export class LiturgiaHorarumLoader {
  private cache = new Map<string, Promise<any>>()

  constructor(private fetcher: typeof fetch = (...args) => fetch(...args)) {}

  private json<T>(path: string): Promise<T> {
    if (!this.cache.has(path)) {
      // The manifest is always revalidated; every other file is requested with
      // its version, so files of an older build are never mixed in.
      const request = (path === 'manifest.json'
        ? this.fetcher(ROOT + path, { cache: 'no-cache' })
        : this.manifest().then(manifest => this.fetcher(`${ROOT}${path}?v=${manifest.version}`))
      ).then((response) => {
        // A missing file comes back as the site's HTML page
        if (!response.ok || !response.headers.get('content-type')?.includes('json'))
          throw new Error(`${path}: HTTP ${response.status}`)
        return response.json()
      })
      request.catch(() => this.cache.delete(path))
      this.cache.set(path, request)
    }
    return this.cache.get(path)!
  }

  manifest() {
    return this.json<Manifest>('manifest.json')
  }

  /** The whole day: every celebration that may be kept, with all its text. */
  async day(date: string): Promise<Day> {
    const year = await this.json<Record<string, YearEntry>>(`years/${date.slice(0, 4)}.json`)
    const entry = year[date]
    if (!entry)
      throw new Error(`${date}: not in the data`)
    const [celebrations, titles, index] = await Promise.all([
      Promise.all(entry.c.map(([, cel]) => this.json<Celebration>(`cels/${cel}.json`).then(typicalOnly))),
      Promise.all(entry.c.map(([title]) => this.json<{ blocks: Record<string, string> }>(`titles/${title}.json`))),
      this.json<Record<string, number>>('common/index.json'),
    ])
    const blocks: Record<string, string> = Object.assign({}, ...titles.map(title => title.blocks))
    const needed = celebrations.flatMap(blockIds).filter(id => !(id in blocks))
    const chunks = [...new Set(needed.map((id) => {
      if (!(id in index))
        throw new Error(`${date}: text block ${id} missing`)
      return index[id]
    }))]
    for (const chunk of await Promise.all(chunks.map(n => this.json<Record<string, string>>(`common/${String(n).padStart(3, '0')}.json`))))
      Object.assign(blocks, chunk)
    return { date, massYear: entry.m, defaultCelebration: entry.d, celebrations, blocks }
  }

  /** Chinese text for the same title and common files used by a day. */
  async chinese(date: string, version: ZhVersion): Promise<ZhBlocks> {
    const year = await this.json<Record<string, YearEntry>>(`years/${date.slice(0, 4)}.json`)
    const entry = year[date]
    if (!entry)
      throw new Error(`${date}: not in the data`)
    const [celebrations, titles, rowTitles, index, mismatch, fixes] = await Promise.all([
      Promise.all(entry.c.map(([, cel]) => this.json<Celebration>(`cels/${cel}.json`).then(typicalOnly))),
      Promise.all(entry.c.map(([title]) => this.json<{ blocks: ChineseRows }>(`zh/${version}/titles/${title}.json`))),
      Promise.all(entry.c.map(([title]) => this.json<LatinRows>(`zh/rows/titles/${title}.json`))),
      this.json<Record<string, number>>('common/index.json'),
      // written by scripts/liturgia-horarum/check-zh-pairing.mjs; optional
      this.json<Record<string, number[]>>('zh/mismatch.json').catch(() => ({} as Record<string, number[]>)),
      // written by scripts/liturgia-horarum/repair-zh-pairing.mjs: the Chinese of the text the Latin
      // actually prints, for rows of alternative psalmodies (see that script); optional
      this.json<Record<string, Record<string, Partial<Record<ZhVersion, ZhText | null>>>>>('zh/fixes.json').catch(() => ({})),
    ])
    const chinese: ChineseRows = Object.assign({}, ...titles.map(title => title.blocks))
    const rows: LatinRows = Object.assign({}, ...rowTitles)
    const chunks = [...new Set(celebrations.flatMap(blockIds).filter(id => id in index).map(id => index[id]))]
    await Promise.all(chunks.map(async (n) => {
      const name = String(n).padStart(3, '0')
      const [latinChunk, chineseChunk] = await Promise.all([
        this.json<LatinRows>(`zh/rows/common/${name}.json`),
        this.json<ChineseRows>(`zh/${version}/common/${name}.json`),
      ])
      Object.assign(rows, latinChunk)
      Object.assign(chinese, chineseChunk)
    }))
    const blocks: ZhBlocks = Object.fromEntries(Object.entries(rows).map(([id, lines]) => {
      const values = chinese[id]
      if (values && values.length !== lines.length)
        throw new Error(`${id}: Chinese row count differs from Latin`)
      return [id, lines.map(([la, key], i) => {
        const fix = fixes[id]?.[i]
        if (fix && version in fix)
          return { la, key, zh: fix[version] ?? null }
        return { la, key, zh: mismatch[id]?.includes(i) && values?.[i] ? ['m', ''] as ZhText : values?.[i] || null }
      })]
    }))
    return blocks
  }
}

// The biographical note on a saint (one or two <div class="small"> paragraphs, then an empty
// <div></div>) heads the first block of each hour the engine assembles for the celebration.
// The book prints it once, at the head of the celebration; the page shows it only in the
// first hour that has it — the Office of Readings on an ordinary memorial, or First Vespers
// on the eve of a feast whose office begins there.
const BIO = /^\s*(?:<div class="small">[\s\S]*?<\/div>\s*(?:<div><\/div>\s*)?)+/

export function hasBio(html: string | undefined): boolean {
  return !!html && BIO.test(html)
}

export function withoutBio(html: string): string {
  return html.replace(BIO, '')
}

/** A Chinese-row whose Latin is (part of) the note: the note itself or the empty div after it. */
export function isBioRow(la: string): boolean {
  return /^\s*<div class="small">/.test(la) || /^\s*<div><\/div>\s*$/.test(la)
}

function firstBlock(version: { parts: Part[] }): string | undefined {
  const part = version.parts[0]
  if (!part)
    return undefined
  return 'block' in part ? part.block : part.options[part.default].block
}

/**
 * Codes of the hours where a note is to be shown: each distinct note in the first hour (in the
 * order of HOURS) that carries it. A Saturday memorial keeps its own note at the Office of
 * Readings and still shows the next day's feast note at First Vespers.
 */
export function bioHourCodes(cel: Celebration, blocks: Record<string, string>): Set<string> {
  const seen = new Set<string>()
  const show = new Set<string>()
  for (const { code } of HOURS) {
    const hour = cel.hours.find(h => h.code === code)
    for (const v of hour?.versions ?? []) {
      const note = BIO.exec(blocks[firstBlock(v) ?? ''] ?? '')?.[0].replace(/\s+/g, ' ').trim()
      if (note && !seen.has(note)) {
        seen.add(note)
        show.add(code)
      }
    }
  }
  return show
}

// Posture of those taking part, General Instruction 263-265: standing for the
// opening, the hymn, the Gospel canticle, the intercessions, the Lord's Prayer and
// the concluding prayer; sitting for the readings except the Gospel; sitting or
// standing for the psalms, as is customary. The Invitatory opens the whole Office.
// Sections the Instruction does not name keep the posture before them.
export const POSTURES = {
  stand: 'Stantes · 立',
  sit: 'Sedentes · 坐',
  either: 'Sedentes vel stantes · 坐或立',
} as const

function postureOf(code: string, part: Part): keyof typeof POSTURES | undefined {
  if (!('block' in part))
    return undefined
  const title = part.title
  if (title === null || code === 'mi' || /^(HYMNUS|CANTICUM EVANGELICUM|PRECES|ORATIO|EVANGELIUM)/.test(title))
    return 'stand'
  if (title === 'PSALMODIA')
    return 'either'
  if (/^(LECTIO|EPISTOLA)/.test(title))
    return 'sit'
  return undefined
}

/** The posture to show before each part: only where it changes. */
export function postureMarks(code: string, parts: Part[]): Array<string | undefined> {
  let last: string | undefined
  return parts.map((part) => {
    const posture = postureOf(code, part)
    if (!posture || posture === last)
      return undefined
    last = posture
    return POSTURES[posture]
  })
}

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function addDays(value: string, amount: number): string {
  const [year, month, day] = value.split('-').map(Number)
  const result = new Date(year, month - 1, day, 12)
  result.setDate(result.getDate() + amount)
  return localDate(result)
}

export function isDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return !!match && localDate(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)) === value
}
