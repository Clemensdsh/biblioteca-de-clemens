import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

export const CORPUS_SCHEMA_VERSION = 'officium1962.translation-corpus.v1'
export const RELEASE_SCHEMA_VERSION = 'officium1962.v1'
export const UPSTREAM_COMMIT = '515a213f79951c563be4f599ca591c63aa63bb6d'
export const PRODUCTION_COMMIT = '10d951f5901a6d2991063763d7b7d471566c688a'
export const EXTRACTION_TIMESTAMP = '2026-07-22T12:32:51-04:00'
export const RELEASE_YEAR = 2026
export const HOUR_ORDER = ['matutinum', 'laudes', 'prima', 'tertia', 'sexta', 'nona', 'vesperae', 'completorium']
export const TRANSLATION_STATUSES = ['untranslated', 'draft', 'machine-draft', 'reviewed', 'approved']

const ROOT = resolve(import.meta.dirname, '../..')
export const DEFAULT_RELEASE_ROOT = join(ROOT, 'public/data/officium1962')
export const DEFAULT_OUTPUT_ROOT = join(ROOT, 'resources/officium1962-latin')
const MAX_CONTEXTS = 10
const CSV_PREVIEW_LENGTH = 160
const REQUIRED_BUCKETS = [
  'absolution',
  'antiphon',
  'blessing',
  'canticle',
  'capitulum',
  'chapter-office',
  'commemoration',
  'dialogue',
  'heading',
  'hymn',
  'invitatory',
  'martyrology-placeholder',
  'other',
  'prayer',
  'pretiosa',
  'psalm',
  'reading',
  'responsory',
  'rubric',
  'te-deum',
  'versicle',
]

export function extractTranslationCorpus(options = {}) {
  const releaseRoot = resolve(options.releaseRoot || DEFAULT_RELEASE_ROOT)
  const outputRoot = resolve(options.outputRoot || DEFAULT_OUTPUT_ROOT)
  const existingTemplate = loadTranslationState(outputRoot)
  const model = buildCorpusModel({ releaseRoot, translationState: existingTemplate })
  const parent = dirname(outputRoot)
  const tempRoot = join(parent, `.${basename(outputRoot)}.tmp-${process.pid}`)
  const backupRoot = join(parent, `.${basename(outputRoot)}.backup-${process.pid}`)

  mkdirSync(parent, { recursive: true })
  rmSync(tempRoot, { recursive: true, force: true })
  rmSync(backupRoot, { recursive: true, force: true })

  try {
    writeCorpusModel(tempRoot, model)
    const validation = validateTranslationCorpus({ releaseRoot, outputRoot: tempRoot, checkDeterminism: true })
    if (!validation.valid)
      throw new Error(`Generated corpus failed validation:\n${validation.errors.join('\n')}`)
    if (existsSync(outputRoot))
      renameSync(outputRoot, backupRoot)
    renameSync(tempRoot, outputRoot)
    rmSync(backupRoot, { recursive: true, force: true })
  }
  catch (error) {
    rmSync(tempRoot, { recursive: true, force: true })
    if (!existsSync(outputRoot) && existsSync(backupRoot))
      renameSync(backupRoot, outputRoot)
    throw error
  }

  return model.manifest
}

