import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { office1962HourNames } from '../../features/officium1962/schema.ts'

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/)
  return match ? [match[1], match[2]] : [arg.replace(/^--/, ''), true]
}))
const year = Number(args.year || 2026)
const schemaVersion = 'officium1962.v1'
const upstreamCommit = '515a213f79951c563be4f599ca591c63aa63bb6d'
const releaseRoot = join('public', 'data', 'officium1962')
const yearRoot = join(releaseRoot, 'years', String(year))
const reportRoot = join(releaseRoot, 'reports')
const errors = []
const warnings = []

if (!existsSync(join(releaseRoot, 'manifest.json'))) {
  console.log(`No Phase 6 release manifest found for ${year}; skipping validate-year until build-year has generated release data.`)
  process.exit(0)
}

const rootManifest = readJson(join(releaseRoot, 'manifest.json'))
const yearManifest = readJson(join(yearRoot, 'manifest.json'))
const calendar = readJson(join(yearRoot, 'calendar.json'))
const sharedManifest = readJson(join(releaseRoot, 'shared', 'manifest.json'))

expect(rootManifest.schemaVersion === schemaVersion, 'root manifest schemaVersion')
expect(yearManifest.schemaVersion === schemaVersion, 'year manifest schemaVersion')
expect(calendar.schemaVersion === schemaVersion, 'calendar schemaVersion')
expect(sharedManifest.schemaVersion === schemaVersion, 'shared manifest schemaVersion')
expect(rootManifest.upstreamCommit === upstreamCommit, 'root manifest upstream commit')
expect(yearManifest.upstreamCommit === upstreamCommit, 'year manifest upstream commit')
expect(sharedManifest.upstreamCommit === upstreamCommit, 'shared manifest upstream commit')

const expectedDates = datesInYear(year)
expect(yearManifest.dayCount === expectedDates.length, `expected ${expectedDates.length} days`)
expect(calendar.days?.length === expectedDates.length, `calendar has ${expectedDates.length} days`)
expect(JSON.stringify(calendar.days.map(day => day.date)) === JSON.stringify(expectedDates), 'calendar dates sorted and complete')

for (const item of yearManifest.days || [])
  expect(checksumFile(join(yearRoot, item.path)) === item.checksum, `checksum ${item.path}`)
for (const item of yearManifest.months || [])
  expect(checksumFile(join(yearRoot, item.path)) === item.checksum, `checksum ${item.path}`)
expect(checksumFile(join(yearRoot, yearManifest.calendar.path)) === yearManifest.calendar.checksum, 'calendar checksum')

const sharedBlocks = new Map()
const sharedChunks = new Set()
for (const chunk of sharedManifest.chunks || []) {
  const path = join(releaseRoot, 'shared', chunk.file)
  sharedChunks.add(chunk.file)
  expect(existsSync(path), `shared chunk exists ${chunk.file}`)
  expect(checksumFile(path) === chunk.checksum, `shared chunk checksum ${chunk.file}`)
  const data = readJson(path)
  for (const block of data.blocks || []) {
    const contentHash = sha256(canonicalStringify({
      sourceRefs: block.sourceRefs || [],
      text: block.text || [],
      title: block.title,
      type: block.type,
      rubricLines: block.rubricLines || [],
      verses: block.verses || [],
    }))
    expect(block.contentHash === contentHash, `contentHash ${block.id}`)
    expect(!sharedBlocks.has(block.id), `duplicate shared block ${block.id}`)
    sharedBlocks.set(block.id, block)
  }
}
expect(sharedBlocks.size === sharedManifest.blockCount, 'shared block count matches manifest')

const referencedBlocks = new Set()
let dateHourCount = 0
let occurrenceCount = 0
let sourceRefCount = 0
let forbiddenSourceCount = 0
let htmlLeakCount = 0
let nfcErrorCount = 0
let emptyCriticalCount = 0
const missingHours = []

