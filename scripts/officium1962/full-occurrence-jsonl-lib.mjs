import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import {
  HOUR_ORDER,
  RELEASE_YEAR,
  TRANSLATION_STATUSES,
} from './translation-corpus-lib.mjs'

export const FULL_OCCURRENCE_SCHEMA_VERSION = 'officium1962.full-occurrence-translation-jsonl.v1'
export const DEFAULT_WORKSPACE_ROOT = resolve(import.meta.dirname, '../../resources/officium1962-translation')
export const DEFAULT_LATIN_ROOT = resolve(import.meta.dirname, '../../resources/officium1962-latin')
export const DEFAULT_RELEASE_ROOT = resolve(import.meta.dirname, '../../public/data/officium1962')
export const FULL_OCCURRENCE_RELATIVE_PATH = 'full-occurrences-by-hour-and-source.zh-Hans.jsonl'

const FULL_OCCURRENCE_RELATIVE_REPORTS = {
  deprecated: 'reports/full-occurrence-export-deprecated.jsonl',
  conflicts: 'reports/full-occurrence-export-conflicts.jsonl',
  validation: 'reports/full-occurrence-export-validation.md',
  summary: 'reports/full-occurrence-export-summary.json',
  importConflicts: 'review/full-occurrence-import-conflicts.jsonl',
  overrideCandidates: 'review/full-occurrence-override-candidates.jsonl',
}

const HOUR_SORT_ORDER = [...HOUR_ORDER, 'calendar-metadata']
const HOUR_LABELS = {
  matutinum: 'Matutinum',
  laudes: 'Laudes',
  prima: 'Prima',
  tertia: 'Tertia',
  sexta: 'Sexta',
  nona: 'Nona',
  vesperae: 'Vesperae',
  completorium: 'Completorium',
  'calendar-metadata': 'Calendar',
}
const SOURCE_CATEGORY_ORDER = ['Psalterium', 'Tempora', 'Sancti', 'Commune', 'Tabulae', 'Rules', 'Other']
const STATUS_RANK = new Map(TRANSLATION_STATUSES.map((status, index) => [status, index]))
const EDITABLE_FIELDS = ['translation', 'translationStatus', 'translator', 'reviewer', 'notes']

export function exportFullOccurrenceJsonl(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const targetPath = resolve(options.targetPath || join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_PATH))
  const model = buildFullOccurrenceModel({ ...options, workspaceRoot, targetPath })

  if (options.write !== false) {
    writeFileAtomic(targetPath, jsonLines(model.records))
    writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.deprecated), jsonLines(model.deprecated))
    writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.conflicts), jsonLines(model.conflicts))
    writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.summary), `${JSON.stringify(stableObject(model.summary), null, 2)}\n`)
    writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.validation), validationMarkdown({
      valid: model.conflicts.length === 0,
      errors: model.conflicts.map(conflict => `${conflict.occurrenceId}: ${conflict.reason}`),
      warnings: model.deprecated.map(entry => `${entry.occurrenceId}: deprecated occurrence`),
      summary: model.summary,
    }))
  }

  return model.summary
}

