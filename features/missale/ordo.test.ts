import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import benedictionesJson from './benedictiones.json'
import { dayFlags } from './dayContext'
import type { OrdoData, OrdoItem, OrdoText } from './ordo'
import json from './ordoMissae.json'
import praefationesJson from './praefationes.json'
import { seasonDay } from './calendar'

const ordo = json as unknown as OrdoData

/** every item, descending into the choices and into both branches of the conditional blocks */
function flatten(items: OrdoItem[]): OrdoItem[] {
  return items.flatMap((item) => {
    if (item.type === 'choice')
      return [item, ...item.options.flatMap(option => flatten(option.items))]
    if (item.type === 'cond')
      return [item, ...flatten(item.items), ...flatten(item.else ?? [])]
    return [item]
  })
}
const everything = (book: OrdoData) => book.sections.flatMap(section => section.parts.flatMap(part => flatten(part.items)))
const all = everything(ordo)

describe('Ordo Missae (Latin 2002 / 《感恩祭典》)', () => {
  it('is generated from the current source file', () => {
    expect(() => execFileSync(process.execPath, ['scripts/missale/build-missale.mjs', '--check'], { stdio: 'pipe' })).not.toThrow()
  })

  it('has the six parts of the Mass and the four Eucharistic Prayers', () => {
    expect(ordo.sections.map(section => section.id)).toEqual([
      'ritus-initiales',
      'liturgia-verbi',
      'liturgia-eucharistica',
      'prex-eucharistica',
      'ritus-communionis',
      'ritus-conclusionis',
    ])
    const prex = all.find(item => item.type === 'choice' && item.id === 'prex')
    expect(prex?.type === 'choice' && prex.options.map(option => option.id)).toEqual(['prex-1', 'prex-2', 'prex-3', 'prex-4'])
  })

  it('pairs every spoken text with Latin and Chinese', () => {
    const texts = all.filter(item => item.type === 'text')
    expect(texts.length).toBeGreaterThan(200)
    expect(texts.filter(item => !item.la.length || !item.zh)).toEqual([])
  })

  it('leaves the daily texts as empty slots', () => {
    const slots = all.filter(item => item.type === 'slot').map(item => item.id)
    expect(slots).toEqual(expect.arrayContaining(['introitus', 'collecta', 'lectio-1', 'psalmus', 'evangelium', 'super-oblata', 'praefatio', 'communio', 'post-communionem']))
  })

  it('gives each Eucharistic Prayer its words of institution, acclamations and doxology', () => {
    const prex = all.find(item => item.type === 'choice' && item.id === 'prex')
    if (prex?.type !== 'choice')
      throw new Error('no prex')
    for (const option of prex.options) {
      const latin = flatten(option.items).filter(item => item.type === 'text').flatMap(item => item.la).join(' ')
      expect(latin, option.id).toContain('hoc est enim Corpus meum')
      expect(latin, option.id).toContain('Mystérium fídei')
      expect(latin, option.id).toContain('Per ipsum, et cum ipso, et in ipso')
    }
  })

  it('sets the words of Christ at the consecration in heavy type, in all four prayers', () => {
    const strong = all.filter((item): item is OrdoText => item.type === 'text' && Boolean(item.strong))
    // body and chalice in each of the four prayers
    expect(strong).toHaveLength(8)
    expect(strong.filter(item => item.la[0].startsWith('Accípite et manducáte')).map(item => item.zh)).toEqual(Array(4).fill('你们大家拿去吃：\n这就是我的身体，\n将为你们而牺牲。'))
    expect(strong.filter(item => item.la[0].startsWith('Accípite et bíbite'))).toHaveLength(4)
  })

  it('marks the priest\'s silent prayers and the people\'s optional acclamations', () => {
    const texts = all.filter((item): item is OrdoText => item.type === 'text')
    expect(texts.filter(item => item.secret).length).toBeGreaterThanOrEqual(12)
    expect(texts.find(item => item.secret && item.la[0].startsWith('Munda cor meum'))).toBeTruthy()
    expect(texts.filter(item => item.optional && item.who === 'populus').map(item => item.la[0])).toEqual(['Benedíctus Deus in sǽcula.', 'Benedíctus Deus in sǽcula.'])
  })

  it('lets the priest read the Gospel when there is no deacon', () => {
    const texts = all.filter((item): item is OrdoText => item.type === 'text')
    expect(texts.find(item => item.la[0] === 'Léctio sancti Evangélii secúndum Matthǽum.')?.who).toBe('minister')
    expect(texts.find(item => item.la[0] === 'Verbum Dómini.' && item.zh.startsWith('以上是基督'))?.who).toBe('minister')
    // the deacon's own words stay the deacon's
    expect(texts.find(item => item.la[0].startsWith('Iube, domne'))?.who).toBe('diaconus')
    const evangelist = all.find(item => item.type === 'choice' && item.id === 'evangelista')
    expect(evangelist?.type === 'choice' && evangelist.options.map(option => option.zh)).toEqual(['通用', '玛窦', '马尔谷', '路加', '若望'])
  })

  it('names the Kyrie “垂怜经” and leaves it out after the third penitential act', () => {
    const kyrie = ordo.sections[0].parts.find(part => part.id === 'kyrie')
    expect(kyrie?.zh).toBe('垂怜经')
    const cond = kyrie?.items.find(item => item.type === 'cond')
    expect(cond?.type === 'cond' && cond.when).toBe('!paenitentia3')
    expect(JSON.stringify(kyrie)).not.toContain('若用“忏悔词”第三式，则省略之')
  })
})

describe('line-by-line alignment of Latin and Chinese', () => {
  for (const [name, book] of [['ordo', ordo], ['praefationes', praefationesJson], ['benedictiones', benedictionesJson]] as const) {
    it(`${name}: a text of several Latin lines has as many Chinese lines`, () => {
      const texts = everything(book as unknown as OrdoData).filter((item): item is OrdoText => item.type === 'text' && item.la.length > 1 && Boolean(item.zh.replace(/\n/g, '')))
      expect(texts.length).toBeGreaterThan(20)
      const off = texts.filter(item => item.zh.split('\n').length !== item.la.length).map(item => item.la[0])
      expect(off).toEqual([])
    })
  }

  it('keeps every Chinese line of the first line of a text non-empty', () => {
    const texts = everything(ordo).filter((item): item is OrdoText => item.type === 'text' && item.la.length > 1)
    expect(texts.filter(item => !item.zh.split('\n')[0])).toEqual([])
  })
})

describe('conditional blocks', () => {
  const known = new Set(Object.keys(dayFlags(seasonDay('2026-03-01'), { title_la: 'Dominica II Quadragesimæ', rank: 'sunday' }, { deacon: false })))

  it('use only flags the page computes', () => {
    const used = everything(ordo)
      .filter(item => item.type === 'cond')
      .flatMap(item => item.when.split(/[|&]/).map(atom => atom.replace(/^!/, '').trim()))
    expect([...new Set(used)].filter(flag => !known.has(flag))).toEqual([])
  })

  it('give the Roman Canon its proper Communicantes and Hanc igitur by day', () => {
    const conds = everything(ordo).filter(item => item.type === 'cond').map(item => item.when)
    for (const when of ['nativitas', 'epiphania', 'pascha', 'ascensio', 'pentecostes', '!propria', '!pascha', 'defuncti'])
      expect(conds, when).toContain(when)
  })
})
