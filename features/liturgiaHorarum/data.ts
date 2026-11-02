// Loads the Liturgy of the Hours (new rite, Latin) from public/data/liturgia-horarum/,
// written by scripts/liturgia-horarum/build-data.mjs (format lh-site/1).

export const HOURS = [
  { code: 'mi', slug: 'invitatorium', la: 'Invitatorium', zh: '邀请经' },
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
}

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

interface YearEntry {
  m: string
  d: number
  c: Array<[string, string]>
}

const ROOT = '/data/liturgia-horarum/'

export function blockIds(cel: Celebration): string[] {
  return cel.hours.flatMap(hour => hour.versions.flatMap(version => version.parts.flatMap(part =>
    'block' in part ? [part.block] : part.options.map(option => option.block))))
}

export class LiturgiaHorarumLoader {
  private cache = new Map<string, Promise<any>>()

  constructor(private fetcher: typeof fetch = (...args) => fetch(...args)) {}

  private json<T>(path: string): Promise<T> {
    if (!this.cache.has(path)) {
      const request = this.fetcher(ROOT + path).then((response) => {
        if (!response.ok)
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
      Promise.all(entry.c.map(([, cel]) => this.json<Celebration>(`cels/${cel}.json`))),
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
