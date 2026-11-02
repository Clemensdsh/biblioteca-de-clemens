import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { addDays, blockIds, HOURS, isDate, LiturgiaHorarumLoader, type Manifest, postureMarks } from './data'

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

const manifest: Manifest = JSON.parse(readFileSync(`${ROOT}manifest.json`, 'utf8'))
const sample = [manifest.from, '2026-04-02', '2026-04-04', '2026-11-02', '2026-12-25', manifest.to]
  .filter(date => date >= manifest.from && date <= manifest.to)

describe('Liturgia Horarum data', () => {
  it.each(sample)('loads every text of %s', async (date) => {
    const day = await new LiturgiaHorarumLoader(localFetch).day(date)
    expect(day.celebrations[day.defaultCelebration]).toBeDefined()
    for (const cel of day.celebrations) {
      expect(cel.hours.map(hour => hour.code)).toEqual(HOURS.map(hour => hour.code))
      for (const id of blockIds(cel))
        expect(typeof day.blocks[id], id).toBe('string')
    }
  })

  it('reports a date outside the data', async () => {
    await expect(new LiturgiaHorarumLoader(localFetch).day(addDays(manifest.to, 1))).rejects.toThrow()
  })

  it('marks posture only where it changes', () => {
    const part = (title: string | null) => ({ title, block: 'x' })
    expect(postureMarks('mrch', [part(null), part('HYMNUS'), part('PSALMODIA'), part('LECTIO BREVIS'), part('RESPONSORIUM BREVE'), part('CANTICUM EVANGELICUM'), part('PRECES'), part('ORATIO')]))
      .toEqual(['Stantes · 立', undefined, 'Sedentes vel stantes · 坐或立', 'Sedentes · 坐', undefined, 'Stantes · 立', undefined, undefined])
    expect(postureMarks('mi', [part(null)])).toEqual(['Stantes · 立'])
  })

  it('validates and steps civil dates', () => {
    expect(isDate('2027-02-29')).toBe(false)
    expect(isDate('2028-02-29')).toBe(true)
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})
