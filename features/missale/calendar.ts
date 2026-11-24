// Date → liturgical day for the Missal page (general Roman calendar).
//
// The season, its week, and the Sunday/weekday cycles of the readings are computed here (Easter
// by the Gregorian computus; Epiphany on 6 January, Ascension on Thursday, as in the general
// calendar). The celebration of the day — its title and rank, and the optional memorials — is read
// from the Liturgy of the Hours data (public/data/liturgia-horarum/, assembled by breviar.sk with
// the general calendar), so that both pages name a day alike.

export type Season = 'adventus' | 'nativitas' | 'quadragesima' | 'hebdomada-sancta' | 'triduum' | 'pascha' | 'per-annum'

export interface SeasonDay {
  date: string
  season: Season
  /** week of the season (Advent 1–4, Christmas 1–2, Lent 1–5, Holy Week 6, Easter 1–7, Ordinary Time 1–34) */
  week: number
  /** 0 = Sunday … 6 = Saturday */
  weekday: number
  /** Sunday readings cycle of the liturgical year this date belongs to */
  cycle: 'A' | 'B' | 'C'
  /** weekday readings cycle (Ordinary Time) */
  weekdayCycle: 'I' | 'II'
  /** the liturgical year (it begins on the First Sunday of Advent of the year before) */
  year: number
  easter: string
  /** the date is 17–24 December */
  lateAdvent: boolean
  /** after 6 January and before the Baptism of the Lord */
  afterEpiphany: boolean
  /** within the octave of Easter (Easter Sunday to the Second Sunday of Easter) */
  easterOctave: boolean
  /** from Ascension to the Saturday before Pentecost */
  afterAscension: boolean
}

const DAY = 86400000

