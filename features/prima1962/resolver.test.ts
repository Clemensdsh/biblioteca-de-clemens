import { describe, expect, it } from 'vitest'
import { normalizeDisplayLatin, normalizeLatinForLookup } from './latinNormalize'
import { addLocalDays, localDateToString, parseLocalDate } from './localDate'
import { isAlleluiaSuppressed, psalmodyKeyFor, resolvePrima1962, shouldIncludeQuicumque, shouldOmitMartyrology } from './resolver'
import manifest from '../../public/data/prima1962/manifest.json'
import psalmsLatin from '../../public/data/prima1962/psalms-latin.json'
import translationStatus from '../../public/data/prima1962/translation-status.json'

describe('prima1962 local date handling', () => {
  it('adds days without UTC serialization drift', () => {
    expect(localDateToString(addLocalDays(parseLocalDate('2028-02-28'), 1))).toBe('2028-02-29')
    expect(localDateToString(addLocalDays(parseLocalDate('2028-02-29'), 1))).toBe('2028-03-01')
    expect(localDateToString(addLocalDays(parseLocalDate('2026-12-31'), 1))).toBe('2027-01-01')
  })
})

describe('prima1962 latin normalization', () => {
  it('normalizes lookup spelling without damaging display spelling', () => {
    expect(normalizeLatinForLookup('Jam adjutorium ejus Judæi œconomia')).toBe('iam adiutorium eius iudaei oeconomia')
    expect(normalizeDisplayLatin('Jam adjutorium ejus Judæi')).toBe('Iam adiutorium eius Iudæi')
  })
})