for (const date of expectedDates) {
  const dayPath = join(yearRoot, 'days', `${date}.json`)
  expect(existsSync(dayPath), `day exists ${date}`)
  if (!existsSync(dayPath))
    continue
  const day = readJson(dayPath)
  expect(day.schemaVersion === schemaVersion, `${date} schemaVersion`)
  expect(day.date === date, `${date} civil date`)
  expect(day.upstreamCommit === upstreamCommit, `${date} upstream commit`)
  for (const hour of office1962HourNames) {
    const hourData = day.hours?.[hour]
    if (!hourData) {
      missingHours.push(`${date}/${hour}`)
      continue
    }
    dateHourCount += 1
    expect(Array.isArray(hourData.occurrences) && hourData.occurrences.length > 0, `${date}/${hour} occurrences`)
    const orders = hourData.occurrences.map(item => item.order)
    expect(new Set(orders).size === orders.length, `${date}/${hour} unique occurrence order`)
    for (const occurrence of hourData.occurrences) {
      occurrenceCount += 1
      referencedBlocks.add(occurrence.blockId)
      const block = sharedBlocks.get(occurrence.blockId)
      if (!block) {
        errors.push(`missing shared block ${date}/${hour}/${occurrence.blockId}`)
        continue
      }
      sourceRefCount += (block.sourceRefs || []).length
      if (!block.text?.length && !['heading', 'rubric', 'spacer'].includes(block.type))
        emptyCriticalCount += 1
      for (const line of [...(block.text || []), ...(block.rubricLines || [])]) {
        if (line !== line.normalize('NFC'))
          nfcErrorCount += 1
        if (/<\/?[a-z][^>]*>/i.test(line))
          htmlLeakCount += 1
      }
      for (const ref of block.sourceRefs || []) {
        if (ref.upstreamCommit !== upstreamCommit)
          errors.push(`bad sourceRef commit ${date}/${hour}/${occurrence.blockId}`)
        if (!ref.path)
          errors.push(`missing sourceRef path ${date}/${hour}/${occurrence.blockId}`)
        if (/Spanish|Espanol|Martyrologium1960|www\/missa|cgi-bin\/missa/i.test(ref.path))
          forbiddenSourceCount += 1
      }
    }
  }
}

expect(missingHours.length === 0, `missing hours: ${missingHours.slice(0, 10).join(', ')}`)
expect(dateHourCount === expectedDates.length * office1962HourNames.length, '2920 date/hour outputs')
expect(htmlLeakCount === 0, 'no HTML leakage')
expect(nfcErrorCount === 0, 'Unicode NFC')
expect(forbiddenSourceCount === 0, 'no forbidden Spanish/Martyrologium1960/missa refs')
expect(emptyCriticalCount === 0, 'no empty critical blocks')

const orphanBlocks = [...sharedBlocks.keys()].filter(id => !referencedBlocks.has(id))
expect(orphanBlocks.length === 0, 'no orphan shared blocks')

const validation = {
  schemaVersion,
  generatedAt: new Date().toISOString(),
  upstreamCommit,
  year,
  dayCount: expectedDates.length,
  dateHourCount,
  expectedDateHourCount: expectedDates.length * office1962HourNames.length,
  occurrenceCount,
  sharedBlockCount: sharedBlocks.size,
  referencedBlockCount: referencedBlocks.size,
  orphanBlockCount: orphanBlocks.length,
  sourceRefCount,
  sourceRefsComplete: errors.filter(item => item.includes('sourceRef')).length === 0,
  htmlLeakCount,
  nfcErrorCount,
  forbiddenSourceCount,
  missingHourCount: missingHours.length,
  errors,
  warnings,
}

mkdirSync(reportRoot, { recursive: true })
writeJson(join(reportRoot, `year-${year}-validation.json`), validation)
writeMarkdown(join('docs', 'officium1962', 'reports', `year-${year}-validation.md`), validation)

if (errors.length) {
  console.error(`validate-year failed with ${errors.length} error(s).`)
  for (const error of errors.slice(0, 50))
    console.error(`- ${error}`)
  process.exit(1)
}

console.log(`validate-year passed: ${expectedDates.length} days, ${dateHourCount} date/hour outputs, ${occurrenceCount} occurrences, ${sharedBlocks.size} shared blocks.`)

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function writeMarkdown(path, report) {
  mkdirSync(dirname(path), { recursive: true })
  const lines = [
    '# Year 2026 Validation',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Upstream commit: ${report.upstreamCommit}`,
    `- Days: ${report.dayCount}`,
    `- Date/hour outputs: ${report.dateHourCount}`,
    `- Occurrences: ${report.occurrenceCount}`,
    `- Shared blocks: ${report.sharedBlockCount}`,
    `- Referenced blocks: ${report.referencedBlockCount}`,
    `- Orphan blocks: ${report.orphanBlockCount}`,
    `- SourceRefs complete: ${report.sourceRefsComplete}`,
    `- HTML leaks: ${report.htmlLeakCount}`,
    `- NFC errors: ${report.nfcErrorCount}`,
    `- Forbidden source refs: ${report.forbiddenSourceCount}`,
    `- Missing hours: ${report.missingHourCount}`,
    `- Errors: ${report.errors.length}`,
    '',
  ]
  if (report.errors.length) {
    lines.push('## Errors', '')
    for (const error of report.errors)
      lines.push(`- ${error}`)
  }
  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8')
}

function expect(condition, message) {
  if (!condition)
    errors.push(message)
}

function checksumFile(path) {
  return sha256(readFileSync(path))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalStringify(value) {
  return JSON.stringify(stableObject(value))
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

function datesInYear(year) {
  const dates = []
  const cursor = new Date(`${year}-01-01T00:00:00Z`)
  while (cursor.getUTCFullYear() === year) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}