export function buildCorpusModel({ releaseRoot = DEFAULT_RELEASE_ROOT, translationState = new Map() } = {}) {
  const release = loadRelease(resolve(releaseRoot))
  const aggregates = new Map()
  const derived = new Map()
  const calendarRows = []
  const pageTitle = addDerived(derived, {
    prefix: 'interface-label',
    latin: 'Officium Romanum 1962',
    type: 'heading',
    subtype: 'interface-label',
    sourceRefs: [localDisplaySource('pages/officium-1962/index.vue', 'h1')],
  })
  addOccurrence(pageTitle, {
    occurrenceId: 'production-page-officium-romanum-1962-title',
    date: 'production-page',
    hour: 'interface',
    order: 0,
    role: 'page-title',
  }, {
    date: 'production-page',
    hour: 'interface',
    blockOrder: 0,
    occurrenceRole: 'page-title',
  })

  for (const block of release.blocks.values()) {
    aggregates.set(block.id, createAggregate({
      id: block.id,
      contentHash: block.contentHash,
      latin: composeSharedLatin(block),
      type: block.type,
      subtype: 'shared-block',
      sourceRefs: block.sourceRefs,
      segments: {
        title: block.title || '',
        text: block.text || [],
        verses: block.verses || [],
        rubricLines: block.rubricLines || [],
      },
      sharedBlock: true,
    }))
  }

  for (const dayEntry of release.yearManifest.days) {
    const day = release.days.get(dayEntry.date)
    const calendarDay = release.calendarByDate.get(day.date)
    const rank = parseRank(day.rank || calendarDay.rank || '')
    const dayRefs = nonEmptyRefs(day.sourceRefs)
    const titleAggregate = addDerived(derived, {
      prefix: 'calendar-title',
      latin: day.liturgicalTitle,
      type: 'heading',
      subtype: 'calendar-title',
      sourceRefs: dayRefs,
    })
    addOccurrence(titleAggregate, {
      occurrenceId: `calendar-${day.date}-title`,
      date: day.date,
      hour: 'calendar',
      order: 0,
      role: 'calendar-title',
    }, contextFor(day, calendarDay, rank, 'calendar', 0, 'calendar-title'))

    const rankAggregate = rank
      ? addDerived(derived, {
          prefix: 'rank',
          latin: rank,
          type: 'heading',
          subtype: 'rank',
          sourceRefs: dayRefs,
        })
      : undefined
    if (rankAggregate) {
      addOccurrence(rankAggregate, {
        occurrenceId: `calendar-${day.date}-rank`,
        date: day.date,
        hour: 'calendar',
        order: 0,
        role: 'rank',
      }, contextFor(day, calendarDay, rank, 'calendar', 0, 'rank'))
    }

    const commemorationMap = new Map()
    for (const hourName of HOUR_ORDER) {
      const hour = day.hours[hourName]
      if (!hour)
        throw new Error(`${day.date} is missing ${hourName}`)
      const hourRefs = nonEmptyRefs(hour.sourceRefs, dayRefs)
      const hourTitleAggregate = addDerived(derived, {
        prefix: 'hour-title',
        latin: hour.title,
        type: 'heading',
        subtype: 'hour-title',
        sourceRefs: hourRefs,
      })
      addOccurrence(hourTitleAggregate, {
        occurrenceId: `calendar-${day.date}-${hourName}-title`,
        date: day.date,
        hour: hourName,
        order: 0,
        role: 'hour-title',
      }, contextFor(day, calendarDay, rank, hourName, 0, 'hour-title'))

      hour.occurrences.forEach((occurrence, index) => {
        const block = release.blocks.get(occurrence.blockId)
        if (!block)
          throw new Error(`Missing shared block ${occurrence.blockId} for ${day.date} ${hourName}`)
        const metadata = occurrence.occurrenceMetadata?.metadata || {}
        const occurrenceTitle = occurrence.occurrenceMetadata?.title || block.title || ''
        const role = occurrenceRole(block.type, metadata)
        const vespersKind = hourName === 'vesperae' ? classifyVespers(metadata, hour.metadata || {}) : undefined
        const previous = hour.occurrences[index - 1]?.blockId
        const next = hour.occurrences[index + 1]?.blockId
        const mapItem = stableObject({
          occurrenceId: occurrence.occurrenceId,
          date: day.date,
          hour: hourName,
          order: occurrence.order,
          role,
          title: occurrenceTitle || undefined,
          nocturn: numeric(metadata.nocturn),
          lessonNumber: numeric(metadata.lessonNumber),
          responsoryNumber: numeric(metadata.responsoryNumber),
          vespersKind,
          primaRole: hourName === 'prima' ? primaRole(block.type, metadata) : undefined,
        })
        const context = stableObject({
          date: day.date,
          hour: hourName,
          celebrationTitle: day.liturgicalTitle,
          rank: rank || undefined,
          season: calendarDay.season || undefined,
          blockOrder: occurrence.order,
          previousBlockId: previous,
          nextBlockId: next,
          nocturn: numeric(metadata.nocturn),
          lessonNumber: numeric(metadata.lessonNumber),
          responsoryNumber: numeric(metadata.responsoryNumber),
          occurrenceRole: role,
          vespersKind,
          readingKind: typeof metadata.readingKind === 'string' ? metadata.readingKind : undefined,
        })
        const aggregate = aggregates.get(block.id)
        addOccurrence(aggregate, mapItem, context)

        if (occurrenceTitle && occurrenceTitle !== block.title && !composeSharedLatin(block).split('\n').includes(occurrenceTitle)) {
          const titleEntry = addDerived(derived, {
            prefix: 'occurrence-title',
            latin: occurrenceTitle,
            type: 'heading',
            subtype: 'occurrence-title',
            sourceRefs: block.sourceRefs,
          })
          addOccurrence(titleEntry, { ...mapItem, occurrenceId: `${occurrence.occurrenceId}-title`, role: 'occurrence-title' }, context)
        }

        const commemorationTitle = typeof metadata.commemorationTitle === 'string'
          ? metadata.commemorationTitle
          : block.type === 'commemoration' ? occurrenceTitle : undefined
        if (commemorationTitle) {
          const titleEntry = occurrenceTitle !== block.title
            ? addDerived(derived, {
                prefix: 'commemoration-title',
                latin: commemorationTitle,
                type: 'heading',
                subtype: 'commemoration-title',
                sourceRefs: block.sourceRefs,
              })
            : aggregate
          commemorationMap.set(titleEntry.id, {
            id: titleEntry.id,
            title: commemorationTitle,
            sourceRefs: titleEntry.sourceRefs,
          })
        }
      })
    }

    if (commemorationMap.size) {
      const commemorationLabel = addDerived(derived, {
        prefix: 'interface-label',
        latin: 'Commemorationes',
        type: 'heading',
        subtype: 'interface-label',
        sourceRefs: [localDisplaySource('components/officium1962/Office1962Viewer.vue', 'officium1962-commemorations')],
      })
      addOccurrence(commemorationLabel, {
        occurrenceId: `calendar-${day.date}-commemorationes-label`,
        date: day.date,
        hour: 'calendar',
        order: 0,
        role: 'commemoration-heading',
      }, contextFor(day, calendarDay, rank, 'calendar', 0, 'commemoration-heading'))
    }

    calendarRows.push(stableObject({
      date: day.date,
      titleId: titleAggregate.id,
      liturgicalTitle: day.liturgicalTitle,
      titleOccurrenceCount: 0,
      rankId: rankAggregate?.id,
      rank: rank || null,
      rankRaw: day.rank || calendarDay.rank || null,
      rankOccurrenceCount: 0,
      commemorations: [...commemorationMap.values()].sort((a, b) => a.id.localeCompare(b.id)),
      season: calendarDay.season || null,
      color: calendarDay.color || null,
      sourceRefs: dayRefs,
    }))
  }

  for (const [id, item] of derived)
    aggregates.set(id, item)

  const corpus = [...aggregates.values()]
    .map(finalizeAggregate)
    .sort((a, b) => a.id.localeCompare(b.id))
  const corpusById = new Map(corpus.map(entry => [entry.id, entry]))
  for (const row of calendarRows) {
    row.titleOccurrenceCount = corpusById.get(row.titleId)?.occurrenceCount || 0
    row.rankOccurrenceCount = row.rankId ? corpusById.get(row.rankId)?.occurrenceCount || 0 : 0
  }

  const { template, deprecated } = mergeTranslations(corpus, translationState)
  const templateById = new Map(template.map(entry => [entry.id, entry]))
  for (const entry of corpus) {
    const translation = templateById.get(entry.id)
    entry.translation = stableObject({
      language: 'zh-Hans',
      text: translation.translation,
      status: translation.status,
      translator: translation.translator || undefined,
      reviewer: translation.reviewer || undefined,
      notes: translation.notes || undefined,
    })
  }

  const byType = Object.fromEntries(REQUIRED_BUCKETS.map(bucket => [bucket, []]))
  for (const entry of corpus) {
    const bucket = typeBucket(entry.type)
    byType[bucket] ||= []
    byType[bucket].push(entry)
  }
  const sourceMap = Object.fromEntries(corpus.map(entry => [entry.id, entry.sourceRefs]))
  const occurrenceMap = Object.fromEntries(corpus.map(entry => [entry.id, entry._occurrences]))
  for (const entry of corpus)
    delete entry._occurrences

  const duplicates = classifyDuplicates(corpus)
  const stats = corpusStatistics(corpus, release, calendarRows, duplicates, template)
  const primaryFiles = buildPrimaryFiles({ corpus, template, byType, sourceMap, occurrenceMap, calendarRows, deprecated })
  const outputHashes = Object.fromEntries(Object.entries(primaryFiles).map(([path, content]) => [path, sha256(content)]))
  const manifest = stableObject({
    schemaVersion: CORPUS_SCHEMA_VERSION,
    releaseSchemaVersion: RELEASE_SCHEMA_VERSION,
    upstreamCommit: UPSTREAM_COMMIT,
    productionCommit: PRODUCTION_COMMIT,
    releaseYear: RELEASE_YEAR,
    extractedAt: EXTRACTION_TIMESTAMP,
    sourceRoot: 'public/data/officium1962',
    canonicalCorpus: 'corpus.jsonl',
    editableTranslationTemplate: 'translation-template.zh-Hans.jsonl',
    counts: stats.counts,
    outputHashes,
  })
  const reports = buildReports({ stats, duplicates, manifest, deprecated })
  const docs = buildResourceDocs()

  return { corpus, template, byType, sourceMap, occurrenceMap, calendarRows, deprecated, duplicates, stats, primaryFiles, manifest, reports, docs }
}

