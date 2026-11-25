import { describe, expect, it } from 'vitest'
import { seasonDay } from './calendar'
import { dayFlags, eucharisticWarnings, evalWhen, saintVars, titleMain } from './dayContext'
import { prefacesFor } from './praefatio'

const cel = (title_la: string, rank: string) => ({ title_la, rank })
const flagsOn = (date: string, title: string, rank: string, deacon = false) => dayFlags(seasonDay(date), cel(title, rank), { deacon })

describe('evalWhen', () => {
  it('reads and, or and not; an unknown flag is false', () => {
    const flags = { a: true, b: false }
    expect(evalWhen('a', flags)).toBe(true)
    expect(evalWhen('b', flags)).toBe(false)
    expect(evalWhen('!b', flags)).toBe(true)
    expect(evalWhen('a&!b', flags)).toBe(true)
    expect(evalWhen('a&b', flags)).toBe(false)
    expect(evalWhen('b|a', flags)).toBe(true)
    expect(evalWhen('nope', flags)).toBe(false)
    expect(evalWhen('!nope', flags)).toBe(true)
  })
})

describe('the day’s flags', () => {
  it('Christmas and its octave', () => {
    expect(flagsOn('2026-12-25', 'IN NATIVITATE DOMINI sollemnitas', 'solemnity')).toMatchObject({ nativitas: true, propria: true, pascha: false })
    expect(flagsOn('2026-12-31', 'Die 31 decembris', 'weekday').nativitas).toBe(true)
    expect(flagsOn('2027-01-01', 'SANCTÆ DEI GENITRICIS MARIÆ sollemnitas', 'solemnity').nativitas).toBe(true)
    expect(flagsOn('2027-01-02', 'Die 2 ianuarii', 'weekday').nativitas).toBe(false)
  })

  it('Epiphany, Ascension and Pentecost', () => {
    expect(flagsOn('2027-01-06', 'IN EPIPHANIA DOMINI sollemnitas', 'solemnity').epiphania).toBe(true)
    expect(flagsOn('2026-05-14', 'IN ASCENSIONE DOMINI sollemnitas', 'solemnity').ascensio).toBe(true)
    expect(flagsOn('2026-05-24', 'DOMINICA PENTECOSTES sollemnitas', 'solemnity').pentecostes).toBe(true)
  })

  it('from the Easter Vigil to the Second Sunday of Easter', () => {
    // Easter 2026 is 5 April
    expect(flagsOn('2026-04-04', 'Sabbato sancto', 'weekday').pascha).toBe(true)
    expect(flagsOn('2026-04-05', 'DOMINICA PASCHÆ', 'solemnity').pascha).toBe(true)
    expect(flagsOn('2026-04-12', 'Dominica II Paschæ', 'solemnity').pascha).toBe(true)
    expect(flagsOn('2026-04-13', 'Feria II', 'weekday').pascha).toBe(false)
    expect(flagsOn('2026-04-03', 'Feria VI in Passione Domini', 'weekday').pascha).toBe(false)
  })

  it('an ordinary weekday has no proper Communicantes', () => {
    expect(flagsOn('2026-11-25', 'Feria IV', 'weekday').propria).toBe(false)
  })

  it('All Souls, the deacon and the third penitential act', () => {
    expect(flagsOn('2026-11-02', 'IN COMMEMORATIONE OMNIUM FIDELIUM DEFUNCTORUM', 'commemoration_of_all_souls').defuncti).toBe(true)
    expect(flagsOn('2026-11-25', 'Feria IV', 'weekday', true).deacon).toBe(true)
    const day = seasonDay('2026-11-25')
    expect(dayFlags(day, cel('Feria IV', 'weekday'), { deacon: false, paenitentia: 'paenitentia-3' }).paenitentia3).toBe(true)
    expect(dayFlags(day, cel('Feria IV', 'weekday'), { deacon: false, paenitentia: 'paenitentia-1' }).paenitentia3).toBe(false)
  })
})

describe('the saint of the day for “N.”', () => {
  it('takes the Latin name in the genitive from the title', () => {
    expect(titleMain('S. Cæciliæ, virginis et martyris, memoria')).toBe('S. Cæciliæ, virginis et martyris')
    expect(saintVars(cel('S. Cæciliæ, virginis et martyris, memoria', 'memorial')).N?.la).toBe('Cæciliæ')
  })

  it('has no saint on a weekday', () => {
    expect(saintVars(cel('Feria IV', 'weekday'))).toEqual({})
    expect(saintVars(undefined)).toEqual({})
  })
})

describe('Eucharistic Prayers III and IV', () => {
  const warn = (date: string, title: string, rank: string) => {
    const day = seasonDay(date)
    const c = cel(title, rank)
    return eucharisticWarnings(day, c, prefacesFor(day, c))
  }

  it('warns against the fourth prayer where the Mass has its own preface', () => {
    expect(warn('2026-12-06', 'Dominica II Adventus', 'sunday')['prex-4']).toContain('不宜使用')
    expect(warn('2026-03-04', 'Feria IV', 'weekday')['prex-4']).toBeTruthy()
    expect(warn('2026-04-15', 'Feria IV', 'weekday')['prex-4']).toBeTruthy()
    expect(warn('2026-11-22', 'DOMINI NOSTRI IESU CHRISTI UNIVERSORUM REGIS sollemnitas', 'solemnity')['prex-4']).toBeTruthy()
  })

  it('does not warn about the fourth prayer on an ordinary Sunday or weekday', () => {
    expect(warn('2026-11-15', 'Dominica XXXIII per annum', 'sunday')['prex-4']).toBeUndefined()
    expect(warn('2026-11-25', 'Feria IV', 'weekday')['prex-4']).toBeUndefined()
  })

  it('warns that the third prayer suits Sundays and feasts, not weekdays', () => {
    expect(warn('2026-11-25', 'Feria IV', 'weekday')['prex-3']).toContain('主日')
    expect(warn('2026-11-22', 'DOMINI NOSTRI IESU CHRISTI UNIVERSORUM REGIS sollemnitas', 'solemnity')['prex-3']).toBeUndefined()
    expect(warn('2026-11-15', 'Dominica XXXIII per annum', 'sunday')['prex-3']).toBeUndefined()
  })
})
