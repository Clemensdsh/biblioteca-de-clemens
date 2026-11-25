import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LiturgiaHorarumLoader } from './data'
import { blankSaintNames, nameSaint } from './nameSlots'
import { saintNameZh } from './titleZh'

const ROOT = 'public/data/liturgia-horarum/'
const localFetch = (async (url: string) => {
  try {
    return new Response(readFileSync(String(url).replace('/data/liturgia-horarum/', ROOT).replace(/\?.*/, '')), { headers: { 'content-type': 'application/json' } })
  }
  catch {
    return new Response(null, { status: 404 })
  }
}) as typeof fetch

describe('names of particular saints in the commons', () => {
  it('blanks the frames of the commons, in both scripts', () => {
    expect(blankSaintNames('你召唤圣女思嘉追随你的芳踪，')).toBe('你召唤圣○○追随你的芳踪，')
    expect(blankSaintNames('你召喚聖嘉勒追隨你的芳踪，')).toBe('你召喚聖○○追隨你的芳踪，')
    const slot = 'Per intercessiónem sanctæ N., quæ virgo fuit'
    expect(blankSaintNames('領：聖女德蘭是賢慧明智的貞女，', slot)).toBe('領：聖○○是賢慧明智的貞女，')
    expect(blankSaintNames('你使你的子民欢庆童贞圣女思嘉的庆节，', slot)).toBe('你使你的子民欢庆童贞圣○○的庆节，')
    expect(blankSaintNames('在此牧者圣文德主教的庆节,')).toBe('在此牧者圣○○的庆节,')
    expect(blankSaintNames('请垂视圣若望·鲍斯高司铎的转求，')).toBe('请垂视圣○○的转求，')
    expect(blankSaintNames('今天在这圣若亚敬及圣亚纳的庆节，请大家赞美我们的天主。', 'Ant. Laudémus Deum nostrum, in celebritáte sancti N..')).toBe('今天在这圣○○的庆节，请大家赞美我们的天主。')
    expect(blankSaintNames('聖善導師，天主誡命的敬愛者，聖熱羅尼莫，請為我們轉求天主聖子。', 'O doctor óptime, beáte N.,')).toBe('聖善導師，天主誡命的敬愛者，聖○○，請為我們轉求天主聖子。')
    expect(blankSaintNames('圣女采琪（则济利亚），你是基督的见证。')).toBe('圣○○，你是基督的见证。')
  })

  it('leaves a row alone whose Latin has no slot for the name', () => {
    const text = '今天在这圣若亚敬及圣亚纳的庆节，请大家赞美我们的天主。'
    expect(blankSaintNames(text, 'Ant. Mirábilem Deum in sanctis suis, veníte adorémus.')).toBe(text)
    expect(blankSaintNames('圣女思嘉是贤慧明智的贞女，')).toBe('圣女思嘉是贤慧明智的贞女，')
  })

  it('leaves other texts alone', () => {
    for (const text of ['在此圣若瑟的庆节，我们要赞美主基督。', '师法圣伯多禄，', '圣母的转求，', '圣宠者的转求', '大圣玛窦，', '圣女小德兰的转求'])
      expect(blankSaintNames(text), text).toBe(text)
  })

  it('names the saint of the day, or leaves the blank', () => {
    expect(nameSaint('你召唤圣女思嘉追随你的芳踪，', '圣加大利纳．亚力大卓')).toBe('你召唤圣加大利纳．亚力大卓追随你的芳踪，')
    expect(nameSaint('请垂视圣安当的转求，', null)).toBe('请垂视圣○○的转求，')
    expect(nameSaint('聖○○追隨你', '聖加大利納')).toBe('聖加大利納追隨你')
    expect(nameSaint('在此牧者圣文德主教的庆节,', '真福某某')).toBe('在此牧者真福某某的庆节,')
  })

  it('names Saint Catherine of Alexandria (2026-11-25) in the hymn of virgins', async () => {
    const loader = new LiturgiaHorarumLoader(localFetch)
    for (const version of ['wanyou', 'hkdlc'] as const) {
      const day = await loader.day('2026-11-25')
      const blocks = await loader.chinese('2026-11-25', version)
      const name = saintNameZh('S. Catharinæ Alexandrinæ, virginis et martyris', version === 'hkdlc')
      expect(name).toBeTruthy()
      const text = Object.values(blocks).flat().map(row => (row.zh ? nameSaint(row.zh[1], name, row.la) : '')).join('\n')
      expect(text, version).toContain(`你${version === 'wanyou' ? '召唤' : '召喚'}${name}追${version === 'wanyou' ? '随' : '隨'}你的芳踪`)
      expect(text, version).not.toMatch(/思嘉|嘉勒|德蘭/)
      expect(Object.keys(day.blocks).length).toBeGreaterThan(0)
    }
  })
})
