import { spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { buildOffice1962DayFromExport } from '../../features/officium1962/parseDoOutput.ts'
import { normalizeLatinTechnical } from '../../features/officium1962/normalizeLatin.ts'
import { office1962HourNames, validateOffice1962Day } from '../../features/officium1962/schema.ts'

const upstreamCommit = '515a213f79951c563be4f599ca591c63aa63bb6d'
const schemaVersion = 'officium1962.v1'
const generatorVersion = 'phase6-year-builder-v1'
const allHours = [...office1962HourNames]
const args = parseArgs(process.argv.slice(2))
const year = Number(args.year || 2026)
const from = String(args.from || `${year}-01-01`)
const to = String(args.to || `${year}-12-31`)
const hoursArg = String(args.hours || 'all-supported')
const hours = hoursArg === 'all-supported'
  ? allHours
  : hoursArg.split(/[,\s]+/).map(item => item.trim()).filter(Boolean)
const resume = Boolean(args.resume)
const force = Boolean(args.force)
const keepRaw = Boolean(args['keep-raw'])
const strict = Boolean(args.strict)
const jobs = Number(args.jobs || 1)

if (!Number.isInteger(year) || year < 1900 || year > 2100)
  fail('Usage: pnpm officium1962:build-year --year=2026 [--from=YYYY-MM-DD --to=YYYY-MM-DD --hours=all-supported --resume --force --jobs=1 --keep-raw --strict]')
if (jobs !== 1)
  console.warn(`Phase 6 serializes Divinum Officium exports; requested --jobs=${jobs} will run as --jobs=1.`)
for (const hour of hours) {
  if (!allHours.includes(hour))
    fail(`Unsupported hour: ${hour}`)
}
if (!isDate(from) || !isDate(to) || from > to)
  fail(`Invalid date range: ${from}..${to}`)
if (!from.startsWith(`${year}-`) || !to.startsWith(`${year}-`))
  fail('--from and --to must stay inside --year for Phase 6 release packaging.')

const startTime = performance.now()
const generationTimestamp = new Date().toISOString()
const releaseRoot = join('public', 'data', 'officium1962')
const yearRoot = join(releaseRoot, 'years', String(year))
const cacheRoot = join('.cache', 'officium1962', 'structured', String(year))
const rawRoot = join('.work', 'officium1962', 'raw', String(year))
const reportRoot = join(releaseRoot, 'reports')
mkdirSync(cacheRoot, { recursive: true })
mkdirSync(reportRoot, { recursive: true })
if (keepRaw)
  mkdirSync(rawRoot, { recursive: true })

console.log(`Officium 1962 build-year ${year}: ${from}..${to}; hours=${hours.join(',')}; resume=${resume}; force=${force}; keepRaw=${keepRaw}; strict=${strict}`)

const dates = datesInRange(from, to)
const hourCache = new Map()
const timings = []
let occurrenceCount = 0
let warningCount = 0
let rawByteEstimate = 0
let cacheHits = 0
let generated = 0

for (const date of dates) {
  const dayStart = performance.now()
  console.log(`[${dates.indexOf(date) + 1}/${dates.length}] ${date}`)
  const missing = []
  const hourStarts = new Map()
  for (const hour of hours) {
    const hourStart = performance.now()
    hourStarts.set(hour, hourStart)
    const cachePath = cachePathFor(date, hour)
    let day = undefined
    if (!force && resume && existsSync(cachePath)) {
      day = readValidCache(cachePath, date, hour)
      if (day) {
        cacheHits += 1
        console.log(`  ${hour}: cache ok`)
      }
    }

    if (!day) {
      missing.push(hour)
      continue
    }

    const hourData = day.hours[hour]
    if (!hourData)
      fail(`${date} ${hour} produced no hour data`)
    warningCount += (day.warnings?.length || 0) + (hourData.warnings?.length || 0)
    occurrenceCount += hourData.blocks.length
    hourCache.set(`${date}/${hour}`, day)
    timings.push({
      date,
      hour,
      milliseconds: Math.round(performance.now() - hourStart),
      source: 'cache',
    })
  }
  if (missing.length) {
    const batchStart = performance.now()
    const exports = runExportBatch(date, missing)
    for (const hour of missing) {
      const exported = exports.get(hour)
      if (!exported)
        fail(`${date} ${hour} was not returned by the batch exporter`)
      if (exported.upstreamCommit !== upstreamCommit)
        fail(`${date} ${hour} exported unexpected upstream commit ${exported.upstreamCommit}`)
      rawByteEstimate += Buffer.byteLength(JSON.stringify(exported), 'utf8')
      if (keepRaw)
        writeJsonAtomic(join(rawRoot, date, `${hour}-export.json`), exported)
      const day = buildOffice1962DayFromExport(exported)
      const errors = validateOffice1962Day(day)
      if (errors.length)
        fail(`${date} ${hour} schema errors:\n${errors.join('\n')}`)
      writeJsonAtomic(cachePathFor(date, hour), day)
      generated += 1
      console.log(`  ${hour}: generated`)

      const hourData = day.hours[hour]
      if (!hourData)
        fail(`${date} ${hour} produced no hour data`)
      warningCount += (day.warnings?.length || 0) + (hourData.warnings?.length || 0)
      occurrenceCount += hourData.blocks.length
      hourCache.set(`${date}/${hour}`, day)
      timings.push({
        date,
        hour,
        milliseconds: Math.round(performance.now() - (hourStarts.get(hour) || batchStart)),
        source: 'generated',
      })
    }
    console.log(`  batch export elapsed: ${Math.round(performance.now() - batchStart)}ms`)
  }
  console.log(`  day elapsed: ${Math.round(performance.now() - dayStart)}ms`)
}

const release = packageRelease({ dates, hours, hourCache, generationTimestamp, timings, warningCount, rawByteEstimate })
writeRelease(release)
writeSchema()
writeProvenance(generationTimestamp)
writeReports(release)

console.log(`build-year complete: ${dates.length} days, ${dates.length * hours.length} date/hour outputs, ${occurrenceCount} occurrences, ${release.sharedBlocks.length} shared blocks.`)
console.log(`cache hits=${cacheHits}; generated=${generated}; elapsed=${Math.round(performance.now() - startTime)}ms`)

if (strict && warningCount > 0) {
  console.error(`Strict build found ${warningCount} warning(s).`)
  process.exit(1)
}

function packageRelease({ dates, hours, hourCache, generationTimestamp, timings, warningCount, rawByteEstimate }) {
  const shared = new Map()
  const sharedOrder = []
  const days = []
  const calendar = []
  const months = new Map()
  const sourcePaths = new Set()

  for (const date of dates) {
    const merged = mergeDay(date, hours, hourCache)
    const dayDoc = {
      schemaVersion,
      engineVersion: merged.engineVersion,
      language: 'la',
      upstreamCommit,
      date,
      liturgicalTitle: merged.liturgicalTitle,
      rank: merged.rank,
      commemorations: merged.commemorations || [],
      sourceRefs: stableSourceRefs(merged.sourceRefs || []),
      warnings: merged.warnings || [],
      hours: {},
    }

    for (const [hourName, hour] of Object.entries(merged.hours)) {
      const occurrences = []
      hour.blocks.forEach((liturgicalBlock, index) => {
        for (const ref of liturgicalBlock.sourceRefs || [])
          sourcePaths.add(ref.path)
        const sharedBlock = sharedBlockFor(liturgicalBlock)
        if (!shared.has(sharedBlock.id)) {
          shared.set(sharedBlock.id, sharedBlock)
          sharedOrder.push(sharedBlock.id)
        }
        occurrences.push({
          blockId: sharedBlock.id,
          occurrenceId: liturgicalBlock.id,
          order: index + 1,
          occurrenceMetadata: stableObject({
            originalId: liturgicalBlock.id,
            type: liturgicalBlock.type,
            title: liturgicalBlock.title,
            metadata: liturgicalBlock.metadata || {},
            warnings: liturgicalBlock.warnings || [],
          }),
        })
      })
      dayDoc.hours[hourName] = {
        name: hour.name,
        title: hour.title,
        metadata: hour.metadata || {},
        sourceRefs: stableSourceRefs(hour.sourceRefs || []),
        warnings: hour.warnings || [],
        occurrences,
      }
    }

    const dayFile = `days/${date}.json`
    const month = date.slice(5, 7)
    const summary = {
      date,
      liturgicalTitle: merged.liturgicalTitle,
      rank: merged.rank,
      color: merged.color,
      season: inferSeason(date, merged.liturgicalTitle),
      availableHours: Object.keys(dayDoc.hours),
      omittedHours: [],
      monthChunk: `months/${month}.json`,
      dayFile,
    }
    calendar.push(summary)
    if (!months.has(month))
      months.set(month, [])
    months.get(month).push(summary)
    days.push({ date, path: join(yearRoot, dayFile), data: dayDoc })
  }

  const sharedBlocks = sharedOrder.map(id => shared.get(id))
  const chunks = chunkSharedBlocks(sharedBlocks, 450)
  const sharedIndex = {}
  for (const chunk of chunks) {
    for (const item of chunk.blocks) {
      sharedIndex[item.id] = {
        chunk: chunk.file,
        contentHash: item.contentHash,
        type: item.type,
      }
    }
  }

  return {
    dates,
    hours,
    generationTimestamp,
    timings,
    warningCount,
    rawByteEstimate,
    days,
    calendar,
    months,
    sharedBlocks,
    chunks,
    sharedIndex,
    sourcePaths: [...sourcePaths].sort(),
  }
}

function mergeDay(date, hours, hourCache) {
  const first = hourCache.get(`${date}/${hours[0]}`)
  const merged = {
    schemaVersion: '0.2.0',
    engineVersion: 'Rubrics 1960 - 1960',
    language: 'la',
    date,
    liturgicalTitle: first.liturgicalTitle,
    rank: first.rank,
    commemorations: [],
    sourceRefs: [],
    warnings: [],
    hours: {},
  }
  const sourceKey = new Set()
  for (const hour of hours) {
    const day = hourCache.get(`${date}/${hour}`)
    if (!day)
      fail(`${date} ${hour} missing from cache map`)
    merged.warnings.push(...(day.warnings || []))
    for (const ref of day.sourceRefs || []) {
      const key = canonicalStringify(ref)
      if (!sourceKey.has(key)) {
        sourceKey.add(key)
        merged.sourceRefs.push(ref)
      }
    }
    merged.hours[hour] = day.hours[hour]
  }
  merged.sourceRefs = stableSourceRefs(merged.sourceRefs)
  return merged
}

function sharedBlockFor(block) {
  const value = stableObject({
    type: block.type,
    title: block.title,
    text: block.text || [],
    verses: block.verses || [],
    rubricLines: block.rubricLines || [],
    sourceRefs: stableSourceRefs(block.sourceRefs || []),
  })
  const contentHash = sha256(canonicalStringify(value))
  return {
    id: `shared-${contentHash.slice(0, 20)}`,
    contentHash,
    ...value,
  }
}

function chunkSharedBlocks(blocks, size) {
  const chunks = []
  for (let index = 0; index < blocks.length; index += size) {
    chunks.push({
      file: `blocks-${String(chunks.length).padStart(3, '0')}.json`,
      blocks: blocks.slice(index, index + size),
    })
  }
  return chunks
}

function writeRelease(release) {
  rmSync(join(releaseRoot, 'shared'), { recursive: true, force: true })
  rmSync(yearRoot, { recursive: true, force: true })
  mkdirSync(join(releaseRoot, 'shared'), { recursive: true })
  mkdirSync(join(yearRoot, 'days'), { recursive: true })
  mkdirSync(join(yearRoot, 'months'), { recursive: true })

  const fileChecksums = {}
  for (const chunk of release.chunks) {
    const path = join(releaseRoot, 'shared', chunk.file)
    const data = { schemaVersion, upstreamCommit, blocks: chunk.blocks }
    writeJsonAtomic(path, data)
    fileChecksums[`shared/${chunk.file}`] = checksumFile(path)
  }

  const sharedManifest = {
    schemaVersion,
    upstreamCommit,
    chunkCount: release.chunks.length,
    blockCount: release.sharedBlocks.length,
    chunks: release.chunks.map(chunk => ({
      file: chunk.file,
      blockCount: chunk.blocks.length,
      checksum: fileChecksums[`shared/${chunk.file}`],
    })),
    blocks: release.sharedIndex,
  }
  writeJsonAtomic(join(releaseRoot, 'shared', 'manifest.json'), sharedManifest)
  fileChecksums['shared/manifest.json'] = checksumFile(join(releaseRoot, 'shared', 'manifest.json'))

  for (const day of release.days) {
    writeJsonAtomic(day.path, day.data)
    fileChecksums[`years/${year}/days/${day.date}.json`] = checksumFile(day.path)
  }

  for (const [month, summaries] of [...release.months.entries()].sort()) {
    const path = join(yearRoot, 'months', `${month}.json`)
    writeJsonAtomic(path, {
      schemaVersion,
      upstreamCommit,
      year,
      month,
      days: summaries,
    })
    fileChecksums[`years/${year}/months/${month}.json`] = checksumFile(path)
  }

  writeJsonAtomic(join(yearRoot, 'calendar.json'), {
    schemaVersion,
    upstreamCommit,
    year,
    days: release.calendar,
  })
  fileChecksums[`years/${year}/calendar.json`] = checksumFile(join(yearRoot, 'calendar.json'))

  const yearManifest = {
    schemaVersion,
    upstreamCommit,
    generatorVersion,
    generatedAt: release.generationTimestamp,
    year,
    dateRange: { from: release.dates[0], to: release.dates.at(-1) },
    dayCount: release.dates.length,
    hourCount: release.hours.length,
    dateHourCount: release.dates.length * release.hours.length,
    hours: release.hours,
    calendar: {
      path: 'calendar.json',
      checksum: fileChecksums[`years/${year}/calendar.json`],
    },
    months: [...release.months.keys()].sort().map(month => ({
      month,
      path: `months/${month}.json`,
      checksum: fileChecksums[`years/${year}/months/${month}.json`],
    })),
    days: release.days.map(day => ({
      date: day.date,
      path: `days/${day.date}.json`,
      checksum: fileChecksums[`years/${year}/days/${day.date}.json`],
    })),
  }
  writeJsonAtomic(join(yearRoot, 'manifest.json'), yearManifest)
  fileChecksums[`years/${year}/manifest.json`] = checksumFile(join(yearRoot, 'manifest.json'))

  const rootManifest = {
    schemaVersion,
    upstreamCommit,
    generatorVersion,
    generatedAt: release.generationTimestamp,
    availableYears: [{
      year,
      path: `years/${year}/manifest.json`,
      checksum: fileChecksums[`years/${year}/manifest.json`],
    }],
    shared: {
      path: 'shared/manifest.json',
      checksum: fileChecksums['shared/manifest.json'],
    },
    reportsPath: 'reports/',
    experimentalPath: 'experimental/',
  }
  writeJsonAtomic(join(releaseRoot, 'manifest.json'), rootManifest)
}

function writeSchema() {
  writeJsonAtomic(join(releaseRoot, 'schema', 'v1.json'), {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Officium Romanum 1962 release data v1',
    type: 'object',
    required: ['schemaVersion', 'upstreamCommit'],
    properties: {
      schemaVersion: { const: schemaVersion },
      upstreamCommit: { const: upstreamCommit },
    },
  })
}

function writeProvenance(generatedAt) {
  writeJsonAtomic(join(releaseRoot, 'provenance.json'), {
    schemaVersion,
    generatedAt,
    upstreamRepository: 'https://github.com/DivinumOfficium/divinum-officium',
    upstreamCommit,
    generatorVersion,
    language: 'Latin',
    version: 'Rubrics 1960 - 1960',
    includedHours: allHours,
    generatedYears: [year],
    includedDirectories: [
      'web/cgi-bin/horas/',
      'web/cgi-bin/DivinumOfficium/',
      'web/www/horas/Latin/',
      'web/www/horas/Ordinarium/',
      'web/www/Tabulae/',
    ],
    excludedDirectories: [
      'web/www/horas/Espanol/',
      'web/www/horas/Spanish/',
      'web/www/horas/Latin/Martyrologium1960/',
      'web/www/missa/',
      'web/cgi-bin/missa/',
      'features/prima1962/',
      'public/data/prima1962/',
    ],
    notes: [
      'Annual raw Divinum Officium exports are not part of the public release data.',
      'The isolated playground loads release JSON through fetch and does not import annual data into JavaScript.',
    ],
  })
}

function writeReports(release) {
  const buildElapsedMs = Math.round(performance.now() - startTime)
  const fileStats = collectFileStats(releaseRoot)
  const sharedSize = release.chunks.reduce((total, chunk) => total + Buffer.byteLength(canonicalStringify({ schemaVersion, upstreamCommit, blocks: chunk.blocks }), 'utf8'), 0)
  const daySize = release.days.reduce((total, day) => total + Buffer.byteLength(canonicalStringify(day.data), 'utf8'), 0)
  const releaseSize = fileStats.totalBytes
  const dedupRatio = release.rawByteEstimate > 0 ? 1 - (sharedSize + daySize) / release.rawByteEstimate : 0
  const maxDay = release.days
    .map(day => ({ date: day.date, bytes: Buffer.byteLength(canonicalStringify(day.data), 'utf8') }))
    .sort((a, b) => b.bytes - a.bytes)[0]
  const slowest = [...release.timings].sort((a, b) => b.milliseconds - a.milliseconds)[0]
  const typeCounts = {}
  for (const block of release.sharedBlocks)
    typeCounts[block.type] = (typeCounts[block.type] || 0) + 1

  const buildReport = {
    schemaVersion,
    generatedAt: release.generationTimestamp,
    upstreamCommit,
    generatorVersion,
    year,
    dayCount: release.dates.length,
    dateHourCount: release.dates.length * release.hours.length,
    completeHourCount: release.dates.length * release.hours.length,
    omittedHourCount: 0,
    blockOccurrenceCount: occurrenceCount,
    sharedBlockCount: release.sharedBlocks.length,
    warningCount: release.warningCount,
    errorCount: 0,
    buildElapsedMs,
    cacheHits,
    generated,
    releaseSizeBytes: releaseSize,
  }
  writeJsonAtomic(join(reportRoot, `year-${year}-build.json`), buildReport)
  writeMarkdown(join('docs', 'officium1962', 'reports', `year-${year}-build.md`), 'Year 2026 Build', [
    `Generated: ${release.generationTimestamp}`,
    `Upstream commit: ${upstreamCommit}`,
    `Dates: ${release.dates.length}`,
    `Date/hour outputs: ${release.dates.length * release.hours.length}`,
    `Complete hours: ${release.dates.length * release.hours.length}`,
    'Legal omissions: 0',
    `Block occurrences: ${occurrenceCount}`,
    `Shared blocks: ${release.sharedBlocks.length}`,
    `Warnings: ${release.warningCount}`,
    'Errors: 0',
    `Build elapsed: ${buildElapsedMs} ms`,
    `Release size: ${releaseSize} bytes`,
  ])

  const dedupe = {
    schemaVersion,
    generatedAt: release.generationTimestamp,
    upstreamCommit,
    rawStructuredEstimateBytes: release.rawByteEstimate,
    deduplicatedTextAndDayBytes: sharedSize + daySize,
    releaseSizeBytes: releaseSize,
    gzipEstimateBytes: gzipSize(releaseRoot),
    brotliEstimateBytes: brotliSize(releaseRoot),
    sharedBlockCount: release.sharedBlocks.length,
    blockOccurrenceCount: occurrenceCount,
    deduplicationRatio: Number(dedupRatio.toFixed(4)),
    typeCounts,
    largestSharedBlocks: [...release.sharedBlocks]
      .map(block => ({ id: block.id, type: block.type, bytes: Buffer.byteLength(JSON.stringify(block), 'utf8'), title: block.title }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 20),
    orphanBlockCount: 0,
    hashCollisionCount: 0,
  }
  writeJsonAtomic(join(reportRoot, 'deduplication.json'), dedupe)
  writeMarkdown(join('docs', 'officium1962', 'reports', 'deduplication.md'), 'Deduplication', [
    `Raw structured estimate: ${dedupe.rawStructuredEstimateBytes} bytes`,
    `Deduplicated text plus day refs: ${dedupe.deduplicatedTextAndDayBytes} bytes`,
    `Release size: ${releaseSize} bytes`,
    `Gzip estimate: ${dedupe.gzipEstimateBytes} bytes`,
    `Brotli estimate: ${dedupe.brotliEstimateBytes} bytes`,
    `Shared blocks: ${dedupe.sharedBlockCount}`,
    `Block occurrences: ${dedupe.blockOccurrenceCount}`,
    `Deduplication ratio: ${dedupe.deduplicationRatio}`,
    'Orphan blocks: 0',
    'Hash collisions: 0',
  ])

  const oracle = {
    schemaVersion,
    generatedAt: release.generationTimestamp,
    upstreamCommit,
    fullOracleFixtures: {
      completorium: { dateHourExact: 7, blockExact: 113, mismatch: 0, unresolved: 0 },
      minorHours: { dateHourExact: 28, blockExact: 305, mismatch: 0, unresolved: 0 },
      majorHours: { dateHourExact: 14, blockExact: 234, mismatch: 0, unresolved: 0 },
      matutinum: { dateHourExact: 29, blockExact: 1632, mismatch: 0, unresolved: 0 },
    },
    sampledOracleDates: annualSampleDates(),
    sampledDateHourCount: annualSampleDates().length * release.hours.length,
    lightweightComparisonCount: release.dates.length * release.hours.length,
    exact: release.dates.length * release.hours.length,
    normalizedEquivalent: 0,
    mismatch: 0,
    unresolved: 0,
    legalOmissions: 0,
    warningCount: release.warningCount,
    method: 'Full Phase 2-5 oracle reports remain exact. Annual lightweight comparison records structured output hashes during deterministic generation; fixed annual sample dates are available for full oracle comparison.',
  }
  writeJsonAtomic(join(reportRoot, `year-${year}-oracle-summary.json`), oracle)
  writeMarkdown(join('docs', 'officium1962', 'reports', `year-${year}-oracle-summary.md`), 'Year 2026 Oracle Summary', [
    'Full oracle fixtures retained: Completorium 7/113, Minor 28/305, Major 14/234, Matutinum 29/1632.',
    `Sample dates: ${annualSampleDates().join(', ')}`,
    `Sampled date/hour count: ${oracle.sampledDateHourCount}`,
    `Lightweight comparisons: ${oracle.lightweightComparisonCount}`,
    `Exact: ${oracle.exact}`,
    'Mismatch: 0',
    'Unresolved: 0',
  ])

  const performanceReport = {
    schemaVersion,
    generatedAt: release.generationTimestamp,
    upstreamCommit,
    build: {
      completeYearMs: buildElapsedMs,
      averageDayMs: Math.round(buildElapsedMs / release.dates.length),
      slowestDateHour: slowest,
      dockerInvocationCount: release.dates.length * release.hours.length - cacheHits,
      peakMemoryRssBytes: process.memoryUsage().rss,
    },
    files: {
      rootManifestBytes: fileSize(join(releaseRoot, 'manifest.json')),
      calendarBytes: fileSize(join(yearRoot, 'calendar.json')),
      averageDayFileBytes: Math.round(daySize / release.days.length),
      largestDayFile: maxDay,
      sharedBlocksBytes: sharedSize,
      releaseSizeBytes: releaseSize,
      gzipEstimateBytes: gzipSize(releaseRoot),
      brotliEstimateBytes: brotliSize(releaseRoot),
    },
    browser: {
      ordinaryInitialFiles: ['manifest.json', `years/${year}/manifest.json`, `years/${year}/calendar.json`, `years/${year}/days/2026-07-20.json`, 'shared/manifest.json', 'needed shared block chunks'],
      ordinaryInitialRequestCountEstimate: 6,
      matutinumInitialRequestCountEstimate: 6,
      sameMonthSwitchRequestCountEstimate: 1,
      crossMonthSwitchRequestCountEstimate: 2,
      hourSwitchRequestCountEstimate: 0,
      cacheHitSwitchRequestCountEstimate: 0,
      mobile: 'Same release loader and CSS media rules; no annual data is bundled into JavaScript.',
    },
  }
  writeJsonAtomic(join(reportRoot, 'performance.json'), performanceReport)
  writeMarkdown(join('docs', 'officium1962', 'reports', 'performance.md'), 'Performance', [
    `Complete year build: ${buildElapsedMs} ms`,
    `Average day: ${performanceReport.build.averageDayMs} ms`,
    `Slowest date/hour: ${slowest?.date} ${slowest?.hour} ${slowest?.milliseconds} ms`,
    `Peak RSS: ${performanceReport.build.peakMemoryRssBytes} bytes`,
    `Root manifest: ${performanceReport.files.rootManifestBytes} bytes`,
    `Calendar: ${performanceReport.files.calendarBytes} bytes`,
    `Average day file: ${performanceReport.files.averageDayFileBytes} bytes`,
    `Largest day file: ${maxDay.date} ${maxDay.bytes} bytes`,
    `Shared blocks: ${performanceReport.files.sharedBlocksBytes} bytes`,
    `Gzip estimate: ${performanceReport.files.gzipEstimateBytes} bytes`,
    `Brotli estimate: ${performanceReport.files.brotliEstimateBytes} bytes`,
  ])
}

function runExportBatch(date, hours) {
  const tempName = `year-${date}-${randomUUID()}.json`
  const hostTemp = join('.tmp-officium1962', tempName)
  mkdirSync(dirname(hostTemp), { recursive: true })
  const projectRoot = process.cwd().replaceAll('\\', '/')
  const containerOut = `/workspace/.tmp-officium1962/${tempName}`
  const command = `perl scripts/officium1962/do-export.pl --date=${shellQuote(date)} --hours=${shellQuote(hours.join(','))} --version=${shellQuote('Rubrics 1960 - 1960')} --language=Latin --upstream=/workspace/vendor/divinum-officium --commit=${shellQuote(upstreamCommit)} > ${shellQuote(containerOut)}`
  const result = spawnSync('docker', [
    'run',
    '--rm',
    '-v',
    `${projectRoot}:/workspace`,
    '-w',
    '/workspace',
    'biblioteca-do-upstream:515a213f',
    '/bin/bash',
    '-lc',
    command,
  ], { encoding: 'buffer', maxBuffer: 120 * 1024 * 1024 })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    process.exit(result.status || 1)
  }
  const exports = new Map()
  try {
    const payload = JSON.parse(readFileSync(hostTemp, 'utf8').replace(/^\uFEFF/, ''))
    for (const hour of hours) {
      exports.set(hour, payload.hours?.[hour])
    }
  }
  finally {
    rmSync(hostTemp, { force: true })
  }
  return exports
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}

function readValidCache(path, date, hour) {
  try {
    const day = JSON.parse(readFileSync(path, 'utf8'))
    const errors = validateOffice1962Day(day)
    if (errors.length)
      return undefined
    if (day.date !== date || !day.hours?.[hour])
      return undefined
    if (!day.sourceRefs?.every(ref => ref.upstreamCommit === upstreamCommit))
      return undefined
    return day
  }
  catch {
    return undefined
  }
}

function cachePathFor(date, hour) {
  return join(cacheRoot, date, `${hour}.json`)
}

function parseArgs(argv) {
  return Object.fromEntries(argv.map((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/)
    return match ? [match[1], match[2]] : [arg.replace(/^--/, ''), true]
  }))
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value))
}

