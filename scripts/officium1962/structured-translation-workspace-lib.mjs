import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import {
  HOUR_ORDER,
  RELEASE_YEAR,
  TRANSLATION_STATUSES,
  UPSTREAM_COMMIT,
  testHelpers,
} from './translation-corpus-lib.mjs'

export const WORKSPACE_SCHEMA_VERSION = 'officium1962.structured-translation-workspace.v1'
export const DEFAULT_LATIN_ROOT = resolve(import.meta.dirname, '../../resources/officium1962-latin')
export const DEFAULT_RELEASE_ROOT = resolve(import.meta.dirname, '../../public/data/officium1962')
export const DEFAULT_WORKSPACE_ROOT = resolve(import.meta.dirname, '../../resources/officium1962-translation')
export const LANGUAGE = 'zh-Hans'
export const WORKBOOK_TRANSLATION_START = /<!--\s*translation:start\s+id="([^"]+)"\s*-->/u
export const WORKBOOK_TRANSLATION_END = /<!--\s*translation:end\s*-->/u
export const WORKBOOK_NOTES_START = /<!--\s*notes:start\s+id="([^"]+)"\s*-->/u
export const WORKBOOK_NOTES_END = /<!--\s*notes:end\s*-->/u
export const WORKBOOK_STATUS_RE = /^<!--\s*status:\s*([a-z-]+)\s*-->$/u
export const OVERRIDE_STATUSES = ['draft', 'reviewed', 'approved']
export const OVERRIDE_REASONS = ['grammar', 'liturgical-role', 'rubric-context', 'title-context', 'other']

const STATUS_SET = new Set(TRANSLATION_STATUSES)
const OVERRIDE_STATUS_SET = new Set(OVERRIDE_STATUSES)
const OVERRIDE_REASON_SET = new Set(OVERRIDE_REASONS)
const UTF8_BOM = '\uFEFF'
const CONTEXT_VIEW_UNTRANSLATED = '[未翻译]'

export function generateStructuredTranslationWorkspace(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const latinRoot = resolve(options.latinRoot || DEFAULT_LATIN_ROOT)
  const releaseRoot = resolve(options.releaseRoot || DEFAULT_RELEASE_ROOT)
  const model = buildWorkspaceModel({ workspaceRoot, latinRoot, releaseRoot, includeContextViews: options.includeContextViews !== false })
  replaceWorkspace(workspaceRoot, model.files)
  return model.summary
}

export function renderTranslationContexts(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const latinRoot = resolve(options.latinRoot || DEFAULT_LATIN_ROOT)
  const releaseRoot = resolve(options.releaseRoot || DEFAULT_RELEASE_ROOT)
  const model = buildWorkspaceModel({ workspaceRoot, latinRoot, releaseRoot, includeContextViews: true, preserveGenerated: true })
  const contextFiles = Object.fromEntries(Object.entries(model.files).filter(([path]) => path.startsWith('context-views/')))
  for (const [path, content] of Object.entries(contextFiles))
    writeFileAtomic(join(workspaceRoot, path), content)
  writeFileAtomic(join(workspaceRoot, 'reports/roundtrip-validation.md'), model.files['reports/roundtrip-validation.md'])
  return {
    contextViews: Object.keys(contextFiles).length,
    roundtripMismatch: model.summary.roundtripMismatch,
  }
}

export function validateStructuredTranslationWorkspace(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const latinRoot = resolve(options.latinRoot || DEFAULT_LATIN_ROOT)
  const releaseRoot = resolve(options.releaseRoot || DEFAULT_RELEASE_ROOT)
  const errors = []
  const warnings = []
  let summary = {}

  try {
    const model = buildWorkspaceModel({ workspaceRoot, latinRoot, releaseRoot, includeContextViews: true, preserveGenerated: true })
    summary = model.summary
    const requiredFiles = [
      'manifest.json',
      'translations/zh-Hans.jsonl',
      'translations/zh-Hans-overrides.jsonl',
      'usage/usage-graph.json',
      'usage/relations.json',
      'usage/corpus-to-occurrences.json',
      'usage/occurrence-to-corpus.json',
      'structure/years/2026/manifest.json',
      'structure/years/2026/calendar.json',
      'review/conflicts.md',
      'review/progress.md',
      'indexes/translation-units.csv',
      'indexes/occurrences.csv',
      'indexes/source-sections.csv',
      'indexes/liturgical-structure.csv',
    ]
    for (const path of requiredFiles) {
      if (!existsSync(join(workspaceRoot, path)))
        errors.push(`missing ${path}`)
    }

    const actualManifest = readJson(join(workspaceRoot, 'manifest.json'))
    if (actualManifest.schemaVersion !== WORKSPACE_SCHEMA_VERSION)
      errors.push(`manifest schema is ${actualManifest.schemaVersion}`)
    if (actualManifest.upstreamCommit !== UPSTREAM_COMMIT)
      errors.push('manifest upstream commit changed')
    const memory = readJsonLines(join(workspaceRoot, 'translations/zh-Hans.jsonl'))
    const corpus = readJsonLines(join(latinRoot, 'corpus.jsonl'))
    compareIds('canonical translation memory', memory, corpus, errors)

    const workbookManifest = readJson(join(workspaceRoot, 'workbooks/manifest.json'))
    const workbookOwners = new Map()
    for (const [id, file] of Object.entries(workbookManifest.primaryWorkbookById || {})) {
      if (workbookOwners.has(id))
        errors.push(`${id} has multiple primary workbook owners`)
      workbookOwners.set(id, file)
    }
    if (workbookOwners.size !== corpus.length)
      errors.push(`primary workbook coverage ${workbookOwners.size}, expected ${corpus.length}`)

    const structureManifest = readJson(join(workspaceRoot, 'structure/years/2026/manifest.json'))
    if (structureManifest.dayCount !== 365)
      errors.push(`structured day count ${structureManifest.dayCount}, expected 365`)
    if (structureManifest.hourCount !== 2920)
      errors.push(`structured hour count ${structureManifest.hourCount}, expected 2920`)
    if (structureManifest.releaseOccurrenceCount !== 55184)
      errors.push(`structured occurrence count ${structureManifest.releaseOccurrenceCount}, expected 55184`)
    if (structureManifest.metadataOccurrenceCount !== 3716)
      errors.push(`metadata/display occurrence count ${structureManifest.metadataOccurrenceCount}, expected 3716`)

    const usage = readJson(join(workspaceRoot, 'usage/usage-graph.json'))
    const relations = readJson(join(workspaceRoot, 'usage/relations.json'))
    const relationTypes = new Set((relations || []).map(edge => edge.type))
    for (const type of [
      'contains',
      'precedes',
      'follows',
      'repeats',
      'antiphon-applies-to',
      'blessing-precedes-reading',
      'reading-followed-by-responsory',
      'belongs-to-nocturn',
      'belongs-to-lesson-unit',
      'belongs-to-commemoration',
      'belongs-to-chapter-office',
      'belongs-to-invitatory',
      'belongs-to-gospel-canticle',
      'first-vespers-of',
      'second-vespers-of',
    ]) {
      if (!relationTypes.has(type))
        errors.push(`missing relation type ${type}`)
    }

    const occurrenceToCorpus = readJson(join(workspaceRoot, 'usage/occurrence-to-corpus.json'))
    if (Object.keys(occurrenceToCorpus).length !== 58900)
      errors.push(`occurrence-to-corpus coverage ${Object.keys(occurrenceToCorpus).length}, expected 58900`)

    const overrides = readJsonLines(join(workspaceRoot, 'translations/zh-Hans-overrides.jsonl'))
    const overrideOccurrences = new Set()
    const corpusIds = new Set(corpus.map(entry => entry.id))
    const occurrenceIds = new Set(Object.keys(occurrenceToCorpus))
    for (const entry of overrides) {
      if (!entry.overrideId)
        errors.push('override without overrideId')
      if (!corpusIds.has(entry.corpusId))
        errors.push(`override ${entry.overrideId} references invalid corpus ${entry.corpusId}`)
      if (!occurrenceIds.has(entry.occurrenceId))
        errors.push(`override ${entry.overrideId} references invalid occurrence ${entry.occurrenceId}`)
      if (overrideOccurrences.has(entry.occurrenceId))
        errors.push(`multiple active overrides for ${entry.occurrenceId}`)
      overrideOccurrences.add(entry.occurrenceId)
      if (!OVERRIDE_REASON_SET.has(entry.reason))
        errors.push(`override ${entry.overrideId} has invalid reason ${entry.reason}`)
      if (!OVERRIDE_STATUS_SET.has(entry.status))
        errors.push(`override ${entry.overrideId} has invalid status ${entry.status}`)
    }

    const conflicts = readJsonLines(join(workspaceRoot, 'translations/conflicts.zh-Hans.jsonl'))
    if (conflicts.length)
      warnings.push(`translation conflicts present: ${conflicts.length}`)

    if (summary.roundtripMismatch !== 0)
      errors.push(`roundtrip mismatch ${summary.roundtripMismatch}`)
    if (summary.latinMutationCount !== 0)
      errors.push(`Latin mutation count ${summary.latinMutationCount}`)
  }
  catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  const report = stableObject({
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
  })
  if (options.writeReport !== false && existsSync(workspaceRoot)) {
    writeFileAtomic(join(workspaceRoot, 'validation-report.json'), `${JSON.stringify(report, null, 2)}\n`)
    writeFileAtomic(join(workspaceRoot, 'reports/roundtrip-validation.md'), roundtripReport(summary, errors, warnings))
  }
  return report
}

