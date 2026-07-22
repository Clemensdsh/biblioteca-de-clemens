import { isOfficeHourName, office1962HourNames, type OfficeHourName } from './schema'

export interface ParsedOfficiumQuery {
  date?: string
  hour: OfficeHourName
  error?: 'invalid-date' | 'invalid-hour'
}

export function localCivilDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isValidCivilDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match)
    return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1)
    return false
  const daysInMonth = new Date(year, month, 0, 12).getDate()
  return day <= daysInMonth
}

export function addCivilDays(value: string, amount: number): string {
  if (!isValidCivilDate(value))
    throw new Error(`Invalid civil date: ${value}`)
  const [year, month, day] = value.split('-').map(Number)
  const result = new Date(year, month - 1, day, 12)
  result.setDate(result.getDate() + amount)
  return localCivilDate(result)
}

export function parseOfficiumQuery(search: string): ParsedOfficiumQuery {
  const params = new URLSearchParams(search)
  const date = params.get('date') || undefined
  const requestedHour = params.get('hour') || office1962HourNames[0]
  if (date && !isValidCivilDate(date))
    return { hour: isOfficeHourName(requestedHour) ? requestedHour : office1962HourNames[0], error: 'invalid-date' }
  if (!isOfficeHourName(requestedHour))
    return { date, hour: office1962HourNames[0], error: 'invalid-hour' }
  return { date, hour: requestedHour }
}

export function buildOfficiumSearch(date: string, hour: OfficeHourName): string {
  const params = new URLSearchParams({ date, hour })
  return `?${params.toString()}`
}