export function validateFullOccurrenceJsonl(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const targetPath = resolve(options.targetPath || join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_PATH))
  const errors = []
  const warnings = []

  if (!existsSync(targetPath)) {
    errors.push(`missing ${FULL_OCCURRENCE_RELATIVE_PATH}`)
    return writeValidation({ workspaceRoot, options, errors, warnings, summary: {} })
  }

  const records = readJsonLines(targetPath)
  const expectedModel = buildFullOccurrenceModel({ ...options, workspaceRoot, targetPath, preserveExisting: false })
  const expectedById = new Map(expectedModel.records.map(record => [record.occurrenceId, record]))
  const corpus = readJsonLines(resolve(options.latinRoot || DEFAULT_LATIN_ROOT, 'corpus.jsonl'))
  const corpusById = new Map(corpus.map(entry => [entry.id, entry]))
  const occurrenceMap = readJson(resolve(options.latinRoot || DEFAULT_LATIN_ROOT, 'occurrence-map.json'))
  const occurrenceMapIds = new Set(flattenOccurrenceMap(occurrenceMap).map(entry => entry.occurrenceId))
  const ids = new Set()

  if (records.length !== expectedModel.summary.totalRecords)
    errors.push(`record count ${records.length}, expected ${expectedModel.summary.totalRecords}`)

  const releaseCount = records.filter(record => record.recordKind === 'liturgical-occurrence').length
  const metadataCount = records.length - releaseCount
  if (releaseCount !== expectedModel.summary.releaseOccurrences)
    errors.push(`release occurrence count ${releaseCount}, expected ${expectedModel.summary.releaseOccurrences}`)
  if (metadataCount !== expectedModel.summary.metadataDisplayOccurrences)
    errors.push(`metadata/display occurrence count ${metadataCount}, expected ${expectedModel.summary.metadataDisplayOccurrences}`)

  for (let index = 0; index < records.length; index++) {
    const record = records[index]
    const expected = expectedById.get(record.occurrenceId)
    if (!expected) {
      errors.push(`unknown occurrenceId ${record.occurrenceId}`)
      continue
    }
    if (ids.has(record.occurrenceId))
      errors.push(`duplicate occurrenceId ${record.occurrenceId}`)
    ids.add(record.occurrenceId)
    if (!occurrenceMapIds.has(record.occurrenceId))
      errors.push(`occurrenceId not in occurrence-map ${record.occurrenceId}`)
    if (!corpusById.has(record.canonicalId))
      errors.push(`invalid canonicalId ${record.canonicalId}`)
    if (record.latinHash !== sha256(record.latin))
      errors.push(`invalid latinHash ${record.occurrenceId}`)
    if (!Array.isArray(record.sourceRefs) || record.sourceRefs.length === 0)
      errors.push(`missing sourceRefs ${record.occurrenceId}`)
    if (!record.primarySourcePath)
      errors.push(`missing primarySourcePath ${record.occurrenceId}`)
    if (!Array.isArray(record.sectionPath) || record.sectionPath.length === 0)
      errors.push(`missing sectionPath ${record.occurrenceId}`)
    if (record.sectionPathText !== record.sectionPath.join(' > '))
      errors.push(`sectionPathText mismatch ${record.occurrenceId}`)
    if (record.hourOrder !== hourOrder(record.hour))
      errors.push(`hourOrder mismatch ${record.occurrenceId}`)
    if (index > 0 && compareRecords(records[index - 1], record) > 0)
      errors.push(`sort order regression at ${record.occurrenceId}`)
    for (const key of Object.keys(expected)) {
      if (EDITABLE_FIELDS.includes(key))
        continue
      if (canonicalStringify(record[key]) !== canonicalStringify(expected[key]))
        errors.push(`structural field changed for ${record.occurrenceId}: ${key}`)
    }
  }

  if (ids.size !== records.length)
    errors.push(`unique occurrenceId count ${ids.size}, expected ${records.length}`)
  if (ids.size !== occurrenceMapIds.size)
    errors.push(`occurrence-map coverage ${ids.size}, expected ${occurrenceMapIds.size}`)

  const canonicalCounts = countBy(records, record => record.canonicalId)
  const latinCounts = countBy(records, record => record.latinHash)
  if (!Object.values(canonicalCounts).some(count => count > 1))
    errors.push('canonicalId repetition not present')
  if (!Object.values(latinCounts).some(count => count > 1))
    errors.push('Latin repetition not present')

  if (!records.some(record => record.hour === 'matutinum' && record.sectionPathText.includes('Nocturnus') && record.sectionPathText.includes('Lectio') && record.sectionPathText.includes('Benedictio')))
    errors.push('Matutinum lesson blessing path missing')
  if (!records.some(record => record.hour === 'matutinum' && record.sectionPathText.includes('Nocturnus') && record.sectionPathText.includes('Lectio') && record.sectionPathText.includes('Responsorium')))
    errors.push('Matutinum responsory path missing')
  if (!records.some(record => record.hour === 'prima' && record.sectionPathText.includes('Officium Capituli')))
    errors.push('Prima Chapter Office path missing')
  if (!records.some(record => record.hour === 'vesperae' && record.vespersKind))
    errors.push('Vesperae metadata missing')
  if (!records.some(record => record.repeatsOccurrenceId))
    errors.push('repeated antiphon relation missing')

  for (const record of records) {
    if (containsHtml(record.latin))
      errors.push(`HTML-like Latin in ${record.occurrenceId}`)
    for (const ref of record.sourceRefs || []) {
      const path = ref.path || ''
      if (/Spanish/u.test(path))
        errors.push(`Spanish source in ${record.occurrenceId}: ${path}`)
      if (/Martyrologium1960/u.test(path))
        errors.push(`Martyrologium1960 source in ${record.occurrenceId}: ${path}`)
      if (/(^|[/\\])missa([/\\]|$)/iu.test(path))
        errors.push(`missa source in ${record.occurrenceId}: ${path}`)
    }
    if (!isNfc(record))
      errors.push(`non-NFC string in ${record.occurrenceId}`)
  }

  const summary = summarizeRecords(records, {
    exportConflicts: readJsonLinesIfExists(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.conflicts)).length,
    deprecatedOccurrences: readJsonLinesIfExists(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.deprecated)).length,
  })
  return writeValidation({ workspaceRoot, options, errors, warnings, summary })
}