function utc(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function iso(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

/** Easter Sunday (Gregorian calendar), as YYYY-MM-DD */
export function easterDate(year: number): string {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** First Sunday of Advent: the Sunday from 27 November to 3 December */
export function adventStart(year: number): string {
  const nov27 = utc(`${year}-11-27`)
  const dow = new Date(nov27).getUTCDay()
  return iso(nov27 + ((7 - dow) % 7) * DAY)
}

/** Baptism of the Lord: the Sunday after 6 January (Epiphany kept on 6 January) */
export function baptismOfTheLord(year: number): string {
  const jan6 = utc(`${year}-01-06`)
  const dow = new Date(jan6).getUTCDay()
  return iso(jan6 + (7 - dow || 7) * DAY)
}

export function seasonDay(date: string): SeasonDay {
  const t = utc(date)
  const year = Number(date.slice(0, 4))
  const weekday = new Date(t).getUTCDay()
  const advent = utc(adventStart(year))
  const litYear = t >= advent ? year + 1 : year
  const easter = utc(easterDate(year))
  const ash = easter - 46 * DAY
  const palm = easter - 7 * DAY
  const holyThursday = easter - 3 * DAY
  const pentecost = easter + 49 * DAY
  const ascension = easter + 39 * DAY
  const baptism = utc(baptismOfTheLord(year))
  const christmas = utc(`${year}-12-25`)
  const weeksFrom = (start: number) => Math.floor((t - start) / (7 * DAY)) + 1
  // the Sunday on or before a date
  const sundayOf = (time: number) => time - new Date(time).getUTCDay() * DAY

  let season: Season
  let week: number
  if (t >= advent && t < christmas) {
    season = 'adventus'
    week = weeksFrom(advent)
  }
  else if (t >= christmas || t <= baptism) {
    season = 'nativitas'
    // week 1 runs from Christmas through the Saturday after the Sunday following it (Holy Family)
    const xmas = t >= christmas ? christmas : utc(`${year - 1}-12-25`)
    // (when Christmas is itself a Sunday, week 1 begins with it)
    const firstSunday = new Date(xmas).getUTCDay() === 0 ? xmas : sundayOf(xmas) + 7 * DAY
    week = t < firstSunday ? 1 : Math.min(2, Math.floor((t - firstSunday) / (7 * DAY)) + 1)
  }
  else if (t >= ash && t < palm) {
    season = 'quadragesima'
    // Ash Wednesday to the following Saturday belong to the days "after Ashes" (week 0)
    week = Math.floor((t - (ash + 4 * DAY)) / (7 * DAY)) + 1
  }
  else if (t >= palm && t < holyThursday) {
    season = 'hebdomada-sancta'
    week = 6
  }
  else if (t >= holyThursday && t < easter) {
    season = 'triduum'
    week = 6
  }
  else if (t >= easter && t <= pentecost) {
    season = 'pascha'
    week = weeksFrom(easter)
  }
  else {
    season = 'per-annum'
    if (t < ash) {
      // week 1 begins on the Monday after the Baptism of the Lord
      week = Math.floor((t - baptism) / (7 * DAY)) + 1
    }
    else {
      // counted back from Christ the King (34th Sunday, the Sunday before Advent)
      const nextAdvent = advent > t ? advent : utc(adventStart(year + 1))
      const king = nextAdvent - 7 * DAY
      week = 34 - Math.floor((sundayOf(king) - sundayOf(t)) / (7 * DAY))
    }
  }

  return {
    date,
    season,
    week,
    weekday,
    cycle: (['C', 'A', 'B'] as const)[litYear % 3],
    weekdayCycle: litYear % 2 ? 'I' : 'II',
    year: litYear,
    easter: iso(easter),
    lateAdvent: season === 'adventus' && Number(date.slice(5, 7)) === 12 && Number(date.slice(8)) >= 17,
    afterEpiphany: season === 'nativitas' && t > utc(`${year}-01-06`) && t < baptism && date.slice(5, 7) === '01',
    easterOctave: t >= easter && t <= easter + 7 * DAY,
    afterAscension: t >= ascension && t < pentecost,
  }
}

const SEASON_ZH: Record<Season, string> = {
  'adventus': '将临期',
  'nativitas': '圣诞期',
  'quadragesima': '四旬期',
  'hebdomada-sancta': '圣周',
  'triduum': '逾越节三日庆典',
  'pascha': '复活期',
  'per-annum': '常年期',
}
const WEEKDAY_ZH = ['主日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

/** e.g. “常年期第三十四周 星期二 · 主日甲年 · 平日第二年” */
export function seasonLabelZh(day: SeasonDay): string {
  const n = (k: number) => {
    const d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    return k < 10 ? d[k] : k < 20 ? `十${d[k - 10]}` : `${d[Math.floor(k / 10)]}十${d[k % 10]}`
  }
  const week = day.season === 'quadragesima' && day.week === 0
    ? '圣灰礼仪后'
    : ['hebdomada-sancta', 'triduum'].includes(day.season) ? '' : `第${n(day.week)}周`
  const cycle = `主日${{ A: '甲', B: '乙', C: '丙' }[day.cycle]}年 · 平日第${day.weekdayCycle === 'I' ? '一' : '二'}年`
  return `${SEASON_ZH[day.season]}${week} ${WEEKDAY_ZH[day.weekday]} · ${cycle}`
}

// ---- the day's celebrations, from the Liturgy of the Hours data ----

export interface Celebration {
  title_la: string
  rank: string
}
export interface CalendarDay {
  date: string
  celebrations: Celebration[]
  defaultCelebration: number
}

interface Manifest { from: string, to: string, version: string }
interface YearEntry { d: number, c: Array<[string, string]> }

const ROOT = '/data/liturgia-horarum/'

export class MissaleCalendar {
  private cache = new Map<string, Promise<any>>()
  constructor(private fetcher: typeof fetch = (...args) => fetch(...args)) {}

  private json<T>(path: string): Promise<T> {
    if (!this.cache.has(path)) {
      const request = (path === 'manifest.json'
        ? this.fetcher(ROOT + path, { cache: 'no-cache' })
        : this.manifest().then(m => this.fetcher(`${ROOT}${path}?v=${m.version}`))
      ).then((response) => {
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

  async day(date: string): Promise<CalendarDay> {
    const year = await this.json<Record<string, YearEntry>>(`years/${date.slice(0, 4)}.json`)
    const entry = year[date]
    if (!entry)
      throw new Error(`${date}: 不在礼历数据中`)
    const celebrations = await Promise.all(entry.c.map(([, cel]) =>
      this.json<{ title_la: string, rank: string }>(`cels/${cel}.json`).then(c => ({ title_la: c.title_la, rank: c.rank }))))
    return { date, celebrations, defaultCelebration: entry.d }
  }
}
