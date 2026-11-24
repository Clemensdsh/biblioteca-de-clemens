import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { adventStart, baptismOfTheLord, easterDate, seasonDay, seasonLabelZh } from './calendar'
import { blessingsFor } from './benedictio'
import { prefacesFor } from './praefatio'
import type { OrdoData } from './ordo'
import benedictiones from './benedictiones.json'
import praefationes from './praefationes.json'

const LH = 'public/data/liturgia-horarum/'
const read = (path: string) => JSON.parse(readFileSync(LH + path, 'utf8'))
const manifest = read('manifest.json') as { years: number[] }
const celCache = new Map<string, { title_la: string, rank: string }>()
const cel = (id: string) => {
  if (!celCache.has(id)) {
    const c = read(`cels/${id}.json`)
    celCache.set(id, { title_la: c.title_la, rank: c.rank })
  }
  return celCache.get(id)!
}
const days: Array<{ date: string, cels: Array<{ title_la: string, rank: string }> }> = []
for (const year of manifest.years) {
  for (const [date, entry] of Object.entries(read(`years/${year}.json`) as Record<string, { c: Array<[string, string]> }>))
    days.push({ date, cels: entry.c.map(([, id]) => cel(id)) })
}

describe('date → liturgical day', () => {
  it('computes Easter, Advent and the Baptism of the Lord', () => {
    expect(easterDate(2026)).toBe('2026-04-05')
    expect(easterDate(2027)).toBe('2027-03-28')
    expect(adventStart(2026)).toBe('2026-11-29')
    expect(baptismOfTheLord(2026)).toBe('2026-01-11')
    expect(baptismOfTheLord(2028)).toBe('2028-01-09')
  })

  it('gives the readings cycles of the liturgical year', () => {
    expect(seasonDay('2026-11-24')).toMatchObject({ season: 'per-annum', week: 34, cycle: 'A', weekdayCycle: 'II' })
    expect(seasonDay('2026-11-29')).toMatchObject({ season: 'adventus', week: 1, cycle: 'B', weekdayCycle: 'I' })
    expect(seasonLabelZh(seasonDay('2026-11-24'))).toBe('常年期第三十四周 星期二 · 主日甲年 · 平日第二年')
  })

  it('agrees with the season and week of every weekday title in the Liturgy of the Hours data (2021–2036)', () => {
    const SEASON: Array<[RegExp, string]> = [[/per annum/, 'per-annum'], [/Quadragesim/, 'quadragesima'], [/Adventus/, 'adventus'], [/pasch/i, 'pascha'], [/Nativitatis/i, 'nativitas']]
    const wrong: string[] = []
    let checked = 0
    for (const { date, cels } of days) {
      const title = cels[0].title_la
      const m = /Tempus ([^,]+), Hebdomada (\d+)/.exec(title)
      if (!m)
        continue
      const expected = SEASON.find(([re]) => re.test(m[1]))?.[1]
      const got = seasonDay(date)
      checked++
      if (got.season !== expected || got.week !== Number(m[2]))
        wrong.push(`${date} ${title} → ${got.season} ${got.week}`)
    }
    expect(checked).toBeGreaterThan(3000)
    expect(wrong).toEqual([])
  })

  it('agrees with the Sundays of Ordinary Time and of Lent by name', () => {
    const ROMAN: Record<string, number> = Object.fromEntries(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'].map((r, i) => [r, i + 1]))
    const wrong: string[] = []
    for (const { date, cels } of days) {
      const m = /^Dominica ([IVX]+) per annum/.exec(cels[0].title_la)
      if (m && (seasonDay(date).season !== 'per-annum' || seasonDay(date).week !== ROMAN[m[1]]))
        wrong.push(`${date} ${cels[0].title_la}`)
    }
    expect(wrong).toEqual([])
  })
})

describe('prefaces and blessings for every day', () => {
  const prefaceIds = new Set((praefationes as unknown as OrdoData).sections.map(s => s.id))
  const blessingIds = new Set((benedictiones as unknown as OrdoData).sections.map(s => s.id))

  it('names only prefaces and blessings that are in the data, for every celebration of 2021–2036', () => {
    const unknown = new Set<string>()
    for (const { date, cels } of days) {
      const day = seasonDay(date)
      for (const c of cels) {
        const p = prefacesFor(day, c)
        p.options.filter(id => !prefaceIds.has(id)).forEach(id => unknown.add(id))
        blessingsFor(day, c).options.filter(id => !blessingIds.has(id)).forEach(id => unknown.add(id))
        // a day without any preface is only Good Friday
        if (!p.options.length && !p.proper)
          expect(day.season === 'triduum' && day.weekday === 5, `${date} ${c.title_la}`).toBe(true)
      }
    }
    expect([...unknown]).toEqual([])
  })

  it('follows the rubrics on sample days', () => {
    const at = (date: string, i = 0) => {
      const d = days.find(x => x.date === date)!
      return prefacesFor(seasonDay(date), d.cels[i])
    }
    expect(at('2026-12-02').options).toEqual(['adv-1'])
    expect(at('2026-12-18').options).toEqual(['adv-2'])
    expect(at('2026-12-25').options).toEqual(['nat-1', 'nat-2', 'nat-3'])
    expect(at('2026-12-26').options).toEqual(['nat-1', 'nat-2', 'nat-3'])
    expect(at('2026-01-08').options).toEqual(['epiph', 'nat-1', 'nat-2', 'nat-3'])
    expect(at('2026-02-25').options).toEqual(['quad-3', 'quad-4', 'quad-1', 'quad-2'])
    expect(at('2026-03-24').options).toEqual(['pass-1'])
    expect(at('2026-03-31').options).toEqual(['pass-2'])
    expect(at('2026-04-02').options).toEqual(['euch-1'])
    expect(at('2026-04-08').options).toEqual(['pasch-1'])
    expect(at('2026-05-18').options).toEqual(['asc-1', 'asc-2', 'pasch-1', 'pasch-2', 'pasch-3', 'pasch-4', 'pasch-5'])
    expect(at('2026-06-07').options).toEqual(['dom-1', 'dom-2', 'dom-3', 'dom-4', 'dom-5', 'dom-6', 'dom-7', 'dom-8'])
    expect(at('2026-11-25').options).toEqual(['comm-1', 'comm-2', 'comm-3', 'comm-4', 'comm-5', 'comm-6'])
    expect(at('2026-11-24').options.slice(0, 2)).toEqual(['mart-1', 'mart-2'])
    expect(at('2026-03-19').options).toEqual(['ioseph'])
    expect(at('2026-09-29').options).toEqual(['angeli'])
    expect(at('2026-11-02').options).toEqual(['def-1', 'def-2', 'def-3', 'def-4', 'def-5'])
    expect(at('2026-11-22').proper?.la).toBe('De Christo universorum Rege')
    expect(at('2026-03-01').proper?.la).toBe('De Transfiguratione Domini')
    expect(at('2026-04-03').options).toEqual([])
  })
})
