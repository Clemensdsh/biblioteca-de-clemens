import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { addDays, blockIds, HOURS, isDate, LiturgiaHorarumLoader, type Manifest, postureMarks } from './data'

const ROOT = 'public/data/liturgia-horarum/'
const localFetch = (async (url: string) => {
  const path = String(url).replace('/data/liturgia-horarum/', ROOT)
  try {
    return new Response(readFileSync(path.replace(/\?.*/, '')), { headers: { 'content-type': 'application/json' } })
  }
  catch {
    return new Response(null, { status: 404 })
  }
}) as typeof fetch

const manifest: Manifest = JSON.parse(readFileSync(`${ROOT}manifest.json`, 'utf8'))
const sample = [manifest.from, '2026-04-02', '2026-04-04', '2026-11-02', '2026-12-25', manifest.to]
  .filter(date => date >= manifest.from && date <= manifest.to)

describe('Liturgia Horarum data', () => {
  it.each(sample)('loads every text of %s', async (date) => {
    const day = await new LiturgiaHorarumLoader(localFetch).day(date)
    expect(day.celebrations[day.defaultCelebration]).toBeDefined()
    for (const cel of day.celebrations) {
      expect(cel.hours.map(hour => hour.code)).toEqual(HOURS.map(hour => hour.code))
      for (const id of blockIds(cel))
        expect(typeof day.blocks[id], id).toBe('string')
    }
  })

  it.each(sample)('loads both Chinese versions of %s', async (date) => {
    const loader = new LiturgiaHorarumLoader(localFetch)
    for (const version of ['hkdlc', 'wanyou'] as const) {
      const blocks = await loader.chinese(date, version)
      expect(Object.keys(blocks).length, `${version} ${date}`).toBeGreaterThan(0)
      const day = await loader.day(date)
      const textOf = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
      for (const [id, rows] of Object.entries(blocks)) {
        expect(textOf(rows.map(row => row.la).join('')), id).toBe(textOf(day.blocks[id]))
        for (const { zh } of rows) {
          if (zh) {
            expect(['t', 's', 'o', 'c', 'm']).toContain(zh[0])
            expect(zh[1]).toEqual(expect.any(String))
          }
        }
      }
    }
  })

  it('gives the Saturday memorial of Our Lady her Lauds intercessions in Chinese, from the scanned book', async () => {
    // 2026-11-21: the Presentation of the Blessed Virgin Mary; its Preces (SPMVSr_PROSBY_0) are in no online source
    const loader = new LiturgiaHorarumLoader(localFetch)
    const blocks = await loader.chinese('2026-11-21', 'hkdlc')
    const row = blocks['2d9a6bd5802ed406'].find(r => r.key === 'SPMVSr_PROSBY_0')!
    expect(row.zh?.[0]).toBe('t')
    expect(row.zh?.[1]).toContain('義德的太陽')
    expect(row.zh?.[1].split('\n').length).toBe(10)
    const simplified = (await loader.chinese('2026-11-21', 'wanyou'))['2d9a6bd5802ed406'].find(r => r.key === 'SPMVSr_PROSBY_0')!
    expect(simplified.zh).toEqual(['t', expect.stringContaining('义德的太阳')])
  })

  it('gives Saint Clement (11-23) the book\'s martyr hymns, the whole responsory and the collect\'s closing formula', async () => {
    const loader = new LiturgiaHorarumLoader(localFetch)
    for (const version of ['hkdlc', 'wanyou'] as const) {
      const blocks = await loader.chinese('2026-11-23', version)
      const zhOf = (id: string, key: string) => blocks[id].find(r => r.key === key)?.zh
      // hymns: the martyr hymn of the book (聖○○ is named by the page), not a bishop's or Saint Josaphat's
      for (const [id, key] of [['8f7091f38f648033', 'SCMM_cHYMNUS'], ['87af426b2d6ce779', 'SCMM_rHYMNUS']]) {
        const zh = zhOf(id, key)
        expect(zh?.[0], `${version} ${key}`).toBe('t')
        expect(zh?.[1]).toMatch(/[圣聖]○○/)
        expect(zh?.[1]).not.toMatch(/依勒内|若撒法|牧者|主教/)
      }
      // the responsory's second response is written out, the collect closes like the Latin
      expect(zhOf('5d200d475534ffdd', '23NOV_cCIT2#R')?.[1]).toMatch(/(?:答：.*\n领：.*\n)?答：因[为為]天主[拣揀][选選]了他，作[为為]自己的祭司。$/)
      expect(zhOf('4a8f0763da5dc491', '23NOV_MODLITBA')?.[1]).toMatch(/永生永王。[亚亞阿][孟们們]。$/)
    }
  })

  it('has the readings of the Apostles\' feasts that the two sources lack, from the 万有真原 day pages', async () => {
    // 2026-07-25: the alternative first reading (1 Cor 4, 1-16) and the second reading of Saint James
    const loader = new LiturgiaHorarumLoader(localFetch)
    const day = await loader.day('2026-07-25')
    const zh = await loader.chinese('2026-07-25', 'wanyou')
    const cel = day.celebrations[day.defaultCelebration]
    const first = cel.hours.find(h => h.code === 'mpc')!.versions[0].parts.find(p => 'block' in p && p.title === 'LECTIO PRIOR') as { block: string }
    const second = cel.hours.find(h => h.code === 'mpc')!.versions[0].parts.find(p => 'block' in p && p.title === 'LECTIO ALTERA') as { block: string }
    expect(zh[first.block].find(r => r.key === 'SCAP_OCR_cCIT1')?.zh?.[1]).toContain('我们要师法使徒们')
    expect(zh[second.block].find(r => r.key === '25JUL_cCIT2')?.zh?.[1]).toContain('金口')
    const hk = await loader.chinese('2026-07-25', 'hkdlc')
    expect(hk[first.block].find(r => r.key === 'SCAP_OCR_cCIT1')?.zh?.[2]).toBe('wanyou')
  })

  it('reports a date outside the data', async () => {
    await expect(new LiturgiaHorarumLoader(localFetch).day(addDays(manifest.to, 1))).rejects.toThrow()
  })

  it('marks posture only where it changes', () => {
    const part = (title: string | null) => ({ title, block: 'x' })
    expect(postureMarks('mrch', [part(null), part('HYMNUS'), part('PSALMODIA'), part('LECTIO BREVIS'), part('RESPONSORIUM BREVE'), part('CANTICUM EVANGELICUM'), part('PRECES'), part('ORATIO')]))
      .toEqual(['Stantes · 立', undefined, 'Sedentes vel stantes · 坐或立', 'Sedentes · 坐', undefined, 'Stantes · 立', undefined, undefined])
    expect(postureMarks('mi', [part(null)])).toEqual(['Stantes · 立'])
  })

  it('validates and steps civil dates', () => {
    expect(isDate('2027-02-29')).toBe(false)
    expect(isDate('2028-02-29')).toBe(true)
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})