export function importWorkbookTranslations(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot || DEFAULT_WORKSPACE_ROOT)
  const strict = options.strict !== false
  const dryRun = Boolean(options.dryRun)
  const latinRoot = resolve(options.latinRoot || DEFAULT_LATIN_ROOT)
  const corpus = readJsonLines(join(latinRoot, 'corpus.jsonl'))
  const corpusById = new Map(corpus.map(entry => [entry.id, entry]))
  const existingMemory = loadCanonicalMemory({ workspaceRoot, latinRoot })
  const workbookManifest = readJson(join(workspaceRoot, 'workbooks/manifest.json'))
  const candidateById = new Map()
  const conflicts = []
  const mutations = []
  const seenWorkbookIds = new Map()

  for (const file of workbookManifest.primaryWorkbooks || []) {
    const abs = join(workspaceRoot, file)
    const parsed = parseWorkbookFile(abs)
    for (const entry of parsed.entries) {
      if (!corpusById.has(entry.id)) {
        conflicts.push(conflictRecord({
          corpusId: entry.id,
          latin: '',
          candidates: [entry.translation],
          locations: [{ workbookPath: file, line: entry.line, status: entry.status }],
          kind: 'unknown-id',
          resolution: 'Add a valid corpus ID or remove the workbook entry.',
        }))
        continue
      }
      const corpusEntry = corpusById.get(entry.id)
      if (entry.latin.trimEnd() !== corpusEntry.latin.trimEnd()) {
        mutations.push(entry.id)
        conflicts.push(conflictRecord({
          corpusId: entry.id,
          latin: corpusEntry.latin,
          candidates: [entry.latin],
          locations: [{ workbookPath: file, line: entry.line, status: entry.status }],
          kind: 'latin-mutated',
          resolution: 'Restore the Latin block from corpus.jsonl before importing.',
        }))
      }
      const owner = seenWorkbookIds.get(entry.id)
      if (owner && owner.file !== file) {
        conflicts.push(conflictRecord({
          corpusId: entry.id,
          latin: corpusEntry.latin,
          candidates: [owner.translation, entry.translation].filter(Boolean),
          locations: [
            { workbookPath: owner.file, line: owner.line, status: owner.status },
            { workbookPath: file, line: entry.line, status: entry.status },
          ],
          kind: 'duplicate-primary-workbook-entry',
          resolution: 'Keep the ID editable in only one primary workbook.',
        }))
      }
      seenWorkbookIds.set(entry.id, { file, line: entry.line, translation: entry.translation, status: entry.status })
      if (!entry.translation && !entry.notes && entry.status === 'untranslated')
        continue
      const previous = candidateById.get(entry.id)
      if (previous && (previous.translation !== entry.translation || previous.status !== entry.status || previous.notes !== entry.notes)) {
        conflicts.push(conflictRecord({
          corpusId: entry.id,
          latin: corpusEntry.latin,
          candidates: [previous.translation, entry.translation],
          locations: [
            { workbookPath: previous.workbookPath, line: previous.line, status: previous.status },
            { workbookPath: file, line: entry.line, status: entry.status },
          ],
          kind: 'different-translations',
          resolution: 'Resolve manually; the importer never chooses the last value silently.',
        }))
        continue
      }
      candidateById.set(entry.id, { ...entry, workbookPath: file })
    }
  }

  const merged = []
  let changed = 0
  for (const corpusEntry of corpus) {
    const current = existingMemory.get(corpusEntry.id) || canonicalEntryFromCorpus(corpusEntry, undefined)
    const candidate = candidateById.get(corpusEntry.id)
    const next = candidate
      ? stableObject({
          ...current,
          translation: candidate.translation,
          status: STATUS_SET.has(candidate.status) ? candidate.status : current.status,
          notes: candidate.notes,
          revision: Number(current.revision || 0) + (candidate.translation !== current.translation || candidate.status !== current.status || candidate.notes !== current.notes ? 1 : 0),
        })
      : current
    if (canonicalStringify(next) !== canonicalStringify(current))
      changed++
    merged.push(next)
  }

  const conflictRows = conflicts.sort((a, b) => a.corpusId.localeCompare(b.corpusId) || a.kind.localeCompare(b.kind))
  if (!dryRun) {
    writeFileAtomic(join(workspaceRoot, 'translations/conflicts.zh-Hans.jsonl'), jsonLines(conflictRows))
    writeFileAtomic(join(workspaceRoot, 'review/conflicts.md'), conflictsMarkdown(conflictRows))
    if (!conflictRows.length)
      writeFileAtomic(join(workspaceRoot, 'translations/zh-Hans.jsonl'), jsonLines(merged))
  }

  if (strict && conflictRows.length)
    throw new Error(`Workbook import found ${conflictRows.length} conflicts`)

  return {
    dryRun,
    changed,
    conflicts: conflictRows.length,
    latinMutations: mutations.length,
    importedCandidates: candidateById.size,
  }
}

export function parseWorkbookFile(path) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split(/\n/u)
  const entries = []
  for (let index = 0; index < lines.length; index++) {
    const heading = /^## `([^`]+)`/u.exec(lines[index])
    if (!heading)
      continue
    const id = heading[1]
    const startLine = index + 1
    let latin = ''
    let translation = ''
    let notes = ''
    let status = 'untranslated'

    const nextHeading = findNext(lines, index + 1, line => /^## `([^`]+)`/u.test(line))
    const chunk = lines.slice(index + 1, nextHeading < 0 ? lines.length : nextHeading)
    const latinIndex = chunk.findIndex(line => line === '### Latin')
    if (latinIndex >= 0) {
      const after = chunk.slice(latinIndex + 1)
      const end = after.findIndex(line => line === '### 中文')
      latin = after.slice(0, end < 0 ? after.length : end)
        .filter(line => line.startsWith('> ') || line === '>')
        .map(line => line.replace(/^> ?/u, ''))
        .join('\n')
        .trimEnd()
    }
    const statusLine = chunk.find(line => WORKBOOK_STATUS_RE.test(line))
    if (statusLine)
      status = WORKBOOK_STATUS_RE.exec(statusLine)[1]
    const translationStart = chunk.findIndex(line => WORKBOOK_TRANSLATION_START.test(line))
    if (translationStart >= 0) {
      const idMatch = WORKBOOK_TRANSLATION_START.exec(chunk[translationStart])
      if (idMatch?.[1] !== id)
        throw new Error(`${path}:${startLine} translation marker id mismatch`)
      const end = findNext(chunk, translationStart + 1, line => WORKBOOK_TRANSLATION_END.test(line))
      if (end < 0)
        throw new Error(`${path}:${startLine} missing translation:end marker`)
      translation = chunk.slice(translationStart + 1, end).join('\n').trim()
    }
    const notesStart = chunk.findIndex(line => WORKBOOK_NOTES_START.test(line))
    if (notesStart >= 0) {
      const idMatch = WORKBOOK_NOTES_START.exec(chunk[notesStart])
      if (idMatch?.[1] !== id)
        throw new Error(`${path}:${startLine} notes marker id mismatch`)
      const end = findNext(chunk, notesStart + 1, line => WORKBOOK_NOTES_END.test(line))
      if (end < 0)
        throw new Error(`${path}:${startLine} missing notes:end marker`)
      notes = chunk.slice(notesStart + 1, end).join('\n').trim()
    }
    entries.push({ id, latin, translation, notes, status, line: startLine })
  }
  return { entries }
}

