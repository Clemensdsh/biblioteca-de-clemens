import { cachePromise } from './cache'
import { ManifestLoadError } from './errors'
import { assertReleaseIdentity, fetchJson } from './http'
import { loadYearManifest } from './loadYearManifest'
import type { RuntimeContext, YearCalendar } from './types'

export function loadCalendar(context: RuntimeContext, year: number): Promise<YearCalendar> {
  return cachePromise(context.cache.calendars, year, async () => {
    const manifest = await loadYearManifest(context, year)
    const calendar = await fetchJson<YearCalendar>(context, `years/${year}/${manifest.calendar.path}`, manifest.calendar.checksum)
    assertReleaseIdentity(calendar, `year ${year} calendar`)
    if (calendar.year !== year || !Array.isArray(calendar.days))
      throw new ManifestLoadError(`Invalid calendar for ${year}`)
    return calendar
  })
}