export function importFullOccurrenceTranslations(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const latinRoot = resolve(options.latinRoot || DEFAULT_LATIN_ROOT)
  const fullPath = resolve(options.fullPath || join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_PATH))
  const memoryPath = resolve(options.memoryPath || join(workspaceRoot, 'translations/zh-Hans.jsonl'))
  const dryRun = Boolean(options.dryRun)
  const strict = options.strict !== false
  const corpus = readJsonLines(join(latinRoot, 'corpus.jsonl'))
  const corpusById = new Map(corpus.map(entry => [entry.id, entry]))
  const memory = readJsonLines(memoryPath)
  const memoryById = new Map(memory.map(entry => [entry.id, entry]))
  const records = readJsonLines(fullPath)
  const grouped = new Map()
  const conflicts = []
  const overrideCandidates = []
  const updates = new Map()

  for (const record of records) {
    const corpusEntry = corpusById.get(record.canonicalId)
    if (!corpusEntry) {
      conflicts.push(importConflict(record, 'unknown-canonical-id', 'The record canonicalId is not present in corpus.jsonl.'))
      continue
    }
    if (record.latinHash !== sha256(corpusEntry.latin)) {
      conflicts.push(importConflict(record, 'latin-hash-mismatch', 'The record Latin hash does not match the current canonical corpus Latin.'))
      continue
    }
    if (!record.translation || !record.translation.trim())
      continue
    const list = grouped.get(record.canonicalId) || []
    list.push(record)
    grouped.set(record.canonicalId, list)
  }

  for (const [canonicalId, list] of grouped) {
    const variants = groupBy(list, record => record.translation.trim())
    const variantEntries = [...variants.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    if (variantEntries.length > 1) {
      conflicts.push(stableObject({
        canonicalId,
        kind: 'differing-occurrence-translations',
        latin: corpusById.get(canonicalId)?.latin || '',
        candidates: variantEntries.map(([translation, recordsForTranslation]) => ({
          translation,
          count: recordsForTranslation.length,
          occurrenceIds: recordsForTranslation.map(record => record.occurrenceId).sort(),
        })),
        status: 'unresolved',
        resolution: 'Resolve manually. The importer will not choose between differing occurrence translations.',
      }))
      const minority = variantEntries.find(([, recordsForTranslation]) => recordsForTranslation.length === 1)
      if (minority) {
        const [translation, [record]] = minority
        overrideCandidates.push(stableObject({
          canonicalId,
          occurrenceId: record.occurrenceId,
          translation,
          reason: 'single occurrence differs from the other translations for this canonical ID',
          status: 'candidate',
        }))
      }
      continue
    }

    const [translation, recordsForTranslation] = variantEntries[0]
    const existing = memoryById.get(canonicalId)
    if (!existing)
      continue
    const candidateStatus = mergedStatus(recordsForTranslation.map(record => record.translationStatus))
    if (isProtected(existing.status) && STATUS_RANK.get(candidateStatus) < STATUS_RANK.get(existing.status))
      continue
    updates.set(canonicalId, {
      translation,
      status: candidateStatus === 'untranslated' ? 'draft' : candidateStatus,
      sourceOccurrenceIds: recordsForTranslation.map(record => record.occurrenceId).sort(),
    })
  }

  if (!dryRun && conflicts.length === 0) {
    const nextMemory = memory.map(entry => {
      const update = updates.get(entry.id)
      if (!update)
        return entry
      return stableObject({
        ...entry,
        translation: update.translation,
        status: update.status,
        revision: Number.isInteger(entry.revision) ? entry.revision + 1 : 1,
      })
    })
    writeFileAtomic(memoryPath, jsonLines(nextMemory))
  }

  writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.importConflicts), jsonLines(conflicts))
  writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.overrideCandidates), jsonLines(overrideCandidates))

  const summary = stableObject({
    dryRun,
    candidateCanonicalUpdates: updates.size,
    conflicts: conflicts.length,
    overrideCandidates: overrideCandidates.length,
    imported: dryRun || conflicts.length > 0 ? 0 : updates.size,
  })
  if (strict && conflicts.length > 0)
    throw Object.assign(new Error(`full occurrence import found ${conflicts.length} conflicts`), { summary })
  return summary
}

