import { cachePromise } from './cache'
import { InvalidDayDocumentError, UnavailableDateError } from './errors'
import { assertReleaseIdentity, fetchJson } from './http'
import { loadYearManifest } from './loadYearManifest'
import { isOfficeHourName } from '../schema'
import type { ReleaseDayDocument, RuntimeContext } from './types'

export function loadDay(context: RuntimeContext, date: string): Promise<ReleaseDayDocument> {
  return cachePromise(context.cache.days, date, async () => {
    const year = Number(date.slice(0, 4))
    const manifest = await loadYearManifest(context, year)
    const entry = manifest.days.find(item => item.date === date)
    if (!entry)
      throw new UnavailableDateError(`Date ${date} is not listed in the year manifest`, { actual: date })
    const day = await fetchJson<ReleaseDayDocument>(context, `years/${year}/${entry.path}`, entry.checksum)
    assertReleaseIdentity(day, `day ${date}`)
    validateDayDocument(day, date)
    return day
  })
}

function validateDayDocument(day: ReleaseDayDocument, expectedDate: string) {
  if (day.date !== expectedDate || day.language !== 'la' || day.engineVersion !== 'Rubrics 1960 - 1960' || !day.hours) {
    throw new InvalidDayDocumentError(`Invalid identity fields in day ${expectedDate}`, {
      expected: expectedDate,
      actual: day.date,
    })
  }
  for (const [hourName, hour] of Object.entries(day.hours)) {
    if (!isOfficeHourName(hourName) || !hour || !Array.isArray(hour.occurrences) || !hour.occurrences.length)
      throw new InvalidDayDocumentError(`Invalid ${hourName} occurrence list in ${expectedDate}`)
    hour.occurrences.forEach((occurrence, index) => {
      if (!occurrence.blockId || !occurrence.occurrenceId || occurrence.order !== index + 1)
        throw new InvalidDayDocumentError(`Invalid occurrence ${index + 1} in ${expectedDate} ${hourName}`)
    })
  }
}