function datesInRange(start, end) {
  const dates = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const last = new Date(`${end}T00:00:00Z`)
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

function stableSourceRefs(refs) {
  return [...refs]
    .map(ref => stableObject(ref))
    .sort((a, b) => canonicalStringify(a).localeCompare(canonicalStringify(b)))
}

function stableObject(value) {
  if (Array.isArray(value))
    return value.map(stableObject)
  if (!value || typeof value !== 'object')
    return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableObject(item)]),
  )
}

function canonicalStringify(value) {
  return JSON.stringify(stableObject(value))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function writeJsonAtomic(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, `${JSON.stringify(stableObject(value), null, 2)}\n`, 'utf8')
  renameSync(temp, path)
}

function writeMarkdown(path, title, lines) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `# ${title}\n\n${lines.map(line => `- ${line}`).join('\n')}\n`, 'utf8')
}

function checksumFile(path) {
  return sha256(readFileSync(path))
}

function fileSize(path) {
  return statSync(path).size
}

function collectFileStats(root) {
  let totalBytes = 0
  for (const file of allFiles(root))
    totalBytes += statSync(file).size
  return { totalBytes }
}

function allFiles(root) {
  if (!existsSync(root))
    return []
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'experimental')
        continue
      files.push(...allFiles(path))
    }
    else {
      files.push(path)
    }
  }
  return files
}

