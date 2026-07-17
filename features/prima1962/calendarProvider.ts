import { addLocalDays, diffLocalDays, getGregorianEaster, localDateToString, monthDay } from './localDate'
import type { LocalDate, Prima1962CalendarDay, Prima1962CalendarProvider } from './types'

export class StaticCalendarProvider implements Prima1962CalendarProvider {
  async getDay(date: LocalDate): Promise<Prima1962CalendarDay> {
    return computePrima1962CalendarDay(date)
  }
}

export class MissaleMeumCalendarProvider implements Prima1962CalendarProvider {
  constructor(private readonly fallback = new StaticCalendarProvider()) {}

  async getDay(date: LocalDate): Promise<Prima1962CalendarDay> {
    return this.fallback.getDay(date)
  }
}

export class DivinumOfficiumOracleProvider implements Prima1962CalendarProvider {
  constructor(private readonly fallback = new StaticCalendarProvider()) {}

  async getDay(date: LocalDate): Promise<Prima1962CalendarDay> {
    return this.fallback.getDay(date)
  }
}

export function computePrima1962CalendarDay(date: LocalDate): Prima1962CalendarDay {
  const easter = getGregorianEaster(date.year)
  const diff = diffLocalDays(date, easter)
  const md = monthDay(date)
  const christmas = { year: date.year, month: 12, day: 25 }
  const advent1 = adventFirstSunday(date.year)

  if (diff === -3)
    return day(date, 'Sacred Triduum', 'I classis', 'triduum', 'Feria Quinta in Cena Domini')
  if (diff === -2)
    return day(date, 'Sacred Triduum', 'I classis', 'triduum', 'Feria Sexta in Passione et Morte Domini')
  if (diff === -1)
    return day(date, 'Sacred Triduum', 'I classis', 'triduum', 'Sabbato Sancto')
  if (diff === 0)
    return day(date, 'Easter', 'I classis', 'easter', 'Dominica Resurrectionis')
  if (diff >= 1 && diff <= 6)
    return day(date, 'Easter Octave', 'I classis', 'easter', 'infra Octavam Paschae')
  if (diff >= 7 && diff <= 38)
    return day(date, 'Eastertide', 'I-III classis', 'easter', 'Tempus Paschale')
  if (diff === 39)
    return day(date, 'Ascension', 'I classis', 'ascension', 'Ascensio Domini')
  if (diff >= 40 && diff <= 48)
    return day(date, 'Ascensiontide', 'I-III classis', 'ascension', 'Tempus Ascensionis')
  if (diff === 49)
    return day(date, 'Pentecost', 'I classis', 'pentecost', 'Dominica Pentecostes')
  if (diff >= 50 && diff <= 55)
    return day(date, 'Pentecost Octave', 'I classis', 'pentecost', 'infra Octavam Pentecostes')
  if (diff === 56)
    return day(date, 'Trinity Sunday', 'I classis', 'trinity', 'Sanctissima Trinitas')
  if (diff === 60)
    return day(date, 'Corpus Christi', 'I classis', 'corpus', 'Corpus Christi')
  if (diff === 68)
    return day(date, 'Sacred Heart', 'I classis', 'heart', 'Sacratissimum Cor Iesu')
  if (diff === -46)
    return day(date, 'Lent', 'I classis', 'ash-wednesday', 'Feria IV Cinerum')
  if (diff >= -45 && diff <= -43)
    return day(date, 'Lent', 'Feria privilegiata', 'after-ashes', 'Feriae post Cineres')
  if (diff >= -14 && diff <= -8)
    return day(date, 'Passiontide', 'I-II classis', 'passion', 'Tempus Passionis')
  if (diff >= -7 && diff <= -4)
    return day(date, 'Holy Week', 'I classis', 'holy-week', 'Hebdomada Sancta')
  if (diff >= -42 && diff <= -15)
    return day(date, 'Lent', 'III classis', 'lent', 'Tempus Quadragesimae')
  if (diff >= -63 && diff <= -47)
    return day(date, 'Septuagesima', 'II-III classis', 'septuagesima', 'Tempus Septuagesimae')
  if (md === '11-02')
    return day(date, 'All Souls', 'I classis', 'all-souls', 'Commemoratio omnium Fidelium Defunctorum')
  if (md === '12-25')
    return day(date, 'Christmas', 'I classis', 'christmas', 'Nativitas Domini')
  if (md === '01-01')
    return day(date, 'Christmas', 'I classis', 'christmas', 'In Octava Nativitatis Domini')
  if (md === '01-06')
    return day(date, 'Epiphany', 'I classis', 'epiphany', 'Epiphania Domini')
  if (compareLocal(date, advent1) >= 0 && compareLocal(date, christmas) < 0)
    return day(date, 'Advent', 'I-III classis', 'advent', 'Tempus Adventus')
  if (md >= '12-25' || md <= '01-13')
    return day(date, 'Christmas', 'II-III classis', 'christmas', 'Tempus Nativitatis')
  return day(date, 'Per Annum', 'Feria or Sunday', 'per-annum', 'Tempus per annum')
}

function day(date: LocalDate, season: string, rank: string, temporalKey: string, celebration: string): Prima1962CalendarDay {
  return {
    date: localDateToString(date),
    season,
    rank,
    celebration,
    temporalKey,
  }
}

function adventFirstSunday(year: number): LocalDate {
  const christmas = { year, month: 12, day: 25 }
  const jsDay = new Date(year, 11, 25).getDay()
  const fourthAdvent = addLocalDays(christmas, -((jsDay || 7) - 1) - 1)
  return addLocalDays(fourthAdvent, -21)
}

function compareLocal(left: LocalDate, right: LocalDate) {
  return new Date(left.year, left.month - 1, left.day).getTime()
    - new Date(right.year, right.month - 1, right.day).getTime()
}
