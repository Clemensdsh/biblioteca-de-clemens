import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { alignPsalm, PSALM_KEY, splitZhPsalm } from './align'
import { bioHourCodes, LiturgiaHorarumLoader } from './data'
import { formatZh } from './zhFormat'

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

describe('saint\'s biographical note', () => {
  it('shows once, at the Office of Readings, on a memorial (S. Iosaphat, 2026-11-12)', async () => {
    const day = await new LiturgiaHorarumLoader(localFetch).day('2026-11-12')
    const cel = day.celebrations[day.defaultCelebration]
    expect([...bioHourCodes(cel, day.blocks)]).toEqual(['mpc'])
  })

  it('stays at First Vespers on the eve of a feast (Lateran basilica, 2025-11-08)', async () => {
    const day = await new LiturgiaHorarumLoader(localFetch).day('2025-11-08')
    for (const cel of day.celebrations)
      expect(bioHourCodes(cel, day.blocks).has('mv')).toBe(true)
  })
})

describe('Chinese paired with another psalm', () => {
  it('is marked, not shown (Sext of 2026-09-08: Latin Ps 52(53), Chinese Ps 74)', async () => {
    const zh = await new LiturgiaHorarumLoader(localFetch).chinese('2026-09-08', 'wanyou')
    const marked = Object.values(zh).flat().filter(row => row.zh?.[0] === 'm')
    expect(marked.length).toBeGreaterThan(0)
    expect(marked.some(row => /Psalmus 52 \(53\)/.test(row.la.replace(/<[^>]+>/g, ' ')))).toBe(true)
  })
})

describe('psalm pairing', () => {
  async function psalmRow(date: string, key: string, version: 'wanyou' | 'hkdlc') {
    const zh = await new LiturgiaHorarumLoader(localFetch).chinese(date, version)
    const row = Object.values(zh).flat().find(r => r.key === key && r.zh?.[0] === 't')!
    const { head, body } = splitZhPsalm(row.zh![1], formatZh(key, row.zh![1], row.la).filter(l => l.cls === 'body').length)
    return alignPsalm(row.la, head, body)
  }

  it('pairs Ps 144(143) I verse by verse, the two-verse Latin Gloria with the one-verse Chinese', async () => {
    const result = await psalmRow('2026-11-12', 'ZALM144_I', 'wanyou')
    expect(result.ok).toBe(true)
    if (!result.ok)
      return
    const verses = result.groups.filter(g => g.kind === 'verse')
    expect(verses.length).toBe(9)
    expect(verses[0].la).toMatch(/Benedíctus Dóminus/)
    expect(verses[0].zh.join('')).toMatch(/我的磐石/)
    const doxology = result.groups.find(g => g.kind === 'doxology')!
    expect(doxology.la).toMatch(/Glória Patri[\s\S]*sicut erat/)
    expect(doxology.zh.join('')).toMatch(/光荣归于父[\s\S]*起初如何/)
  })

  it('gives up rather than guess when the structure does not match', () => {
    const la = '<div class="psalm"><p class="verse start"><sup>1</sup>Unus versus,&nbsp;*</p><p class="verse cont">pars altera.</p>'
      + '<p class="verse start"><sup>2</sup>Alter versus,&nbsp;*</p><p class="verse cont">pars altera.</p></div>'
    // 2 Latin verses, 1 Chinese verse: never split; at most one group holding everything
    const one = alignPsalm(la, [], ['只有一节，※', '后半。'])
    if (one.ok)
      expect(one.groups.filter(g => g.kind === 'verse')).toHaveLength(1)
    expect(alignPsalm(la, [], ['第一节，※', '后半。', '多出的', '两行，※', '后半。']).ok).toBe(true) // a wrapped first half
  })

  it('only takes psalm and canticle rows', () => {
    expect(PSALM_KEY.test('ZALM144_I')).toBe(true)
    expect(PSALM_KEY.test('CHVAL_ZJV11')).toBe(true)
    expect(PSALM_KEY.test('FIX:MAGNIFICAT')).toBe(true)
    expect(PSALM_KEY.test('SCMM_vHYMNUS')).toBe(false)
  })
})
