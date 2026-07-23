import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  FULL_OCCURRENCE_SCHEMA_VERSION,
  buildFullOccurrenceModel,
  importFullOccurrenceTranslations,
  validateFullOccurrenceJsonl,
} from '../../scripts/officium1962/full-occurrence-jsonl-lib.mjs'

const root = 'resources/officium1962-translation'
const fullPath = `${root}/full-occurrences-by-hour-and-source.zh-Hans.jsonl`
const records = jsonl(fullPath)
const summary = json(`${root}/reports/full-occurrence-export-summary.json`)

describe('Officium 1962 full occurrence JSONL', () => {
  it('exports every release occurrence and metadata/display occurrence into one JSONL file', () => {
    expect(summary.schemaVersion).toBe(FULL_OCCURRENCE_SCHEMA_VERSION)
    expect(records).toHaveLength(58900)
    expect(records.filter(record => record.recordKind === 'liturgical-occurrence')).toHaveLength(55184)
    expect(records.filter(record => record.recordKind !== 'liturgical-occurrence')).toHaveLength(3716)
  })

  it('keeps occurrence IDs unique while intentionally repeating canonical IDs and Latin', () => {
    expect(new Set(records.map(record => record.occurrenceId)).size).toBe(records.length)
    expect(summary.duplicateCanonicalIds).toBeGreaterThan(1000)
    expect(summary.duplicateLatinHashes).toBeGreaterThan(1000)
    expect(records.some(record => records.find(other => other !== record && other.canonicalId === record.canonicalId))).toBe(true)
    expect(records.some(record => records.find(other => other !== record && other.latinHash === record.latinHash))).toBe(true)
  })

  it('sorts by hour, source category, source path, section, date, block order, and occurrence ID', () => {
    for (let index = 1; index < records.length; index++)
      expect(fullSortKey(records[index - 1]).localeCompare(fullSortKey(records[index])) <= 0, records[index].occurrenceId).toBe(true)
    expect(records[0].hour).toBe('matutinum')
    expect(records.at(-1)?.hour).toBe('calendar-metadata')
    expect(records.map(record => record.hourOrder)).toEqual([...records.map(record => record.hourOrder)].sort((a, b) => a - b))
  })

  it('categorizes sources and preserves stable source references', () => {
    expect(summary.sourceRefsCompletePercent).toBe(100)
    expect(records.some(record => record.sourceCategory === 'Psalterium' && record.primarySourcePath.includes('/Psalterium/'))).toBe(true)
    expect(records.some(record => record.sourceCategory === 'Tempora' && /\/Tempora(?:\/|$)/u.test(record.primarySourcePath))).toBe(true)
    expect(records.some(record => record.sourceCategory === 'Rules' && record.primarySourcePath.includes('horas.pl'))).toBe(true)
    expect(records.every(record => Array.isArray(record.sourceRefs) && record.sourceRefs.length > 0)).toBe(true)
  })

  it('keeps useful section paths for Matutinum, Prima, Vesperae, repeated antiphons, and metadata', () => {
    expect(records.some(record => record.hour === 'matutinum' && record.sectionPathText.includes('Nocturnus') && record.sectionPathText.includes('Lectio') && record.sectionPathText.includes('Benedictio'))).toBe(true)
    expect(records.some(record => record.hour === 'matutinum' && record.sectionPathText.includes('Nocturnus') && record.sectionPathText.includes('Lectio') && record.sectionPathText.includes('Responsorium'))).toBe(true)
    expect(records.some(record => record.hour === 'prima' && record.sectionPathText.includes('Officium Capituli') && record.sectionPathText.includes('Lectio'))).toBe(true)
    expect(records.some(record => record.hour === 'vesperae' && record.vespersKind)).toBe(true)
    expect(records.some(record => record.type === 'antiphon' && record.repeatsOccurrenceId)).toBe(true)
    expect(records.some(record => record.hour === 'calendar-metadata' && record.recordKind === 'calendar-title')).toBe(true)
    expect(records.some(record => record.hour === 'calendar-metadata' && record.recordKind === 'rank')).toBe(true)
    expect(records.some(record => record.hour === 'calendar-metadata' && record.role === 'hour-title')).toBe(true)
  })

  it('validates the generated JSONL and keeps production code isolated from it', () => {
    const report = validateFullOccurrenceJsonl({ writeReport: false })
    expect(report.valid, report.errors.join('\n')).toBe(true)
    const productionFiles = [
      'pages/officium-1962/index.vue',
      'components/officium1962/Office1962Viewer.vue',
      'features/officium1962/runtime/loadDay.ts',
      'features/officium1962/runtime/index.ts',
    ].map(path => readFileSync(path, 'utf8')).join('\n')
    expect(productionFiles).not.toContain('full-occurrences-by-hour-and-source')
    expect(productionFiles).not.toContain('officium1962-translation')
  }, 45_000)

  it('preserves edited occurrence translations and reports Latin hash conflicts on regeneration', () => {
    const temp = mkdtempSync(join(tmpdir(), 'officium-full-export-'))
    const target = join(temp, 'full.jsonl')
    const sample = records.find(record => record.recordKind === 'liturgical-occurrence')!
    writeFileSync(target, `${JSON.stringify({ ...sample, translation: '译文', translationStatus: 'draft', notes: 'note' })}\n`, 'utf8')
    try {
      const preserved = buildFullOccurrenceModel({ targetPath: target })
      const preservedRecord = preserved.records.find(record => record.occurrenceId === sample.occurrenceId)!
      expect(preservedRecord.translation).toBe('译文')
      expect(preservedRecord.translationStatus).toBe('draft')
      expect(preservedRecord.notes).toBe('note')

      writeFileSync(target, `${JSON.stringify({ ...sample, latinHash: 'bad-hash', translation: '译文', translationStatus: 'draft' })}\n`, 'utf8')
      const conflicted = buildFullOccurrenceModel({ targetPath: target })
      expect(conflicted.conflicts.some(conflict => conflict.occurrenceId === sample.occurrenceId)).toBe(true)
      const conflictedRecord = conflicted.records.find(record => record.occurrenceId === sample.occurrenceId)!
      expect(conflictedRecord.translation).toBe('')
    }
    finally {
      rmSync(temp, { recursive: true, force: true })
    }
  }, 45_000)

  it('supports canonical merge dry-runs, differing translation conflicts, and override candidates', () => {
    const temp = mkdtempSync(join(tmpdir(), 'officium-full-import-'))
    try {
      const latinRoot = join(temp, 'latin')
      const workspace = join(temp, 'workspace')
      mkdirSync(latinRoot, { recursive: true })
      mkdirSync(join(workspace, 'translations'), { recursive: true })
      const corpus = [
        corpusEntry('same-id', 'Latin one'),
        corpusEntry('different-id', 'Latin two'),
      ]
      writeFileSync(join(latinRoot, 'corpus.jsonl'), jsonLines(corpus), 'utf8')
      writeFileSync(join(workspace, 'translations/zh-Hans.jsonl'), jsonLines(corpus.map(entry => ({
        id: entry.id,
        latin: entry.latin,
        translation: '',
        status: 'untranslated',
      }))), 'utf8')
      writeFileSync(join(workspace, 'full.jsonl'), jsonLines([
        occurrenceRecord('same-id', 'occ-1', 'Latin one', '统一译文'),
        occurrenceRecord('same-id', 'occ-2', 'Latin one', '统一译文'),
        occurrenceRecord('different-id', 'occ-3', 'Latin two', '多数译文'),
        occurrenceRecord('different-id', 'occ-4', 'Latin two', '多数译文'),
        occurrenceRecord('different-id', 'occ-5', 'Latin two', '少数译文'),
      ]), 'utf8')

      const summary = importFullOccurrenceTranslations({
        workspaceRoot: workspace,
        latinRoot,
        fullPath: join(workspace, 'full.jsonl'),
        memoryPath: join(workspace, 'translations/zh-Hans.jsonl'),
        dryRun: true,
        strict: false,
      })
      expect(summary.candidateCanonicalUpdates).toBe(1)
      expect(summary.conflicts).toBe(1)
      expect(summary.overrideCandidates).toBe(1)
      expect(jsonl(join(workspace, 'review/full-occurrence-import-conflicts.jsonl'))).toHaveLength(1)
      expect(jsonl(join(workspace, 'review/full-occurrence-override-candidates.jsonl'))).toHaveLength(1)
    }
    finally {
      rmSync(temp, { recursive: true, force: true })
    }
  })
})