export function validateTranslationCorpus(options = {}) {
  const releaseRoot = resolve(options.releaseRoot || DEFAULT_RELEASE_ROOT)
  const outputRoot = resolve(options.outputRoot || DEFAULT_OUTPUT_ROOT)
  const errors = []
  const warnings = []
  let model

  try {
    const translationState = loadTranslationState(outputRoot)
    model = buildCorpusModel({ releaseRoot, translationState })
    const actualCorpus = readJsonLines(join(outputRoot, 'corpus.jsonl'))
    const actualTemplate = readJsonLines(join(outputRoot, 'translation-template.zh-Hans.jsonl'))
    const actualCalendar = readJsonLines(join(outputRoot, 'calendar-titles.jsonl'))
    const actualManifest = readJson(join(outputRoot, 'manifest.json'))
    const actualSourceMap = readJson(join(outputRoot, 'source-map.json'))
    const actualOccurrenceMap = readJson(join(outputRoot, 'occurrence-map.json'))

    compareIds('corpus', actualCorpus, model.corpus, errors)
    compareIds('translation template', actualTemplate, model.template, errors)
    if (actualCalendar.length !== 365)
      errors.push(`calendar-titles has ${actualCalendar.length} rows, expected 365`)
    if (actualManifest.schemaVersion !== CORPUS_SCHEMA_VERSION)
      errors.push(`manifest schema is ${actualManifest.schemaVersion}`)
    if (actualManifest.upstreamCommit !== UPSTREAM_COMMIT)
      errors.push('manifest upstream commit mismatch')

    const release = loadRelease(releaseRoot)
    const corpusById = new Map(actualCorpus.map(entry => [entry.id, entry]))
    const templateById = new Map(actualTemplate.map(entry => [entry.id, entry]))
    let sharedOccurrenceCount = 0
    let sourceComplete = 0
    for (const block of release.blocks.values()) {
      const entry = corpusById.get(block.id)
      if (!entry) {
        errors.push(`release block ${block.id} is absent from corpus`)
        continue
      }
      if (entry.contentHash !== block.contentHash)
        errors.push(`${block.id} contentHash mismatch`)
      if (sha256(canonicalStringify(sharedIdentity(block))) !== block.contentHash)
        errors.push(`${block.id} release contentHash cannot be reproduced`)
      if (canonicalStringify(actualSourceMap[block.id]) !== canonicalStringify(block.sourceRefs))
        errors.push(`${block.id} sourceRefs changed`)
      const occurrences = actualOccurrenceMap[block.id]
      if (!Array.isArray(occurrences))
        errors.push(`${block.id} occurrence map missing`)
      else
        sharedOccurrenceCount += occurrences.length
    }
    if (sharedOccurrenceCount !== release.releaseOccurrenceCount)
      errors.push(`shared occurrence coverage ${sharedOccurrenceCount}, expected ${release.releaseOccurrenceCount}`)

    for (const entry of actualCorpus) {
      if (entry.id !== entry.id.normalize('NFC') || entry.latin !== entry.latin.normalize('NFC'))
        errors.push(`${entry.id} is not Unicode NFC`)
      if (!entry.latin || !entry.latin.trim())
        errors.push(`${entry.id} has empty Latin`)
      if (containsHtml(entry.latin))
        errors.push(`${entry.id} contains HTML`)
      if (/Spanish|Martyrologium1960|(?:^|\/)missa(?:\/|$)/i.test(entry.latin))
        errors.push(`${entry.id} contains forbidden corpus text`)
      if (!templateById.has(entry.id))
        errors.push(`${entry.id} has no translation template entry`)
      if (!Array.isArray(actualSourceMap[entry.id]) || !actualSourceMap[entry.id].length)
        errors.push(`${entry.id} source map is empty`)
      else
        sourceComplete++
      if (!Array.isArray(actualOccurrenceMap[entry.id]) || actualOccurrenceMap[entry.id].length !== entry.occurrenceCount)
        errors.push(`${entry.id} occurrence count mismatch`)
      if (entry.subtype !== 'shared-block') {
        const expected = derivedContentHash(entry.type, entry.subtype, entry.latin, entry.sourceRefs)
        if (entry.contentHash !== expected)
          errors.push(`${entry.id} derived contentHash mismatch`)
      }
    }
    if (sourceComplete !== actualCorpus.length)
      errors.push(`sourceRefs complete for ${sourceComplete}/${actualCorpus.length} entries`)
    const sourceMapText = JSON.stringify(actualSourceMap)
    if (/Spanish|Martyrologium1960|web\/(?:www|cgi-bin)\/missa/i.test(sourceMapText))
      errors.push('source-map contains a forbidden Spanish, Martyrologium1960, or missa path')

    let byTypeCount = 0
    for (const [bucket, entries] of Object.entries(model.byType)) {
      const actual = readJsonLines(join(outputRoot, 'by-type', `${bucket}.jsonl`))
      byTypeCount += actual.length
      compareIds(`by-type/${bucket}`, actual, entries, errors)
    }
    if (byTypeCount !== actualCorpus.length)
      errors.push(`by-type count ${byTypeCount}, expected ${actualCorpus.length}`)

    const csvRows = parseCsvRows(readFileSync(join(outputRoot, 'index.csv'), 'utf8').replace(/^\uFEFF/, ''))
    if (csvRows.length - 1 !== actualCorpus.length)
      errors.push(`CSV count ${csvRows.length - 1}, expected ${actualCorpus.length}`)

    if (options.checkDeterminism !== false) {
      for (const [path, expected] of Object.entries(model.primaryFiles)) {
        const actual = readFileSync(join(outputRoot, path), path === 'index.csv' ? 'utf8' : 'utf8')
        if (actual !== expected)
          errors.push(`${path} is not the deterministic extractor output`)
      }
    }

    const protectedCharacters = ['æ', 'á', 'ǽ', '℣.', '℟.', '†', '*']
    const joinedLatin = actualCorpus.map(entry => entry.latin).join('\n')
    for (const marker of protectedCharacters) {
      if (!joinedLatin.includes(marker))
        errors.push(`protected Latin marker ${marker} is absent`)
    }
    const productionFiles = [
      join(ROOT, 'pages/officium-1962/index.vue'),
      join(ROOT, 'components/officium1962/Office1962Viewer.vue'),
      join(ROOT, 'components/officium1962/LiturgicalBlockRenderer.vue'),
      join(ROOT, 'features/officium1962/runtime/index.ts'),
      join(ROOT, 'valaxy.config.ts'),
      join(ROOT, 'vite.config.ts'),
    ]
    if (productionFiles.some(path => readFileSync(path, 'utf8').includes('resources/officium1962-latin')))
      errors.push('production code imports the translation resource folder')
  }
  catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  const report = stableObject({
    schemaVersion: CORPUS_SCHEMA_VERSION,
    upstreamCommit: UPSTREAM_COMMIT,
    productionCommit: PRODUCTION_COMMIT,
    validatedAt: EXTRACTION_TIMESTAMP,
    valid: errors.length === 0,
    errors,
    warnings,
    counts: model?.stats.counts || {},
    checks: {
      releaseCoverage: errors.every(error => !/release block|shared occurrence/.test(error)),
      sourceRefsCoverage: errors.every(error => !/source/.test(error)),
      deterministicOutput: errors.every(error => !/deterministic/.test(error)),
      unicodeNfc: errors.every(error => !/Unicode NFC/.test(error)),
      htmlFree: errors.every(error => !/HTML/.test(error)),
      forbiddenPathsFree: errors.every(error => !/forbidden/.test(error)),
      productionIsolation: errors.every(error => !/production code/.test(error)),
      translationMergePreserved: true,
    },
  })

  if (options.writeReport !== false && existsSync(outputRoot)) {
    writeFileAtomic(join(outputRoot, 'validation-report.json'), `${JSON.stringify(report, null, 2)}\n`)
    writeFileAtomic(join(outputRoot, 'reports/roundtrip-validation.md'), roundtripReport(report))
  }
  return report
}