export function buildFullOccurrenceModel(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const latinRoot = resolve(options.latinRoot || DEFAULT_LATIN_ROOT)
  const targetPath = resolve(options.targetPath || join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_PATH))
  const corpus = readJsonLines(join(latinRoot, 'corpus.jsonl'))
  const corpusById = new Map(corpus.map(entry => [entry.id, entry]))
  const sourceMap = readJson(join(latinRoot, 'source-map.json'))
  const occurrenceMap = readJson(join(latinRoot, 'occurrence-map.json'))
  const occurrenceEntries = flattenOccurrenceMap(occurrenceMap)
  const translationMemory = readJsonLines(join(workspaceRoot, 'translations/zh-Hans.jsonl'))
  const canonicalById = new Map(translationMemory.map(entry => [entry.id, entry]))
  const overrides = readJsonLines(join(workspaceRoot, 'translations/zh-Hans-overrides.jsonl'))
  const overrideByOccurrence = new Map(overrides.map(entry => [entry.occurrenceId, entry]))
  const existingByOccurrence = options.preserveExisting === false || !existsSync(targetPath)
    ? new Map()
    : new Map(readJsonLines(targetPath).map(entry => [entry.occurrenceId, entry]))
  const days = loadStructuredDays(workspaceRoot)
  const dayByDate = new Map(days.map(day => [day.date, day]))
  const structureOccurrenceIds = new Set()
  const conflicts = []
  let records = []

  for (const day of days) {
    for (const hour of HOUR_ORDER) {
      const structuredHour = day.hours[hour]
      collectStructuredRecords({
        day,
        hour,
        sections: structuredHour.sections || [],
        path: [HOUR_LABELS[hour]],
        records,
        structureOccurrenceIds,
        corpusById,
        canonicalById,
        overrideByOccurrence,
        existingByOccurrence,
        sourceMap,
        conflicts,
      })
    }
  }

  records = dedupeOccurrenceRecords(records)
  addAntiphonRepeatRelations(records)

  for (const occurrence of occurrenceEntries) {
    if (structureOccurrenceIds.has(occurrence.occurrenceId))
      continue
    const corpusEntry = corpusById.get(occurrence.canonicalId)
    if (!corpusEntry)
      continue
    const day = dayByDate.get(occurrence.date)
    const record = createBaseRecord({
      occurrence,
      corpusEntry,
      node: metadataNode(occurrence, corpusEntry),
      day,
      hour: 'calendar-metadata',
      sectionPath: metadataSectionPath(occurrence),
      canonicalById,
      overrideByOccurrence,
      existingByOccurrence,
      sourceRefs: sourceRefsFor({ node: null, corpusEntry, sourceMap }),
      sourceMap,
      conflicts,
    })
    record.recordKind = metadataRecordKind(occurrence)
    records.push(record)
  }

  records.sort(compareRecords)
  for (const record of records)
    record.sortKey = makeSortKey(record)

  const currentIds = new Set(records.map(record => record.occurrenceId))
  const deprecated = [...existingByOccurrence.values()]
    .filter(record => !currentIds.has(record.occurrenceId))
    .map(record => stableObject({
      occurrenceId: record.occurrenceId,
      canonicalId: record.canonicalId,
      latin: record.latin,
      translation: record.translation || '',
      translationStatus: record.translationStatus || 'untranslated',
      deprecatedBy: FULL_OCCURRENCE_SCHEMA_VERSION,
    }))
    .sort((a, b) => a.occurrenceId.localeCompare(b.occurrenceId))

  return {
    records: records.map(record => stableObject(record)),
    deprecated,
    conflicts: conflicts.sort((a, b) => a.occurrenceId.localeCompare(b.occurrenceId)),
    summary: summarizeRecords(records, {
      exportConflicts: conflicts.length,
      deprecatedOccurrences: deprecated.length,
    }),
  }
}

function collectStructuredRecords(context) {
  for (const item of context.sections) {
    if (item.sectionId) {
      collectStructuredRecords({
        ...context,
        sections: item.children || [],
        path: [...context.path, sectionLabel(item)],
      })
      continue
    }

    const corpusEntry = context.corpusById.get(item.corpusId)
    if (!corpusEntry)
      continue
    context.structureOccurrenceIds.add(item.occurrenceId)
    const record = createBaseRecord({
      occurrence: {
        occurrenceId: item.occurrenceId,
        canonicalId: item.corpusId,
        date: context.day.date,
        hour: context.hour,
        order: item.order,
        role: item.role,
      },
      corpusEntry,
      node: item,
      day: context.day,
      hour: context.hour,
      sectionPath: [...context.path, nodeLabel(item)],
      canonicalById: context.canonicalById,
      overrideByOccurrence: context.overrideByOccurrence,
      existingByOccurrence: context.existingByOccurrence,
      sourceRefs: sourceRefsFor({ node: item, corpusEntry, sourceMap: context.sourceMap }),
      sourceMap: context.sourceMap,
      conflicts: context.conflicts,
    })
    recordsClean(record)
    context.records.push(record)
  }
}