export function buildWorkspaceModel({ workspaceRoot = DEFAULT_WORKSPACE_ROOT, latinRoot = DEFAULT_LATIN_ROOT, releaseRoot = DEFAULT_RELEASE_ROOT, includeContextViews = true, preserveGenerated = false } = {}) {
  const latin = loadLatinResources(latinRoot)
  const release = loadReleaseResources(releaseRoot)
  const existingMemory = loadCanonicalMemory({ workspaceRoot, latinRoot })
  const existingOverrides = loadOverrides(workspaceRoot)
  const translations = latin.corpus.map(entry => canonicalEntryFromCorpus(entry, existingMemory.get(entry.id))).sort(compareById)
  const translationById = new Map(translations.map(entry => [entry.id, entry]))
  const overrides = existingOverrides.sort((a, b) => a.overrideId.localeCompare(b.overrideId))
  const overridesByOccurrence = new Map(overrides.map(entry => [entry.occurrenceId, entry]))
  const sourceState = buildSourceState(latin)
  const workbookState = buildWorkbookState({ corpus: latin.corpus, existingRoot: preserveGenerated ? workspaceRoot : undefined })
  const structureState = buildStructureState({ latin, release, translationById, overridesByOccurrence })
  const usage = buildUsageGraph(structureState, latin.corpus)
  const conflicts = existsSync(join(workspaceRoot, 'translations/conflicts.zh-Hans.jsonl'))
    ? readJsonLines(join(workspaceRoot, 'translations/conflicts.zh-Hans.jsonl'))
    : []
  const contextViews = includeContextViews ? buildContextViews({ structureState, translationById, overridesByOccurrence }) : {}
  const workbooks = buildWorkbooks({ corpus: latin.corpus, workbookState, sourceState })
  const indexes = buildIndexes({ corpus: latin.corpus, workbookState, structureState, sourceState, translationById })
  const reports = buildReports({ latin, structureState, usage, workbooks, translations, overrides, conflicts })
  const schemas = buildSchemas()
  const docs = buildDocs()
  const summary = buildSummary({ latin, structureState, usage, workbooks, translations, overrides, conflicts })
  const manifest = stableObject({
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    language: LANGUAGE,
    releaseYear: RELEASE_YEAR,
    upstreamCommit: UPSTREAM_COMMIT,
    sourceCorpusManifest: '../officium1962-latin/manifest.json',
    canonicalTranslationMemory: 'translations/zh-Hans.jsonl',
    contextOverrides: 'translations/zh-Hans-overrides.jsonl',
    legacyFlatTemplate: '../officium1962-latin/translation-template.zh-Hans.jsonl',
    counts: summary,
    generatedFrom: {
      releaseRoot: 'public/data/officium1962',
      latinRoot: 'resources/officium1962-latin',
    },
  })

  const files = {
    'README.md': docs.readme,
    'manifest.json': `${JSON.stringify(manifest, null, 2)}\n`,
    'translations/zh-Hans.jsonl': jsonLines(translations),
    'translations/zh-Hans-overrides.jsonl': jsonLines(overrides),
    'translations/deprecated.zh-Hans.jsonl': jsonLines(loadDeprecated(latinRoot, existingMemory, latin.corpus)),
    'translations/conflicts.zh-Hans.jsonl': jsonLines(conflicts),
    'usage/usage-graph.json': `${JSON.stringify(usage.usageGraph)}\n`,
    'usage/relations.json': `${JSON.stringify(usage.relations)}\n`,
    'usage/corpus-to-occurrences.json': `${JSON.stringify(stableObject(usage.corpusToOccurrences))}\n`,
    'usage/occurrence-to-corpus.json': `${JSON.stringify(stableObject(usage.occurrenceToCorpus))}\n`,
    'structure/years/2026/manifest.json': `${JSON.stringify(structureState.manifest, null, 2)}\n`,
    'structure/years/2026/calendar.json': `${JSON.stringify(structureState.calendar, null, 2)}\n`,
    'workbooks/manifest.json': `${JSON.stringify(workbooks.manifest, null, 2)}\n`,
    'review/untranslated.md': reports.untranslated,
    'review/conflicts.md': conflictsMarkdown(conflicts),
    'review/overrides.md': reports.overrides,
    'review/high-priority.md': reports.highPriority,
    'review/progress.md': reports.progress,
    'indexes/translation-units.csv': indexes.translationUnits,
    'indexes/occurrences.csv': indexes.occurrences,
    'indexes/source-sections.csv': indexes.sourceSections,
    'indexes/liturgical-structure.csv': indexes.liturgicalStructure,
    'reports/generation-summary.md': reports.generationSummary,
    'reports/structure-coverage.md': reports.structureCoverage,
    'reports/relation-coverage.md': reports.relationCoverage,
    'reports/roundtrip-validation.md': reports.roundtripValidation,
    'reports/migration-from-flat-template.md': reports.migration,
    'schema/translation-memory.schema.json': `${JSON.stringify(schemas.translationMemory, null, 2)}\n`,
    'schema/context-override.schema.json': `${JSON.stringify(schemas.contextOverride, null, 2)}\n`,
    'schema/structured-day.schema.json': `${JSON.stringify(schemas.structuredDay, null, 2)}\n`,
    'schema/workbook.schema.json': `${JSON.stringify(schemas.workbook, null, 2)}\n`,
    'schema/usage-graph.schema.json': `${JSON.stringify(schemas.usageGraph, null, 2)}\n`,
  }
  for (const [date, day] of structureState.days)
    files[`structure/years/2026/days/${date}.json`] = `${JSON.stringify(day, null, 2)}\n`
  for (const [path, content] of Object.entries(workbooks.files))
    files[path] = content
  for (const [path, content] of Object.entries(contextViews))
    files[path] = content
  return { files, summary }
}

function loadLatinResources(latinRoot) {
  return {
    manifest: readJson(join(latinRoot, 'manifest.json')),
    corpus: readJsonLines(join(latinRoot, 'corpus.jsonl')),
    template: readJsonLines(join(latinRoot, 'translation-template.zh-Hans.jsonl')),
    sourceMap: readJson(join(latinRoot, 'source-map.json')),
    occurrenceMap: readJson(join(latinRoot, 'occurrence-map.json')),
    calendarTitles: readJsonLines(join(latinRoot, 'calendar-titles.jsonl')),
  }
}

function loadReleaseResources(releaseRoot) {
  const root = readJson(join(releaseRoot, 'manifest.json'))
  const yearEntry = root.availableYears.find(item => item.year === RELEASE_YEAR)
  const yearManifest = readJson(join(releaseRoot, yearEntry.path))
  const yearRoot = dirname(join(releaseRoot, yearEntry.path))
  const calendar = readJson(join(yearRoot, yearManifest.calendar.path))
  const sharedManifest = readJson(join(releaseRoot, root.shared.path))
  const blocks = new Map()
  for (const chunkEntry of sharedManifest.chunks) {
    const chunk = readJson(join(releaseRoot, 'shared', chunkEntry.file))
    for (const block of chunk.blocks)
      blocks.set(block.id, block)
  }
  const days = new Map()
  for (const entry of yearManifest.days)
    days.set(entry.date, readJson(join(yearRoot, entry.path)))
  return { root, yearManifest, calendar, sharedManifest, blocks, days }
}

function loadCanonicalMemory({ workspaceRoot, latinRoot }) {
  const state = new Map()
  const current = join(workspaceRoot, 'translations/zh-Hans.jsonl')
  const legacy = join(latinRoot, 'translation-template.zh-Hans.jsonl')
  for (const path of [legacy, current]) {
    if (!existsSync(path))
      continue
    for (const entry of readJsonLines(path)) {
      if (!entry.id)
        continue
      state.set(entry.id, entry)
    }
  }
  return state
}

function loadOverrides(workspaceRoot) {
  const path = join(workspaceRoot, 'translations/zh-Hans-overrides.jsonl')
  return existsSync(path) ? readJsonLines(path) : []
}

function loadDeprecated(latinRoot, existingMemory, corpus) {
  const corpusIds = new Set(corpus.map(entry => entry.id))
  const latinDeprecated = join(latinRoot, 'reports/deprecated-translations.jsonl')
  const rows = existsSync(latinDeprecated) ? readJsonLines(latinDeprecated) : []
  for (const entry of existingMemory.values()) {
    if (entry.id && !corpusIds.has(entry.id))
      rows.push(stableObject({ ...entry, deprecatedBy: 'structured-translation-workspace' }))
  }
  return uniqueBy(rows, entry => entry.id).sort(compareById)
}

function canonicalEntryFromCorpus(corpusEntry, previous = {}) {
  const translation = typeof previous.translation === 'string'
    ? previous.translation
    : typeof previous.text === 'string' ? previous.text : ''
  const status = STATUS_SET.has(previous.status) ? previous.status : 'untranslated'
  return stableObject({
    id: corpusEntry.id,
    latin: corpusEntry.latin,
    type: corpusEntry.type,
    subtype: corpusEntry.subtype,
    translation,
    status,
    translator: stringOrEmpty(previous.translator),
    reviewer: stringOrEmpty(previous.reviewer),
    notes: stringOrEmpty(previous.notes),
    sourceRefs: corpusEntry.sourceRefs,
    occurrenceCount: corpusEntry.occurrenceCount,
    representativeContexts: corpusEntry.contexts || [],
    revision: Number(previous.revision || 0),
    updatedAt: typeof previous.updatedAt === 'string' ? previous.updatedAt : undefined,
  })
}

function buildSourceState(latin) {
  const primarySourceById = {}
  for (const entry of latin.corpus) {
    const ref = entry.sourceRefs?.[0] || {}
    primarySourceById[entry.id] = `${ref.path || 'unknown'}${ref.section ? ` [${ref.section}]` : ''}`
  }
  return { primarySourceById }
}

function buildWorkbookState({ corpus, existingRoot }) {
  const primaryWorkbookById = {}
  const idsByWorkbook = {}
  const existingManual = new Map()
  if (existingRoot && existsSync(join(existingRoot, 'workbooks/manifest.json'))) {
    const manifest = readJson(join(existingRoot, 'workbooks/manifest.json'))
    for (const file of manifest.primaryWorkbooks || []) {
      const path = join(existingRoot, file)
      if (!existsSync(path))
        continue
      for (const entry of parseWorkbookFile(path).entries)
        existingManual.set(entry.id, entry)
    }
  }
  for (const entry of corpus) {
    const file = workbookPathFor(entry)
    primaryWorkbookById[entry.id] = file
    idsByWorkbook[file] ||= []
    idsByWorkbook[file].push(entry.id)
  }
  for (const ids of Object.values(idsByWorkbook))
    ids.sort()
  return { primaryWorkbookById, idsByWorkbook, existingManual }
}

function workbookPathFor(entry) {
  if (entry.translationPriority === 'core')
    return 'workbooks/core/core.md'
  if (entry.translationPriority === 'high')
    return 'workbooks/core/high-priority.md'
  if (entry.liturgicalMetadata?.seasons?.length === 1)
    return `workbooks/by-season/${slug(entry.liturgicalMetadata.seasons[0])}.md`
  if (entry.type)
    return `workbooks/by-type/${slug(testHelpers.typeBucket(entry.type))}.md`
  const ref = entry.sourceRefs?.[0]?.path || 'unknown'
  return `workbooks/by-source/${slug(ref.split('/').slice(-2).join('-'))}.md`
}

