import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { Officium1962Loader } from './index'
import { InvalidChecksumError, ManifestLoadError, MissingSharedBlockError, UnavailableDateError, UnavailableYearError, UnsupportedSchemaError } from './errors'
import { Officium1962Cache } from './cache'
import { reconstructHour } from './reconstructHour'
import type { RuntimeContext, SharedManifest } from './types'

const commit = '515a213f79951c563be4f599ca591c63aa63bb6d'
const schemaVersion = 'officium1962.v1'

function sha(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function fixture() {
  const chunk = JSON.stringify({
    schemaVersion,
    upstreamCommit: commit,
    blocks: [{
      id: 'shared-a',
      contentHash: 'hash-a',
      type: 'dialogue',
      title: 'Incipit',
      text: ['℣. Deus, in adjutórium meum inténde.', '℟. Dómine, ad adjuvándum me festína.'],
      verses: [],
      rubricLines: [],
      sourceRefs: [{ upstreamCommit: commit, path: 'Psalterium/Common/Prayers.txt' }],
      warnings: [],
    }],
  })
  const shared = JSON.stringify({
    schemaVersion,
    upstreamCommit: commit,
    chunkCount: 1,
    blockCount: 1,
    chunks: [{ file: 'blocks-000.json', blockCount: 1, checksum: sha(chunk) }],
    blocks: { 'shared-a': { chunk: 'blocks-000.json', contentHash: 'hash-a', type: 'dialogue' } },
  })
  const day = JSON.stringify({
    schemaVersion,
    upstreamCommit: commit,
    engineVersion: 'Rubrics 1960 - 1960',
    language: 'la',
    date: '2026-07-22',
    liturgicalTitle: 'S. Mariæ Magdalenæ',
    rank: 'III. classis',
    commemorations: [],
    sourceRefs: [],
    warnings: [],
    hours: {
      matutinum: {
        name: 'matutinum',
        title: 'Matutinum',
        metadata: {},
        sourceRefs: [],
        warnings: [],
        occurrences: [{ blockId: 'shared-a', occurrenceId: 'office-a', order: 1, occurrenceMetadata: { metadata: {} } }],
      },
      laudes: {
        name: 'laudes',
        title: 'Laudes',
        metadata: {},
        sourceRefs: [],
        warnings: [],
        occurrences: [{ blockId: 'shared-a', occurrenceId: 'office-b', order: 1, occurrenceMetadata: { metadata: {} } }],
      },
    },
  })
  const calendar = JSON.stringify({
    schemaVersion,
    upstreamCommit: commit,
    year: 2026,
    days: [{
      date: '2026-07-22',
      liturgicalTitle: 'S. Mariæ Magdalenæ',
      availableHours: ['matutinum', 'laudes'],
      omittedHours: [],
      monthChunk: 'months/07.json',
      dayFile: 'days/2026-07-22.json',
    }],
  })
  const year = JSON.stringify({
    schemaVersion,
    upstreamCommit: commit,
    generatorVersion: 'test',
    generatedAt: '2026-07-22T00:00:00Z',
    year: 2026,
    dateRange: { from: '2026-01-01', to: '2026-12-31' },
    dayCount: 1,
    hourCount: 2,
    dateHourCount: 2,
    hours: ['matutinum', 'laudes'],
    calendar: { path: 'calendar.json', checksum: sha(calendar) },
    months: [],
    days: [{ date: '2026-07-22', path: 'days/2026-07-22.json', checksum: sha(day) }],
  })
  const root = JSON.stringify({
    schemaVersion,
    upstreamCommit: commit,
    generatorVersion: 'test',
    generatedAt: '2026-07-22T00:00:00Z',
    availableYears: [{ year: 2026, path: 'years/2026/manifest.json', checksum: sha(year) }],
    shared: { path: 'shared/manifest.json', checksum: sha(shared) },
    reportsPath: 'reports/',
  })
  return new Map([
    ['/data/officium1962/manifest.json', root],
    ['/data/officium1962/years/2026/manifest.json', year],
    ['/data/officium1962/years/2026/calendar.json', calendar],
    ['/data/officium1962/years/2026/days/2026-07-22.json', day],
    ['/data/officium1962/shared/manifest.json', shared],
    ['/data/officium1962/shared/blocks-000.json', chunk],
  ])
}

function createFetch(files = fixture(), counts = new Map<string, number>()) {
  return async (input: RequestInfo | URL) => {
    const path = String(input)
    counts.set(path, (counts.get(path) || 0) + 1)
    const body = files.get(path)
    return body === undefined
      ? new Response('not found', { status: 404 })
      : new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
}

describe('Officium 1962 production loader', () => {
  it('loads root, year, calendar, day, shared manifest, and the needed chunk', async () => {
    const loader = new Officium1962Loader({ fetch: createFetch() })
    const result = await loader.loadHour('2026-07-22', 'matutinum')
    expect(result.rootManifest.availableYears[0].year).toBe(2026)
    expect(result.yearManifest.year).toBe(2026)
    expect(result.calendarDay.liturgicalTitle).toContain('Magdalenæ')
    expect(result.day.date).toBe('2026-07-22')
    expect(result.hour.blocks[0].text[0]).toContain('℣.')
  })

  it('caches every document and suppresses duplicate in-flight requests', async () => {
    const counts = new Map<string, number>()
    const loader = new Officium1962Loader({ fetch: createFetch(fixture(), counts) })
    await Promise.all([
      loader.loadHour('2026-07-22', 'matutinum'),
      loader.loadHour('2026-07-22', 'matutinum'),
      loader.loadHour('2026-07-22', 'laudes'),
    ])
    expect([...counts.values()].every(count => count === 1)).toBe(true)
    expect(loader.cacheSnapshot()).toEqual({ yearManifests: 1, calendars: 1, days: 1, sharedChunks: 1 })
  })

  it('rejects an unknown schema version', async () => {
    const files = fixture()
    files.set('/data/officium1962/manifest.json', JSON.stringify({ schemaVersion: 'future.v9', upstreamCommit: commit }))
    await expect(new Officium1962Loader({ fetch: createFetch(files) }).loadRootManifest()).rejects.toBeInstanceOf(UnsupportedSchemaError)
  })

  it('rejects an unavailable year without requesting a fabricated manifest', async () => {
    await expect(new Officium1962Loader({ fetch: createFetch() }).loadYearManifest(2025)).rejects.toBeInstanceOf(UnavailableYearError)
  })

  it('rejects a missing date instead of falling back', async () => {
    await expect(new Officium1962Loader({ fetch: createFetch() }).loadDay('2026-07-23')).rejects.toBeInstanceOf(UnavailableDateError)
  })

  it('rejects checksum failures', async () => {
    const files = fixture()
    files.set('/data/officium1962/years/2026/calendar.json', '{}')
    await expect(new Officium1962Loader({ fetch: createFetch(files) }).loadCalendar(2026)).rejects.toBeInstanceOf(InvalidChecksumError)
  })

  it('turns a network failure into ManifestLoadError', async () => {
    const fetch = async () => { throw new TypeError('offline') }
    await expect(new Officium1962Loader({ fetch }).loadRootManifest()).rejects.toBeInstanceOf(ManifestLoadError)
  })

  it('uses the configured static-site base path', async () => {
    const requested: string[] = []
    const baseFiles = new Map([...fixture()].map(([key, value]) => [`/library${key}`, value]))
    const fetch = async (input: RequestInfo | URL) => {
      requested.push(String(input))
      const body = baseFiles.get(String(input))
      return body ? new Response(body) : new Response('', { status: 404 })
    }
    await new Officium1962Loader({ basePath: '/library/', fetch }).loadRootManifest()
    expect(requested).toEqual(['/library/data/officium1962/manifest.json'])
  })

  it('does not retain a failed request in cache', async () => {
    let attempts = 0
    const loader = new Officium1962Loader({
      fetch: async (input) => {
        attempts += 1
        if (attempts === 1)
          return new Response('', { status: 503 })
        return createFetch()(input)
      },
    })
    await expect(loader.loadRootManifest()).rejects.toBeInstanceOf(ManifestLoadError)
    await expect(loader.loadRootManifest()).resolves.toBeTruthy()
    expect(attempts).toBe(2)
  })

  it('reports a missing shared manifest entry explicitly', async () => {
    const context: RuntimeContext = { basePath: '/', fetch: createFetch(), cache: new Officium1962Cache() }
    const day = JSON.parse(fixture().get('/data/officium1962/years/2026/days/2026-07-22.json')!)
    const manifest: SharedManifest = {
      schemaVersion,
      upstreamCommit: commit,
      blockCount: 0,
      chunkCount: 0,
      chunks: [],
      blocks: {},
    }
    await expect(reconstructHour(context, day, 'matutinum', manifest)).rejects.toBeInstanceOf(MissingSharedBlockError)
  })
})
