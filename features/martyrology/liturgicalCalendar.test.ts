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
    await vi.advanceTimersByTimeAsync(2800)

    await expect(result).resolves.toMatchObject({
      source: 'computus',
      data: {
        season: 'Ordinary Time',
      },
    })
  })

  it('uses a backup remote API when the first remote API stalls', async () => {
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
          season: 'ordinary',
          celebrations: [{ title: 'Thursday of the Fifteenth Week in Ordinary Time', rank: 'ferial' }],
        }),
      })
    }))

    await expect(loadLiturgicalData(new Date(2026, 6, 16))).resolves.toMatchObject({
      source: 'calapi',
      data: {
        season: 'ordinary',
        celebration: {
          name: 'Thursday of the Fifteenth Week in Ordinary Time',
          type: 'ferial',
        },
      },
    })
  })
})