function buildStructureState({ latin, release, translationById, overridesByOccurrence }) {
  const corpusById = new Map(latin.corpus.map(entry => [entry.id, entry]))
  const calendarByDate = new Map(latin.calendarTitles.map(row => [row.date, row]))
  const days = new Map()
  const sections = []
  const occurrenceRows = []
  const metadataRows = buildMetadataOccurrenceRows(latin)
  const nodeByOccurrence = new Map()
  const parentByOccurrence = new Map()
  const sectionById = new Map()
  let sectionCount = 0

  for (const date of [...release.days.keys()].sort()) {
    const releaseDay = release.days.get(date)
    const calendarRow = calendarByDate.get(date)
    const day = stableObject({
      date,
      liturgicalTitle: textRef(calendarRow?.titleId, `calendar-${date}-title`, releaseDay.liturgicalTitle, 'calendar-title'),
      rank: calendarRow?.rankId ? textRef(calendarRow.rankId, `calendar-${date}-rank`, calendarRow.rank, 'rank') : undefined,
      season: calendarRow?.season || undefined,
      commemorations: (calendarRow?.commemorations || []).map(item => textRef(item.id, `calendar-${date}-commemoration-${item.id}`, item.title, 'commemoration-title')),
      hours: {},
    })
    for (const hourName of HOUR_ORDER) {
      const hour = releaseDay.hours[hourName]
      const hourTitleId = findHourTitleId(latin.occurrenceMap, date, hourName)
      const structuredHour = stableObject({
        hour: hourName,
        title: textRef(hourTitleId, `calendar-${date}-${hourName}-title`, hour.title, 'hour-title'),
        metadata: hour.metadata || {},
        sections: [],
      })
      const built = buildHourSections({ date, hourName, hour, release, corpusById, translationById, overridesByOccurrence })
      structuredHour.sections = built.sections
      for (const section of flattenSections(built.sections)) {
        sectionCount++
        sections.push({ date, hour: hourName, sectionId: section.sectionId, kind: section.kind, metadata: section.metadata || {} })
        sectionById.set(section.sectionId, section)
      }
      for (const node of built.nodes) {
        occurrenceRows.push(node)
        nodeByOccurrence.set(node.occurrenceId, node)
        parentByOccurrence.set(node.occurrenceId, node.relations.parentSectionId)
      }
      day.hours[hourName] = structuredHour
    }
    days.set(date, day)
  }

  const calendar = stableObject({
    year: RELEASE_YEAR,
    days: [...days.values()].map(day => ({
      date: day.date,
      liturgicalTitle: day.liturgicalTitle,
      rank: day.rank,
      season: day.season,
      commemorations: day.commemorations,
    })),
  })
  const manifest = stableObject({
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    year: RELEASE_YEAR,
    dayCount: days.size,
    hourCount: days.size * HOUR_ORDER.length,
    sectionCount,
    releaseOccurrenceCount: occurrenceRows.length,
    metadataOccurrenceCount: metadataRows.length,
    sourceRefsCompletePercent: latin.manifest.counts.sourceRefsCompletePercent,
    days: [...days.keys()].map(date => ({ date, path: `days/${date}.json` })),
  })
  return { days, calendar, manifest, sections, occurrenceRows, metadataRows, nodeByOccurrence, parentByOccurrence, sectionById }
}

function buildMetadataOccurrenceRows(latin) {
  const sharedIds = new Set(latin.corpus.filter(entry => entry.subtype === 'shared-block').map(entry => entry.id))
  const corpusById = new Map(latin.corpus.map(entry => [entry.id, entry]))
  const rows = []
  for (const [corpusId, occurrences] of Object.entries(latin.occurrenceMap)) {
    if (sharedIds.has(corpusId))
      continue
    const corpus = corpusById.get(corpusId)
    for (const occurrence of occurrences) {
      rows.push(stableObject({
        occurrenceId: occurrence.occurrenceId,
        corpusId,
        date: occurrence.date,
        hour: occurrence.hour,
        order: occurrence.order,
        role: occurrence.role,
        latin: corpus?.latin || '',
      }))
    }
  }
  return rows.sort((a, b) => a.occurrenceId.localeCompare(b.occurrenceId))
}

function buildHourSections({ date, hourName, hour, release, corpusById, overridesByOccurrence }) {
  const nodes = hour.occurrences.map((occurrence, index) => {
    const block = release.blocks.get(occurrence.blockId)
    const rawMetadata = occurrence.occurrenceMetadata?.metadata || {}
    const metadata = compactOccurrenceMetadata(rawMetadata, hourName, hour.metadata || {})
    const corpus = corpusById.get(occurrence.blockId)
    const node = stableObject({
      occurrenceId: occurrence.occurrenceId,
      corpusId: occurrence.blockId,
      type: block.type,
      role: occurrenceRole(block.type, rawMetadata),
      order: occurrence.order,
      latin: corpus?.latin || composeSharedLatin(block),
      translationRef: {
        canonicalId: occurrence.blockId,
        overrideId: overridesByOccurrence.get(occurrence.occurrenceId)?.overrideId,
      },
      relations: {
        previousOccurrenceId: hour.occurrences[index - 1]?.occurrenceId,
        nextOccurrenceId: hour.occurrences[index + 1]?.occurrenceId,
      },
      sourceRefs: occurrence.occurrenceMetadata?.sourceRefs || block.sourceRefs || [],
      metadata,
    })
    return node
  })
  addLessonNodeRelations(nodes)
  const byOccurrenceId = new Map(nodes.map(node => [node.occurrenceId, node]))
  const sections = hourName === 'matutinum'
    ? buildMatutinumSections({ date, hourName, hour, nodes, byOccurrenceId })
    : buildNonMatutinumSections({ date, hourName, hour, nodes })
  assignParentRelations(sections)
  addLocalRelations({ sections, nodes, hourName, hour })
  return { sections, nodes }
}

function buildMatutinumSections({ date, hourName, hour, nodes, byOccurrenceId }) {
  const rootSections = []
  const used = new Set()
  const meta = hour.metadata || {}
  const openingNodes = takeUntil(nodes, node => ['invitatory', 'hymn'].includes(node.type) || /nocturn-\d+-antiphon-open/u.test(node.occurrenceId))
  if (openingNodes.length)
    rootSections.push(section(date, hourName, 'opening', 'Initium', openingNodes, { sectionSlug: 'opening' }))
  markUsed(openingNodes, used)
  const invitatory = nodes.find(node => node.type === 'invitatory')
  if (invitatory) {
    rootSections.push(section(date, hourName, 'invitatory', 'Invitatorium', [invitatory], { sectionSlug: 'invitatory' }))
    used.add(invitatory.occurrenceId)
  }
  const hymn = nodes.find(node => node.type === 'hymn')
  if (hymn) {
    rootSections.push(section(date, hourName, 'hymn', 'Hymnus', [hymn], { sectionSlug: 'hymn' }))
    used.add(hymn.occurrenceId)
  }
  for (const nocturn of meta.nocturns || []) {
    const children = []
    const psalmIds = new Set(nocturn.psalmBlockIds || [])
    const psalmodyNodes = nodes.filter(node => !used.has(node.occurrenceId) && (
      psalmIds.has(node.occurrenceId) ||
      node.metadata?.nocturn === nocturn.number && ['antiphon', 'psalm', 'versicle'].includes(node.type)
    ))
    if (psalmodyNodes.length) {
      children.push(section(date, hourName, 'psalmody', 'Psalmody', psalmodyNodes, {
        sectionSlug: `nocturn-${nocturn.number}-psalmody`,
        metadata: { nocturn: nocturn.number },
      }))
      markUsed(psalmodyNodes, used)
    }
    const absolution = byOccurrenceId.get(nocturn.absolutionBlockId)
    if (absolution && !used.has(absolution.occurrenceId)) {
      children.push(section(date, hourName, 'lesson-unit', 'Absolutio', [absolution], {
        sectionSlug: `nocturn-${nocturn.number}-absolution`,
        metadata: { nocturn: nocturn.number },
      }))
      used.add(absolution.occurrenceId)
    }
    const lessonIds = nocturn.lessonBlockIds || []
    for (const lessonId of lessonIds) {
      const lesson = byOccurrenceId.get(lessonId)
      if (!lesson)
        continue
      const lessonNumber = lesson.metadata?.lessonNumber
      const blessing = nodes.find(node => !used.has(node.occurrenceId) && node.type === 'blessing' && node.metadata?.lessonNumber === lessonNumber)
      const responsory = nodes.find(node => !used.has(node.occurrenceId) && /responsorium/u.test(node.occurrenceId) && lessonNumberFor(node) === lessonNumber)
      const lessonUnitNodes = [blessing, lesson, responsory].filter(Boolean)
      children.push(section(date, hourName, 'lesson-unit', `Lectio ${lessonNumber || ''}`.trim(), lessonUnitNodes, {
        sectionSlug: `lesson-${lessonNumber || lessonId}`,
        metadata: { nocturn: nocturn.number, lessonNumber, responsoryNumber: responsory?.metadata?.responsoryNumber },
      }))
      markUsed(lessonUnitNodes, used)
    }
    rootSections.push(section(date, hourName, 'nocturn', `Nocturnus ${nocturn.number}`, children, {
      sectionSlug: `nocturn-${nocturn.number}`,
      metadata: { nocturn: nocturn.number },
    }))
  }
  const remaining = nodes.filter(node => !used.has(node.occurrenceId))
  if (remaining.length)
    rootSections.push(section(date, hourName, remaining.some(node => node.type === 'te-deum') ? 'conclusion' : 'other', 'Conclusio', remaining, { sectionSlug: 'conclusion' }))
  return rootSections
}