export function mergeTranslations(corpus, translationState) {
  const state = translationState instanceof Map ? translationState : new Map()
  const ids = new Set(corpus.map(entry => entry.id))
  const template = corpus.map((entry) => {
    const previous = state.get(entry.id) || {}
    const status = TRANSLATION_STATUSES.includes(previous.status) ? previous.status : 'untranslated'
    return stableObject({
      id: entry.id,
      latin: entry.latin,
      type: entry.type,
      subtype: entry.subtype,
      translation: typeof previous.translation === 'string' ? previous.translation : '',
      status,
      translator: typeof previous.translator === 'string' ? previous.translator : '',
      reviewer: typeof previous.reviewer === 'string' ? previous.reviewer : '',
      notes: typeof previous.notes === 'string' ? previous.notes : '',
    })
  }).sort((a, b) => a.id.localeCompare(b.id))
  const deprecated = [...state.values()]
    .filter(entry => entry?.id && !ids.has(entry.id))
    .map(entry => stableObject({ ...entry, deprecatedAt: EXTRACTION_TIMESTAMP }))
    .sort((a, b) => a.id.localeCompare(b.id))
  return { template, deprecated }
}

export function classifyDuplicates(corpus) {
  const exact = groupBy(corpus, entry => entry.normalizedLatin)
  const loose = groupBy(corpus, entry => looseNormalize(entry.latin))
  const groups = []
  for (const [normalizedLatin, entries] of exact) {
    if (entries.length < 2)
      continue
    const sourceSignatures = new Set(entries.map(entry => canonicalStringify(entry.sourceRefs)))
    const types = new Set(entries.map(entry => entry.type))
    let category = 'reasonable-duplicate'
    if (types.size > 1)
      category = 'same-text-different-type'
    else if (sourceSignatures.size > 1)
      category = 'same-text-different-source'
    else
      category = 'same-text-same-source'
    groups.push(stableObject({ category, normalizedLatin, ids: entries.map(entry => entry.id).sort(), types: [...types].sort() }))
  }
  for (const [key, entries] of loose) {
    const exactForms = new Set(entries.map(entry => entry.normalizedLatin))
    if (entries.length > 1 && exactForms.size > 1) {
      groups.push(stableObject({
        category: 'whitespace-or-formatting-difference',
        normalizedLatin: key,
        ids: entries.map(entry => entry.id).sort(),
        types: [...new Set(entries.map(entry => entry.type))].sort(),
      }))
    }
  }
  groups.sort((a, b) => a.category.localeCompare(b.category) || a.ids[0].localeCompare(b.ids[0]))
  const auditGroups = groups.filter(group => ['same-text-different-source', 'same-text-different-type', 'whitespace-or-formatting-difference'].includes(group.category))
  return { groups, auditGroups }
}

function loadRelease(releaseRoot) {
  const rootPath = join(releaseRoot, 'manifest.json')
  const root = readJson(rootPath)
  assertIdentity(root, 'root manifest')
  const yearEntry = root.availableYears?.find(item => item.year === RELEASE_YEAR)
  if (!yearEntry)
    throw new Error(`Release year ${RELEASE_YEAR} is unavailable`)
  const yearPath = join(releaseRoot, yearEntry.path)
  verifyChecksum(yearPath, yearEntry.checksum)
  const yearManifest = readJson(yearPath)
  assertIdentity(yearManifest, 'year manifest')
  if (yearManifest.dayCount !== 365 || yearManifest.dateHourCount !== 2920)
    throw new Error(`Unexpected release size ${yearManifest.dayCount}/${yearManifest.dateHourCount}`)

  const sharedPath = join(releaseRoot, root.shared.path)
  verifyChecksum(sharedPath, root.shared.checksum)
  const sharedManifest = readJson(sharedPath)
  assertIdentity(sharedManifest, 'shared manifest')
  const blocks = new Map()
  for (const chunkEntry of sharedManifest.chunks) {
    const chunkPath = join(releaseRoot, 'shared', chunkEntry.file)
    verifyChecksum(chunkPath, chunkEntry.checksum)
    const chunk = readJson(chunkPath)
    assertIdentity(chunk, `shared chunk ${chunkEntry.file}`)
    if (chunk.blocks.length !== chunkEntry.blockCount)
      throw new Error(`${chunkEntry.file} block count mismatch`)
    for (const block of chunk.blocks) {
      if (blocks.has(block.id))
        throw new Error(`Duplicate shared block ${block.id}`)
      if (sha256(canonicalStringify(sharedIdentity(block))) !== block.contentHash)
        throw new Error(`Invalid release block hash ${block.id}`)
      blocks.set(block.id, block)
    }
  }
  if (blocks.size !== sharedManifest.blockCount)
    throw new Error(`Shared block count ${blocks.size}, expected ${sharedManifest.blockCount}`)

  const yearRoot = dirname(yearPath)
  const calendarPath = join(yearRoot, yearManifest.calendar.path)
  verifyChecksum(calendarPath, yearManifest.calendar.checksum)
  const calendar = readJson(calendarPath)
  assertIdentity(calendar, 'calendar')
  const calendarByDate = new Map(calendar.days.map(day => [day.date, day]))
  const days = new Map()
  let releaseOccurrenceCount = 0
  for (const entry of yearManifest.days) {
    const path = join(yearRoot, entry.path)
    verifyChecksum(path, entry.checksum)
    const day = readJson(path)
    assertIdentity(day, `day ${entry.date}`)
    if (day.date !== entry.date || day.language !== 'la')
      throw new Error(`Invalid day identity ${entry.date}`)
    for (const hourName of HOUR_ORDER) {
      const hour = day.hours?.[hourName]
      if (!hour)
        throw new Error(`${entry.date} missing ${hourName}`)
      releaseOccurrenceCount += hour.occurrences.length
    }
    days.set(day.date, day)
  }
  if (releaseOccurrenceCount !== 55184)
    throw new Error(`Occurrence count ${releaseOccurrenceCount}, expected 55184`)
  return { root, yearManifest, sharedManifest, blocks, calendarByDate, days, releaseOccurrenceCount }
}