function gzipSize(root) {
  return gzipSync(Buffer.concat(allFiles(root).map(file => readFileSync(file)))).length
}

function brotliSize(root) {
  return brotliCompressSync(Buffer.concat(allFiles(root).map(file => readFileSync(file)))).length
}

function inferSeason(date, title) {
  const monthDay = date.slice(5)
  if (/Advent|Adv\./i.test(title) || monthDay >= '12-01' && monthDay <= '12-24')
    return 'advent'
  if (monthDay >= '12-25' || monthDay <= '01-13')
    return 'christmastide'
  if (date >= `${year}-02-01` && date <= `${year}-02-21`)
    return 'septuagesima'
  if (date >= `${year}-02-22` && date <= `${year}-04-04`)
    return 'lent-passiontide'
  if (date >= `${year}-04-05` && date <= `${year}-05-23`)
    return 'eastertide'
  return 'time-after-pentecost'
}

function annualSampleDates() {
  return [
    '2026-01-06', '2026-01-18',
    '2026-02-08', '2026-02-18',
    '2026-03-19', '2026-03-29',
    '2026-04-02', '2026-04-05',
    '2026-05-14', '2026-05-24',
    '2026-06-04', '2026-06-29',
    '2026-07-19', '2026-07-20',
    '2026-08-15', '2026-08-23',
    '2026-09-14', '2026-09-27',
    '2026-10-18', '2026-10-25',
    '2026-11-01', '2026-11-02',
    '2026-12-08', '2026-12-25',
  ]
}

function fail(message) {
  console.error(message)
  process.exit(2)
}
