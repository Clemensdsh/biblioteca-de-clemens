import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lookupFixedLine, lookupPsalmLine, splitZhSegments, type PsalmsZhData } from './psalmsZh'
import { psalmLineKey } from './psalmKey.mjs'

const data: PsalmsZhData = JSON.parse(readFileSync('public/data/officium1962/psalms-zh.json', 'utf8'))
const corpus = readFileSync('resources/officium1962-latin/corpus.jsonl', 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(line => JSON.parse(line) as { type: string, latin: string })
  .filter(entry => entry.type === 'psalm')

describe('Officium 1962 psalm Chinese (思高-based)', () => {
  it('uses the expected schema and lists only reviewed psalms', () => {
    expect(data.schemaVersion).toBe('officium1962.psalms-zh.v1')
    expect(Object.values(data.psalms).every(psalm => psalm.reviewed)).toBe(true)
  })

  it('has Chinese for every displayed Latin line of each published psalm', () => {
    const missing: string[] = []
    for (const entry of corpus) {
      const lines = entry.latin.split('\n')
      const psalm = Number(/^Psalmus (\d+)/.exec(lines[0])![1])
      if (!data.psalms[String(psalm)])
        continue
      for (const line of lines.slice(1)) {
        if (!/^\d+:\d+\s/.test(line))
          continue
        if (!lookupPsalmLine(data, line))
          missing.push(line.slice(0, 50))
      }
    }
    expect(missing).toEqual([])
  })

  it('keeps bold markers paired and note numbers valid', () => {
    for (const [number, psalm] of Object.entries(data.psalms)) {
      for (const [key, line] of Object.entries(psalm.lines)) {
        expect((line.z.match(/\*\*/g) || []).length % 2, `${number} ${key}`).toBe(0)
        for (const n of line.n || [])
          expect(psalm.notes[n - 1], `${number} ${key} note ${n}`).toBeTruthy()
      }
    }
  })

  it('computes the same key from Latin lines with or without liturgical marks', () => {
    expect(psalmLineKey('5:3 Inténde voci oratiónis meæ, * Rex meus et Deus meus.'))
      .toBe(psalmLineKey('5:3  Inténde voci oratiónis meæ, ‡ Rex meus et Deus meus.'))
    expect(psalmLineKey('Gloria Patri')).toBeNull()
  })

  it('translates the repeated doxology lines', () => {
    expect(lookupFixedLine(data, '℣. Glória Patri, et Fílio, * et Spirítui Sancto.')).toContain('光荣归于父')
    expect(lookupFixedLine(data, '℟. Sicut erat in princípio, et nunc, et semper, * et in sǽcula sæculórum. Amen.')).toContain('阿们')
  })

  it('splits bold segments for rendering without HTML', () => {
    expect(splitZhSegments('把**我们**掩护')).toEqual([
      { text: '把', changed: false },
      { text: '我们', changed: true },
      { text: '掩护', changed: false },
    ])
  })
})
