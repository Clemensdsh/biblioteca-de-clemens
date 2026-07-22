import { Officium1962Cache } from './cache'
import { UnavailableDateError } from './errors'
import { loadCalendar } from './loadCalendar'
import { loadDay } from './loadDay'
import { loadRootManifest, loadSharedManifest } from './loadRootManifest'
import { loadYearManifest } from './loadYearManifest'
import { reconstructHour } from './reconstructHour'
import type { FetchLike, LoadedOfficeHour, RuntimeContext } from './types'
import type { OfficeHourName } from '../schema'

export * from './errors'
export * from './types'

export interface Officium1962LoaderOptions {
  basePath?: string
  fetch?: FetchLike
  cache?: Officium1962Cache
}

export class Officium1962Loader {
  readonly context: RuntimeContext

  constructor(options: Officium1962LoaderOptions = {}) {
    this.context = {
      basePath: options.basePath ?? import.meta.env.BASE_URL ?? '/',
      fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
      cache: options.cache ?? new Officium1962Cache(),
    }
  }

  loadRootManifest() { return loadRootManifest(this.context) }
  loadYearManifest(year: number) { return loadYearManifest(this.context, year) }
  loadCalendar(year: number) { return loadCalendar(this.context, year) }
  loadDay(date: string) { return loadDay(this.context, date) }
  loadSharedManifest() { return loadSharedManifest(this.context) }

  async loadHour(date: string, hourName: OfficeHourName): Promise<LoadedOfficeHour> {
    const year = Number(date.slice(0, 4))
    const rootManifest = await this.loadRootManifest()
    const yearManifest = await this.loadYearManifest(year)
    const [calendar, day, sharedManifest] = await Promise.all([
      this.loadCalendar(year),
      this.loadDay(date),
      this.loadSharedManifest(),
    ])
    const calendarDay = calendar.days.find(item => item.date === date)
    if (!calendarDay)
      throw new UnavailableDateError(`Date ${date} is missing from the calendar`, { actual: date })
    if (!calendarDay.availableHours.includes(hourName))
      throw new UnavailableDateError(`${date} does not provide ${hourName}`)
    const hour = await reconstructHour(this.context, day, hourName, sharedManifest)
    return { rootManifest, yearManifest, calendarDay, day, hour }
  }

  clearCache() { this.context.cache.clear() }
  cacheSnapshot() { return this.context.cache.snapshot() }
}