function createBaseRecord({
  occurrence,
  corpusEntry,
  node,
  day,
  hour,
  sectionPath,
  canonicalById,
  overrideByOccurrence,
  existingByOccurrence,
  sourceRefs,
  conflicts,
}) {
  const canonical = canonicalById.get(occurrence.canonicalId)
  const override = overrideByOccurrence.get(occurrence.occurrenceId)
  const generatedTranslation = override?.translation || canonical?.translation || ''
  const generatedStatus = override?.status || canonical?.status || 'untranslated'
  const latin = corpusEntry.latin
  const latinHash = sha256(latin)
  const existing = existingByOccurrence.get(occurrence.occurrenceId)
  const preserve = existing && hasEditableData(existing)
  const latinHashConflict = existing?.latinHash && existing.latinHash !== latinHash

  if (latinHashConflict) {
    conflicts.push(stableObject({
      occurrenceId: occurrence.occurrenceId,
      canonicalId: occurrence.canonicalId,
      oldLatinHash: existing.latinHash,
      newLatinHash: latinHash,
      translation: existing.translation || '',
      translationStatus: existing.translationStatus || 'untranslated',
      reason: 'Latin hash changed; editable translation was not silently preserved.',
    }))
  }

  const editable = preserve && !latinHashConflict
    ? pickEditable(existing)
    : {
        translation: generatedTranslation,
        translationStatus: generatedTranslation ? generatedStatus : 'untranslated',
      }
  const primary = choosePrimarySourceRef(sourceRefs)
  const sourceCategory = categoryForSourceRef(primary)
  const metadata = node?.metadata || {}

  const record = {
    occurrenceId: occurrence.occurrenceId,
    canonicalId: occurrence.canonicalId,
    recordKind: 'liturgical-occurrence',
    date: occurrence.date,
    hour,
    hourOrder: hourOrder(hour),
    liturgicalTitle: day?.liturgicalTitle?.latin,
    rank: day?.rank?.latin,
    season: day?.season || corpusEntry.contexts?.[0]?.season,
    type: node?.type || corpusEntry.type,
    subtype: corpusEntry.subtype,
    role: node?.role || occurrence.role,
    sectionPath,
    sectionPathText: sectionPath.join(' > '),
    blockOrder: Number.isFinite(Number(node?.order ?? occurrence.order)) ? Number(node?.order ?? occurrence.order) : undefined,
    nocturn: numberOrUndefined(metadata.nocturn),
    lessonNumber: numberOrUndefined(metadata.lessonNumber),
    responsoryNumber: numberOrUndefined(metadata.responsoryNumber),
    vespersKind: metadata.vespersKind,
    repetitionRole: repetitionRole(node),
    latin,
    latinHash,
    translation: editable.translation || '',
    translationStatus: validStatus(editable.translationStatus),
    translator: editable.translator,
    reviewer: editable.reviewer,
    notes: editable.notes,
    canonicalTranslation: canonical?.translation || '',
    canonicalTranslationStatus: canonical?.status || 'untranslated',
    overrideTranslation: override?.translation,
    overrideId: override?.overrideId,
    sourceCategory,
    primarySourcePath: primary?.path || '',
    primarySourceSection: primary?.section,
    sourceRefs,
    previousOccurrenceId: node?.relations?.previousOccurrenceId,
    nextOccurrenceId: node?.relations?.nextOccurrenceId,
    repeatsOccurrenceId: node?.relations?.repeatsOccurrenceId,
    relatedOccurrenceIds: relatedOccurrenceIds(node),
  }
  record.sortKey = makeSortKey(record)
  return normalizeNfc(record)
}

function metadataNode(occurrence, corpusEntry) {
  return {
    type: corpusEntry.type,
    role: occurrence.role,
    order: occurrence.order,
    metadata: {
      originalHour: occurrence.hour,
    },
  }
}

function metadataSectionPath(occurrence) {
  if (occurrence.role === 'calendar-title')
    return ['Calendar', 'Liturgical title']
  if (occurrence.role === 'rank')
    return ['Calendar', 'Rank']
  if (occurrence.role === 'commemoration-heading')
    return ['Calendar', 'Commemoration']
  if (occurrence.role === 'hour-title')
    return ['Calendar', 'Hour title', HOUR_LABELS[occurrence.hour] || occurrence.hour]
  if (occurrence.role === 'page-title')
    return ['Calendar', 'Display metadata', 'Page title']
  return ['Calendar', 'Display metadata']
}

function metadataRecordKind(occurrence) {
  if (occurrence.role === 'calendar-title')
    return 'calendar-title'
  if (occurrence.role === 'rank')
    return 'rank'
  if (occurrence.role === 'commemoration-heading')
    return 'commemoration-title'
  return 'display-metadata'
}

