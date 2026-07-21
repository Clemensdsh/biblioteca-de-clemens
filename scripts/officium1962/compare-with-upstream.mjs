import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { buildOffice1962DayFromExport } from '../../features/officium1962/parseDoOutput.ts'
import { normalizeLatinTechnical } from '../../features/officium1962/normalizeLatin.ts'

const defaultDates = [
  '2026-07-20',
  '2026-07-19',
  '2026-04-02',
  '2026-04-05',
  '2026-08-15',
  '2026-11-02',
  '2026-12-25',
]

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/)
  return match ? [match[1], match[2]] : [arg, true]
}))

const dates = String(args.dates || defaultDates.join(','))
  .split(',')
  .map(date => date.trim())
  .filter(Boolean)

const results = []

for (const date of dates) {
  const exported = loadOrRunExport(date)
  const day = buildOffice1962DayFromExport(exported)
  const hour = day.hours.completorium
  if (!hour)
    throw new Error(`${date} did not produce Completorium`)

  const oracleLines = exported.units.flatMap(unit => htmlToLines(unit.html))
  let cursor = 0
  const blockResults = []

  for (const block of hour.blocks) {
    const candidateLines = normalizeLatinTechnical(block.text.join('\n')).split('\n').filter(Boolean)
    const found = findLinesInOrder(oracleLines, candidateLines, cursor)
    if (found >= 0) {
      blockResults.push({
        blockId: block.id,
        type: block.type,
        status: 'exact',
      })
      cursor = found + Math.max(candidateLines.length, 1)
      continue
    }

    const normalizedFound = findLinesInOrder(
      oracleLines.map(normalizeForComparison),
      candidateLines.map(normalizeForComparison),
      cursor,
    )
    if (normalizedFound >= 0) {
      blockResults.push({
        blockId: block.id,
        type: block.type,
        status: 'normalized-equivalent',
      })
      cursor = normalizedFound + Math.max(candidateLines.length, 1)
      continue
    }

    blockResults.push({
      blockId: block.id,
      type: block.type,
      status: 'mismatch',
      message: `Block text was not found in upstream output after oracle line ${cursor}.`,
    })
  }

  const counts = countStatuses(blockResults)
  const status = counts.mismatch > 0
    ? 'mismatch'
    : counts.unresolved > 0
      ? 'unresolved'
      : counts['expected-structural-difference'] > 0
        ? 'expected-structural-difference'
        : counts['normalized-equivalent'] > 0
          ? 'normalized-equivalent'
          : 'exact'

  results.push({
    date,
    hour: 'completorium',
    status,
    blockResults,
    counts,
    notes: [
      'Oracle source is the pinned Divinum Officium Perl engine through the local adapter, using Rubrics 1960 - 1960 and Latin.',
      'Comparison is performed per structured block against the normalized upstream resolved text stream, not as one whole HTML string.',
    ],
  })
}

const dateCounts = countStatuses(results)
const blockCounts = results.reduce((counts, result) => {
  for (const [status, count] of Object.entries(result.counts))
    counts[status] += count
  return counts
}, emptyCounts())
const report = {
  schemaVersion: '0.1.0',
  generatedAt: new Date().toISOString(),
  upstreamCommit: firstCommit(results),
  dates,
  summary: {
    dateCounts,
    blockCounts,
  },
  results,
}

writeJson('public/data/officium1962/reports/completorium-oracle-comparison.json', report)
writeMarkdown('docs/officium1962/reports/completorium-oracle-comparison.md', report)

const failed = results.filter(result => result.status === 'mismatch' || result.status === 'unresolved')
if (failed.length) {
  console.error(`Completorium oracle comparison failed for ${failed.length} date(s).`)
  process.exit(1)
}

console.log(`Completorium oracle comparison passed: dates exact=${dateCounts.exact}, blocks exact=${blockCounts.exact}, normalized-equivalent=${blockCounts['normalized-equivalent']}, mismatch=${blockCounts.mismatch}, unresolved=${blockCounts.unresolved}`)

