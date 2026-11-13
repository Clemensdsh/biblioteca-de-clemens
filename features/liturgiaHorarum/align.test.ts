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

describe('alternative psalmody: the Chinese follows the Latin actually printed', () => {
  const plain = (la: string) => la.replace(/<[^>]+>/g, ' ')

  it('drops the engine\'s "psalms of the current, previous or next week" for Daytime Prayer (not in the typical edition, GILH 81)', async () => {
    const day = await new LiturgiaHorarumLoader(localFetch).day('2026-09-08')
    for (const cel of day.celebrations) {
      for (const hour of cel.hours)
        expect(hour.versions.map(v => v.label).join('|')).not.toMatch(/前周或后周/)
    }
  })

  it('complementary psalmody, "loco psalmi 121 (122) psalmum 128 (129)" (Terce of 2026-01-01): Ps 128(129) has its own Chinese', async () => {
    const zh = await new LiturgiaHorarumLoader(localFetch).chinese('2026-01-01', 'wanyou')
    const rows = Object.values(zh).flat().filter(row => /Psalmus 128 \(129\)/.test(plain(row.la)) && row.key === 'ZALM122')
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.zh?.[0]).toBe('t')
      // 万有真原 numbers psalms by the Vulgate or the Hebrew: either is Ps 128(129), not Ps 121(122)
      expect(row.zh![1].split('\n').slice(0, 3).join(' ')).toMatch(/\b12[89]\b/)
    }
  })

  it('GILH 34, Ps 95 in place of an invitatory psalm (Lauds of 2021-01-12): whole in 万有真原, marked in 香港本', async () => {
    const loader = new LiturgiaHorarumLoader(localFetch)
    const isPs95 = (row: { la: string, key: string | null }) => /Psalmus 94 \(95\)/.test(plain(row.la)) && /^ZALM(24|67|100)$/.test(row.key ?? '')
    const wanyou = Object.values(await loader.chinese('2021-01-12', 'wanyou')).flat().filter(isPs95)
    expect(wanyou.length).toBeGreaterThan(0)
    for (const row of wanyou)
      expect(row.zh![1]).toMatch(/请大家前来[\s\S]*因为上主是崇高的天主[\s\S]*愿光荣归于父/)
    const hk = Object.values(await loader.chinese('2021-01-12', 'hkdlc')).flat().filter(isPs95)
    for (const row of hk)
      expect(row.zh?.[0]).toBe('m')
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
