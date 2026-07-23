import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  WORKSPACE_SCHEMA_VERSION,
  buildWorkspaceModel,
  importWorkbookTranslations,
  parseWorkbookFile,
  validateStructuredTranslationWorkspace,
} from '../../scripts/officium1962/structured-translation-workspace-lib.mjs'

const root = 'resources/officium1962-translation'
const latinRoot = 'resources/officium1962-latin'
const manifest = json(`${root}/manifest.json`)
const structureManifest = json(`${root}/structure/years/2026/manifest.json`)
const workbookManifest = json(`${root}/workbooks/manifest.json`)
const usage = json(`${root}/usage/usage-graph.json`)
const relations = json(`${root}/usage/relations.json`)
const occurrenceToCorpus = json(`${root}/usage/occurrence-to-corpus.json`)
const translationMemory = jsonl(`${root}/translations/zh-Hans.jsonl`)
const corpus = jsonl(`${latinRoot}/corpus.jsonl`)

describe('Officium 1962 structured translation workspace', () => {
  it('migrates the legacy flat template into canonical translation memory without changing IDs', () => {
    expect(manifest.schemaVersion).toBe(WORKSPACE_SCHEMA_VERSION)
    expect(manifest.legacyFlatTemplate).toContain('translation-template.zh-Hans.jsonl')
    expect(translationMemory).toHaveLength(9102)
    expect(translationMemory.map(entry => entry.id)).toEqual(corpus.map(entry => entry.id))
    expect(translationMemory.every(entry => entry.translation === '' && entry.status === 'untranslated')).toBe(true)
  })

  it('assigns exactly one primary workbook to each corpus ID', () => {
    const owners = workbookManifest.primaryWorkbookById
    expect(Object.keys(owners)).toHaveLength(9102)
    expect(new Set(Object.keys(owners)).size).toBe(9102)
    expect(workbookManifest.primaryWorkbooks).toHaveLength(manifest.counts.primaryWorkbooks)
  })

  it('parses workbook markers and preserves editable regions', () => {
    const temp = mkdtempSync(join(tmpdir(), 'officium-workbook-'))
    const path = join(temp, 'sample.md')
    writeFileSync(path, [
      '## `sample-id`',
      '',
      '### Latin',
      '',
      '> Latin line',
      '',
      '### 中文',
      '',
      '<!-- translation:start id="sample-id" -->',
      '中文译文',
      '<!-- translation:end -->',
      '',
      '### 状态',
      '',
      '<!-- status: draft -->',
      '',
      '### 备注',
      '',
      '<!-- notes:start id="sample-id" -->',
      'note',
      '<!-- notes:end -->',
      '',
    ].join('\n'), 'utf8')
    try {
      const parsed = parseWorkbookFile(path)
      expect(parsed.entries[0]).toMatchObject({ id: 'sample-id', latin: 'Latin line', translation: '中文译文', status: 'draft', notes: 'note' })
    }
    finally {
      rmSync(temp, { recursive: true, force: true })
    }
  })

  it('supports dry-run import and refuses Latin mutation conflicts', () => {
    const temp = mkdtempSync(join(tmpdir(), 'officium-import-'))
    const latin = join(temp, 'latin')
    const workspace = join(temp, 'workspace')
    const corpusEntry = {
      id: 'sample-id',
      latin: 'Original Latin',
      type: 'heading',
      subtype: 'test',
      sourceRefs: [{ path: 'local', section: 'test', upstreamCommit: '515a213f79951c563be4f599ca591c63aa63bb6d' }],
      occurrenceCount: 1,
      contexts: [{ date: '2026-01-01', hour: 'calendar', occurrenceRole: 'test' }],
    }
    mkdirp(join(latin))
    mkdirp(join(workspace, 'workbooks/core'))
    mkdirp(join(workspace, 'translations'))
    writeFileSync(join(latin, 'corpus.jsonl'), `${JSON.stringify(corpusEntry)}\n`, 'utf8')
    writeFileSync(join(latin, 'translation-template.zh-Hans.jsonl'), `${JSON.stringify({ id: 'sample-id', latin: 'Original Latin', type: 'heading', subtype: 'test', translation: '', status: 'untranslated' })}\n`, 'utf8')
    writeFileSync(join(workspace, 'translations/zh-Hans.jsonl'), `${JSON.stringify({ ...corpusEntry, translation: '', status: 'untranslated', representativeContexts: corpusEntry.contexts })}\n`, 'utf8')
    writeFileSync(join(workspace, 'workbooks/manifest.json'), JSON.stringify({ primaryWorkbooks: ['workbooks/core/core.md'], primaryWorkbookById: { 'sample-id': 'workbooks/core/core.md' } }), 'utf8')
    writeFileSync(join(workspace, 'workbooks/core/core.md'), [
      '## `sample-id`',
      '',
      '### Latin',
      '',
      '> Mutated Latin',
      '',
      '### 中文',
      '',
      '<!-- translation:start id="sample-id" -->',
      '译文',
      '<!-- translation:end -->',
      '',
      '### 状态',
      '',
      '<!-- status: draft -->',
      '',
      '### 备注',
      '',
      '<!-- notes:start id="sample-id" -->',
      '<!-- notes:end -->',
      '',
    ].join('\n'), 'utf8')
    try {
      expect(() => importWorkbookTranslations({ workspaceRoot: workspace, latinRoot: latin, dryRun: true })).toThrow(/conflicts/)
    }
    finally {
      rmSync(temp, { recursive: true, force: true })
    }
  })

  it('covers all structured days, hours, release occurrences, and metadata/display occurrences', () => {
    expect(structureManifest).toMatchObject({
      dayCount: 365,
      hourCount: 2920,
      releaseOccurrenceCount: 55184,
      metadataOccurrenceCount: 3716,
    })
    expect(Object.keys(occurrenceToCorpus)).toHaveLength(58900)
  })

  it('keeps Matutinum hierarchy and lesson units queryable', () => {
    const day = json(`${root}/structure/years/2026/days/2026-01-01.json`)
    const matutinum = day.hours.matutinum
    expect(matutinum.sections.some((section: any) => section.kind === 'nocturn' && section.metadata.nocturn === 1)).toBe(true)
    expect(JSON.stringify(matutinum)).toContain('lesson-unit')
    expect(JSON.stringify(matutinum)).toContain('responsoryForOccurrenceId')
  })

  it('records expected usage graph relation types', () => {
    expect(usage.relationFile).toBe('relations.json')
    const types = new Set(relations.map((relation: any) => relation.type))
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
      'belongs-to-chapter-office',
      'belongs-to-invitatory',
      'belongs-to-gospel-canticle',
      'first-vespers-of',
      'second-vespers-of',
    ])
      expect(types.has(type), type).toBe(true)
  })

  it('validates overrides and production isolation', () => {
    const report = validateStructuredTranslationWorkspace({ writeReport: false })
    expect(report.valid, report.errors.join('\n')).toBe(true)
    const serialized = JSON.stringify(buildWorkspaceModel({ includeContextViews: false }).summary)
    expect(serialized).toContain('"roundtripMismatch":0')
  }, 45_000)
})

function json(path: string): any {
  return JSON.parse(readFileSyncUtf8(path))
}

function jsonl(path: string): any[] {
  return readFileSyncUtf8(path).split('\n').filter(Boolean).map(line => JSON.parse(line))
}

function readFileSyncUtf8(path: string): string {
  return readFileSync(path, 'utf8')
}

function mkdirp(path: string) {
  mkdirSync(path, { recursive: true })
}
