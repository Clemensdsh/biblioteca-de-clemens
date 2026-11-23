import { Officium1962Cache } from './cache'
import { UnavailableDateError } from './errors'
import { loadCalendar } from './loadCalendar'
import { loadDay } from './loadDay'
import { loadRootManifest, loadSharedManifest } from './loadRootManifest'
import { loadYearManifest } from './loadYearManifest'
import { reconstructHour } from './reconstructHour'
import { loadLiLeisi, type LiLeisiData } from '../liLeisi'
import { loadPsalmsZh, loadPsalmsZhCore, psalmNumbersIn, psalmsZhFrom, type PsalmsZhCore, type PsalmsZhData, type PsalmsZhPsalm } from '../psalmsZh'
import { cachePromise } from './cache'
import { fetchJson } from './http'
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
    // the shared manifest needs only the root manifest: fetch it alongside the year manifest
    const sharedManifestPending = this.loadSharedManifest()
    sharedManifestPending.catch(() => {}) // awaited below; avoid an unhandled rejection if the year fails first
    const rootManifest = await this.loadRootManifest()
    const yearManifest = await this.loadYearManifest(year)
    const [calendar, day, sharedManifest] = await Promise.all([
      this.loadCalendar(year),
      this.loadDay(date),
      sharedManifestPending,
    ])
    const calendarDay = calendar.days.find(item => item.date === date)
    if (!calendarDay)
      throw new UnavailableDateError(`Date ${date} is missing from the calendar`, { actual: date })
    if (!calendarDay.availableHours.includes(hourName))
      throw new UnavailableDateError(`${date} does not provide ${hourName}`)
    const hour = await reconstructHour(this.context, day, hourName, sharedManifest)
    return { rootManifest, yearManifest, calendarDay, day, hour }
  }

  private psalmsZh?: Promise<PsalmsZhData>

  /** 圣咏中文对照数据；失败时抛出，调用方应忽略并只显示拉丁文。 */
  loadPsalmsZh() {
    this.psalmsZh ??= loadPsalmsZh(this.context).catch((error) => {
      this.psalmsZh = undefined
      throw error
    })
    return this.psalmsZh
  }

  private psalmsZhCore?: Promise<PsalmsZhCore>
  private psalmZhFiles = new Map<string, Promise<PsalmsZhPsalm>>()

  /** 圣咏中文的公共部分（时辰名、抬头、固定句、颂歌）；失败时抛出。 */
  loadPsalmsZhCore() {
    this.psalmsZhCore ??= loadPsalmsZhCore(this.context).catch((error) => {
      this.psalmsZhCore = undefined
      throw error
    })
    return this.psalmsZhCore
  }

  /** 只含这些块用到的圣咏的中文对照数据（每篇按 core 中的 SHA-256 校验）；失败时抛出，调用方应只显示拉丁文。 */
  async loadPsalmsZhFor(blocks: Array<{ text?: string[], verses?: string[] }>): Promise<PsalmsZhData> {
    const core = await this.loadPsalmsZhCore()
    const numbers = psalmNumbersIn(blocks).filter(n => core.psalmFiles[n])
    const psalms = await Promise.all(numbers.map((n) => {
      const checksum = core.psalmFiles[n]
      return cachePromise(this.psalmZhFiles, `${n}:${checksum}`, () =>
        fetchJson<PsalmsZhPsalm>(this.context, `psalms-zh/${n.padStart(3, '0')}.json`, checksum))
    }))
    return psalmsZhFrom(core, Object.fromEntries(numbers.map((n, i) => [n, psalms[i]])))
  }

  private liLeisi?: Promise<LiLeisiData>

  /** 利类思译本（司铎课典）配对数据；失败时抛出，调用方应忽略。 */
  loadLiLeisi() {
    this.liLeisi ??= loadLiLeisi(this.context).catch((error) => {
      this.liLeisi = undefined
      throw error
    })
    return this.liLeisi
  }

  clearCache() { this.context.cache.clear() }
  cacheSnapshot() { return this.context.cache.snapshot() }
}
