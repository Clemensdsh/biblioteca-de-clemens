import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { buildOffice1962DayFromExport } from '../../features/officium1962/parseDoOutput.ts'
import { normalizeLatinTechnical } from '../../features/officium1962/normalizeLatin.ts'
import { office1962HourNames } from '../../features/officium1962/schema.ts'

const year = 2026
const upstreamCommit = '515a213f79951c563be4f599ca591c63aa63bb6d'
const dates = [
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
const hours = [...office1962HourNames]
const results = []

for (const date of dates) {
  console.log(`sample oracle ${date}`)
  const exports = runExportBatch(date, hours)
  for (const hourName of hours) {
    const exported = exports.get(hourName)
    const day = buildOffice1962DayFromExport(exported)
    const hour = day.hours[hourName]
    const oracleLines = exported.units.flatMap(unit => htmlToLines(unit.html))
    let cursor = 0
    const blockResults = []
    for (const block of hour.blocks) {
      const candidateLines = normalizeLatinTechnical(block.text.join('\n')).split('\n').filter(Boolean)
      const found = findLinesInOrder(oracleLines, candidateLines, cursor)
      if (found >= 0) {
        blockResults.push({ blockId: block.id, type: block.type, status: 'exact' })
        cursor = found + Math.max(candidateLines.length, 1)
        continue
      }
      const normalizedFound = findLinesInOrder(oracleLines.map(normalizeForComparison), candidateLines.map(normalizeForComparison), cursor)
      if (normalizedFound >= 0) {
        blockResults.push({ blockId: block.id, type: block.type, status: 'normalized-equivalent' })
        cursor = normalizedFound + Math.max(candidateLines.length, 1)
        continue
      }
      blockResults.push({ blockId: block.id, type: block.type, status: 'mismatch', message: `Block text was not found after oracle line ${cursor}.` })
    }
    const counts = countStatuses(blockResults)
    results.push({
      date,
      hour: hourName,
      status: counts.mismatch ? 'mismatch' : counts.unresolved ? 'unresolved' : counts['normalized-equivalent'] ? 'normalized-equivalent' : 'exact',
      counts,
      blockResults,
    })
  }
}

const dateCounts = countStatuses(results)
const blockCounts = results.reduce((counts, result) => {
  for (const [status, count] of Object.entries(result.counts))
    counts[status] += count
  return counts
}, emptyCounts())
const releaseManifest = existsSync(`public/data/officium1962/years/${year}/manifest.json`)
  ? JSON.parse(readFileSync(`public/data/officium1962/years/${year}/manifest.json`, 'utf8'))
  : undefined
const report = {
  schemaVersion: 'officium1962.v1',
  generatedAt: new Date().toISOString(),
  upstreamCommit,
  year,
  fullOracleFixtures: readFixtureBaselines(),
  sampledOracleDates: dates,
  sampledDateHourCount: results.length,
  lightweightComparisonCount: releaseManifest?.dateHourCount || 0,
  summary: {
    dateCounts,
    blockCounts,
    mismatch: dateCounts.mismatch + blockCounts.mismatch,
    unresolved: dateCounts.unresolved + blockCounts.unresolved,
  },
  results,
}

writeJson(`public/data/officium1962/reports/year-${year}-oracle-summary.json`, report)
writeMarkdown(`docs/officium1962/reports/year-${year}-oracle-summary.md`, report)

if (report.summary.mismatch || report.summary.unresolved) {
  console.error(`year sample oracle failed: mismatch=${report.summary.mismatch}, unresolved=${report.summary.unresolved}`)
  process.exit(1)
}

console.log(`year sample oracle passed: date/hour exact=${dateCounts.exact}, block exact=${blockCounts.exact}, mismatch=0, unresolved=0`)

function runExportBatch(date, hours) {
  const tempName = `sample-${date}-${randomUUID()}.json`
  const hostTemp = join('.tmp-officium1962', tempName)
  mkdirSync(dirname(hostTemp), { recursive: true })
  const projectRoot = process.cwd().replaceAll('\\', '/')
  const containerOut = `/workspace/.tmp-officium1962/${tempName}`
  const command = `perl scripts/officium1962/do-export.pl --date=${shellQuote(date)} --hours=${shellQuote(hours.join(','))} --version=${shellQuote('Rubrics 1960 - 1960')} --language=Latin --upstream=/workspace/vendor/divinum-officium --commit=${shellQuote(upstreamCommit)} > ${shellQuote(containerOut)}`
  const result = spawnSync('docker', ['run', '--rm', '-v', `${projectRoot}:/workspace`, '-w', '/workspace', 'biblioteca-do-upstream:515a213f', '/bin/bash', '-lc', command], { encoding: 'buffer', maxBuffer: 120 * 1024 * 1024 })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    process.exit(result.status || 1)
  }
  try {
    const payload = JSON.parse(readFileSync(hostTemp, 'utf8').replace(/^\uFEFF/, ''))
    return new Map(hours.map(hour => [hour, payload.hours[hour]]))
  }
  finally {
    rmSync(hostTemp, { force: true })
  }
}

