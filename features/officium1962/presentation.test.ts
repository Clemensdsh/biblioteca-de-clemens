import { describe, expect, it } from 'vitest'
import { cleanLine, plainTitle, prepareBlock } from './presentation'
import type { LiturgicalBlock } from './schema'

function block(partial: Partial<LiturgicalBlock>): LiturgicalBlock {
  return { id: 'b', type: 'prayer', text: [], verses: [], rubricLines: [], metadata: {}, sourceRefs: [], warnings: [], ...partial } as unknown as LiturgicalBlock
}

describe('officium1962 presentation', () => {
  it('moves {source} out of the title and drops the duplicated first line', () => {
    const prepared = prepareBlock(block({
      type: 'invitatory',
      title: 'Invitatorium{Antiphona ex Proprio Sanctorum}',
      text: ['Invitatorium {Antiphona ex Proprio Sanctorum}', 'Ant. Laudémus Deum nostrum * In confessióne beátæ Elísabeth..'],
    }))
    expect(prepared.title).toBe('Invitatorium')
    expect(prepared.tag?.kind).toBe('source')
    expect(prepared.items).toHaveLength(1)
    const line = prepared.items[0]
    expect(line.kind === 'line' && line.segments.map(s => s.text).join('')).toBe('Ant. Laudémus Deum nostrum * In confessióne beátæ Elísabeth.')
  })

  it('keeps grouped source headers as a scope note', () => {
    const prepared = prepareBlock(block({ type: 'capitulum', title: 'Capitulum', text: ['Capitulum Hymnus Versus {ex Commune aut Festo}', 'Prov. 31:10-11', 'Mulíerem fortem'] }))
    expect(prepared.tagScope).toBe('Capitulum · Hymnus · Versus')
    expect(prepared.items.map(i => i.kind === 'line' && i.citation)).toEqual([true, false])
  })

  it('turns _ into gaps and drops trailing ones', () => {
    const prepared = prepareBlock(block({ type: 'hymn', text: ['a', '_', 'b', '_'] }))
    expect(prepared.items.map(i => i.kind)).toEqual(['line', 'gap', 'line'])
  })

  it('only marks bracketed rubric words as rubric, not the spoken text', () => {
    const prepared = prepareBlock(block({ text: ['Quóniam ipsíus est mare (genuflectitur) veníte, adorémus'] }))
    const line = prepared.items[0]
    expect(line.kind === 'line' && line.segments.filter(s => s.kind === 'rubric').map(s => s.text)).toEqual(['(genuflectitur)'])
    const blessing = prepareBlock(block({ text: ['Benedictio. Ille nos benedícat, qui sine fine vivit et regnat.'] })).items[0]
    expect(blessing.kind === 'line' && blessing.segments.filter(s => s.kind === 'rubric').map(s => s.text)).toEqual(['Benedictio'])
  })

  it('splits verse numbers and strips % marks', () => {
    const item = prepareBlock(block({ type: 'psalm', text: ['68:2 Salvum me fac, Deus'] })).items[0]
    expect(item.kind === 'line' && item.ref).toBe('68:2')
    expect(cleanLine('Reliqua omittuntur, nisi %Laudes% separandæ sint.')).toBe('Reliqua omittuntur, nisi Laudes separandæ sint.')
  })

  it('does not repeat rubric lines already present in the text', () => {
    const prepared = prepareBlock(block({ text: ['Pater Noster dicitur secreto usque ad Et ne nos indúcas in tentatiónem:'], rubricLines: ['Pater Noster dicitur secreto usque ad Et ne nos indúcas in tentatiónem:'] }))
    expect(prepared.rubricLines).toEqual([])
    expect(plainTitle('Lectio brevis{Per Annum}')).toBe('Lectio brevis')
  })
  it('treats 1 Pet 5:8-9 as a citation, not verse 1', () => {
    const prepared = prepareBlock(block({ type: 'reading', text: ['1 Pet 5:8-9', '1 Verba Amos'] }))
    expect(prepared.items.map(i => i.kind === 'line' && [i.citation, i.ref])).toEqual([[true, undefined], [false, '1']])
  })
})
