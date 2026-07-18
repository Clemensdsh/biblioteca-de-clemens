import { describe, expect, it } from 'vitest'
import { defaultDaytimeHourIndex } from './daytimeHour'

describe('Saturday Mary daytime prayer hour default', () => {
  it.each([
    [9, 0, 0],
    [10, 59, 0],
    [11, 0, 1],
    [12, 59, 1],
    [13, 0, 2],
    [15, 0, 2],
  ])('maps %s:%s to hour index %s', (hour, minute, expected) => {
    expect(defaultDaytimeHourIndex(new Date(2026, 6, 18, hour, minute))).toBe(expected)
  })
})
