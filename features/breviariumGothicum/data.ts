// Loads the Breviarium Gothicum (Lorenzana 1775) from public/data/breviarium-gothicum/,
// written by 西班牙日课/前端/export_web_data.py (format bg-site/1). The office of each day
// is assembled outside this site; the page only reads static data.

export interface Manifest {
  format: string
  from: string
  to: string
  years: number[]
  blockChunk: number
  blockChunks: number[]
  version: string
}

export interface ScanPage {
  /** image number: pages/pNNN.webp */
  n: number
  /** printed folio label, e.g. "B · fol. CLXIII" */
  f: string
}

export interface Flag {
  label: string
  /** id of a section in notes.json */
  note: string
  /** one-line reason printed with the mark, when there is one */
  title?: string
}

export interface Ref {
  summary: string
  targets?: Card[]
  pages?: ScanPage[]
}

export interface Card {
  label: string
  /** marks printed with the label: low confidence, gaps in the book */
  marks?: Flag[]
  /** source key of the text in blocks/ */
  b?: string
  inline?: string
  trail?: string
  missing?: string
  pages?: ScanPage[]
  notes?: string[]
  frame?: boolean
  refs?: Ref[]
  explain?: Array<{ kind: string, summary: string, text: string }>
}

export type Item
  = | ({ t: 'slot' } & Card)
    | { t: 'rubric', text: string }
    /** date: another day to open; tab: the cell to open (on that day, or on this one) */
    | { t: 'note', text: string, flags?: Flag[], date?: string, tab?: TabSlug }
    | { t: 'explain', summary: string, lines: string[] }
    /** the pieces of a Liber Horarum hour not said today, folded */
    | { t: 'alt', summary: string, items: Array<{ t: 'slot' } & Card> }

export interface Section {
  kind: 'hour' | 'minor' | 'pointer' | 'placeholder' | 'evening-vespers' | 'concurrence-tail' | 'unselected'
  title: string
  /** the civil-day page the section was verified on */
  from?: string
  /** a Liber Horarum hour the book prescribes for other days only (Aurora on Sundays and feasts) */
  notApplicable?: boolean
  hour?: string
  role?: string
  office?: string
  label?: string
  sourceDate?: string
  items: Item[]
}

export interface Day {
  date: string
  heading: string
  meta: Record<string, string>
  basis: string[]
  pointer?: string
  pointerNote?: string
  uncertain: Array<{ tag: string, summary: string, evidence: string }>
  flags: Flag[]
  /** the hours of the liturgical day, in fixed order; "vesperae" only when the evening stays with this day */
  cells: Array<{ slug: TabSlug, sections: Section[] }>
}

export interface Note {
  title: string
  text: string
}

/** The hours of a liturgical day, which begins with the Vespers of the evening before. */
export const TABS = [
  { slug: 'vesperae-prior', la: 'Ad Vesperum', zh: '前晚晚祷' },
  { slug: 'completorium-prior', la: 'Completorium', zh: '前晚终祷' },
  { slug: 'matutinum', la: 'Ad Matutinum', zh: '晨祷' },
  { slug: 'laudes', la: 'In Laudibus', zh: '赞美经' },
  { slug: 'aurora', la: 'Aurora', zh: '晨光时辰' },
  { slug: 'prima', la: 'Ad Primam', zh: '第一时' },
  { slug: 'tertia', la: 'Ad Tertiam', zh: '第三时' },
  { slug: 'sexta', la: 'Ad Sextam', zh: '第六时' },
  { slug: 'nona', la: 'Ad Nonam', zh: '第九时' },
  { slug: 'vesperae', la: 'Ad Vesperum', zh: '本日晚祷' },
] as const

export type TabSlug = typeof TABS[number]['slug']

/** The tabs of a day: the nine fixed hours, and the evening when it stays with this day.
 * The cells are made by export_web_data.py from the verified pages (D-078). */
export function tabsOf(day: Day): Map<TabSlug, Section[]> {
  const cells = new Map(day.cells.map(cell => [cell.slug, cell.sections]))
  return new Map(TABS.filter(tab => cells.has(tab.slug)).map(tab => [tab.slug, cells.get(tab.slug)!]))
}

/** The cards of a section, folded ones included. */
export function cardsOf(section: Section): Card[] {
  return section.items.flatMap(item => item.t === 'slot' ? [item] : item.t === 'alt' ? item.items : [])
}

function blockKeys(cards: Card[]): string[] {
  return cards.flatMap(card => [
    ...(card.b ? [card.b] : []),
    ...blockKeys((card.refs || []).flatMap(ref => ref.targets || [])),
  ])
}

const ROOT = '/data/breviarium-gothicum/'

export function scanUrl(page: ScanPage): string {
  return `${ROOT}pages/p${String(page.n).padStart(3, '0')}.webp`
}

export class BreviariumGothicumLoader {
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

  notes() {
    return this.json<Record<string, Note>>('notes.json')
  }

  /** The day with the text of every block it uses. */
  async day(date: string): Promise<{ day: Day, blocks: Record<string, string> }> {
    const [manifest, year] = await Promise.all([this.manifest(), this.json<Record<string, Day>>(`years/${date.slice(0, 4)}.json`)])
    const day = year[date]
    if (!day)
      throw new Error(`${date}: not in the data`)
    const cards = day.cells.flatMap(cell => cell.sections.flatMap(cardsOf))
    const keys = blockKeys(cards)
    const chunks = [...new Set(keys.map(key => Math.floor(Number.parseInt(key.replace(/^x/, ''), 10) / manifest.blockChunk)))]
    const blocks: Record<string, string> = Object.assign({}, ...await Promise.all(
      chunks.map(n => this.json<Record<string, string>>(`blocks/${String(n).padStart(2, '0')}.json`)),
    ))
    const missing = keys.find(key => !(key in blocks))
    if (missing)
      throw new Error(`${date}: text block ${missing} missing`)
    return { day, blocks }
  }
}

export { addDays, isDate, localDate } from '../liturgiaHorarum/data'