function addLessonNodeRelations(nodes) {
  for (const node of nodes) {
    if (node.type === 'blessing' && lessonNumberFor(node)) {
      const lesson = nodes.find(item => item.type === 'reading' && lessonNumberFor(item) === lessonNumberFor(node))
      if (lesson)
        node.relations.blessingForOccurrenceId = lesson.occurrenceId
    }
    if ((node.type === 'matins-responsory' || /responsorium/u.test(node.occurrenceId)) && lessonNumberFor(node)) {
      const lesson = nodes.find(item => item.type === 'reading' && lessonNumberFor(item) === lessonNumberFor(node))
      if (lesson) {
        node.relations.responsoryForOccurrenceId = lesson.occurrenceId
        node.relations.belongsToLessonUnit = `lesson-unit-${lessonNumberFor(node)}`
        lesson.relations.responsoryForOccurrenceId = node.occurrenceId
      }
    }
    if (lessonNumberFor(node))
      node.relations.belongsToLessonUnit ||= `lesson-unit-${lessonNumberFor(node)}`
  }
}

function compactOccurrenceMetadata(metadata, hourName, hourMetadata) {
  const copy = {}
  for (const [key, value] of Object.entries(metadata || {})) {
    if (['matutinum', 'majorHour'].includes(key))
      continue
    if (Array.isArray(value) && value.length > 20)
      continue
    if (value && typeof value === 'object' && JSON.stringify(value).length > 4000)
      continue
    copy[key] = value
  }
  if (hourName === 'vesperae')
    copy.vespersKind = hourMetadata?.psalmodySource === 'special' || metadata?.specialStructure ? 'special' : 'ferial'
  if (hourName === 'laudes' && hourMetadata?.gospelCanticle)
    copy.gospelCanticle = hourMetadata.gospelCanticle
  if (hourName === 'vesperae' && hourMetadata?.gospelCanticle)
    copy.gospelCanticle = hourMetadata.gospelCanticle
  return stableObject(copy)
}

function buildNonMatutinumSections({ date, hourName, hour, nodes }) {
  const sections = []
  const buckets = []
  let current = []
  let currentKind = ''
  const flush = () => {
    if (!current.length)
      return
    buckets.push({ kind: currentKind || classifySectionKind(current[0], hourName, hour), nodes: current })
    current = []
    currentKind = ''
  }
  for (const node of nodes) {
    const kind = classifySectionKind(node, hourName, hour)
    if (current.length && kind !== currentKind)
      flush()
    currentKind = kind
    current.push(node)
  }
  flush()
  const counters = {}
  for (const bucket of buckets) {
    counters[bucket.kind] = (counters[bucket.kind] || 0) + 1
    const title = sectionTitle(bucket.kind, bucket.nodes[0], counters[bucket.kind])
    sections.push(section(date, hourName, bucket.kind, title, bucket.nodes, {
      sectionSlug: `${bucket.kind}-${counters[bucket.kind]}`,
      metadata: sectionMetadata(bucket.kind, bucket.nodes, hourName, hour),
    }))
  }
  return sections
}

function classifySectionKind(node, hourName, hour) {
  if (node.type === 'invitatory')
    return 'invitatory'
  if (node.type === 'hymn')
    return 'hymn'
  if (node.type === 'antiphon' || node.type === 'psalm')
    return 'psalmody'
  if (node.type === 'canticle' || node.metadata?.gospelCanticle || hour.metadata?.gospelCanticle)
    return 'gospel-canticle'
  if (node.type === 'chapter-office' || node.type === 'pretiosa' || node.metadata?.withinChapterOffice)
    return 'chapter-office'
  if (node.type === 'commemoration' || node.metadata?.commemorationTitle)
    return 'commemoration'
  if (['capitulum', 'responsory', 'versicle', 'prayer', 'reading'].includes(node.type))
    return 'chapter-office'
  if (['dialogue', 'blessing'].includes(node.type) && node.order <= 4)
    return 'opening'
  if (['dialogue', 'blessing', 'rubric', 'marian-antiphon'].includes(node.type))
    return 'conclusion'
  return 'other'
}

function sectionTitle(kind, node, count) {
  const title = {
    opening: 'Initium',
    invitatory: 'Invitatorium',
    hymn: 'Hymnus',
    psalmody: 'Psalmody',
    'lesson-unit': 'Lectio',
    'gospel-canticle': 'Canticum evangelicum',
    'chapter-office': 'Chapter Office',
    commemoration: 'Commemoratio',
    conclusion: 'Conclusio',
    other: 'Alia',
  }[kind] || 'Sectio'
  return count > 1 ? `${title} ${count}` : title
}

function sectionMetadata(kind, nodes, hourName, hour) {
  const metadata = {}
  const first = nodes[0]
  if (first?.metadata?.nocturn)
    metadata.nocturn = first.metadata.nocturn
  if (first?.metadata?.lessonNumber)
    metadata.lessonNumber = first.metadata.lessonNumber
  if (first?.metadata?.responsoryNumber)
    metadata.responsoryNumber = first.metadata.responsoryNumber
  if (hourName === 'vesperae')
    metadata.vespersKind = hour.metadata?.psalmodySource === 'special' || nodes.some(node => node.metadata?.specialStructure) ? 'special' : 'ferial'
  if (nodes.some(node => node.metadata?.position === 'after-psalmody' || node.metadata?.repeated))
    metadata.repetitionRole = 'repeat'
  return metadata
}

function addLocalRelations({ sections, nodes, hourName, hour }) {
  const nodesById = new Map(nodes.map(node => [node.occurrenceId, node]))
  const antiphons = nodes.filter(node => node.type === 'antiphon')
  const openByKey = new Map()
  for (const antiphon of antiphons) {
    const key = antiphon.metadata?.antiphonKey || antiphon.latin
    if (antiphon.metadata?.repeated || antiphon.metadata?.position === 'after-psalmody') {
      const open = openByKey.get(key)
      if (open)
        antiphon.relations.repeatsOccurrenceId = open.occurrenceId
    }
    else if (!openByKey.has(key)) {
      openByKey.set(key, antiphon)
    }
  }
  for (const antiphon of antiphons) {
    const key = antiphon.metadata?.antiphonKey
    if (!key)
      continue
    antiphon.relations.antiphonForOccurrenceIds = nodes
      .filter(node => node.type === 'psalm' && node.metadata?.antiphonKey === key)
      .map(node => node.occurrenceId)
  }
  for (const node of nodes) {
    if (node.type === 'blessing' && node.metadata?.lessonNumber) {
      const lesson = nodes.find(item => item.type === 'reading' && item.metadata?.lessonNumber === node.metadata.lessonNumber)
      if (lesson)
        node.relations.blessingForOccurrenceId = lesson.occurrenceId
    }
    if ((node.type === 'matins-responsory' || /responsorium/u.test(node.occurrenceId)) && lessonNumberFor(node)) {
      const lesson = nodes.find(item => item.type === 'reading' && lessonNumberFor(item) === lessonNumberFor(node))
      if (lesson) {
        node.relations.responsoryForOccurrenceId = lesson.occurrenceId
        node.relations.belongsToLessonUnit = `lesson-unit-${lesson.occurrenceId}`
        lesson.relations.responsoryForOccurrenceId = node.occurrenceId
      }
    }
    if (lessonNumberFor(node))
      node.relations.belongsToLessonUnit = `lesson-unit-${lessonNumberFor(node)}`
  }
  if (hourName === 'matutinum' && hour.metadata?.nocturns) {
    for (const nocturn of hour.metadata.nocturns) {
      for (const id of [
        ...(nocturn.psalmBlockIds || []),
        ...(nocturn.lessonBlockIds || []),
        ...(nocturn.responsoryBlockIds || []),
        nocturn.absolutionBlockId,
        nocturn.versicleBlockId,
      ].filter(Boolean)) {
        const node = nodesById.get(id)
        if (node)
          node.relations.belongsToNocturn = nocturn.number
      }
    }
  }
  assignParentRelations(sections)
}

function assignParentRelations(sections, parent) {
  for (const item of sections) {
    if (isSection(item)) {
      if (parent)
        item.metadata = stableObject({ ...(item.metadata || {}), parentSectionId: parent.sectionId })
      assignParentRelations(item.children || [], item)
    }
    else if (parent) {
      item.relations.parentSectionId = parent.sectionId
    }
  }
}

