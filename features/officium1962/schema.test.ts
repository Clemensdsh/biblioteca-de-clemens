import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeLatinTechnical } from './normalizeLatin.ts'
import { validateExportedOfficeHour, validateOffice1962Day, type LiturgicalBlock, type Office1962Day } from './schema.ts'

const dates = [
  '2026-07-20',
  '2026-07-19',
  '2026-04-02',
  '2026-04-05',
  '2026-08-15',
  '2026-11-02',
  '2026-12-25',
]

function loadDay(date = '2026-07-20'): Office1962Day {
  return JSON.parse(readFileSync(`public/data/officium1962/experimental/days/${date}/completorium.json`, 'utf8'))
}

function blocks(date = '2026-07-20'): LiturgicalBlock[] {
  return loadDay(date).hours.completorium?.blocks || []
}

describe('officium1962 exported upstream schema', () => {
  it('accepts a minimal exported Rubrics 1960 Latin hour', () => {
    const errors = validateExportedOfficeHour({
      schemaVersion: '0.1.0',
      engineVersion: 'Rubrics 1960 - 1960',
      language: 'la',
      date: '2026-07-20',
      hour: 'completorium',
      liturgicalTitle: 'S. Hieronymi Aemiliani Confessoris ~ III. classis',
      upstreamCommit: '515a213f79951c563be4f599ca591c63aa63bb6d',
      sourceRefs: [{ upstreamCommit: '515a213f79951c563be4f599ca591c63aa63bb6d', path: 'web/cgi-bin/horas/horas.pl' }],
      warnings: [],
      units: [{ id: 'do-1962-2026-07-20-completorium-001', raw: '#Incipit', html: 'Incipit' }],
    })

    expect(errors).toEqual([])
  })

  it('rejects unsupported languages and empty sourceRefs', () => {
    const errors = validateExportedOfficeHour({
      schemaVersion: '0.1.0',
      engineVersion: 'Rubrics 1960 - 1960',
      language: 'en',
      date: '2026-07-20',
      hour: 'completorium',
      liturgicalTitle: 'Title',
      upstreamCommit: '515a213f79951c563be4f599ca591c63aa63bb6d',
      sourceRefs: [],
      warnings: [],
      units: [{ id: 'x', raw: '#Incipit', html: 'Incipit' }],
    })

    expect(errors).toContain('language must be la')
    expect(errors).toContain('sourceRefs must be non-empty')
  })
})

describe('officium1962 Latin normalization', () => {
  it('only performs technical normalization', () => {
    expect(normalizeLatinTechnical('Dómine&nbsp;adjuva\r\nÆvum  \n\n\n')).toBe('Dómine adjuva\nÆvum')
  })
})