function addAntiphonRepeatRelations(records) {
  const byId = new Map(records.map(record => [record.occurrenceId, record]))
  for (const record of records.filter(item => item.recordKind === 'liturgical-occurrence' && item.type === 'antiphon')) {
    const openId = record.occurrenceId.endsWith('-antiphon-close')
      ? record.occurrenceId.replace(/-antiphon-close$/u, '-antiphon-open')
      : ''
    if (openId && byId.has(openId)) {
      record.repeatsOccurrenceId = openId
      const related = new Set(record.relatedOccurrenceIds || [])
      related.add(openId)
      record.relatedOccurrenceIds = [...related].sort()
      record.sortKey = makeSortKey(record)
    }
  }

  const groups = groupBy(
    records.filter(record => record.recordKind === 'liturgical-occurrence' && record.type === 'antiphon'),
    record => `${record.date}|${record.hour}|${record.canonicalId}|${record.latinHash}`,
  )
  for (const group of groups.values()) {
    group.sort((a, b) => Number(a.blockOrder || 0) - Number(b.blockOrder || 0) || a.occurrenceId.localeCompare(b.occurrenceId))
    const first = group[0]
    for (const record of group.slice(1)) {
      if (!record.repeatsOccurrenceId)
        record.repeatsOccurrenceId = first.occurrenceId
      const related = new Set(record.relatedOccurrenceIds || [])
      related.add(first.occurrenceId)
      record.relatedOccurrenceIds = [...related].sort()
      record.sortKey = makeSortKey(record)
    }
  }
}

function dedupeOccurrenceRecords(records) {
  const bestById = new Map()
  for (const record of records) {
    const existing = bestById.get(record.occurrenceId)
    if (!existing || occurrencePathScore(record) > occurrencePathScore(existing))
      bestById.set(record.occurrenceId, record)
  }
  return [...bestById.values()]
}

function occurrencePathScore(record) {
  let score = record.sectionPath.length
  if (record.sectionPathText.includes('Nocturnus'))
    score += 100
  if (record.sectionPathText.includes('Lectio'))
    score += 20
  if (record.sectionPathText.includes('Initium'))
    score -= 50
  return score
}

function relatedOccurrenceIds(node) {
  const relations = node?.relations || {}
  const ids = [
    relations.repeatsOccurrenceId,
    relations.blessingForOccurrenceId,
    relations.responsoryForOccurrenceId,
    ...(relations.antiphonForOccurrenceIds || []),
  ].filter(Boolean)
  return ids.length ? [...new Set(ids)].sort() : undefined
}

function repetitionRole(node) {
  if (!node)
    return undefined
  if (node.metadata?.position)
    return node.metadata.position
  if (node.metadata?.repetitionRole)
    return node.metadata.repetitionRole
  if (node.metadata?.repeated)
    return node.role || 'repeated'
  return undefined
}

function sectionLabel(section) {
  const label = section.title?.latin || section.kind || section.sectionId
  if (label.startsWith('Chapter Office'))
    return label.replace('Chapter Office', 'Officium Capituli')
  if (/^Nocturnus \d+$/u.test(label))
    return label
  if (section.metadata?.vespersKind && !label.includes(section.metadata.vespersKind))
    return `${label} (${section.metadata.vespersKind})`
  return label
}

function nodeLabel(node) {
  if (node.type === 'blessing')
    return 'Benedictio'
  if (node.type === 'absolution')
    return 'Absolutio'
  if (node.type === 'matins-responsory' || node.type === 'responsory')
    return 'Responsorium'
  if (node.type === 'reading')
    return node.metadata?.lessonNumber ? `Lectio ${node.metadata.lessonNumber}` : 'Lectio'
  if (node.type === 'antiphon') {
    if (node.role === 'before-psalm')
      return 'Antiphona ante Psalmum'
    if (node.role === 'after-psalm')
      return 'Antiphona post Psalmum'
    if (node.role === 'before-canticle')
      return 'Antiphona ante Canticum'
    if (node.role === 'after-canticle')
      return 'Antiphona post Canticum'
    return 'Antiphona'
  }
  if (node.type === 'psalm')
    return node.metadata?.psalmNumber ? `Psalmus ${node.metadata.psalmNumber}` : 'Psalmus'
  if (node.type === 'canticle')
    return node.metadata?.canticle === 'magnificat' ? 'Magnificat' : node.metadata?.canticle === 'benedictus' ? 'Benedictus' : node.metadata?.canticle === 'nunc-dimittis' ? 'Nunc dimittis' : 'Canticum'
  if (node.type === 'chapter-office')
    return 'Officium Capituli'
  if (node.type === 'pretiosa')
    return 'Pretiosa'
  if (node.type === 'martyrology-placeholder')
    return 'Martyrologium placeholder'
  if (node.type === 'capitulum')
    return 'Capitulum'
  if (node.type === 'te-deum')
    return 'Te Deum'
  if (node.type === 'hymn')
    return 'Hymnus'
  if (node.type === 'versicle')
    return 'Versiculus'
  if (node.type === 'prayer')
    return 'Oratio'
  if (node.type === 'rubric')
    return 'Rubrica'
  if (node.type === 'dialogue')
    return 'Dialogus'
  if (node.type === 'invitatory')
    return 'Invitatorium'
  return node.role || node.type
}

