import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadLiturgicalData } from './liturgicalCalendar'

describe('martyrology liturgical calendar loading', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('falls back to local computus when the remote calendar API stalls', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))

    const result = loadLiturgicalData(new Date(2026, 6, 16))
    await vi.advanceTimersByTimeAsync(7000)

    await expect(result).resolves.toMatchObject({
      source: 'computus',
      data: {
        season: 'Ordinary Time',
      },
    })
  })

  it('uses LitCal when the first remote API stalls', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('cpbjr.github.io')) {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          litcal: [
            {
              date: '2026-07-18T00:00:00+00:00',
              name: 'Sabbato Hebdomadae Decimae quintae Temporis Ordinarii',
              grade: 0,
              grade_lcl: 'feria',
              liturgical_season: 'ORDINARY_TIME',
            },
            {
              date: '2026-07-18T00:00:00+00:00',
              name: 'Dominica XVI Per Annum Missa in Vigilia',
              grade: 5,
              grade_lcl: 'FESTUM DOMINI',
              liturgical_season: 'ORDINARY_TIME',
              is_vigil_mass: true,
            },
          ],
        }),
      })
    }))

    const result = loadLiturgicalData(new Date(2026, 6, 18))
    await vi.advanceTimersByTimeAsync(1800)

    await expect(result).resolves.toMatchObject({
      source: 'litcal-api',
      data: {
        season: 'ORDINARY_TIME',
        celebration: {
          name: 'Sabbato Hebdomadae Decimae quintae Temporis Ordinarii',
          type: 'feria',
        },
      },
    })
  })
})