function corpusEntry(id: string, latin: string) {
  return {
    id,
    latin,
    type: 'heading',
    sourceRefs: [{ path: 'web/www/horas/Latin/Psalterium/Test.txt', section: id }],
  }
}

function occurrenceRecord(canonicalId: string, occurrenceId: string, latin: string, translation: string) {
  return {
    occurrenceId,
    canonicalId,
    latin,
    latinHash: sha256(latin),
    translation,
    translationStatus: 'draft',
  }
}

function json(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function jsonl(path: string): any[] {
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
}

function jsonLines(entries: any[]) {
  return `${entries.map(entry => JSON.stringify(entry)).join('\n')}\n`
}

function sha256(value: string) {
  return createHash('sha256').update(value.normalize('NFC')).digest('hex')
}

function fullSortKey(record: any) {
  const categories = ['Psalterium', 'Tempora', 'Sancti', 'Commune', 'Tabulae', 'Rules', 'Other']
  return [
    String(record.hourOrder).padStart(2, '0'),
    String(categories.indexOf(record.sourceCategory) + 1).padStart(2, '0'),
    record.primarySourcePath || '',
    record.primarySourceSection || '',
    record.date || '',
    String(record.blockOrder || 0).padStart(6, '0'),
    record.occurrenceId,
  ].join('|')
}
