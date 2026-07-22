import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { office1962HourNames } from '../schema'
import { Officium1962Loader } from './index'

function releaseFetch(requests: string[]) {
  return async (input: RequestInfo | URL) => {
    const path = String(input)
    requests.push(path)
    if (!path.startsWith('/data/officium1962/'))
      return new Response('not found', { status: 404 })
    try {
      const bytes = await readFile(resolve('public', path.slice(1)))
      return new Response(bytes, { headers: { 'Content-Type': 'application/json' } })
    }
    catch {
      return new Response('not found', { status: 404 })
    }
  }
}

describe('Officium 1962 published release integration', () => {
  it('reconstructs all eight hours for a special day from release files', async () => {
    const requests: string[] = []
    const loader = new Officium1962Loader({ fetch: releaseFetch(requests) })
    const results = []
    for (const hour of office1962HourNames)
      results.push(await loader.loadHour('2026-08-15', hour))

    expect(results.map(result => result.hour.name)).toEqual(office1962HourNames)
    expect(results.every(result => result.hour.blocks.length > 0)).toBe(true)
    expect(results[0].hour.metadata?.nocturnCount).toBe(3)
    expect(results[6].hour.metadata?.concurrenceResolvedByUpstream).toBe(true)
    expect(results.flatMap(result => result.hour.blocks).every(block => block.sourceRefs.length > 0)).toBe(true)
    expect(new Set(requests).size).toBe(requests.length)
    expect(requests.some(path => /experimental|\/raw\//.test(path))).toBe(false)
    expect(requests.some(path => path.includes('2026-08-16'))).toBe(false)
  }, 30_000)
})