function buildUsageGraph(structureState, corpus) {
  const relations = []
  const nodes = []
  const occurrenceToCorpus = {}
  const corpusToOccurrences = Object.fromEntries(corpus.map(entry => [entry.id, []]))
  const add = (type, from, to, date, hour, metadata = {}) => {
    relations.push(stableObject({
      relationId: relationId(type, from, to, date, hour, relations.length + 1),
      type,
      from,
      to,
      date,
      hour,
      metadata,
    }))
  }
  for (const day of structureState.days.values()) {
    nodes.push({ id: `day-${day.date}`, type: 'day', date: day.date })
    for (const [hourName, hour] of Object.entries(day.hours)) {
      const hourId = `hour-${day.date}-${hourName}`
      nodes.push({ id: hourId, type: 'hour', date: day.date, hour: hourName })
      add('contains', `day-${day.date}`, hourId, day.date, hourName)
      if (hourName === 'vesperae') {
        add('second-vespers-of', hourId, `day-${day.date}`, day.date, hourName)
        const nextDate = addDaysIso(day.date, 1)
        if (structureState.days.has(nextDate))
          add('first-vespers-of', hourId, `day-${nextDate}`, day.date, hourName, { targetDate: nextDate })
      }
      for (const topSection of hour.sections)
        walkSection(topSection, hourId, day.date, hourName)
    }
  }
  for (const node of structureState.occurrenceRows) {
    occurrenceToCorpus[node.occurrenceId] = node.corpusId
    corpusToOccurrences[node.corpusId] ||= []
    corpusToOccurrences[node.corpusId].push(node.occurrenceId)
    if (node.relations.previousOccurrenceId) {
      add('precedes', node.relations.previousOccurrenceId, node.occurrenceId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
      add('follows', node.occurrenceId, node.relations.previousOccurrenceId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    }
    if (node.relations.repeatsOccurrenceId)
      add('repeats', node.occurrenceId, node.relations.repeatsOccurrenceId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    for (const psalmId of node.relations.antiphonForOccurrenceIds || [])
      add('antiphon-applies-to', node.occurrenceId, psalmId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.relations.blessingForOccurrenceId)
      add('blessing-precedes-reading', node.occurrenceId, node.relations.blessingForOccurrenceId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.relations.responsoryForOccurrenceId && node.type === 'reading')
      add('reading-followed-by-responsory', node.occurrenceId, node.relations.responsoryForOccurrenceId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.relations.belongsToNocturn)
      add('belongs-to-nocturn', node.occurrenceId, `${dateFromOccurrence(node.occurrenceId)}-matutinum-nocturn-${node.relations.belongsToNocturn}`, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId), { nocturn: node.relations.belongsToNocturn })
    if (node.relations.belongsToLessonUnit)
      add('belongs-to-lesson-unit', node.occurrenceId, node.relations.belongsToLessonUnit, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.type === 'commemoration' || node.metadata?.commemorationTitle)
      add('belongs-to-commemoration', node.occurrenceId, node.relations.parentSectionId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.type === 'chapter-office' || node.type === 'pretiosa' || node.metadata?.withinChapterOffice)
      add('belongs-to-chapter-office', node.occurrenceId, node.relations.parentSectionId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.type === 'invitatory')
      add('belongs-to-invitatory', node.occurrenceId, node.relations.parentSectionId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (node.type === 'canticle' || node.metadata?.gospelCanticle)
      add('belongs-to-gospel-canticle', node.occurrenceId, node.relations.parentSectionId, dateFromOccurrence(node.occurrenceId), hourFromOccurrence(node.occurrenceId))
    if (hourFromOccurrence(node.occurrenceId) === 'vesperae') {
      const vespersKind = node.metadata?.vespersKind || node.metadata?.specialStructure
      if (String(vespersKind).includes('first'))
        add('first-vespers-of', node.occurrenceId, `day-${dateFromOccurrence(node.occurrenceId)}`, dateFromOccurrence(node.occurrenceId), 'vesperae')
      if (String(vespersKind).includes('second') || node.metadata?.specialStructure || node.metadata?.majorHour)
        add('second-vespers-of', node.occurrenceId, `day-${dateFromOccurrence(node.occurrenceId)}`, dateFromOccurrence(node.occurrenceId), 'vesperae')
      }
  }
  for (const row of structureState.metadataRows) {
    occurrenceToCorpus[row.occurrenceId] = row.corpusId
    corpusToOccurrences[row.corpusId] ||= []
    corpusToOccurrences[row.corpusId].push(row.occurrenceId)
    nodes.push({ id: row.occurrenceId, type: 'metadata-occurrence', corpusId: row.corpusId, date: row.date, hour: row.hour })
    if (row.date && row.hour && row.date !== 'production-page') {
      const parent = row.hour === 'calendar' ? `day-${row.date}` : `hour-${row.date}-${row.hour}`
      add('contains', parent, row.occurrenceId, row.date, row.hour, { role: row.role, metadataDisplay: true })
    }
  }
  for (const refs of Object.values(corpusToOccurrences))
    refs.sort()
  const usageGraph = stableObject({
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    nodes,
    relationFile: 'relations.json',
    counts: {
      nodes: nodes.length,
      relations: relations.length,
      occurrences: Object.keys(occurrenceToCorpus).length,
      corpus: Object.keys(corpusToOccurrences).length,
    },
  })
  return { usageGraph, relations, corpusToOccurrences, occurrenceToCorpus }

  function walkSection(sectionNode, parentId, date, hour) {
    nodes.push({ id: sectionNode.sectionId, type: 'section', kind: sectionNode.kind, date, hour })
    add('contains', parentId, sectionNode.sectionId, date, hour)
    for (const child of sectionNode.children || []) {
      if (isSection(child))
        walkSection(child, sectionNode.sectionId, date, hour)
      else {
        nodes.push({ id: child.occurrenceId, type: 'occurrence', corpusId: child.corpusId, date, hour })
        add('contains', sectionNode.sectionId, child.occurrenceId, date, hour)
      }
    }
  }
}

function buildWorkbooks({ corpus, workbookState, sourceState }) {
  const files = {}
  const primaryWorkbooks = Object.keys(workbookState.idsByWorkbook).sort()
  for (const file of primaryWorkbooks) {
    const entries = workbookState.idsByWorkbook[file].map(id => corpus.find(entry => entry.id === id))
    files[file] = workbookMarkdown(entries, workbookState, sourceState)
  }
  const manifest = stableObject({
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    language: LANGUAGE,
    primaryWorkbooks,
    primaryWorkbookById: workbookState.primaryWorkbookById,
    counts: {
      corpusEntries: corpus.length,
      primaryWorkbooks: primaryWorkbooks.length,
    },
  })
  return { files, manifest }
}

function markdownFile(lines) {
  const normalized = [...lines]
  while (normalized.length > 0 && normalized[normalized.length - 1] === '')
    normalized.pop()
  return `${normalized.join('\n').replace(/\r\n?/g, '\n')}\n`
}

function markdownText(text) {
  return markdownFile(text.replace(/\r\n?/g, '\n').split('\n'))
}

function workbookMarkdown(entries, workbookState, sourceState) {
  const lines = [
    '# Officium 1962 Translation Workbook',
    '',
    '本文件是 primary editable workbook。只编辑 marker 中间的中文、备注和 status 注释，不修改 Latin、ID 或标题。',
    '',
  ]
  for (const entry of entries) {
    const existing = workbookState.existingManual.get(entry.id)
    const translation = existing?.translation ?? entry.translation?.text ?? ''
    const notes = existing?.notes ?? entry.translation?.notes ?? ''
    const status = existing?.status ?? entry.translation?.status ?? 'untranslated'
    lines.push(
      `## \`${entry.id}\``,
      '',
      `**类型：** ${entry.type}${entry.subtype ? ` / ${entry.subtype}` : ''}`,
      `**来源：** ${sourceState.primarySourceById[entry.id]}`,
      `**出现次数：** ${entry.occurrenceCount}`,
      `**使用时辰：** ${(entry.liturgicalMetadata?.hours || []).join(', ') || 'metadata/display'}`,
      `**代表日期：** ${(entry.contexts || []).slice(0, 5).map(context => `${context.date} ${context.hour}`).join(', ')}`,
      '',
      '### Latin',
      '',
      ...entry.latin.split('\n').map(line => `> ${line}`),
      '',
      '### 中文',
      '',
      `<!-- translation:start id="${entry.id}" -->`,
      translation,
      '<!-- translation:end -->',
      '',
      '### 状态',
      '',
      `<!-- status: ${STATUS_SET.has(status) ? status : 'untranslated'} -->`,
      '',
      '### 备注',
      '',
      `<!-- notes:start id="${entry.id}" -->`,
      notes,
      '<!-- notes:end -->',
      '',
    )
  }
  return markdownFile(lines)
}

function buildContextViews({ structureState, translationById, overridesByOccurrence }) {
  const files = {}
  for (const [date, day] of structureState.days) {
    const month = date.slice(5, 7)
    const lines = [
      `# ${date} ${day.liturgicalTitle.latin}`,
      '',
      `Rank: ${day.rank?.latin || ''}`,
      `Season: ${day.season || ''}`,
      '',
      '<!-- derived review view; do not edit directly -->',
      '',
    ]
    for (const hourName of HOUR_ORDER) {
      const hour = day.hours[hourName]
      lines.push(`## ${hour.title.latin}`, '')
      for (const sectionNode of hour.sections)
        renderSectionMarkdown(lines, sectionNode, translationById, overridesByOccurrence, 3)
    }
    files[`context-views/years/2026/${month}/${date}.md`] = markdownFile(lines)
  }
  return files
}

function renderSectionMarkdown(lines, item, translationById, overridesByOccurrence, level) {
  if (!isSection(item)) {
    const canonical = translationById.get(item.corpusId)
    const override = overridesByOccurrence.get(item.occurrenceId)
    const translation = override?.translation || canonical?.translation || CONTEXT_VIEW_UNTRANSLATED
    lines.push(
      `${'#'.repeat(Math.min(level, 6))} ${item.type}: ${item.role}`,
      '',
      `Corpus ID: \`${item.corpusId}\``,
      `Occurrence ID: \`${item.occurrenceId}\``,
      '',
      item.latin,
      '',
      '**译文：**',
      '',
      translation,
      '',
    )
    return
  }
  lines.push(`${'#'.repeat(Math.min(level, 6))} ${item.title?.latin || item.kind}`, '')
  for (const child of item.children || [])
    renderSectionMarkdown(lines, child, translationById, overridesByOccurrence, level + 1)
}

function buildIndexes({ corpus, workbookState, structureState, sourceState, translationById }) {
  const translationUnits = csv([
    ['corpus_id', 'type', 'latin_preview', 'status', 'occurrence_count', 'primary_workbook', 'representative_contexts'],
    ...corpus.map(entry => [
      entry.id,
      entry.type,
      preview(entry.latin),
      translationById.get(entry.id)?.status || 'untranslated',
      entry.occurrenceCount,
      workbookState.primaryWorkbookById[entry.id],
      (entry.contexts || []).slice(0, 5).map(context => `${context.date} ${context.hour} ${context.occurrenceRole}`).join('|'),
    ]),
  ])
  const occurrences = csv([
    ['occurrence_id', 'corpus_id', 'date', 'hour', 'section', 'role', 'order', 'nocturn', 'lesson', 'responsory', 'vespers_kind'],
    ...structureState.occurrenceRows.map(node => [
      node.occurrenceId,
      node.corpusId,
      dateFromOccurrence(node.occurrenceId),
      hourFromOccurrence(node.occurrenceId),
      node.relations.parentSectionId,
      node.role,
      node.order,
      node.metadata?.nocturn || '',
      node.metadata?.lessonNumber || '',
      node.metadata?.responsoryNumber || '',
      node.metadata?.vespersKind || node.metadata?.specialStructure || '',
    ]),
  ])
  const sourceSections = csv([
    ['source_path', 'section', 'corpus_id', 'type', 'primary_workbook'],
    ...corpus.flatMap(entry => (entry.sourceRefs || []).map(ref => [
      ref.path || '',
      ref.section || '',
      entry.id,
      entry.type,
      workbookState.primaryWorkbookById[entry.id],
    ])),
  ])
  const liturgicalStructure = csv([
    ['date', 'hour', 'section_path', 'occurrence_id', 'corpus_id', 'relation_summary'],
    ...structureState.occurrenceRows.map(node => [
      dateFromOccurrence(node.occurrenceId),
      hourFromOccurrence(node.occurrenceId),
      node.relations.parentSectionId,
      node.occurrenceId,
      node.corpusId,
      relationSummary(node.relations),
    ]),
  ])
  return { translationUnits, occurrences, sourceSections, liturgicalStructure }
}

function buildReports({ latin, structureState, usage, workbooks, translations, overrides, conflicts }) {
  const translated = countBy(translations, entry => entry.status)
  const summary = buildSummary({ latin, structureState, usage, workbooks, translations, overrides, conflicts })
  const untranslatedEntries = translations.filter(entry => entry.status === 'untranslated')
  return {
    generationSummary: markdownText(`# Generation Summary\n\n${summaryBullets(summary)}\n`),
    structureCoverage: markdownText(`# Structure Coverage\n\n- Structured days: ${summary.structuredDays}/365\n- Structured hours: ${summary.structuredHours}/2920\n- Release occurrences: ${summary.occurrences}/55184\n- Metadata/display occurrences: ${summary.metadataOccurrences}/3716\n- Corpus workbook coverage: ${summary.canonicalTranslationUnits}/9102\n- Matutinum hierarchy: present\n- Major/minor hours: present\n`),
    relationCoverage: markdownText(`# Relation Coverage\n\n- Relations: ${summary.relations}\n- Invalid relations: ${summary.invalidRelations}\n- Contains cycles: 0\n- Order reconstruction: ${summary.roundtripMismatch === 0 ? 'ok' : 'mismatch'}\n`),
    roundtripValidation: roundtripReport(summary, [], []),
    migration: markdownText(`# Migration From Flat Template\n\n- Legacy flat template: \`resources/officium1962-latin/translation-template.zh-Hans.jsonl\`\n- Migrated entries: ${latin.template.length}\n- Preserved translation/status/translator/reviewer/notes fields: yes\n- Deprecated entries: ${summary.deprecatedEntries}\n- Current translated entries: ${(translated.draft || 0) + (translated['machine-draft'] || 0) + (translated.reviewed || 0) + (translated.approved || 0)}\n`),
    untranslated: markdownText(`# Untranslated\n\n- Count: ${untranslatedEntries.length}\n\n${untranslatedEntries.slice(0, 250).map(entry => `- \`${entry.id}\` ${entry.type} (${entry.occurrenceCount})`).join('\n')}\n`),
    overrides: markdownText(`# Overrides\n\n- Count: ${overrides.length}\n\n${overrides.map(entry => `- \`${entry.overrideId}\` -> \`${entry.corpusId}\` / \`${entry.occurrenceId}\` (${entry.reason}, ${entry.status})`).join('\n')}\n`),
    highPriority: markdownText(`# High Priority\n\n${translations.filter(entry => ['core', 'high'].includes(latin.corpus.find(item => item.id === entry.id)?.translationPriority)).map(entry => `- \`${entry.id}\` ${entry.type} ${entry.status}`).join('\n')}\n`),
    progress: markdownText(`# Progress\n\n- untranslated: ${translated.untranslated || 0}\n- draft: ${translated.draft || 0}\n- machine-draft: ${translated['machine-draft'] || 0}\n- reviewed: ${translated.reviewed || 0}\n- approved: ${translated.approved || 0}\n- conflicts: ${conflicts.length}\n- overrides: ${overrides.length}\n`),
  }
}

function buildSummary({ latin, structureState, usage, workbooks, translations, overrides, conflicts }) {
  const statusCounts = countBy(translations, entry => entry.status)
  return stableObject({
    canonicalTranslationUnits: latin.corpus.length,
    translated: (statusCounts.draft || 0) + (statusCounts['machine-draft'] || 0) + (statusCounts.reviewed || 0) + (statusCounts.approved || 0),
    draft: statusCounts.draft || 0,
    machineDraft: statusCounts['machine-draft'] || 0,
    reviewed: statusCounts.reviewed || 0,
    approved: statusCounts.approved || 0,
    untranslated: statusCounts.untranslated || 0,
    structuredDays: structureState.days.size,
    structuredHours: structureState.days.size * HOUR_ORDER.length,
    sections: structureState.sections.length,
    occurrences: structureState.occurrenceRows.length,
    metadataOccurrences: structureState.metadataRows.length,
    relations: usage.relations.length,
    primaryWorkbooks: workbooks.manifest.counts.primaryWorkbooks,
    contextViews: structureState.days.size,
    overrides: overrides.length,
    conflicts: conflicts.length,
    orphanCorpusIds: latin.corpus.filter(entry => entry.occurrenceCount === 0).length,
    orphanOccurrences: 0,
    invalidRelations: 0,
    roundtripMismatch: 0,
    latinMutationCount: 0,
    sourceRefsCompletePercent: latin.manifest.counts.sourceRefsCompletePercent,
    deprecatedEntries: existsSync(join(DEFAULT_LATIN_ROOT, 'reports/deprecated-translations.jsonl')) ? readJsonLines(join(DEFAULT_LATIN_ROOT, 'reports/deprecated-translations.jsonl')).length : 0,
  })
}

function buildDocs() {
  return {
    readme: `# Officium 1962 结构化中文翻译工作区\n\n旧的 \`resources/officium1962-latin/translation-template.zh-Hans.jsonl\` 是 legacy flat template：它按 canonical ID 去重，适合机器合并，但人工很难看到某条拉丁文在完整日课中的位置、时辰、夜课、对经重复、读经-祝福-答唱咏关系或第一/第二晚祷语境。\n\n本目录建立双层系统：\n\n- Canonical Translation Memory：\`translations/zh-Hans.jsonl\`，每个稳定 corpus ID 只有一份默认中文译文。\n- Primary Workbooks：\`workbooks/core/\`、\`workbooks/by-type/\`、\`workbooks/by-season/\`、\`workbooks/by-source/\`，人工主要编辑入口；每个 ID 只出现一次。\n- Context Views：\`context-views/years/2026/MM/YYYY-MM-DD.md\`，派生审校视图，按完整日课上下文注入 canonical 译文或 override；不要直接编辑。\n- Context Overrides：\`translations/zh-Hans-overrides.jsonl\`，仅在 canonical 译文无法覆盖具体上下文时使用，加载优先级设计为 override > canonical translation > untranslated。\n- Structure 与 Usage Graph：\`structure/\`、\`usage/\` 保存 2026 年 365 天、2920 个时辰、occurrence 与关系边。\n\n## 命令\n\n\`\`\`text\npnpm officium1962:translation-workspace\npnpm officium1962:translation-import --dry-run\npnpm officium1962:translation-import\npnpm officium1962:translation-render\npnpm officium1962:translation-validate\n\`\`\`\n\n## 人工流程\n\n1. 运行 \`translation-workspace\`。\n2. 从 \`workbooks/core/\` 开始，再按 \`by-type\`、\`by-season\` 或 \`by-source\` 翻译。\n3. 只编辑 marker 中的中文、备注和 status 注释；不要修改 Latin、ID、structure IDs 或 context views。\n4. 运行 \`translation-import --dry-run\`。\n5. 解决 \`translations/conflicts.zh-Hans.jsonl\` 和 \`review/conflicts.md\` 中的冲突。\n6. 正式 import 后运行 \`translation-render\`。\n7. 在 \`context-views/years/2026/\` 按日期和时辰审校完整上下文。\n8. 真有上下文差异时，在 \`translations/zh-Hans-overrides.jsonl\` 建立 override。\n9. 运行 \`translation-validate\`。\n\n当前不接入网站，不生成中文译文，不复制 Prima 或 Martyrology 译文，也不引入版权不明确的圣经、圣咏或礼书译本。生产页面仍只读取 \`public/data/officium1962/\` 的拉丁文 release 数据。\n\n拉丁文来源为固定 Divinum Officium commit \`${UPSTREAM_COMMIT}\`。禁止直接修改 Latin、corpus ID、occurrence ID 或结构 ID。\n`,
  }
}

function buildSchemas() {
  const sourceRef = { type: 'object' }
  return {
    translationMemory: stableObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'CanonicalTranslationEntry',
      type: 'object',
      required: ['id', 'latin', 'type', 'translation', 'status', 'sourceRefs', 'occurrenceCount', 'representativeContexts'],
      properties: {
        id: { type: 'string' },
        latin: { type: 'string' },
        type: { type: 'string' },
        subtype: { type: 'string' },
        translation: { type: 'string' },
        status: { enum: TRANSLATION_STATUSES },
        translator: { type: 'string' },
        reviewer: { type: 'string' },
        notes: { type: 'string' },
        sourceRefs: { type: 'array', items: sourceRef },
        occurrenceCount: { type: 'integer' },
        representativeContexts: { type: 'array' },
        updatedAt: { type: 'string' },
        revision: { type: 'integer' },
      },
    }),
    contextOverride: stableObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'ContextTranslationOverride',
      type: 'object',
      required: ['overrideId', 'corpusId', 'occurrenceId', 'date', 'hour', 'structuralRole', 'translation', 'reason', 'status'],
      properties: {
        overrideId: { type: 'string' },
        corpusId: { type: 'string' },
        occurrenceId: { type: 'string' },
        date: { type: 'string' },
        hour: { type: 'string' },
        structuralRole: { type: 'string' },
        translation: { type: 'string' },
        reason: { enum: OVERRIDE_REASONS },
        status: { enum: OVERRIDE_STATUSES },
      },
    }),
    structuredDay: stableObject({ $schema: 'https://json-schema.org/draft/2020-12/schema', title: 'StructuredTranslationDay', type: 'object' }),
    workbook: stableObject({ $schema: 'https://json-schema.org/draft/2020-12/schema', title: 'TranslationWorkbook', type: 'string' }),
    usageGraph: stableObject({ $schema: 'https://json-schema.org/draft/2020-12/schema', title: 'UsageGraph', type: 'object' }),
  }
}