function sourceRefsFor({ node, corpusEntry, sourceMap }) {
  const refs = node?.sourceRefs?.length ? node.sourceRefs : corpusEntry.sourceRefs?.length ? corpusEntry.sourceRefs : sourceMap[corpusEntry.id] || []
  return refs
    .map(ref => stableObject({
      path: ref.path,
      section: ref.section,
    }))
    .sort((a, b) => canonicalStringify(a).localeCompare(canonicalStringify(b)))
}

function choosePrimarySourceRef(sourceRefs) {
  const sorted = [...sourceRefs].sort((a, b) => sourceRefCompare(a, b))
  return sorted.find(isDirectLatinSource)
    || sorted.find(ref => (ref.transformation || []).some(item => /resolve/i.test(item)))
    || sorted[0]
    || { path: '', section: '' }
}

function sourceRefCompare(a, b) {
  return categoryCompare(categoryForSourceRef(a), categoryForSourceRef(b))
    || String(a.path || '').localeCompare(String(b.path || ''))
    || String(a.section || '').localeCompare(String(b.section || ''))
    || canonicalStringify(a).localeCompare(canonicalStringify(b))
}

function isDirectLatinSource(ref) {
  const path = normalizePath(ref.path || '')
  return path.includes('/Latin/') && !path.includes('/cgi-bin/')
}

function categoryForSourceRef(ref) {
  const path = normalizePath(ref?.path || '')
  const section = String(ref?.section || '')
  if (path.includes('/Psalterium/'))
    return 'Psalterium'
  if (path.includes('/Tempora/') || path.endsWith('/Tempora') || section.includes('Tempora'))
    return 'Tempora'
  if (path.includes('/Sancti/') || path.endsWith('/Sancti') || section.includes('Sancti'))
    return 'Sancti'
  if (path.includes('/Commune/') || path.endsWith('/Commune') || section.includes('Commune'))
    return 'Commune'
  if (path.includes('/Tabulae/'))
    return 'Tabulae'
  if (path.includes('/cgi-bin/') || /calendar|resolver|generated|rule|getordinarium|resolve_refs/iu.test(`${path} ${section} ${(ref?.transformation || []).join(' ')}`))
    return 'Rules'
  return 'Other'
}

function normalizePath(path) {
  return String(path || '').replaceAll('\\', '/')
}

function categoryCompare(a, b) {
  return SOURCE_CATEGORY_ORDER.indexOf(a) - SOURCE_CATEGORY_ORDER.indexOf(b)
}

function makeSortKey(record) {
  return [
    pad(record.hourOrder, 2),
    pad(SOURCE_CATEGORY_ORDER.indexOf(record.sourceCategory) + 1, 2),
    sha256(record.primarySourcePath || '').slice(0, 8),
    sha256(record.primarySourceSection || '').slice(0, 8),
    record.date || '',
    pad(Number(record.blockOrder || 0), 6),
    record.occurrenceId,
  ].join('|')
}

function fullSortKey(record) {
  return [
    pad(record.hourOrder, 2),
    pad(SOURCE_CATEGORY_ORDER.indexOf(record.sourceCategory) + 1, 2),
    record.primarySourcePath || '',
    record.primarySourceSection || '',
    record.date || '',
    pad(Number(record.blockOrder || 0), 6),
    record.occurrenceId,
  ].join('|')
}

function compareRecords(a, b) {
  return fullSortKey(a).localeCompare(fullSortKey(b))
}

function hourOrder(hour) {
  return HOUR_SORT_ORDER.indexOf(hour) + 1
}

function validStatus(status) {
  return TRANSLATION_STATUSES.includes(status) ? status : 'untranslated'
}

function hasEditableData(record) {
  return Boolean(
    record.translation
    || (record.translationStatus && record.translationStatus !== 'untranslated')
    || record.translator
    || record.reviewer
    || record.notes
  )
}

function pickEditable(record) {
  return {
    translation: record.translation || '',
    translationStatus: validStatus(record.translationStatus),
    translator: record.translator,
    reviewer: record.reviewer,
    notes: record.notes,
  }
}

