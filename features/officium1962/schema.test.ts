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
const phase3Hours = ['tertia', 'sexta', 'nona', 'prima'] as const
const phase4Hours = ['laudes', 'vesperae'] as const

function loadDay(date = '2026-07-20', hour = 'completorium'): Office1962Day {
  return JSON.parse(readFileSync(`public/data/officium1962/experimental/days/${date}/${hour}.json`, 'utf8'))
}

function blocks(date = '2026-07-20', hour = 'completorium'): LiturgicalBlock[] {
  return loadDay(date, hour).hours[hour as keyof Office1962Day['hours']]?.blocks || []
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

describe('officium1962 Phase 3 minor hours and Prima', () => {
  it.each(dates.flatMap(date => phase3Hours.map(hour => [date, hour] as const)))('validates schema for %s %s', (date, hour) => {
    expect(validateOffice1962Day(loadDay(date, hour))).toEqual([])
  })

  it.each(phase3Hours)('keeps %s block IDs stable and known', (hour) => {
    const ids = blocks('2026-07-20', hour).map(block => block.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(id => id.startsWith(`office-1962-2026-07-20-${hour}-`))).toBe(true)
    expect(blocks('2026-07-20', hour).every(block => block.type !== 'unknown')).toBe(true)
  })

  it('models Tertia, Sexta, and Nona through a shared minor-hour structure', () => {
    for (const hour of ['tertia', 'sexta', 'nona'] as const) {
      const types = blocks('2026-07-20', hour).map(block => block.type)
      expect(types).toEqual([
        'dialogue',
        'hymn',
        'antiphon',
        'psalm',
        'psalm',
        'psalm',
        'antiphon',
        'capitulum',
        'responsory',
        'versicle',
        'prayer',
        'blessing',
      ])
      expect(blocks('2026-07-20', hour)[0].metadata?.minorHour).toMatchObject({ hour })
    }
  })

  it('keeps Prima independent from existing prima1962 and martyrology modules', () => {
    const primaTypes = blocks('2026-07-20', 'prima').map(block => block.type)
    expect(primaTypes).toContain('martyrology')
    expect(primaTypes).toContain('pretiosa')
    expect(primaTypes).toContain('chapter-office')
    expect(primaTypes).toContain('reading')

    const parser = readFileSync('features/officium1962/parseDoOutput.ts', 'utf8')
    expect(parser).not.toContain('features/prima1962')
    expect(parser).not.toContain('useMartyrologyPage')
    expect(parser).not.toContain('public/data/prima1962')
  })

  it('preserves sourceRefs for Phase 3 key blocks', () => {
    const keyTypes = new Set(['prayer', 'hymn', 'psalm', 'antiphon', 'reading', 'responsory', 'martyrology', 'chapter-office', 'pretiosa'])
    for (const date of dates) {
      for (const hour of phase3Hours) {
        for (const block of blocks(date, hour).filter(block => keyTypes.has(block.type))) {
          expect(block.sourceRefs.length, `${date} ${hour} ${block.id}`).toBeGreaterThan(0)
          expect(block.sourceRefs.every(ref => ref.upstreamCommit === '515a213f79951c563be4f599ca591c63aa63bb6d')).toBe(true)
          expect(block.sourceRefs.every(ref => Boolean(ref.path))).toBe(true)
        }
      }
    }
  })

  it('records special structures for Triduum, Easter, and All Souls minor hours', () => {
    expect(blocks('2026-04-02', 'tertia').filter(block => block.type === 'psalm').every(block => block.metadata?.gloriaPatriOmitted === true)).toBe(true)
    expect(blocks('2026-04-02', 'prima').some(block => block.metadata?.silentConclusion === true || block.metadata?.specialStructure === 'sacred-triduum')).toBe(true)
    expect(blocks('2026-04-05', 'tertia').some(block => block.metadata?.replacesCapitulum === true)).toBe(true)
    expect(blocks('2026-11-02', 'nona').filter(block => block.type === 'psalm').every(block => block.metadata?.includesRequiemAeternam === true)).toBe(true)
    expect(blocks('2026-11-02', 'prima').some(block => block.type === 'martyrology' && block.metadata?.specialStructure === 'defunctorum')).toBe(true)
  })

  it('has exact oracle comparison results for the Phase 3 fixture dates and hours', () => {
    const report = JSON.parse(readFileSync('public/data/officium1962/reports/minor-hours-oracle-comparison.json', 'utf8'))
    expect(report.summary.dateCounts.exact).toBe(28)
    expect(report.summary.blockCounts.exact).toBe(305)
    expect(report.summary.blockCounts.mismatch).toBe(0)
    expect(report.summary.blockCounts.unresolved).toBe(0)
  })

  it('updates the isolated preview without registering a production route', () => {
    const preview = readFileSync('playground/officium1962/main.mjs', 'utf8')
    expect(preview).toContain('availableHours')
    expect(preview).toContain('${state.selectedHour}.json')

    const routeSearchTargets = [
      'pages',
      'layouts',
      'composables',
      'vite.config.ts',
      'valaxy.config.ts',
    ]
    for (const target of routeSearchTargets) {
      try {
        expect(readFileSync(target, 'utf8')).not.toContain('officium1962')
      }
      catch {
        // Directory targets are checked by the build; this assertion only guards direct config files.
      }
    }
  })
})

describe('officium1962 Phase 4 Laudes and Vesperae', () => {
  it.each(dates.flatMap(date => phase4Hours.map(hour => [date, hour] as const)))('validates schema for %s %s', (date, hour) => {
    expect(validateOffice1962Day(loadDay(date, hour))).toEqual([])
  })

  it.each(phase4Hours)('keeps %s block IDs stable and known', (hour) => {
    const ids = blocks('2026-07-20', hour).map(block => block.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(id => id.startsWith(`office-1962-2026-07-20-${hour}-`))).toBe(true)
    expect(blocks('2026-07-20', hour).every(block => block.type !== 'unknown')).toBe(true)
  })

  it('models Laudes psalmody, Old Testament canticle, Benedictus, and commemoration', () => {
    const laudes = blocks('2026-07-20', 'laudes')
    const psalmody = laudes.filter(block => block.type === 'psalm' || (block.type === 'canticle' && block.metadata?.psalmSourceNumber === '211'))
    expect(psalmody).toHaveLength(5)
    expect(psalmody.map(block => block.metadata?.psalmSourceNumber || block.metadata?.psalmNumber)).toEqual(['46', '5', '28', '211', '116'])
    expect(psalmody.every(block => block.metadata?.includesGloriaPatri === true)).toBe(true)

    const benedictus = laudes.find(block => block.id.endsWith('-benedictus'))
    expect(benedictus?.type).toBe('canticle')
    expect(benedictus?.metadata?.canticle).toBe('benedictus')
    expect(benedictus?.metadata?.source).toBe('Luc. 1:68-79')

    const commemoration = laudes.find(block => block.type === 'commemoration')
    expect(commemoration?.metadata?.includesAntiphon).toBe(true)
    expect(commemoration?.sourceRefs.some(ref => ref.path.includes('Common/Prayers.txt'))).toBe(true)
  })

  it('models Vesperae Magnificat and upstream-resolved empty sections without inventing psalmody', () => {
    const vesperae = blocks('2026-07-20', 'vesperae')
    expect(loadDay('2026-07-20', 'vesperae').hours.vesperae?.metadata?.concurrenceResolvedByUpstream).toBe(true)
    expect(vesperae.find(block => block.id.endsWith('psalmi-empty'))?.metadata?.emptyMajorSection).toBe('psalmi')
    expect(vesperae.find(block => block.id.endsWith('hymnus-empty'))?.metadata?.emptyMajorSection).toBe('hymnus')

    const magnificat = vesperae.find(block => block.id.endsWith('-magnificat'))
    expect(magnificat?.type).toBe('canticle')
    expect(magnificat?.metadata?.canticle).toBe('magnificat')
    expect(magnificat?.metadata?.source).toBe('Luc. 1:46-55')
  })

  it('keeps Phase 4 Latin text NFC-normalized, free of HTML, and sourced', () => {
    const keyTypes = new Set(['prayer', 'hymn', 'psalm', 'canticle', 'antiphon', 'commemoration', 'responsory', 'capitulum'])
    for (const date of dates) {
      for (const hour of phase4Hours) {
        for (const block of blocks(date, hour)) {
          for (const line of block.text) {
            expect(line).toBe(line.normalize('NFC'))
            expect(line).not.toMatch(/<\/?[a-z][^>]*>/i)
          }
          if (keyTypes.has(block.type)) {
            expect(block.sourceRefs.length, `${date} ${hour} ${block.id}`).toBeGreaterThan(0)
            expect(block.sourceRefs.every(ref => ref.upstreamCommit === '515a213f79951c563be4f599ca591c63aa63bb6d')).toBe(true)
            expect(block.sourceRefs.every(ref => Boolean(ref.path))).toBe(true)
          }
        }
      }
    }
  })

  it('records special major-hour structures for Triduum, Easter, and All Souls', () => {
    expect(blocks('2026-04-02', 'laudes').some(block => block.type === 'rubric' && block.metadata?.omitted === true)).toBe(true)
    expect(blocks('2026-04-02', 'vesperae').some(block => block.id.endsWith('capitulum-hymnus-versus-omittitur'))).toBe(true)
    expect(blocks('2026-04-05', 'laudes').some(block => block.type === 'rubric' && block.metadata?.specialStructure === 'easter')).toBe(true)
    expect(blocks('2026-04-05', 'laudes').some(block => block.metadata?.replacesCapitulum === true)).toBe(true)
    expect(blocks('2026-11-02', 'laudes').some(block => block.metadata?.replacesCapitulum === true)).toBe(true)
    const defunctorumPsalmody = blocks('2026-11-02', 'laudes')
      .filter(block => block.type === 'psalm' || (block.type === 'canticle' && block.metadata?.psalmSourceNumber))
    expect(defunctorumPsalmody).toHaveLength(5)
    expect(defunctorumPsalmody.every(block => block.metadata?.includesRequiemAeternam === true)).toBe(true)
  })

  it('has exact oracle comparison results for the Phase 4 fixture dates and hours', () => {
    const report = JSON.parse(readFileSync('public/data/officium1962/reports/major-hours-oracle-comparison.json', 'utf8'))
    expect(report.summary.dateCounts.exact).toBe(14)
    expect(report.summary.blockCounts.exact).toBe(234)
    expect(report.summary.blockCounts.mismatch).toBe(0)
    expect(report.summary.blockCounts.unresolved).toBe(0)
  })

  it('adds Laudes and Vesperae only to the isolated preview', () => {
    const preview = readFileSync('playground/officium1962/main.mjs', 'utf8')
    expect(preview).toContain("'laudes'")
    expect(preview).toContain("'vesperae'")

    const parser = readFileSync('features/officium1962/parseDoOutput.ts', 'utf8')
    expect(parser).not.toContain('features/prima1962')
    expect(parser).not.toContain('public/data/prima1962')
  })
})
