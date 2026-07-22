import { describe, expect, it } from 'vitest'
import { addCivilDays, buildOfficiumSearch, isValidCivilDate, localCivilDate, parseOfficiumQuery } from './pageState'

describe('Officium 1962 URL and civil-date state', () => {
  it('parses a valid date and hour', () => {
    expect(parseOfficiumQuery('?date=2026-07-22&hour=vesperae')).toEqual({ date: '2026-07-22', hour: 'vesperae' })
  })

  it('rejects invalid dates without substituting another date', () => {
    expect(parseOfficiumQuery('?date=2026-02-30&hour=laudes')).toEqual({ hour: 'laudes', error: 'invalid-date' })
  })

  it('rejects invalid hours', () => {
    expect(parseOfficiumQuery('?date=2026-07-22&hour=mass')).toEqual({ date: '2026-07-22', hour: 'matutinum', error: 'invalid-hour' })
  })

  it('defaults only the hour when it is omitted', () => {
    expect(parseOfficiumQuery('?date=2026-07-22')).toEqual({ date: '2026-07-22', hour: 'matutinum' })
  })

  it('formats local fields without using UTC conversion', () => {
    const fakeLocalDate = { getFullYear: () => 2026, getMonth: () => 6, getDate: () => 22 } as Date
    expect(localCivilDate(fakeLocalDate)).toBe('2026-07-22')
  })

  it('handles leap years and civil-day boundaries', () => {
    expect(isValidCivilDate('2028-02-29')).toBe(true)
    expect(isValidCivilDate('2026-02-29')).toBe(false)
    expect(addCivilDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addCivilDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('builds refresh-stable query state', () => {
    expect(buildOfficiumSearch('2026-07-22', 'completorium')).toBe('?date=2026-07-22&hour=completorium')
  })
})