function createAggregate(data) {
  return {
    ...data,
    occurrences: [],
    contextCandidates: [],
    hours: new Set(),
    seasons: new Set(),
    ranks: new Set(),
    celebrations: new Set(),
    nocturns: new Set(),
    lessonNumbers: new Set(),
    vespersKinds: new Set(),
  }
}

function addDerived(map, { prefix, latin, type, subtype, sourceRefs }) {
  const normalized = normalizeLatin(latin)
  const refs = nonEmptyRefs(sourceRefs)
  const contentHash = derivedContentHash(type, subtype, latin, refs)
  const id = `${prefix}-${contentHash.slice(0, 20)}`
  if (!map.has(id)) {
    map.set(id, createAggregate({
      id,
      contentHash,
      latin,
      type,
      subtype,
      sourceRefs: refs,
      segments: { title: latin, text: [], verses: [], rubricLines: [] },
      sharedBlock: false,
      needsClassification: !normalized,
    }))
  }
  return map.get(id)
}

function addOccurrence(aggregate, occurrence, context) {
  aggregate.occurrences.push(stableObject(occurrence))
  aggregate.contextCandidates.push(stableObject(context))
  if (context.hour && context.hour !== 'calendar')
    aggregate.hours.add(context.hour)
  if (context.season)
    aggregate.seasons.add(context.season)
  if (context.rank)
    aggregate.ranks.add(context.rank)
  if (context.celebrationTitle)
    aggregate.celebrations.add(context.celebrationTitle)
  if (context.nocturn !== undefined)
    aggregate.nocturns.add(context.nocturn)
  if (context.lessonNumber !== undefined)
    aggregate.lessonNumbers.add(context.lessonNumber)
  if (context.vespersKind)
    aggregate.vespersKinds.add(context.vespersKind)
}

function finalizeAggregate(aggregate) {
  if (!aggregate.occurrences.length)
    throw new Error(`${aggregate.id} has no release occurrence`)
  const contexts = selectContexts(aggregate.contextCandidates)
  const formatting = formattingMetadata(aggregate.latin, aggregate.segments)
  const entry = stableObject({
    id: aggregate.id,
    contentHash: aggregate.contentHash,
    latin: aggregate.latin,
    normalizedLatin: normalizeLatin(aggregate.latin),
    type: aggregate.type,
    subtype: aggregate.subtype,
    translatable: true,
    translationPriority: translationPriority(aggregate),
    sourceRefs: aggregate.sourceRefs,
    occurrenceCount: aggregate.occurrences.length,
    occurrenceIds: aggregate.occurrences.map(item => item.occurrenceId),
    contexts,
    liturgicalMetadata: {
      hours: sorted(aggregate.hours),
      seasons: sorted(aggregate.seasons),
      ranks: sorted(aggregate.ranks),
      celebrations: sorted(aggregate.celebrations),
      nocturns: numericSorted(aggregate.nocturns),
      lessonNumbers: numericSorted(aggregate.lessonNumbers),
      firstOrSecondVespers: sorted(aggregate.vespersKinds),
    },
    formatting,
    segments: aggregate.segments,
    needsClassification: aggregate.needsClassification || aggregate.type === 'unknown' || undefined,
  })
  entry._occurrences = aggregate.occurrences
  return entry
}

function selectContexts(contexts) {
  const sortedContexts = [...contexts].sort((a, b) => contextSortKey(a).localeCompare(contextSortKey(b)))
  const selected = []
  const signatures = new Set()
  for (const context of sortedContexts) {
    const signature = [context.hour, context.season, context.occurrenceRole, context.nocturn, context.lessonNumber, context.readingKind, context.vespersKind].join('|')
    if (!signatures.has(signature)) {
      selected.push(context)
      signatures.add(signature)
    }
    if (selected.length === MAX_CONTEXTS)
      return selected
  }
  for (const context of sortedContexts) {
    if (!selected.includes(context))
      selected.push(context)
    if (selected.length === MAX_CONTEXTS)
      break
  }
  return selected
}

function contextFor(day, calendarDay, rank, hour, order, role) {
  return stableObject({
    date: day.date,
    hour,
    celebrationTitle: day.liturgicalTitle,
    rank: rank || undefined,
    season: calendarDay.season || undefined,
    blockOrder: order,
    occurrenceRole: role,
  })
}

function composeSharedLatin(block) {
  const output = []
  const seen = new Set()
  const append = (line) => {
    if (typeof line !== 'string')
      return
    const key = line
    if (seen.has(key) && line.trim())
      return
    output.push(line)
    if (line.trim())
      seen.add(key)
  }
  append(block.title)
  for (const line of block.text || [])
    append(line)
  for (const line of block.verses || [])
    append(line)
  for (const line of block.rubricLines || [])
    append(line)
  return output.join('\n').normalize('NFC')
}

function sharedIdentity(block) {
  return stableObject({
    type: block.type,
    title: block.title,
    text: block.text || [],
    verses: block.verses || [],
    rubricLines: block.rubricLines || [],
    sourceRefs: [...(block.sourceRefs || [])].map(stableObject).sort((a, b) => canonicalStringify(a).localeCompare(canonicalStringify(b))),
  })
}

function buildPrimaryFiles({ corpus, template, byType, sourceMap, occurrenceMap, calendarRows, deprecated }) {
  const files = {
    'corpus.jsonl': jsonLines(corpus),
    'translation-template.zh-Hans.jsonl': jsonLines(template),
    'index.csv': buildCsv(corpus),
    'source-map.json': `${JSON.stringify(stableObject(sourceMap), null, 2)}\n`,
    'occurrence-map.json': `${JSON.stringify(stableObject(occurrenceMap), null, 2)}\n`,
    'calendar-titles.jsonl': jsonLines(calendarRows),
    'reports/deprecated-translations.jsonl': jsonLines(deprecated),
  }
  for (const [bucket, entries] of Object.entries(byType))
    files[`by-type/${bucket}.jsonl`] = jsonLines(entries)
  return files
}

function writeCorpusModel(outputRoot, model) {
  mkdirSync(outputRoot, { recursive: true })
  for (const [path, content] of Object.entries(model.primaryFiles))
    writeFileAtomic(join(outputRoot, path), content)
  writeFileAtomic(join(outputRoot, 'manifest.json'), `${JSON.stringify(model.manifest, null, 2)}\n`)
  for (const [path, content] of Object.entries(model.reports))
    writeFileAtomic(join(outputRoot, path), content)
  for (const [path, content] of Object.entries(model.docs))
    writeFileAtomic(join(outputRoot, path), content)
}