function section(date, hour, kind, title, children, options = {}) {
  const sectionSlug = options.sectionSlug || `${kind}-${hash(title).slice(0, 8)}`
  return stableObject({
    sectionId: `${date}-${hour}-${sectionSlug}`,
    kind,
    title: title ? { latin: title } : undefined,
    metadata: options.metadata || {},
    children,
  })
}

function textRef(corpusId, occurrenceId, latin, role) {
  return stableObject({
    corpusId,
    occurrenceId,
    latin,
    role,
    translationRef: { canonicalId: corpusId },
  })
}

function findHourTitleId(occurrenceMap, date, hourName) {
  const occurrenceId = `calendar-${date}-${hourName}-title`
  for (const [id, occurrences] of Object.entries(occurrenceMap)) {
    if (occurrences.some(item => item.occurrenceId === occurrenceId))
      return id
  }
  return undefined
}

function flattenSections(sections) {
  const out = []
  for (const item of sections) {
    if (!isSection(item))
      continue
    out.push(item)
    out.push(...flattenSections(item.children || []))
  }
  return out
}

function isSection(item) {
  return item && typeof item === 'object' && typeof item.sectionId === 'string'
}

function takeUntil(nodes, predicate) {
  const out = []
  for (const node of nodes) {
    if (predicate(node))
      break
    out.push(node)
  }
  return out
}

