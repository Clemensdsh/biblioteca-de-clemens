import { describe, expect, it } from 'vitest'
import { BreviariumGothicumLoader, cardsOf, type Day, scanUrl, type Section, TABS, type TabSlug, tabsOf } from './data'

function section(kind: Section['kind'], hour?: string, label = ''): Section {
  return { kind, hour, label, title: label, items: [] }
}

function day(cells: Array<[TabSlug, Section[]]>): Day {
  return { date: '2026-10-27', heading: '', meta: {}, basis: [], uncertain: [], flags: [], cells: cells.map(([slug, sections]) => ({ slug, sections })) }
}

describe('tabsOf', () => {
  it('keeps the fixed order of the liturgical day', () => {
    const nine = TABS.slice(0, 9).map(tab => [tab.slug, [section('hour')]] as [TabSlug, Section[]])
    const tabs = tabsOf(day([...nine].reverse()))
    expect([...tabs.keys()]).toEqual(TABS.slice(0, 9).map(tab => tab.slug))
  })

  it('shows the evening only when the day has it', () => {
    const evening = section('evening-vespers', 'vespers')
    const tabs = tabsOf(day([['matutinum', [section('hour', 'matins')]], ['vesperae', [evening]]]))
    expect(tabs.get('vesperae')).toEqual([evening])
    expect(tabsOf(day([['matutinum', []]])).has('vesperae')).toBe(false)
  })
})

describe('cardsOf', () => {
  it('includes the folded pieces of a Liber Horarum hour', () => {
    const minor: Section = { ...section('minor', 'prima'), items: [{ t: 'slot', label: 'A', b: '1-2' }, { t: 'alt', summary: '', items: [{ t: 'slot', label: 'B', b: '3-4' }] }] }
    expect(cardsOf(minor).map(card => card.b)).toEqual(['1-2', '3-4'])
  })
})

describe('BreviariumGothicumLoader', () => {
  const manifest = { format: 'bg-site/1', from: '2026-01-01', to: '2026-12-31', years: [2026], blockChunk: 200000, blockChunks: [0, 10, 11], version: 'v1' }
  const theDay = day([
    ['matutinum', [{ ...section('hour', 'matins'), items: [{ t: 'slot', label: 'Psalmus', b: '2012123-2013773', refs: [{ summary: '', targets: [{ label: 'Psalmus', b: 'x150-200' }] }] }] }]],
    ['prima', [{ ...section('minor', 'prima'), items: [{ t: 'alt', summary: '', items: [{ t: 'slot', label: 'R.', b: '2355221-2355522~0a1b2c3d' }] }] }]],
  ])
  const files: Record<string, unknown> = {
    'manifest.json': manifest,
    'years/2026.json': { '2026-10-27': theDay },
    'blocks/10.json': { '2012123-2013773': 'Miserére mei' },
    'blocks/11.json': { '2355221-2355522~0a1b2c3d': 'Adjútor' },
    'blocks/00.json': { 'x150-200': 'excerpt' },
  }
  const fetcher = (async (url: string) => {
    const path = String(url).replace('/data/breviarium-gothicum/', '').replace(/\?v=.*$/, '')
    const body = files[path]
    return new Response(body === undefined ? '<html>' : JSON.stringify(body), { status: body === undefined ? 404 : 200, headers: { 'content-type': body === undefined ? 'text/html' : 'application/json' } })
  }) as typeof fetch

  it('loads the day with the blocks of every card, nested target and folded piece', async () => {
    const result = await new BreviariumGothicumLoader(fetcher).day('2026-10-27')
    expect(result.blocks).toEqual({ '2012123-2013773': 'Miserére mei', 'x150-200': 'excerpt', '2355221-2355522~0a1b2c3d': 'Adjútor' })
  })

  it('reports a date outside the data', async () => {
    await expect(new BreviariumGothicumLoader(fetcher).day('2026-10-28')).rejects.toThrow('not in the data')
  })
})

describe('scanUrl', () => {
  it('pads the image number to three digits', () => {
    expect(scanUrl({ n: 51, f: '' })).toBe('/data/breviarium-gothicum/pages/p051.webp')
  })
})
