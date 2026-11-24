import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import type { OrdoData, OrdoItem } from './ordo'
import json from './ordoMissae.json'

const ordo = json as unknown as OrdoData

function flatten(items: OrdoItem[]): OrdoItem[] {
  return items.flatMap(item => item.type === 'choice' ? [item, ...item.options.flatMap(option => flatten(option.items))] : [item])
}
const all = ordo.sections.flatMap(section => section.parts.flatMap(part => flatten(part.items)))

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
})