function summarizeRecords(records, extra = {}) {
  const canonicalCounts = countBy(records, record => record.canonicalId)
  const latinCounts = countBy(records, record => record.latinHash)
  return stableObject({
    schemaVersion: FULL_OCCURRENCE_SCHEMA_VERSION,
    totalRecords: records.length,
    releaseOccurrences: records.filter(record => record.recordKind === 'liturgical-occurrence').length,
    metadataDisplayOccurrences: records.filter(record => record.recordKind !== 'liturgical-occurrence').length,
    byHour: countBy(records, record => record.hour),
    bySourceCategory: countBy(records, record => record.sourceCategory),
    duplicateCanonicalIds: Object.values(canonicalCounts).filter(count => count > 1).length,
    duplicateLatinHashes: Object.values(latinCounts).filter(count => count > 1).length,
    sourceRefsCompletePercent: records.length ? Number(((records.filter(record => record.sourceRefs?.length).length / records.length) * 100).toFixed(4)) : 0,
    sorting: 'hour-source-path-section-date-order-occurrenceId',
    exportConflicts: extra.exportConflicts || 0,
    deprecatedOccurrences: extra.deprecatedOccurrences || 0,
  })
}

function writeValidation({ workspaceRoot, options, errors, warnings, summary }) {
  const report = {
    schemaVersion: FULL_OCCURRENCE_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
  }
  if (options.writeReport !== false) {
    writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.validation), validationMarkdown(report))
    writeFileAtomic(join(workspaceRoot, FULL_OCCURRENCE_RELATIVE_REPORTS.summary), `${JSON.stringify(stableObject(summary), null, 2)}\n`)
  }
  return report
}

function validationMarkdown(report) {
  return [
    '# Full Occurrence Export Validation',
    '',
    `- Valid: ${report.valid ? 'yes' : 'no'}`,
    `- Errors: ${report.errors.length}`,
    `- Warnings: ${report.warnings.length}`,
    '',
    '## Summary',
    '',
    ...Object.entries(report.summary || {}).map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`),
    '',
    '## Errors',
    '',
    ...(report.errors.length ? report.errors.map(error => `- ${error}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(report.warnings.length ? report.warnings.map(warning => `- ${warning}`) : ['- none']),
  ].join('\n').replace(/\n+$/u, '\n')
}

function loadStructuredDays(workspaceRoot) {
  const daysRoot = join(workspaceRoot, 'structure/years/2026/days')
  return readdirSync(daysRoot)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => readJson(join(daysRoot, file)))
}

function flattenOccurrenceMap(occurrenceMap) {
  return Object.entries(occurrenceMap).flatMap(([canonicalId, occurrences]) =>
    occurrences.map(occurrence => ({ canonicalId, ...occurrence })),
  )
}

function groupBy(values, callback) {
  const grouped = new Map()
  for (const value of values) {
    const key = callback(value)
    const list = grouped.get(key) || []
    list.push(value)
    grouped.set(key, list)
  }
  return grouped
}

function countBy(values, callback) {
  const counts = {}
  for (const value of values) {
    const key = callback(value)
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
}

function mergedStatus(statuses) {
  const candidates = statuses.map(validStatus).filter(status => status !== 'untranslated')
  if (!candidates.length)
    return 'draft'
  return candidates.sort((a, b) => STATUS_RANK.get(b) - STATUS_RANK.get(a))[0]
}

function isProtected(status) {
  return status === 'reviewed' || status === 'approved'
}

function importConflict(record, kind, resolution) {
  return stableObject({
    canonicalId: record.canonicalId,
    occurrenceId: record.occurrenceId,
    kind,
    latin: record.latin,
    translation: record.translation || '',
    status: 'unresolved',
    resolution,
  })
}

function recordsClean(record) {
  if (record.relatedOccurrenceIds?.length === 0)
    delete record.relatedOccurrenceIds
}

function numberOrUndefined(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function pad(value, width) {
  return String(value).padStart(width, '0')
}

function containsHtml(value) {
  return /<\/?[a-z][^>]*>/iu.test(value)
}

function isNfc(value) {
  if (typeof value === 'string')
    return value === value.normalize('NFC')
  if (Array.isArray(value))
    return value.every(isNfc)
  if (value && typeof value === 'object')
    return Object.values(value).every(isNfc)
  return true
}

function normalizeNfc(value) {
  if (typeof value === 'string')
    return value.normalize('NFC')
  if (Array.isArray(value))
    return value.map(normalizeNfc)
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeNfc(item)]))
  return value
}

function sha256(value) {
  return createHash('sha256').update(String(value).normalize('NFC')).digest('hex')
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readJsonLines(path) {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}

function readJsonLinesIfExists(path) {
  return existsSync(path) ? readJsonLines(path) : []
}

function jsonLines(entries) {
  return entries.length ? `${entries.map(entry => JSON.stringify(stableObject(normalizeNfc(entry)))).join('\n')}\n` : ''
}

function writeFileAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, content.replace(/\r\n?/g, '\n'), 'utf8')
  renameSync(temp, path)
}

function canonicalStringify(value) {
  return JSON.stringify(stableObject(value))
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