function loadOrRunExport(date) {
  const rawPath = join('public', 'data', 'officium1962', 'experimental', 'days', date, 'raw', 'completorium-export.json')
  if (existsSync(rawPath))
    return JSON.parse(readFileSync(rawPath, 'utf8'))

  const result = spawnSync(
    process.execPath,
    ['scripts/officium1962/run-do-export.mjs', `--date=${date}`, '--hour=completorium'],
    { encoding: 'buffer', maxBuffer: 40 * 1024 * 1024 },
  )
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    process.exit(result.status || 1)
  }
  return JSON.parse(result.stdout.toString('utf8').replace(/^\uFEFF/, ''))
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
  if (needle.length === 0)
    return start
  for (let index = start; index <= haystack.length - needle.length; index += 1) {
    let matched = true
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) {
        matched = false
        break
      }
    }
    if (matched)
      return index
  }
  return -1
}

function normalizeForComparison(value) {
  return normalizeLatinTechnical(value)
    .replace(/\s+/g, ' ')
    .trim()
}

function countStatuses(items) {
  const counts = emptyCounts()
  for (const item of items)
    counts[item.status] += 1
  return counts
}

function emptyCounts() {
  return {
    exact: 0,
    'normalized-equivalent': 0,
    'expected-structural-difference': 0,
    mismatch: 0,
    unresolved: 0,
  }
}

function firstCommit() {
  for (const date of dates) {
    const rawPath = join('public', 'data', 'officium1962', 'experimental', 'days', date, 'raw', 'completorium-export.json')
    if (existsSync(rawPath))
      return JSON.parse(readFileSync(rawPath, 'utf8')).upstreamCommit
  }
  return 'unknown'
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function writeMarkdown(path, report) {
  mkdirSync(dirname(path), { recursive: true })
  const lines = [
    '# Completorium Oracle Comparison',
    '',
    `Generated: ${report.generatedAt}`,
    `Upstream commit: ${report.upstreamCommit}`,
    '',
    '## Summary',
    '',
    `- date exact: ${report.summary.dateCounts.exact}`,
    `- date normalized-equivalent: ${report.summary.dateCounts['normalized-equivalent']}`,
    `- date expected-structural-difference: ${report.summary.dateCounts['expected-structural-difference']}`,
    `- date mismatch: ${report.summary.dateCounts.mismatch}`,
    `- date unresolved: ${report.summary.dateCounts.unresolved}`,
    `- block exact: ${report.summary.blockCounts.exact}`,
    `- block normalized-equivalent: ${report.summary.blockCounts['normalized-equivalent']}`,
    `- block expected-structural-difference: ${report.summary.blockCounts['expected-structural-difference']}`,
    `- block mismatch: ${report.summary.blockCounts.mismatch}`,
    `- block unresolved: ${report.summary.blockCounts.unresolved}`,
    '',
    '## Dates',
    '',
  ]

  for (const result of report.results) {
    lines.push(`### ${result.date}`)
    lines.push('')
    lines.push(`Status: ${result.status}`)
    lines.push('')
    lines.push(`Counts: exact ${result.counts.exact}; normalized-equivalent ${result.counts['normalized-equivalent']}; expected-structural-difference ${result.counts['expected-structural-difference']}; mismatch ${result.counts.mismatch}; unresolved ${result.counts.unresolved}.`)
    const problems = result.blockResults.filter(block => block.status === 'mismatch' || block.status === 'unresolved')
    if (problems.length) {
      lines.push('')
      lines.push('Problems:')
      for (const problem of problems)
        lines.push(`- ${problem.blockId}: ${problem.status}${problem.message ? `; ${problem.message}` : ''}`)
    }
    lines.push('')
  }

  lines.push('## Method')
  lines.push('')
  lines.push('The oracle is the pinned Divinum Officium Perl engine at the recorded commit, invoked through the local adapter with Latin and Rubrics 1960 - 1960. The comparison checks each structured Completorium block against the upstream resolved text stream in order. It does not compare screenshots or one full HTML blob.')
  lines.push('')
  lines.push('The upstream Perl pipeline has already resolved many source inclusions before export, so this comparison verifies textual and structural preservation. Per-block source file references are produced separately by the structured exporter.')

  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8')
}
