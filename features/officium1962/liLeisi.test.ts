import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadHourBlocks } from '../../scripts/officium1962/li-leisi/do-data.mjs'
import { LI_LEISI_SCHEMA, liDoxology, lookupLiLeisi, type LiLeisiData } from './liLeisi'

const data = JSON.parse(readFileSync(join(__dirname, '../../public/data/officium1962/li-leisi.json'), 'utf8')) as LiLeisiData

function block(date: string, hour: string, order: number) {
  const found = loadHourBlocks(date, hour).find(b => b.order === order)
  if (!found)
    throw new Error(`no block ${date} ${hour} #${order}`)
  return found
}

const lookup = (date: string, hour: string, order: number, context?: { date: string, hour: string }) =>
  lookupLiLeisi(data, block(date, hour, order), context)

describe('利类思译本（司铎课典）', () => {
  it('数据版本正确，键是整块键、值是译文列表', () => {
    expect(data.schemaVersion).toBe(LI_LEISI_SCHEMA)
    for (const [key, list] of Object.entries(data.blocks)) {
      expect(/^(b:|iv:|iv-psalm)/.test(key)).toBe(true)
      expect(list.length).toBeGreaterThan(0)
    }
  })

  it('圣诞赞美经第一对经取到「牧童奚見」（完整版，不是晨经里只载首句的那条），重复对经不取', () => {
    expect(lookup('2026-12-25', 'laudes', 2)?.[0].p[0].t).toContain('牧童奚見')
    expect(lookup('2026-12-25', 'laudes', 2)?.[0].p[0].e).toBeUndefined()
    expect(lookup('2026-12-25', 'laudes', 4)).toBeUndefined()
  })

  it('同一篇圣咏 109 不分日期，译文相同；译文不带缩略荣福经，页面按拉丁块补全文', () => {
    const asFirst = lookup('2026-12-24', 'vesperae', 3, { date: '2026-12-24', hour: 'vesperae' })
    expect(asFirst).toHaveLength(1)
    expect(asFirst?.[0].p[0].t.startsWith('主語吾主曰')).toBe(true)
    expect(asFirst?.[0].p[0].t).not.toContain('及無窮世亞孟')
    expect(liDoxology(block('2026-12-24', 'vesperae', 3))).toContain('若今茲')
    expect(liDoxology(block('2026-11-02', 'laudes', 3))).toContain('永安')
  })

  it('请经：圣咏 94 每天相同，不随对经变；圣诞专用的对经不出现在别的日子', () => {
    const plain = lookup('2026-11-22', 'matutinum', 2)
    expect(plain?.[0].p.some(p => p.k === 'psalm' && p.t.includes('請向主舞蹈歌呼'))).toBe(true)
    expect(plain?.[0].p.some(p => p.k === 'invit')).toBe(false)
    expect(plain?.[0].p.map(p => p.t).join('')).not.toContain('基利斯督為吾降誕')
    const jan1 = lookup('2026-01-01', 'matutinum', 2, { date: '2026-01-01', hour: 'matutinum' })
    expect(jan1?.[0].p.some(p => p.k === 'invit' && p.t.includes('基利斯督為吾降誕'))).toBe(true)
    expect(jan1?.[0].p.filter(p => p.k === 'psalm').every(p => !p.t.includes('('))).toBe(true)
  })

  it('夜课第三节圣咏 88 带有「只用 88:2–37」的说明', () => {
    expect(lookup('2026-12-25', 'matutinum', 48)?.[0].p[0].n).toContain('88:2')
  })

  it('夜课经解与答唱共用一个块；福音书只引首句、全书无全文的不显示半成品', () => {
    expect(lookup('2026-12-25', 'matutinum', 60)?.[0].p.map(part => part.k)).toEqual(['homily', 'mresp'])
    expect(lookup('2026-12-25', 'matutinum', 59)).toBeUndefined()
  })

  it('译文里不留「云云」，按书中他处补全的段落带 c 标记', () => {
    // 圣诞晨经节目「永王永活云云」按晨经全文（1 Tim 1:17）补全
    const cap = lookup('2026-12-25', 'prima', 8) ?? lookup('2026-12-25', 'prima', 9)
    expect(cap?.[0].p[0].t).not.toContain('云云')
    expect(cap?.[0].p[0].c).toBe(1)
  })

  it('译本没有的块不显示，也不用别的文字补', () => {
    // 晚经开场降福（Jube Domine）块译本有文字但不是该块的译文，不配
    expect(lookup('2026-12-25', 'completorium', 1)).toBeUndefined()
    expect(lookupLiLeisi(undefined, block('2026-12-25', 'laudes', 2))).toBeUndefined()
  })
})