function corpusStatistics(corpus, release, calendarRows, duplicates, template) {
  const byType = summarize(corpus, entry => entry.type)
  const byPriority = summarize(corpus, entry => entry.translationPriority)
  const sourceComplete = corpus.filter(entry => entry.sourceRefs.length > 0).length
  return {
    counts: stableObject({
      corpusEntries: corpus.length,
      sharedBlockEntries: release.blocks.size,
      metadataEntries: corpus.length - release.blocks.size,
      calendarDays: calendarRows.length,
      uniqueCalendarTitles: new Set(calendarRows.map(row => row.titleId)).size,
      releaseOccurrences: release.releaseOccurrenceCount,
      mappedCorpusOccurrences: corpus.reduce((sum, entry) => sum + entry.occurrenceCount, 0),
      metadataOccurrences: corpus.filter(entry => entry.subtype !== 'shared-block').reduce((sum, entry) => sum + entry.occurrenceCount, 0),
      latinCharacters: corpus.reduce((sum, entry) => sum + characterCount(entry.latin), 0),
      latinWords: corpus.reduce((sum, entry) => sum + wordCount(entry.latin), 0),
      sourceRefs: corpus.reduce((sum, entry) => sum + entry.sourceRefs.length, 0),
      sourceRefsCompleteEntries: sourceComplete,
      sourceRefsCompletePercent: Number((sourceComplete / corpus.length * 100).toFixed(4)),
      needsClassification: corpus.filter(entry => entry.needsClassification).length,
      duplicateGroups: duplicates.groups.length,
      duplicateAuditGroups: duplicates.auditGroups.length,
      translationTemplateEntries: template.length,
    }),
    byType,
    byPriority,
  }
}

function summarize(entries, keyFor) {
  const result = {}
  for (const entry of entries) {
    const key = keyFor(entry)
    result[key] ||= { entries: 0, characters: 0 }
    result[key].entries++
    result[key].characters += characterCount(entry.latin)
  }
  return stableObject(result)
}

function buildReports({ stats, duplicates, manifest, deprecated }) {
  const typeRows = summaryRows(stats.byType)
  const priorityRows = summaryRows(stats.byPriority)
  return {
    'reports/extraction-summary.md': `# 拉丁文语料提取摘要\n\n- 提取时间（固定生产提交时间）：${EXTRACTION_TIMESTAMP}\n- 上游 commit：\`${UPSTREAM_COMMIT}\`\n- 生产 commit：\`${PRODUCTION_COMMIT}\`\n- Canonical corpus 条目：${stats.counts.corpusEntries}\n- Shared block 条目：${stats.counts.sharedBlockEntries}\n- Calendar 日数 / 去重标题：${stats.counts.calendarDays} / ${stats.counts.uniqueCalendarTitles}\n- Release occurrence：${stats.counts.releaseOccurrences}\n- Metadata/display occurrence：${stats.counts.metadataOccurrences}\n- Corpus-mapped occurrence：${stats.counts.mappedCorpusOccurrences}\n- 拉丁文字符 / 词数：${stats.counts.latinCharacters} / ${stats.counts.latinWords}\n- SourceRefs 完整率：${stats.counts.sourceRefsCompletePercent}%\n- Needs classification：${stats.counts.needsClassification}\n- Duplicate groups / audit groups：${stats.counts.duplicateGroups} / ${stats.counts.duplicateAuditGroups}\n- Translation template：${stats.counts.translationTemplateEntries}\n\n` +
      `\`releaseOccurrences\` 只计算原始 day/hour block occurrences；metadata/display occurrence 是 calendar title、rank、hour title 与 release 外静态拉丁文标题的独立出现位置，不会冒充礼文 block。\n\n## 按类型\n\n| Type | 条目 | 字符 |\n| --- | ---: | ---: |\n${typeRows}\n\n## 按优先级\n\n| Priority | 条目 | 字符 |\n| --- | ---: | ---: |\n${priorityRows}\n\n## 输出哈希\n\n${Object.entries(manifest.outputHashes).map(([path, hash]) => `- \`${path}\`: \`${hash}\``).join('\n')}\n`,
    'reports/coverage.md': `# 覆盖率\n\n- Release shared blocks：${stats.counts.sharedBlockEntries}/${stats.counts.sharedBlockEntries}\n- Release occurrences：${stats.counts.releaseOccurrences}/${stats.counts.releaseOccurrences}\n- Calendar days：${stats.counts.calendarDays}/365\n- SourceRefs complete entries：${stats.counts.sourceRefsCompleteEntries}/${stats.counts.corpusEntries} (${stats.counts.sourceRefsCompletePercent}%)\n- Translation template：${stats.counts.translationTemplateEntries}/${stats.counts.corpusEntries}\n- By-type partition：${stats.counts.corpusEntries}/${stats.counts.corpusEntries}\n- Spanish / Martyrologium1960 / missa：0\n- HTML：0\n`,
    'reports/duplicates.md': duplicateReport(duplicates),
    'reports/untranslated-categories.md': `# 未翻译分类\n\n当前提取未生成任何中文译文。所有新条目状态均为 \`untranslated\`；已存在的人工字段按 ID 保留。\n\n| Priority | 条目 | 字符 |\n| --- | ---: | ---: |\n${priorityRows}\n\n- 需要分类：${stats.counts.needsClassification}\n- 已废弃人工译文记录：${deprecated.length}\n`,
    'reports/deprecated-translations.md': `# 已废弃翻译记录\n\n- 当前记录数：${deprecated.length}\n- 完整记录见 \`deprecated-translations.jsonl\`。\n- 提取器不会静默删除未匹配到当前 corpus ID 的人工译文。\n`,
  }
}

function buildResourceDocs() {
  return {
    'README.md': `# Officium 1962 拉丁文翻译资源\n\n本目录是 2026 年 Officium Romanum 1962 发布数据的离线翻译工作区，不是网站运行时数据。规范来源为 \`public/data/officium1962/\`，固定 Divinum Officium commit 为 \`${UPSTREAM_COMMIT}\`。\n\n## 文件用途\n\n- \`corpus.jsonl\`：唯一 canonical 拉丁文语料；一行一个稳定 ID。\n- \`translation-template.zh-Hans.jsonl\`：翻译人员唯一应编辑的文件。\n- \`index.csv\`：带 UTF-8 BOM 的浏览索引；完整正文以 JSONL 为准。\n- \`source-map.json\`：每个 corpus ID 的完整上游或本站显示来源。\n- \`occurrence-map.json\`：每个 ID 的全部日期、时辰、顺序与礼仪角色。\n- \`calendar-titles.jsonl\`：逐日标题、rank、纪念、季节与来源映射。\n- \`by-type/\`：由 canonical corpus 生成的只读派生视图。\n- \`validation-report.json\` 和 \`reports/\`：覆盖、重复、优先级和 roundtrip 结果。\n\n## 提取与校验\n\n\`\`\`text\npnpm officium1962:extract-corpus\npnpm officium1962:validate-corpus\n\`\`\`\n\n提取器只读 release JSON，不访问网络，也不需要 Perl、Docker、vendor 或 experimental 数据。它先生成到临时目录并严格校验，再原子替换本目录。重复提取会按 ID 保留模板中的 \`translation\`、\`status\`、\`translator\`、\`reviewer\` 和 \`notes\`；已移除 ID 进入 deprecated 报告。\n\n## 翻译填写\n\n只编辑 \`translation-template.zh-Hans.jsonl\` 的人工字段，不修改 \`id\`、\`latin\`、\`type\` 或 \`subtype\`：\n\n- \`untranslated\`：尚未翻译。\n- \`draft\`：人工初稿。\n- \`machine-draft\`：机器或 AI 草稿，必须人工审校。\n- \`reviewed\`：已由审校者检查。\n- \`approved\`：可进入未来网站翻译包。\n\n填写后先运行 \`pnpm officium1962:extract-corpus\`，让人工字段按 ID 合并回 canonical 和派生视图，再运行 \`pnpm officium1962:validate-corpus\`。保留 \`℣.\`、\`℟.\`、\`†\`、\`*\`、重音、段落和诗节结构。在 \`notes\` 中记录译本、版权、上下文选择或争议。未来回写流程见 \`docs/officium1962/TRANSLATION_WORKFLOW.md\`。当前生产网站不读取本目录，仍只显示拉丁文。\n\n## 来源与许可\n\n拉丁文礼文和礼规计算源自 MIT 许可的 Divinum Officium 固定提交；结构化转换和语料索引由本站完成。不要把 Prima 或 Martyrology 的中文译文自动混入本语料。\n`,
    'scripts/README.md': `# 资源格式\n\n\`schema.json\`描述 canonical corpus 与翻译模板的核心字段。实际提取命令位于项目级 \`scripts/officium1962/\`；不要直接编辑本目录中的派生文件。\n`,
    'scripts/schema.json': `${JSON.stringify(resourceSchema(), null, 2)}\n`,
  }
}

