import type { Reading } from './parser'

export type LiturgicalDataSource = 'cpbjr-api' | 'litcal-api' | 'calapi' | 'computus'
export type LiturgicalData = {
  season?: string
  celebration?: {
    name?: string
    type?: string
  }
}

export async function loadLiturgicalData(date: Date): Promise<{ data: LiturgicalData, source: LiturgicalDataSource }> {
  const loaders = [
    () => loadCpbjrCalendar(date),
    () => loadLitCalCalendar(date),
    () => loadCalapiCalendar(date),
  ]

  for (const loader of loaders) {
    try {
      return await loader()
    }
    catch {
      // Try the next calendar source; individual fetches are bounded by timeout.
    }
  }

  return {
    data: localComputusData(date),
    source: 'computus',
  }
}

async function loadCpbjrCalendar(date: Date): Promise<{ data: LiturgicalData, source: LiturgicalDataSource }> {
  const year = date.getFullYear()
  const response = await fetchWithTimeout(
    `https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/${year}/${formatMonthDay(date)}.json`,
    1800,
  )
  if (!response.ok)
    throw new Error('cpbjr calendar API response is not ok')

  return {
    data: await response.json(),
    source: 'cpbjr-api',
  }
}

async function loadLitCalCalendar(date: Date): Promise<{ data: LiturgicalData, source: LiturgicalDataSource }> {
  const response = await fetchWithTimeout(
    `https://litcal.johnromanodorazio.com/api/v5/calendar/${date.getFullYear()}?return_type=JSON&year_type=CIVIL`,
    3200,
  )
  if (!response.ok)
    throw new Error('litcal calendar API response is not ok')

  return {
    data: normalizeLitCalData(await response.json(), date),
    source: 'litcal-api',
  }
}

async function loadCalapiCalendar(date: Date): Promise<{ data: LiturgicalData, source: LiturgicalDataSource }> {
  const response = await fetchWithTimeout(
    `https://calapi.inadiutorium.cz/calendar?date=${formatDateInput(date)}`,
    1800,
  )
  if (!response.ok)
    throw new Error('calapi calendar API response is not ok')

  return {
    data: normalizeCalapiData(await response.json()),
    source: 'calapi',
  }
}

function normalizeCalapiData(data: unknown): LiturgicalData {
  const calendar = isRecord(data) ? data : {}
  const celebration = Array.isArray(calendar.celebrations) && isRecord(calendar.celebrations[0])
    ? calendar.celebrations[0]
    : undefined
  return {
    season: typeof calendar.season === 'string' ? calendar.season : undefined,
    celebration: {
      name: stringValue(celebration?.title) || stringValue(celebration?.name),
      type: stringValue(celebration?.rank) || stringValue(celebration?.rank_name),
    },
  }
}

function normalizeLitCalData(data: unknown, date: Date): LiturgicalData {
  const calendar = isRecord(data) ? data : {}
  const events = Array.isArray(calendar.litcal) ? calendar.litcal.filter(isRecord) : []
  const datePrefix = formatDateInput(date)
  const dayEvents = events.filter(event => {
    const eventDate = stringValue(event.date)
    return eventDate.startsWith(datePrefix) && event.is_vigil_mass !== true
  })
  const event = dayEvents[0]

  return {
    season: stringValue(event?.liturgical_season),
    celebration: {
      name: stringValue(event?.name),
      type: normalizeLitCalRank(event),
    },
  }
}

function normalizeLitCalRank(event?: Record<string, unknown>) {
  const grade = typeof event?.grade === 'number' ? event.grade : Number.NaN
  if (grade >= 6)
    return 'solemnity'
  if (grade >= 4)
    return 'feast'
  if (grade === 3)
    return 'memorial'
  if (grade === 2)
    return 'optional memorial'
  if (grade === 0)
    return 'feria'

  return stringValue(event?.grade_lcl)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function localComputusData(date: Date): LiturgicalData {
  return {
    season: computeSeason(date),
    celebration: {
      name: '',
      type: '',
    },
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: 'force-cache',
    })
  }
  finally {
    clearTimeout(timeout)
  }
}

export function detectMovableFeast(date: Date, liturgical: LiturgicalData) {
  const name = String(liturgical?.celebration?.name || '').toLowerCase()
  const easter = getEaster(date.getFullYear())
  const diff = diffDays(date, easter)
  const monthDay = formatMonthDay(date)

  if (diff === -46 || name.includes('ash'))
    return 'ash-wednesday'
  if (diff === -42)
    return 'lent-1'
  if (diff === -7 || name.includes('palm'))
    return 'palm-sunday'
  if (diff >= -3 && diff <= -1)
    return 'holy-triduum'
  if (diff === 0)
    return 'easter-sunday'
  if (diff === 39 || name.includes('ascension'))
    return 'ascension'
  if (diff === 49 || name.includes('pentecost'))
    return 'pentecost'
  if (diff === 56 || name.includes('trinity'))
    return 'trinity-sunday'
  if (diff === 60 || name.includes('corpus'))
    return 'corpus-christi'
  if (diff === 68 || name.includes('sacred heart'))
    return 'sacred-heart'
  if (diff === 69)
    return 'immaculate-heart'
  if (name.includes('christ the king'))
    return 'christ-king'
  if (name.includes('holy family'))
    return 'holy-family'
  if (name.includes('baptism'))
    return 'baptism-of-the-lord'
  if (monthDay === adventFirstSunday(date))
    return 'advent-1'
  if (monthDay === '12-26')
    return '12-26'
  if (monthDay === '12-27')
    return '12-27'
  if (monthDay === '12-28')
    return '12-28'

  return ''
}

export function selectReadings(all: Reading[], date: Date, season?: string) {
  if (!all.length)
    return []

  const feastId = detectMovableFeast(date, { season, celebration: {} })
  const monthDay = formatMonthDay(date)
  const normalizedSeason = String(season || computeSeason(date)).toLowerCase()
  const occasions = [feastId, monthDay]

  if (normalizedSeason.includes('advent'))
    occasions.push('advent')
  else if (normalizedSeason.includes('christmas'))
    occasions.push('christmas')
  else if (normalizedSeason.includes('lent'))
    occasions.push('lent')
  else if (normalizedSeason.includes('easter'))
    occasions.push('easter')
  else
    occasions.push('ordinary')

  const matched = all.filter(item => occasions.includes(item.occasion))
  return matched
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function clearTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatMonthDay(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatDateInput(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day)
    return new Date()
  return new Date(year, month - 1, day)
}

function diffDays(date: Date, base: Date) {
  return Math.round((clearTime(date).getTime() - clearTime(base).getTime()) / 86400000)
}

function getEaster(year: number) {
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
  return new Date(year, month - 1, day)
}

export function computeSeason(date: Date) {
  const easter = getEaster(date.getFullYear())
  const diff = diffDays(date, easter)
  const monthDay = formatMonthDay(date)
  if (monthDay >= '12-25' || monthDay <= '01-12')
    return 'Christmas'
  if (diff >= -46 && diff < 0)
    return 'Lent'
  if (diff >= 0 && diff <= 49)
    return 'Easter'
  if (monthDay >= adventFirstSunday(date) && monthDay < '12-25')
    return 'Advent'
  return 'Ordinary Time'
}

function adventFirstSunday(date: Date) {
  const christmas = new Date(date.getFullYear(), 11, 25)
  const fourthAdvent = addDays(christmas, -((christmas.getDay() || 7) - 1) - 1)
  const firstAdvent = addDays(fourthAdvent, -21)
  return formatMonthDay(firstAdvent)
}
