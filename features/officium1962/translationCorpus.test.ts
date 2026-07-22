import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CORPUS_SCHEMA_VERSION,
  PRODUCTION_COMMIT,
  UPSTREAM_COMMIT,
  classifyDuplicates,
  extractTranslationCorpus,
  mergeTranslations,
  testHelpers,
  validateTranslationCorpus,
} from '../../scripts/officium1962/translation-corpus-lib.mjs'

const resourceRoot = 'resources/officium1962-latin'
const corpus = jsonl(`${resourceRoot}/corpus.jsonl`)
const template = jsonl(`${resourceRoot}/translation-template.zh-Hans.jsonl`)
const calendar = jsonl(`${resourceRoot}/calendar-titles.jsonl`)
const manifest = json(`${resourceRoot}/manifest.json`)
const sourceMap = json(`${resourceRoot}/source-map.json`)
const occurrenceMap = json(`${resourceRoot}/occurrence-map.json`)
const corpusById = new Map(corpus.map(entry => [entry.id, entry]))

describe('Officium 1962 Latin translation corpus', () => {
  it('records the fixed release identity and complete corpus size', () => {
    expect(manifest.schemaVersion).toBe(CORPUS_SCHEMA_VERSION)
    expect(manifest.upstreamCommit).toBe(UPSTREAM_COMMIT)
    expect(manifest.productionCommit).toBe(PRODUCTION_COMMIT)
    expect(manifest.releaseYear).toBe(2026)
    expect(manifest.counts).toMatchObject({
      sharedBlockEntries: 8713,
      releaseOccurrences: 55184,
      calendarDays: 365,
      corpusEntries: corpus.length,
    })
  })

  it('maps every release shared block and occurrence into the corpus', () => {
    const sharedManifest = json('public/data/officium1962/shared/manifest.json')
    const releaseIds = Object.keys(sharedManifest.blocks).sort()
    const corpusSharedIds = corpus.filter(entry => entry.subtype === 'shared-block').map(entry => entry.id).sort()
    expect(corpusSharedIds).toEqual(releaseIds)
    const occurrenceCount = corpusSharedIds.reduce((sum, id) => sum + occurrenceMap[id].length, 0)
    expect(occurrenceCount).toBe(55184)
  })

  it('retains hour-specific occurrence context needed for translation review', () => {
    const occurrences = Object.values(occurrenceMap).flat() as any[]
    expect(occurrences.some(item => item.hour === 'matutinum' && item.nocturn && item.lessonNumber)).toBe(true)
    expect(occurrences.some(item => item.hour === 'vesperae' && ['ferial', 'special'].includes(item.vespersKind))).toBe(true)
    expect(occurrences.some(item => item.hour === 'prima' && item.primaRole === 'martyrology-placeholder')).toBe(true)
  })

  it('uses stable release IDs and deterministic metadata IDs', () => {
    expect(corpus.filter(entry => entry.subtype === 'shared-block').every(entry => entry.id === `shared-${entry.contentHash.slice(0, 20)}`)).toBe(true)
    for (const entry of corpus.filter(entry => entry.subtype !== 'shared-block')) {
      expect(entry.contentHash).toBe(testHelpers.derivedContentHash(entry.type, entry.subtype, entry.latin, entry.sourceRefs))
      expect(entry.id.endsWith(entry.contentHash.slice(0, 20))).toBe(true)
    }
  })

  it('passes deterministic roundtrip validation', () => {
    const report = validateTranslationCorpus({ writeReport: false })
    expect(report.valid, report.errors.join('\n')).toBe(true)
    expect(report.checks.deterministicOutput).toBe(true)
    expect(report.checks.productionIsolation).toBe(true)
  }, 30_000)

  it('preserves every sourceRef and the pinned upstream commit', () => {
    expect(Object.keys(sourceMap)).toHaveLength(corpus.length)
    expect(corpus.every(entry => sourceMap[entry.id].length > 0)).toBe(true)
    expect(Object.values(sourceMap).flat().every((ref: any) => ref.upstreamCommit === UPSTREAM_COMMIT)).toBe(true)
  })

  it('extracts all calendar titles, ranks, and commemorations', () => {
    expect(calendar).toHaveLength(365)
    expect(calendar.every(row => corpusById.has(row.titleId) && (!row.rankId || corpusById.has(row.rankId)))).toBe(true)
    expect(calendar.reduce((sum, row) => sum + row.commemorations.length, 0)).toBe(67)
    expect(calendar.flatMap(row => row.commemorations).every(item => corpusById.has(item.id))).toBe(true)
  })

  it('keeps Unicode NFC, protected Latin characters, and plain text', () => {
    const allLatin = corpus.map(entry => entry.latin).join('\n')
    expect(corpus.every(entry => entry.latin === entry.latin.normalize('NFC'))).toBe(true)
    expect(allLatin).toContain('æ')
    expect(allLatin).toContain('℣.')
    expect(allLatin).toContain('℟.')
    expect(allLatin).toContain('†')
    expect(allLatin).toContain('*')
    expect(allLatin).not.toMatch(/<\/?[a-z][^>]*>/i)
    expect(allLatin).not.toMatch(/Spanish|Martyrologium1960|web\/(?:www|cgi-bin)\/missa/i)
  })

  it('preserves existing manual translation fields during a merge', () => {
    const sample = corpus[0]
    const existing = new Map([[sample.id, {
      id: sample.id,
      translation: '人工译文',
      status: 'reviewed',
      translator: 'Translator',
      reviewer: 'Reviewer',
      notes: 'Keep this note',
    }], ['removed-id', {
      id: 'removed-id',
      latin: 'Vetus',
      translation: '旧译文',
      status: 'approved',
    }]])
    const merged = mergeTranslations([sample], existing)
    expect(merged.template[0]).toMatchObject({
      translation: '人工译文',
      status: 'reviewed',
      translator: 'Translator',
      reviewer: 'Reviewer',
      notes: 'Keep this note',
    })
    expect(merged.deprecated).toHaveLength(1)
    expect(merged.deprecated[0].id).toBe('removed-id')
  })

  it('leaves an existing output untouched when strict extraction fails', () => {
    const output = mkdtempSync(join(tmpdir(), 'officium1962-corpus-failure-'))
    const marker = join(output, 'marker.txt')
    writeFileSync(marker, 'unchanged', 'utf8')
    try {
      expect(() => extractTranslationCorpus({ releaseRoot: join(output, 'missing-release'), outputRoot: output })).toThrow()
      expect(readFileSync(marker, 'utf8')).toBe('unchanged')
    }
    finally {
      rmSync(output, { recursive: true, force: true })
    }
  })

  it('keeps template, CSV, and by-type views in one-to-one coverage', () => {
    expect(template).toHaveLength(corpus.length)
    expect(template.map(entry => entry.id)).toEqual(corpus.map(entry => entry.id))
    const csvRows = readFileSync(`${resourceRoot}/index.csv`, 'utf8').trimEnd().split('\n')
    expect(csvRows).toHaveLength(corpus.length + 1)
    const buckets = Object.keys(manifest.outputHashes).filter(path => path.startsWith('by-type/'))
    const byTypeCount = buckets.reduce((sum, path) => sum + jsonl(`${resourceRoot}/${path}`).length, 0)
    expect(byTypeCount).toBe(corpus.length)
  })

  it('starts without generated Chinese translations', () => {
    expect(template.every(entry => entry.translation === '' && entry.status === 'untranslated')).toBe(true)
    expect(readFileSync(`${resourceRoot}/corpus.jsonl`, 'utf8')).not.toContain('\r')
  })

  it('records duplicate categories without merging distinct IDs', () => {
    const duplicates = classifyDuplicates(corpus)
    expect(duplicates.groups).toHaveLength(manifest.counts.duplicateGroups)
    expect(duplicates.auditGroups).toHaveLength(manifest.counts.duplicateAuditGroups)
    expect(duplicates.groups.every(group => new Set(group.ids).size === group.ids.length)).toBe(true)
  })

  it('records valid output hashes and an UTF-8 BOM CSV', () => {
    for (const [path, checksum] of Object.entries(manifest.outputHashes)) {
      const actual = createHash('sha256').update(readFileSync(`${resourceRoot}/${path}`)).digest('hex')
      expect(actual).toBe(checksum)
    }
    expect(readFileSync(`${resourceRoot}/index.csv`)[0]).toBe(0xEF)
  })

  it('keeps the translation workspace out of production imports', () => {
    const productionFiles = [
      'pages/officium-1962/index.vue',
      'components/officium1962/Office1962Viewer.vue',
      'components/officium1962/LiturgicalBlockRenderer.vue',
      'features/officium1962/runtime/index.ts',
      'valaxy.config.ts',
      'vite.config.ts',
    ]
    expect(productionFiles.every(path => !readFileSync(path, 'utf8').includes('resources/officium1962-latin'))).toBe(true)
  })
})

function json(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function jsonl(path: string): any[] {
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
}