describe('officium1962 Completorium structured data', () => {
  it.each(dates)('validates schema for %s', (date) => {
    expect(validateOffice1962Day(loadDay(date))).toEqual([])
  })

  it('preserves stable IDs and known block types', () => {
    const ids = blocks().map(block => block.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(id => /^office-1962-2026-07-20-completorium-[a-z0-9-]+$/.test(id))).toBe(true)
    expect(blocks().every(block => block.type !== 'unknown')).toBe(true)
  })

  it('keeps block text NFC-normalized and free of HTML tags', () => {
    for (const date of dates) {
      for (const block of blocks(date)) {
        for (const line of block.text) {
          expect(line).toBe(line.normalize('NFC'))
          expect(line).not.toMatch(/<\/?[a-z][^>]*>/i)
        }
      }
    }
  })

  it('requires sourceRefs on key textual blocks', () => {
    const keyTypes = new Set(['prayer', 'hymn', 'psalm', 'antiphon', 'marian-antiphon', 'reading', 'responsory'])
    for (const date of dates) {
      for (const block of blocks(date).filter(block => keyTypes.has(block.type))) {
        expect(block.sourceRefs.length, `${date} ${block.id}`).toBeGreaterThan(0)
        expect(block.sourceRefs.every(ref => ref.upstreamCommit === '515a213f79951c563be4f599ca591c63aa63bb6d')).toBe(true)
        expect(block.sourceRefs.every(ref => Boolean(ref.path))).toBe(true)
      }
    }
  })

  it('models ordinary block order without flattening Completorium into HTML', () => {
    expect(blocks().map(block => block.type)).toEqual([
      'blessing',
      'reading',
      'dialogue',
      'dialogue',
      'antiphon',
      'psalm',
      'psalm',
      'psalm',
      'antiphon',
      'hymn',
      'capitulum',
      'responsory',
      'versicle',
      'antiphon',
      'canticle',
      'antiphon',
      'prayer',
      'dialogue',
      'blessing',
      'marian-antiphon',
      'blessing',
    ])
  })

  it('records psalm segments, verses, Gloria Patri, and antiphon repetition', () => {
    const normal = blocks()
    const psalms = normal.filter(block => block.type === 'psalm')
    expect(psalms).toHaveLength(3)
    expect(psalms.map(block => block.metadata?.psalmNumber)).toEqual(['6', '7', '7'])
    expect(psalms.map(block => block.metadata?.segment)).toEqual([undefined, '2-10', '11-18'])
    expect(psalms.every(block => Array.isArray(block.metadata?.verses) && (block.metadata?.verses as string[]).length > 0)).toBe(true)
    expect(psalms.every(block => block.metadata?.includesGloriaPatri === true)).toBe(true)

    const repeatedAntiphons = normal.filter(block => block.type === 'antiphon' && block.metadata?.repeated === true)
    expect(repeatedAntiphons.length).toBeGreaterThanOrEqual(2)
  })

  it('models responsory metadata without Vue-side liturgical inference', () => {
    const responsory = blocks().find(block => block.type === 'responsory')
    expect(responsory?.metadata?.incipit).toContain('In manus tuas')
    expect(responsory?.metadata?.versicle).toContain('Redemísti nos')
    expect(responsory?.metadata?.includesGloriaPatri).toBe(true)
  })

  it('records seasonal Marian antiphons', () => {
    expect(blocks('2026-04-05').find(block => block.type === 'marian-antiphon')?.metadata?.antiphonKey).toBe('regina-caeli')
    expect(blocks('2026-12-25').find(block => block.type === 'marian-antiphon')?.metadata?.antiphonKey).toBe('alma-redemptoris-mater')
    expect(blocks('2026-07-20').find(block => block.type === 'marian-antiphon')?.metadata?.antiphonKey).toBe('salve-regina')
  })

  it('keeps private recitation formulas and special-day structures explicit', () => {
    expect(blocks().find(block => block.id.endsWith('confiteor-converte-nos'))?.metadata?.privateRecitation).toBe(true)
    expect(blocks('2026-04-02').some(block => block.metadata?.specialStructure === 'sacred-triduum')).toBe(true)
    expect(blocks('2026-04-02').filter(block => block.type === 'psalm').every(block => block.metadata?.gloriaPatriOmitted === true)).toBe(true)
    expect(blocks('2026-11-02').some(block => block.metadata?.specialStructure === 'defunctorum')).toBe(true)
    expect(blocks('2026-11-02').filter(block => block.type === 'psalm').every(block => block.metadata?.includesRequiemAeternam === true)).toBe(true)
  })

  it('has exact oracle comparison results for the Phase 2 fixture dates', () => {
    const report = JSON.parse(readFileSync('public/data/officium1962/reports/completorium-oracle-comparison.json', 'utf8'))
    expect(report.summary.dateCounts.exact).toBe(7)
    expect(report.summary.blockCounts.exact).toBeGreaterThan(100)
    expect(report.summary.blockCounts.mismatch).toBe(0)
    expect(report.summary.blockCounts.unresolved).toBe(0)
  })

  it('keeps the experimental Vue renderer isolated from raw Divinum Officium HTML parsing', () => {
    const viewer = readFileSync('components/officium1962/Office1962Viewer.vue', 'utf8')
    const renderer = readFileSync('components/officium1962/LiturgicalBlockRenderer.vue', 'utf8')

    expect(viewer).toContain('day: Office1962Day')
    expect(viewer).not.toContain('parseExportedOfficeHour')
    expect(renderer).not.toContain('v-html')
    expect(renderer).toContain('data-block-type')
  })
})
