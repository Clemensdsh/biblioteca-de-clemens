import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { buildOffice1962DayFromExport } from '../../features/officium1962/parseDoOutput.ts'
import { office1962HourNames } from '../../features/officium1962/schema.ts'

// These dates exercise concurrence, the Triduum, and a day whose whole office
// is replaced by the Office of the Dead. They are deliberately not just feast
// days with straightforward sanctoral precedence.
const defaultDates = ['2026-03-29', '2026-04-02', '2026-11-02']
const upstreamCommit = '515a213f79951c563be4f599ca591c63aa63bb6d'
const args = parseArgs(process.argv.slice(2))
const dates = String(args.dates || defaultDates.join(','))
  .split(',')
  .map(date => date.trim())
  .filter(Boolean)
const hours = String(args.hours || office1962HourNames.join(','))
  .split(/[\s,]+/)
  .map(hour => hour.trim())
  .filter(Boolean)
const reportName = String(args['report-name'] || 'release-edge-audit')

for (const hour of hours) {
  if (!office1962HourNames.includes(hour))
    throw new Error(`Unsupported hour: ${hour}`)
}

const shared = loadSharedBlocks()
const results = []

for (const date of dates) {
  console.log(`release audit ${date}`)
  const releaseDay = readJson(join('public', 'data', 'officium1962', 'years', date.slice(0, 4), 'days', `${date}.json`))
  const exportedHours = runExportBatch(date, hours)

  for (const hourName of hours) {
    const exported = exportedHours.get(hourName)
    if (!exported)
      throw new Error(`${date} upstream export omitted ${hourName}`)
    const expected = buildOffice1962DayFromExport(exported).hours[hourName]
    const actual = releaseDay.hours?.[hourName]
    if (!expected || !actual)
      throw new Error(`${date} ${hourName} is missing from ${expected ? 'the release' : 'the upstream parser'}`)

    const expectedBlocks = expected.blocks.map(blockIdentity)
    const actualBlocks = actual.occurrences.map((occurrence) => {
      const block = shared.get(occurrence.blockId)
      if (!block)
        throw new Error(`${date} ${hourName} references unavailable ${occurrence.blockId}`)
      return blockIdentity(block)
    })
    const blockMismatches = compareArrays(expectedBlocks, actualBlocks)
    const expectedOccurrences = expected.blocks.map(occurrenceIdentity)
    const actualOccurrences = actual.occurrences.map((occurrence) => {
      const { originalId, ...displayableMetadata } = occurrence.occurrenceMetadata || {}
      return stableObject({
        ...displayableMetadata,
        title: withoutGetunitOrdinal(displayableMetadata.title),
      })
    })
    const occurrenceMismatches = compareArrays(expectedOccurrences, actualOccurrences)
    const expectedHour = hourIdentity(expected)
    const actualHour = hourIdentity(actual)
    const hourMatches = canonicalStringify(expectedHour) === canonicalStringify(actualHour)
    const status = !hourMatches || blockMismatches.length || occurrenceMismatches.length ? 'mismatch' : 'exact'

    results.push({
      date,
      hour: hourName,
      status,
      expectedBlockCount: expectedBlocks.length,
      actualBlockCount: actualBlocks.length,
      hourMatches,
      blockMismatches,
      occurrenceMismatches,
    })
  }
}

const report = {
  schemaVersion: 'officium1962.v1',
  generatedAt: new Date().toISOString(),
  upstreamCommit,
  comparison: 'The persisted site release is reconstructed from its shared-block chunks and compared with a fresh parse of the pinned Divinum Officium output. Internal occurrence IDs and Divinum Officium getunit ordinals such as [6] are intentionally excluded because they are run-local identifiers, not liturgical text.',
  dates,
  hours,
  summary: {
    dateHourCount: results.length,
    exact: results.filter(result => result.status === 'exact').length,
    mismatch: results.filter(result => result.status === 'mismatch').length,
    comparedBlocks: results.reduce((sum, result) => sum + result.actualBlockCount, 0),
    blockMismatchCount: results.reduce((sum, result) => sum + result.blockMismatches.length, 0),
    occurrenceMismatchCount: results.reduce((sum, result) => sum + result.occurrenceMismatches.length, 0),
  },
  results,
}

writeJson(join('public', 'data', 'officium1962', 'reports', `${reportName}.json`), report)
writeMarkdown(join('docs', 'officium1962', 'reports', `${reportName}.md`), report)

if (report.summary.mismatch) {
  console.error(`release audit failed: ${report.summary.mismatch} of ${report.summary.dateHourCount} date/hour comparisons differ`)
  process.exit(1)
}

console.log(`release audit passed: ${report.summary.exact} date/hour outputs, ${report.summary.comparedBlocks} blocks, 0 mismatches`)

