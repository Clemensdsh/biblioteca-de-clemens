import type { LocalDate } from './types'

export function parseLocalDate(value: string): LocalDate {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day)
    throw new Error(`Invalid local date: ${value}`)
  return { year, month, day }
}

export function localDateToString(date: LocalDate) {
  return [
    String(date.year).padStart(4, '0'),
    String(date.month).padStart(2, '0'),
    String(date.day).padStart(2, '0'),
  ].join('-')
}

export function localDateFromDate(date: Date): LocalDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

export function addLocalDays(date: LocalDate, days: number): LocalDate {
  const next = new Date(date.year, date.month - 1, date.day)
  next.setDate(next.getDate() + days)
  return localDateFromDate(next)
}

export function dayOfWeek(date: LocalDate) {
  return new Date(date.year, date.month - 1, date.day).getDay()
}

export function monthDay(date: LocalDate) {
  return `${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

export function diffLocalDays(date: LocalDate, base: LocalDate) {
  const left = new Date(date.year, date.month - 1, date.day).getTime()
  const right = new Date(base.year, base.month - 1, base.day).getTime()
  return Math.round((left - right) / 86400000)
}

export function getGregorianEaster(year: number): LocalDate {
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
  return { year, month, day }
}