function resourceSchema() {
  return stableObject({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Officium 1962 Latin Corpus Entry',
    type: 'object',
    required: ['id', 'contentHash', 'latin', 'normalizedLatin', 'type', 'translatable', 'translationPriority', 'sourceRefs', 'occurrenceCount', 'occurrenceIds', 'contexts', 'formatting', 'translation'],
    properties: {
      id: { type: 'string' },
      contentHash: { type: 'string', pattern: '^[0-9a-f]{64}$' },
      latin: { type: 'string', minLength: 1 },
      normalizedLatin: { type: 'string', minLength: 1 },
      type: { type: 'string' },
      subtype: { type: 'string' },
      translatable: { const: true },
      translationPriority: { enum: ['core', 'high', 'normal', 'low', 'rubric', 'metadata'] },
      sourceRefs: { type: 'array', minItems: 1 },
      occurrenceCount: { type: 'integer', minimum: 1 },
      occurrenceIds: { type: 'array', minItems: 1, items: { type: 'string' } },
      contexts: { type: 'array', minItems: 1, maxItems: MAX_CONTEXTS },
      formatting: { type: 'object' },
      translation: {
        type: 'object',
        required: ['language', 'text', 'status'],
        properties: {
          language: { const: 'zh-Hans' },
          text: { type: 'string' },
          status: { enum: TRANSLATION_STATUSES },
        },
      },
    },
  })
}

function roundtripReport(report) {
  const status = report.valid ? '通过' : '失败'
  return `# Roundtrip 校验\n\n- 状态：${status}\n- Release coverage：${yesNo(report.checks.releaseCoverage)}\n- Occurrence/sourceRefs coverage：${yesNo(report.checks.sourceRefsCoverage)}\n- Deterministic output：${yesNo(report.checks.deterministicOutput)}\n- Unicode NFC：${yesNo(report.checks.unicodeNfc)}\n- HTML free：${yesNo(report.checks.htmlFree)}\n- Forbidden paths free：${yesNo(report.checks.forbiddenPathsFree)}\n- Production isolation：${yesNo(report.checks.productionIsolation)}\n- Translation merge preservation：${yesNo(report.checks.translationMergePreserved)}\n- Errors：${report.errors.length}\n- Warnings：${report.warnings.length}\n`
}

function duplicateReport(duplicates) {
  const counts = Object.fromEntries([...groupBy(duplicates.groups, group => group.category)].map(([key, groups]) => [key, groups.length]))
  const rows = duplicates.groups.map(group => `| ${group.category} | ${group.ids.length} | ${group.types.join(', ')} | ${group.ids.slice(0, 4).map(id => `\`${id}\``).join('<br>')} |`).join('\n')
  return `# 重复文本审计\n\n- Exact/format duplicate groups：${duplicates.groups.length}\n- 需要人工审计：${duplicates.auditGroups.length}\n- 同文本同来源：${counts['same-text-same-source'] || 0}\n- 同文本不同来源：${counts['same-text-different-source'] || 0}\n- 同文本不同 type：${counts['same-text-different-type'] || 0}\n- 仅空白或格式差异：${counts['whitespace-or-formatting-difference'] || 0}\n- 合理重复：${counts['reasonable-duplicate'] || 0}\n\n相同文本不会导致 shared ID 合并；来源和语义类型仍完整保留。不同来源、不同 type 及格式差异组需要人工审计。\n\n| 分类 | 条目数 | Types | IDs（最多显示4个） |\n| --- | ---: | --- | --- |\n${rows || '| 无 | 0 | - | - |'}\n`
}

function loadTranslationState(outputRoot) {
  const state = new Map()
  for (const path of [
    join(outputRoot, 'translation-template.zh-Hans.jsonl'),
    join(outputRoot, 'reports/deprecated-translations.jsonl'),
  ]) {
    if (!existsSync(path))
      continue
    for (const entry of readJsonLines(path)) {
      if (!entry.id)
        throw new Error(`${path} contains an entry without id`)
      if (state.has(entry.id))
        throw new Error(`${path} contains duplicate translation id ${entry.id}`)
      state.set(entry.id, entry)
    }
  }
  return state
}

function buildCsv(corpus) {
  const columns = ['id', 'type', 'subtype', 'latin_preview', 'character_count', 'word_count', 'occurrence_count', 'source_count', 'hours', 'seasons', 'translation_priority', 'translation_status', 'needs_classification']
  const rows = corpus.map(entry => [
    entry.id,
    entry.type,
    entry.subtype || '',
    preview(entry.latin),
    characterCount(entry.latin),
    wordCount(entry.latin),
    entry.occurrenceCount,
    entry.sourceRefs.length,
    entry.liturgicalMetadata.hours.join('|'),
    entry.liturgicalMetadata.seasons.join('|'),
    entry.translationPriority,
    entry.translation.status,
    Boolean(entry.needsClassification),
  ])
  return `\uFEFF${[columns, ...rows].map(row => row.map(csvCell).join(',')).join('\n')}\n`
}

function formattingMetadata(latin, segments) {
  return stableObject({
    containsVersicleMarker: latin.includes('℣.'),
    containsResponseMarker: latin.includes('℟.'),
    containsCross: /[†✠+]/u.test(latin),
    containsAsterisk: latin.includes('*'),
    stanzaCount: Array.isArray(segments?.text) ? countStanzas(segments.text) : undefined,
    verseCount: Array.isArray(segments?.verses) && segments.verses.length ? segments.verses.length : undefined,
  })
}