describe('prima1962 resolver', () => {
  it('resolves a normal Monday with Monday psalmody and next-day martyrology', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-07-13'))

    expect(result.officeDate).toBe('2026-07-13')
    expect(result.martyrologyDate).toBe('2026-07-14')
    expect(psalmodyKeyFor(parseLocalDate('2026-07-13'))).toBe('Feria II')
    expect(result.psalms.map(psalm => psalm.number)).toEqual(['23', '18', '18'])
    expect(result.lectioBrevis.id).toBe('lectio.per-annum')
    expect(result.martyrologyOmitted).toBe(false)
  })

  it('resolves a normal Wednesday with Wednesday psalmody', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-07-15'))

    expect(psalmodyKeyFor(parseLocalDate('2026-07-15'))).toBe('Feria IV')
    expect(result.psalms.map(psalm => psalm.number)).toEqual(['25', '51', '52'])
  })

  it('uses Passiontide responsory without Gloria Patri', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-03-22'))

    expect(result.responsory.mode).toBe('passion')
    expect(result.responsory.blocks.some(block => block.latin.includes('Glória Patri'))).toBe(false)
    expect(result.openingAcclamation).toBe('laus-tibi')
  })

  it('uses Paschal responsory in Eastertide', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-04-06'))

    expect(result.responsory.mode).toBe('paschal')
    expect(result.responsory.blocks.some(block => block.latin.includes('allelúia'))).toBe(true)
    expect(result.openingAcclamation).toBe('alleluia')
  })

  it('matches the Rubrics 1960 Prima oracle for Ash Wednesday variable texts', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-02-18'))

    expect(result.temporalKey).toBe('ash-wednesday')
    expect(result.officeTitle).toContain('Feria IV Cinerum')
    expect(result.officeRank).toBe('I classis')
    expect(result.openingAcclamation).toBe('laus-tibi')
    expect(result.antiphon.id).toBe('antiphon.Feria IV')
    expect(result.lectioBrevis.id).toBe('lectio.per-annum')
    expect(result.responsory.mode).toBe('ordinary')
    expect(result.responsory.blocks.some(block => block.id === 'responsory.ordinary.4')).toBe(true)
  })

  it('keeps Eastertide weekdays in the Paschal variable texts after the octave', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-04-22'))

    expect(result.temporalKey).toBe('easter')
    expect(result.lectioBrevis.id).toBe('lectio.pasch')
    expect(result.lectioBrevis.latin).toContain('Si consurrex')
    expect(result.responsory.mode).toBe('paschal')
    expect(result.antiphon.id).toMatch(/^antiphon\.Pasch\./)
  })

  it('uses seasonal Prima antiphons in late Advent', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-12-17'))

    expect(result.antiphon.id).toBe('antiphon.Adv45.1')
    expect(result.antiphon.latin).toContain('De Sion')
    expect(result.antiphon.chinese).toContain('全能的上主')
    expect(result.responsory.blocks.some(block => block.latin.includes('Qui ventúrus es in mundum'))).toBe(true)
  })

  it('uses proper Sunday Ant Prima in Lent before the seasonal fallback', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-02-22'))

    expect(result.antiphon.id).toBe('antiphon.Tempora/Quad1-0')
    expect(result.antiphon.latin).toContain('Iesus autem')
    expect(result.antiphon.chinese).toContain('禁食了四十天')
  })

  it('uses Lent variable texts from the first Sunday of Lent', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-02-22'))

    expect(result.temporalKey).toBe('lent')
    expect(result.antiphon.id).toBe('antiphon.Tempora/Quad1-0')
    expect(result.lectioBrevis.id).toBe('lectio.quad')
  })

  it('uses Passiontide variable texts during Holy Week before the Triduum', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-03-30'))

    expect(result.temporalKey).toBe('holy-week')
    expect(result.antiphon.id).toMatch(/^antiphon\.Quad5/)
    expect(result.lectioBrevis.id).toBe('lectio.quad5')
    expect(result.responsory.mode).toBe('passion')
    expect(result.responsory.blocks.some(block => block.id === 'responsory.ordinary.4')).toBe(false)
  })

  it('uses the special Triduum minor-hours structure from the 1960 rules', async () => {
    for (const date of ['2026-04-02', '2026-04-03', '2026-04-04']) {
      const result = await resolvePrima1962(parseLocalDate(date))

      expect(result.temporalKey).toBe('triduum')
      expect(result.psalms.map(psalm => psalm.number)).toEqual(['117', '118', '118'])
      expect(result.psalmGloriaOmitted).toBe(true)
      expect(result.martyrologyOmitted).toBe(true)
      expect(result.lectioBrevis.id).toBe('lectio.quad5')
      expect(result.responsory.mode).toBe('passion')
    }
  })

  it('covers sampled dates against Divinum Officium gettempora-derived keys', async () => {
    const cases = [
      ['2025-09-18', 'per-annum', 'antiphon.Feria V', 'lectio.per-annum', 'ordinary'],
      ['2025-12-02', 'advent', 'antiphon.Adv1.1', 'lectio.adv', 'ordinary'],
      ['2025-12-24', 'advent', 'antiphon.Adv4.1', 'lectio.adv', 'ordinary'],
      ['2026-02-10', 'septuagesima', 'antiphon.Feria III', 'lectio.per-annum', 'ordinary'],
      ['2026-03-13', 'lent', 'antiphon.Quad.1', 'lectio.quad', 'ordinary'],
      ['2026-04-18', 'easter', 'antiphon.Pasch.1', 'lectio.pasch', 'paschal'],
      ['2026-06-06', 'per-annum', 'antiphon.Sabbato', 'lectio.per-annum', 'ordinary'],
    ] as const

    for (const [date, temporalKey, antiphonId, lectioId, responsoryMode] of cases) {
      const result = await resolvePrima1962(parseLocalDate(date))
      expect([date, result.temporalKey]).toEqual([date, temporalKey])
      expect([date, result.antiphon.id]).toEqual([date, antiphonId])
      expect([date, result.lectioBrevis.id]).toEqual([date, lectioId])
      expect([date, result.responsory.mode]).toEqual([date, responsoryMode])
    }
  })

  it('marks Trinity Sunday for Quicumque', async () => {
    const trinity = parseLocalDate('2026-05-31')
    const result = await resolvePrima1962(trinity)

    expect(shouldIncludeQuicumque(trinity, 'trinity')).toBe(true)
    expect(result.includeQuicumque).toBe(true)
    expect(result.quicumque?.[0]?.latin).toContain('Quicúmque vult salvus esse')
    expect(result.quicumque?.[0]?.translationStatus).toBe('temporary-translation')
  })

  it('does not add Quicumque on ordinary Sundays under the 1960 rubrics', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-07-12'))

    expect(result.includeQuicumque).toBe(false)
  })

  it('omits martyrology during the Triduum', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-04-02'))

    expect(shouldOmitMartyrology('triduum')).toBe(true)
    expect(result.martyrologyOmitted).toBe(true)
    expect(result.psalmGloriaOmitted).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('does not import the 1960 martyrology data path', () => {
    expect(manifest.notImported).toContain('web/www/horas/Latin/Martyrologium1960/')
    expect(JSON.stringify(manifest)).not.toContain('Martyrologium1960",')
  })

  it('keeps psalm verses structured and translation status explicit', () => {
    expect(psalmsLatin['23'][0].latin).toContain('Dómini est terra')
    expect(psalmsLatin['23'][0].translationStatus).toBe('verified-source-translation')
    expect(psalmsLatin['18(2-\'7b\')'][0].chinese).toContain('高天陈述天主的光荣')
    expect(psalmsLatin['18(2-\'7b\')'][0].sourceRefs.some(ref => ref.file.includes('思高圣咏集_武加大编号_逐节纯文本'))).toBe(true)
    expect(translationStatus.some(item => item.codexTemporaryTranslation)).toBe(true)
  })

  it('does not include Dominican/Iesu variant lines in the ordinary short responsory', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-07-13'))
    const responsory = result.responsory.blocks.map(block => block.latin).join('\n')

    expect(responsory).toContain('Christe, Fili Dei vivi')
    expect(responsory).not.toContain('Iesu Christe')
    expect(responsory).not.toContain('Jesu Christe')
  })

  it('keeps the Versus pair before Et libera in the rendered block list', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-07-13'))
    const exsurgeIndex = result.blocks.findIndex(block => block.id === 'responsory.exsurge')
    const liberaIndex = result.blocks.findIndex(block => block.id === 'responsory.libera')

    expect(exsurgeIndex).toBeGreaterThan(-1)
    expect(liberaIndex).toBeGreaterThan(exsurgeIndex)
  })

  it('uses Ascension proper responsory verse', async () => {
    const result = await resolvePrima1962(parseLocalDate('2026-05-14'))

    expect(result.responsory.blocks.some(block => block.latin.includes('Qui scandis super sídera'))).toBe(true)
    expect(result.lectioBrevis.latin).toContain('Viri Galilǽi')
  })

  it('detects alleluia suppression boundaries', () => {
    expect(isAlleluiaSuppressed(parseLocalDate('2026-02-01'))).toBe(true)
    expect(isAlleluiaSuppressed(parseLocalDate('2026-04-05'))).toBe(false)
  })
})
