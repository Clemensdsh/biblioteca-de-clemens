import { describe, expect, it } from 'vitest'
import { collectOf, isFirstVespersOfNextDay, isSunday } from './eve'

const long = (word: string) => `Orémus. ${`${word} `.repeat(40)}Per Dóminum nostrum.`
const hour = (...prayers: string[]) => [
  { type: 'prayer', text: ['℣. Dómine, exáudi oratiónem meam. ℟. Et clamor meus ad te véniat.'] },
  ...prayers.map(text => ({ type: 'prayer', text: [text] })),
  { type: 'blessing', text: ['Benedicámus Dómino.'] },
]

describe('first Vespers of the next day (1962)', () => {
  const sunday = hour(long('Excita'))
  const feast = hour(long('Præsentatióne'))

  it('Saturday feast before a Sunday: the Vespers pray the Sunday collect', () => {
    expect(isFirstVespersOfNextDay(sunday, feast, sunday, '2026-11-22')).toBe(true)
  })

  it('a ferial Saturday has the Sunday collect in its own Lauds too, and is still First Vespers', () => {
    expect(isFirstVespersOfNextDay(sunday, sunday, sunday, '2026-11-22')).toBe(true)
  })

  it('a weekday before a weekday sharing the collect is not', () => {
    expect(isFirstVespersOfNextDay(sunday, sunday, sunday, '2026-11-18')).toBe(false)
  })

  it('the eve of a feast: its collect, not the day\'s own', () => {
    const joseph = hour(long('Joseph'))
    expect(isFirstVespersOfNextDay(joseph, feast, joseph, '2026-03-19')).toBe(true)
  })

  it('a day that keeps its own Vespers', () => {
    expect(isFirstVespersOfNextDay(feast, feast, sunday, '2026-11-22')).toBe(false)
  })

  it('finds the collect and tells Sundays', () => {
    expect(collectOf(feast)).toBe(collectOf(hour(long('Præsentatióne'))))
    expect(collectOf([])).toBeUndefined()
    expect(isSunday('2026-11-22')).toBe(true)
    expect(isSunday('2026-11-21')).toBe(false)
  })
})
