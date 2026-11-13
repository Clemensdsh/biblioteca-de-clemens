import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { celebrationNameZh, psalterWeekZh, RANK_ZH, titleZh, zhNumber } from './titleZh'

// the page's own split of a title into name and trailing rank / psalter week
const RANK = /^(.*?),?\s+(sollemnitas|festum|memoria(?: ad libitum)?|pro commemoratione|Hebdomada \d+ Psalterii)$/

describe('Chinese day titles', () => {
  it('writes numbers', () => {
    expect([1, 10, 12, 20, 32, 34].map(zhNumber)).toEqual(['一', '十', '十二', '二十', '三十二', '三十四'])
  })

  it('translates the seasons by rule', () => {
    expect(titleZh('Feria quarta, Tempus per annum, Hebdomada 32')).toBe('常年期第三十二周星期三')
    expect(titleZh('Sabbatum, Tempus Adventus, Hebdomada 3')).toBe('将临期第三周星期六')
    expect(titleZh('Dominica XXIX per annum')).toBe('常年期第二十九主日')
    expect(titleZh('Dominica Quarta Adventus')).toBe('将临期第四主日')
    expect(titleZh('FERIA TERTIA INFRA OCTAVAM PASCHÆ')).toBe('复活八日庆期星期二')
    expect(titleZh('FERIA VI IN PASSIONE DOMINI')).toBe('圣周五：救主受难纪念')
    expect(titleZh('Feria quinta, Hebdomada sancta, Hebdomada 6')).toBe('圣周四：主的晚餐')
    expect(psalterWeekZh('Hebdomada 4 Psalterii')).toBe('圣咏集第四周')
    expect(RANK_ZH.memoria).toBe('必行纪念')
    expect(RANK_ZH['memoria ad libitum']).toBe('自由纪念')
  })

  it('covers every weekday and Sunday title in the data', () => {
    const missing = new Set<string>()
    for (const f of readdirSync('public/data/liturgia-horarum/cels')) {
      const cel = JSON.parse(readFileSync(`public/data/liturgia-horarum/cels/${f}`, 'utf8'))
      if (!['weekday', 'sunday'].includes(cel.rank) && !/^DOMINICA (PASCHÆ|PENTECOSTES)/.test(cel.title_la))
        continue
      const m = RANK.exec(cel.title_la)
      const main = m ? m[1] : cel.title_la
      if (!titleZh(main))
        missing.add(cel.title_la)
      if (m && !RANK_ZH[m[2]] && !psalterWeekZh(m[2]))
        missing.add(`rank: ${m[2]}`)
    }
    expect([...missing]).toEqual([])
  }, 60_000) // reads every celebration file

  it('names some days by date, as GCatholic does', () => {
    expect(titleZh('Feria quinta, Tempus Adventus, Hebdomada 3', '2026-12-17')).toBe('将临期十二月十七日')
    expect(titleZh('Feria quinta, Tempus Adventus, Hebdomada 3', '2026-12-10')).toBe('将临期第三周星期四')
    expect(titleZh('Feria tertia infra octavam Nativitatis', '2026-12-29')).toBe('圣诞庆期第五日')
    expect(titleZh('Feria secunda, Tempus Nativitatis, Hebdomada 2', '2026-01-05')).toBe('圣诞期平日星期一')
    expect(titleZh('Feria quarta, Tempus Nativitatis, Hebdomada 2', '2026-01-07')).toBe('主显节后星期三')
  })

  it('names every saint and feast in the data (GCatholic)', () => {
    expect(titleZh('S. Iosaphat, episcopi et martyris')).toBeNull()
    expect(celebrationNameZh('S. Iosaphat, episcopi et martyris')).toBe('圣若撒法（主教、殉道）')
    const missing = new Set<string>()
    for (const f of readdirSync('public/data/liturgia-horarum/cels')) {
      const cel = JSON.parse(readFileSync(`public/data/liturgia-horarum/cels/${f}`, 'utf8'))
      if (['weekday', 'sunday'].includes(cel.rank))
        continue
      const main = RANK.exec(cel.title_la)?.[1] ?? cel.title_la
      if (!celebrationNameZh(main) && !titleZh(main))
        missing.add(cel.title_la)
    }
    expect([...missing]).toEqual([])
  }, 60_000) // reads every celebration file
})