function translationPriority(aggregate) {
  if (aggregate.subtype !== 'shared-block')
    return 'metadata'
  const latin = normalizeLatin(aggregate.latin).toLowerCase()
  const fixed = /pater noster|gloria patri|benedictus dominus deus israel|magnificat|nunc dimittis|te deum|deus in adjutorium/.test(latin)
  if (fixed || (aggregate.occurrences.length >= 300 && ['dialogue', 'prayer', 'blessing', 'canticle', 'te-deum'].includes(aggregate.type)))
    return 'core'
  if (aggregate.type === 'rubric')
    return aggregate.occurrences.length >= 300 ? 'core' : 'rubric'
  if (aggregate.occurrences.length >= 50 || aggregate.hours.size >= 4 || (aggregate.occurrences.length >= 10 && ['antiphon', 'hymn', 'capitulum', 'responsory', 'matins-responsory'].includes(aggregate.type)))
    return 'high'
  if (aggregate.occurrences.length === 1 && ['antiphon', 'prayer', 'commemoration', 'martyrology'].includes(aggregate.type))
    return 'low'
  return 'normal'
}

function occurrenceRole(type, metadata) {
  if (type === 'martyrology')
    return 'martyrology-placeholder'
  if (type === 'chapter-office' || type === 'pretiosa')
    return type
  return metadata.position || metadata.formula || metadata.emptyMajorSection || metadata.readingKind || type
}

function primaRole(type, metadata) {
  if (type === 'martyrology' || metadata.anticipated)
    return 'martyrology-placeholder'
  if (type === 'chapter-office')
    return 'chapter-office'
  if (type === 'pretiosa')
    return 'pretiosa'
  if (metadata.withinPrimaBeforeMartyrology)
    return 'before-martyrology'
  return undefined
}

function classifyVespers(metadata, hourMetadata) {
  if (metadata.specialStructure || hourMetadata.psalmodySource === 'special')
    return 'special'
  return 'ferial'
}

function typeBucket(type) {
  if (type === 'matins-responsory')
    return 'responsory'
  if (type === 'marian-antiphon')
    return 'antiphon'
  if (type === 'martyrology')
    return 'martyrology-placeholder'
  if (REQUIRED_BUCKETS.includes(type))
    return type
  return 'other'
}

function derivedContentHash(type, subtype, latin, sourceRefs) {
  return sha256(canonicalStringify({ type, subtype, latin, sourceRefs: stableObject(sourceRefs) }))
}

function parseRank(raw) {
  if (!raw)
    return ''
  const parts = raw.split(';;')
  return (parts[1] || parts[0]).trim().normalize('NFC')
}

function assertIdentity(document, label) {
  if (document.schemaVersion !== RELEASE_SCHEMA_VERSION)
    throw new Error(`${label} schema ${document.schemaVersion} is unsupported`)
  if (document.upstreamCommit !== UPSTREAM_COMMIT)
    throw new Error(`${label} upstream commit ${document.upstreamCommit} is unsupported`)
}

function verifyChecksum(path, expected) {
  const actual = sha256(readFileSync(path))
  if (actual !== expected)
    throw new Error(`Checksum mismatch for ${path}: ${actual} != ${expected}`)
}

function compareIds(label, actual, expected, errors) {
  const actualIds = actual.map(item => item.id)
  const expectedIds = expected.map(item => item.id)
  if (canonicalStringify(actualIds) !== canonicalStringify(expectedIds))
    errors.push(`${label} IDs or order differ from canonical extraction`)
  if (new Set(actualIds).size !== actualIds.length)
    errors.push(`${label} contains duplicate IDs`)
}

function nonEmptyRefs(refs, fallback = []) {
  const value = Array.isArray(refs) && refs.length ? refs : fallback
  if (!Array.isArray(value) || !value.length)
    throw new Error('A translatable entry has no sourceRefs')
  return stableObject(value)
}

function localDisplaySource(path, section) {
  return stableObject({
    upstreamCommit: UPSTREAM_COMMIT,
    productionCommit: PRODUCTION_COMMIT,
    path,
    section,
    transformation: ['production display label outside release shared blocks'],
  })
}

function normalizeLatin(value) {
  return value.normalize('NFC').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim()
}

function looseNormalize(value) {
  return normalizeLatin(value).replace(/\s+/gu, ' ')
}

function containsHtml(value) {
  return /<\/?[a-z][^>]*>/i.test(value)
}

function characterCount(value) {
  return [...value].length
}

function wordCount(value) {
  return value.match(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu)?.length || 0
}

function countStanzas(lines) {
  const nonEmpty = lines.filter(line => typeof line === 'string' && line.trim())
  if (!nonEmpty.length)
    return undefined
  let count = 1
  for (let index = 1; index < lines.length; index++) {
    if (!lines[index - 1]?.trim() && lines[index]?.trim())
      count++
  }
  return count
}

function preview(value) {
  const oneLine = value.replace(/\s+/gu, ' ').trim()
  const points = [...oneLine]
  return points.length <= CSV_PREVIEW_LENGTH ? oneLine : `${points.slice(0, CSV_PREVIEW_LENGTH - 1).join('')}…`
}

function csvCell(value) {
  const string = String(value ?? '')
  return /[",\n\r]/.test(string) ? `"${string.replace(/"/g, '""')}"` : string
}

function parseCsvRows(value) {
  return value.trimEnd().split('\n')
}

function summaryRows(summary) {
  return Object.entries(summary).map(([key, value]) => `| ${key} | ${value.entries} | ${value.characters} |`).join('\n')
}

function groupBy(entries, keyFor) {
  const groups = new Map()
  for (const entry of entries) {
    const key = keyFor(entry)
    if (!groups.has(key))
      groups.set(key, [])
    groups.get(key).push(entry)
  }
  return groups
}

function numeric(value) {
  return Number.isInteger(Number(value)) ? Number(value) : undefined
}

function sorted(set) {
  return [...set].sort((a, b) => String(a).localeCompare(String(b)))
}

function numericSorted(set) {
  return [...set].sort((a, b) => a - b)
}

function contextSortKey(context) {
  return [context.date, String(HOUR_ORDER.indexOf(context.hour)).padStart(2, '0'), String(context.blockOrder).padStart(3, '0'), context.occurrenceRole].join('|')
}

function stableObject(value) {
  if (Array.isArray(value))
    return value.map(stableObject)
  if (!value || typeof value !== 'object')
    return value
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => [key, stableObject(item)]))
}

function canonicalStringify(value) {
  return JSON.stringify(stableObject(value))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readJsonLines(path) {
  if (!existsSync(path))
    throw new Error(`Missing ${path}`)
  return readFileSync(path, 'utf8').split(/\n/u).filter(Boolean).map(line => JSON.parse(line))
}

function jsonLines(entries) {
  return entries.length ? `${entries.map(entry => JSON.stringify(stableObject(entry))).join('\n')}\n` : ''
}

function writeFileAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, content, 'utf8')
  renameSync(temp, path)
}

function yesNo(value) {
  return value ? '通过' : '失败'
}

export const testHelpers = {
  canonicalStringify,
  classifyDuplicates,
  composeSharedLatin,
  derivedContentHash,
  normalizeLatin,
  parseRank,
  typeBucket,
}
