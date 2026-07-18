import { describe, expect, it } from 'vitest'
import { concludingPrayerSeasonIndex, normalizeConcludingPrayerSeason } from './concludingPrayerSeason'

describe('Saturday Mary concluding prayer season mapping', () => {
  it.each([
    ['Advent', 'advent', 0],
    ['Christmas', 'christmas', 1],
    ['Tempus Nativitatis', 'christmas', 1],
    ['Lent', 'lent', 2],
    ['Tempus Quadragesimae', 'lent', 2],
    ['Easter', 'easter', 3],
    ['Tempus Paschale', 'easter', 3],
    ['Ordinary Time', 'ordinary', 4],
    ['ORDINARY_TIME', 'ordinary', 4],
    ['Tempus per Annum', 'ordinary', 4],
  ] as const)('maps %s to %s', (input, key, index) => {
    const seasonKey = normalizeConcludingPrayerSeason(input)
    expect(seasonKey).toBe(key)
    expect(seasonKey && concludingPrayerSeasonIndex(seasonKey)).toBe(index)
  })
})