function loadSharedBlocks() {
  const manifest = readJson(join('public', 'data', 'officium1962', 'shared', 'manifest.json'))
  const blocks = new Map()
  for (const chunk of manifest.chunks || []) {
    const data = readJson(join('public', 'data', 'officium1962', 'shared', chunk.file))
    for (const block of data.blocks || [])
      blocks.set(block.id, block)
  }
  return blocks
}

function runExportBatch(date, requestedHours) {
  const tempName = `release-audit-${date}-${randomUUID()}.json`
  const hostTemp = join('.tmp-officium1962', tempName)
  mkdirSync(dirname(hostTemp), { recursive: true })
  const projectRoot = process.cwd().replaceAll('\\', '/')
  const containerOut = `/workspace/.tmp-officium1962/${tempName}`
  const command = `perl scripts/officium1962/do-export.pl --date=${shellQuote(date)} --hours=${shellQuote(requestedHours.join(','))} --version=${shellQuote('Rubrics 1960 - 1960')} --language=Latin --upstream=/workspace/vendor/divinum-officium --commit=${shellQuote(upstreamCommit)} > ${shellQuote(containerOut)}`
  const result = spawnSync('docker', ['run', '--rm', '-v', `${projectRoot}:/workspace`, '-w', '/workspace', 'biblioteca-do-upstream:515a213f', '/bin/bash', '-lc', command], { encoding: 'buffer', maxBuffer: 120 * 1024 * 1024 })
  if (result.status !== 0) {
    if (result.error)
      throw result.error
    if (result.stderr)
      process.stderr.write(result.stderr)
    if (result.stdout)
      process.stderr.write(result.stdout)
    throw new Error(`Docker export failed for ${date} with status ${result.status ?? 'unknown'}`)
  }
  try {
    const payload = readJson(hostTemp)
    return new Map(requestedHours.map(hour => [hour, payload.hours?.[hour]]))
  }
  finally {
    rmSync(hostTemp, { force: true })
  }
}

function blockIdentity(block) {
  return stableObject({
    type: block.type,
    title: withoutGetunitOrdinal(block.title),
    text: block.text || [],
    verses: block.verses || [],
    rubricLines: block.rubricLines || [],
    sourceRefs: stableSourceRefs((block.sourceRefs || []).map(ref => ({
      ...ref,
      section: withoutGetunitOrdinal(ref.section),
    }))),
  })
}

function occurrenceIdentity(block) {
  return stableObject({
    type: block.type,
    title: withoutGetunitOrdinal(block.title),
    metadata: block.metadata || {},
    warnings: block.warnings || [],
  })
}

function hourIdentity(hour) {
  return stableObject({
    name: hour.name,
    title: hour.title,
    metadata: hour.metadata || {},
    sourceRefs: stableSourceRefs(hour.sourceRefs || []),
    warnings: hour.warnings || [],
  })
}

function compareArrays(expected, actual) {
  const mismatches = []
  const max = Math.max(expected.length, actual.length)
  for (let index = 0; index < max; index += 1) {
    if (canonicalStringify(expected[index]) !== canonicalStringify(actual[index])) {
      mismatches.push({
        index,
        expected: expected[index] ? summarize(expected[index]) : undefined,
        actual: actual[index] ? summarize(actual[index]) : undefined,
      })
    }
  }
  return mismatches
}

function summarize(value) {
  return stableObject({
    type: value.type,
    title: value.title,
    firstTextLine: value.text?.[0],
    originalId: value.originalId,
  })
}

function withoutGetunitOrdinal(value) {
  return typeof value === 'string'
    ? value.replace(/\s+\[\d+\]$/, '')
    : value
}

function stableSourceRefs(refs) {
  return [...refs]
    .map(stableObject)
    .sort((left, right) => canonicalStringify(left).localeCompare(canonicalStringify(right)))
}

function stableObject(value) {
  if (Array.isArray(value))
    return value.map(stableObject)
  if (!value || typeof value !== 'object')
    return value
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => [key, stableObject(item)]))
}

function canonicalStringify(value) {
  return JSON.stringify(stableObject(value))
}

function readJson(path) {
  if (!existsSync(path))
    throw new Error(`Required file does not exist: ${path}`)
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''))
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(stableObject(value), null, 2)}\n`, 'utf8')
}

function writeMarkdown(path, report) {
  const lines = [
    '# Release Edge Audit',
    '',
    `- Upstream commit: ${report.upstreamCommit}`,
    `- Dates: ${report.dates.join(', ')}`,
    `- Hours: ${report.hours.join(', ')}`,
    `- Date/hour comparisons: ${report.summary.dateHourCount}`,
    `- Blocks compared: ${report.summary.comparedBlocks}`,
    `- Mismatches: ${report.summary.mismatch}`,
    '',
    report.comparison,
  ]
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8')
}

function parseArgs(argv) {
  return Object.fromEntries(argv.map((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/)
    return match ? [match[1], match[2]] : [arg.replace(/^--/, ''), true]
  }))
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}
