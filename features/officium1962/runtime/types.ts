import type { LiturgicalBlock, Office1962Day, OfficeHour, OfficeHourName } from '../schema'

export const RELEASE_SCHEMA_VERSION = 'officium1962.v1'
export const PINNED_UPSTREAM_COMMIT = '515a213f79951c563be4f599ca591c63aa63bb6d'

export interface ChecksumPath {
  path: string
  checksum: string
}

export interface RootManifest {
  schemaVersion: string
  upstreamCommit: string
  generatorVersion: string
  generatedAt: string
  availableYears: Array<ChecksumPath & { year: number }>
  shared: ChecksumPath
  reportsPath: string
  experimentalPath?: string
}

export interface YearManifest {
  schemaVersion: string
  upstreamCommit: string
  generatorVersion: string
  generatedAt: string
  year: number
  dateRange: { from: string, to: string }
  dayCount: number
  hourCount: number
  dateHourCount: number
  hours: OfficeHourName[]
  calendar: ChecksumPath
  months: Array<ChecksumPath & { month: string }>
  days: Array<ChecksumPath & { date: string }>
}

export interface CalendarDay {
  date: string
  liturgicalTitle: string
  rank?: string
  color?: string
  season?: string
  availableHours: OfficeHourName[]
  omittedHours: OfficeHourName[]
  monthChunk: string
  dayFile: string
}

export interface YearCalendar {
  schemaVersion: string
  upstreamCommit: string
  year: number
  days: CalendarDay[]
}

export interface BlockOccurrence {
  blockId: string
  occurrenceId: string
  order: number
  occurrenceMetadata?: {
    originalId?: string
    type?: string
    title?: string
    metadata?: Record<string, unknown>
    sourceRefs?: LiturgicalBlock['sourceRefs']
    warnings?: LiturgicalBlock['warnings']
  }
}

export interface ReleaseHour extends Omit<OfficeHour, 'blocks'> {
  occurrences: BlockOccurrence[]
}

export interface ReleaseDayDocument extends Omit<Office1962Day, 'schemaVersion' | 'hours'> {
  schemaVersion: string
  upstreamCommit: string
  hours: Partial<Record<OfficeHourName, ReleaseHour>>
}

export interface SharedBlock extends LiturgicalBlock {
  contentHash: string
  verses: string[]
  rubricLines: string[]
}

export interface SharedManifest {
  schemaVersion: string
  upstreamCommit: string
  chunkCount: number
  blockCount: number
  chunks: Array<{ file: string, blockCount: number, checksum: string }>
  blocks: Record<string, { chunk: string, contentHash: string, type: string }>
}

export interface SharedChunk {
  schemaVersion: string
  upstreamCommit: string
  blocks: SharedBlock[]
}

export interface LoadedOfficeHour {
  day: ReleaseDayDocument
  calendarDay: CalendarDay
  hour: OfficeHour
  rootManifest: RootManifest
  yearManifest: YearManifest
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export interface RuntimeContext {
  basePath: string
  fetch: FetchLike
  cache: import('./cache').Officium1962Cache
}