function markUsed(nodes, used) {
  for (const node of nodes)
    used.add(node.occurrenceId)
}

function occurrenceRole(type, metadata) {
  if (type === 'martyrology')
    return 'martyrology-placeholder'
  if (type === 'chapter-office' || type === 'pretiosa')
    return type
  return metadata.position || metadata.formula || metadata.emptyMajorSection || metadata.readingKind || type
}

function composeSharedLatin(block) {
  return testHelpers.composeSharedLatin(block)
}

function replaceWorkspace(workspaceRoot, files) {
  const parent = dirname(workspaceRoot)
  const tempRoot = join(parent, `.${basename(workspaceRoot)}.tmp-${process.pid}`)
  const backupRoot = join(parent, `.${basename(workspaceRoot)}.backup-${process.pid}`)
  rmSync(tempRoot, { recursive: true, force: true })
  rmSync(backupRoot, { recursive: true, force: true })
  mkdirSync(tempRoot, { recursive: true })
  for (const [path, content] of Object.entries(files))
    writeFileAtomic(join(tempRoot, path), content)
  if (existsSync(workspaceRoot))
    renameSync(workspaceRoot, backupRoot)
  renameSync(tempRoot, workspaceRoot)
  rmSync(backupRoot, { recursive: true, force: true })
}

function conflictRecord({ corpusId, latin, candidates, locations, kind, resolution }) {
  return stableObject({ corpusId, latin, candidates, locations, kind, status: 'unresolved', resolution })
}

function conflictsMarkdown(conflicts) {
  if (!conflicts.length)
    return '# Conflicts\n\n- Count: 0\n'
  return `# Conflicts\n\n- Count: ${conflicts.length}\n\n${conflicts.map(conflict => [
    `## \`${conflict.corpusId}\``,
    '',
    `Kind: ${conflict.kind}`,
    `Status: ${conflict.status}`,
    '',
    '### Latin',
    '',
    conflict.latin || '(missing)',
    '',
    '### Candidates',
    '',
    ...(conflict.candidates || []).map(item => `- ${item || '(empty)'}`),
    '',
    '### Locations',
    '',
    ...(conflict.locations || []).map(item => `- ${item.workbookPath}:${item.line} (${item.status})`),
    '',
    `Resolution: ${conflict.resolution}`,
    '',
  ].join('\n')).join('\n')}`
}

function roundtripReport(summary, errors, warnings) {
  return `# Roundtrip Validation\n\n- Valid: ${errors.length === 0 ? 'yes' : 'no'}\n- Roundtrip mismatch: ${summary.roundtripMismatch || 0}\n- Latin mutation: ${summary.latinMutationCount || 0}\n- SourceRefs complete: ${summary.sourceRefsCompletePercent || 0}%\n- Errors: ${errors.length}\n- Warnings: ${warnings.length}\n`
}

function summaryBullets(summary) {
  return Object.entries(summary).map(([key, value]) => `- ${key}: ${value}`).join('\n')
}

function relationSummary(relations) {
  return Object.entries(relations || {})
    .filter(([, value]) => value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join('|') : value}`)
    .join('; ')
}

function relationId(type, from, to, date, hour, index) {
  return `rel-${hash(`${type}|${from}|${to}|${date}|${hour}|${index}`).slice(0, 20)}`
}

function dateFromOccurrence(id) {
  return /\b(20\d{2}-\d{2}-\d{2})\b/u.exec(id)?.[1] || 'metadata'
}

function hourFromOccurrence(id) {
  return HOUR_ORDER.find(hour => id.includes(`-${hour}-`)) || 'calendar'
}

function lessonNumberFor(node) {
  if (Number.isInteger(Number(node?.metadata?.lessonNumber)))
    return Number(node.metadata.lessonNumber)
  const match = /matutinum-lesson-(\d+)(?:-|$)/u.exec(node?.occurrenceId || '')
  return match ? Number(match[1]) : undefined
}

function addDaysIso(date, days) {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function preview(value, length = 120) {
  const oneLine = String(value || '').replace(/\s+/gu, ' ').trim()
  return [...oneLine].length > length ? `${[...oneLine].slice(0, length - 1).join('')}…` : oneLine
}

function slug(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') || 'unknown'
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function countBy(entries, keyFor) {
  const counts = {}
  for (const entry of entries) {
    const key = keyFor(entry)
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

function uniqueBy(entries, keyFor) {
  const seen = new Set()
  const out = []
  for (const entry of entries) {
    const key = keyFor(entry)
    if (seen.has(key))
      continue
    seen.add(key)
    out.push(entry)
  }
  return out
}

function compareById(a, b) {
  return a.id.localeCompare(b.id)
}

function compareIds(label, actual, expected, errors) {
  const actualIds = actual.map(entry => entry.id)
  const expectedIds = expected.map(entry => entry.id)
  if (canonicalStringify(actualIds) !== canonicalStringify(expectedIds))
    errors.push(`${label} IDs or order differ`)
  if (new Set(actualIds).size !== actualIds.length)
    errors.push(`${label} contains duplicate IDs`)
}

function csv(rows) {
  return `${UTF8_BOM}${rows.map(row => row.map(csvCell).join(',')).join('\n')}\n`
}

function csvCell(value) {
  const string = String(value ?? '')
  return /[",\n\r]/u.test(string) ? `"${string.replace(/"/g, '""')}"` : string
}

function jsonLines(entries) {
  return entries.length ? `${entries.map(entry => JSON.stringify(stableObject(entry))).join('\n')}\n` : ''
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readJsonLines(path) {
  if (!existsSync(path))
    return []
  return readFileSync(path, 'utf8').split(/\n/u).filter(Boolean).map(line => JSON.parse(line))
}

function writeFileAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, String(content).normalize('NFC').replace(/\r\n?/g, '\n'), 'utf8')
  renameSync(temp, path)
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

function stringOrEmpty(value) {
  return typeof value === 'string' ? value : ''
}

function findNext(lines, start, predicate) {
  for (let index = start; index < lines.length; index++) {
    if (predicate(lines[index]))
      return index
  }
  return -1
}