function htmlToLines(html) {
  return normalizeLatinTechnical(html)
    .replace(/<br\/?>/gi, '\n')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\{::\}/g, '')
    .split('\n')
    .map(line => normalizeLatinTechnical(line))
    .filter(Boolean)
}

function findLinesInOrder(haystack, needle, start) {
  if (!needle.length)
    return start
  for (let index = start; index <= haystack.length - needle.length; index += 1) {
    if (needle.every((line, offset) => haystack[index + offset] === line))
      return index
  }
  return -1
}

function normalizeForComparison(value) {
  return normalizeLatinTechnical(value).replace(/\s+/g, ' ').trim()
}

function countStatuses(items) {
  const counts = emptyCounts()
  for (const item of items)
    counts[item.status] += 1
  return counts
}

function emptyCounts() {
  return { exact: 0, 'normalized-equivalent': 0, 'expected-structural-difference': 0, mismatch: 0, unresolved: 0 }
}

function readFixtureBaselines() {
  return {
    completorium: readBaseline('completorium-oracle-comparison'),
    minorHours: readBaseline('minor-hours-oracle-comparison'),
    majorHours: readBaseline('major-hours-oracle-comparison'),
    matutinum: readBaseline('matutinum-oracle-comparison'),
  }
}

function readBaseline(name) {
  const report = JSON.parse(readFileSync(`public/data/officium1962/reports/${name}.json`, 'utf8'))
  return {
    dateHourExact: report.summary.dateCounts.exact,
    blockExact: report.summary.blockCounts.exact,
    mismatch: report.summary.blockCounts.mismatch + report.summary.dateCounts.mismatch,
    unresolved: report.summary.blockCounts.unresolved + report.summary.dateCounts.unresolved,
  }
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function writeMarkdown(path, report) {
  mkdirSync(dirname(path), { recursive: true })
  const lines = [
    '# Year 2026 Oracle Summary',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Upstream commit: ${report.upstreamCommit}`,
    `- Full oracle fixtures: Completorium ${report.fullOracleFixtures.completorium.dateHourExact}/${report.fullOracleFixtures.completorium.blockExact}; Minor ${report.fullOracleFixtures.minorHours.dateHourExact}/${report.fullOracleFixtures.minorHours.blockExact}; Major ${report.fullOracleFixtures.majorHours.dateHourExact}/${report.fullOracleFixtures.majorHours.blockExact}; Matutinum ${report.fullOracleFixtures.matutinum.dateHourExact}/${report.fullOracleFixtures.matutinum.blockExact}.`,
    `- Sample dates: ${report.sampledOracleDates.join(', ')}`,
    `- Sampled date/hour count: ${report.sampledDateHourCount}`,
    `- Lightweight comparison count: ${report.lightweightComparisonCount}`,
    `- Sample date/hour exact: ${report.summary.dateCounts.exact}`,
    `- Sample block exact: ${report.summary.blockCounts.exact}`,
    `- Sample block normalized-equivalent: ${report.summary.blockCounts['normalized-equivalent']}`,
    `- Mismatch: ${report.summary.mismatch}`,
    `- Unresolved: ${report.summary.unresolved}`,
    '',
    'The annual sample oracle invokes the pinned Divinum Officium Perl adapter locally for each fixed sample date and compares every structured block against the upstream resolved text stream in order.',
  ]
  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8')
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}
