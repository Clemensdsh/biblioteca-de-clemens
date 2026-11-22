import { describe, expect, it } from 'vitest'
import { collectBlocks, type Eve, hasFirstVespersOfNextDay } from './eve'

const eve = (date: string, rank: string, title_la: string, collects: string[] = []): Eve => ({ date, rank, title_la, collects })
const weekday = 'Sabbatum, Tempus per annum, Hebdomada 32 Hebdomada 4 Psalterii'

describe('first Vespers of the next day', () => {
  it('a Saturday memorial before the Sunday of Christ the King (2026-11-21)', () => {
    expect(hasFirstVespersOfNextDay('memorial', 'In Præsentatione Beatæ Mariæ Virginis memoria', eve('2026-11-22', 'solemnity', 'DOMINI NOSTRI IESU CHRISTI UNIVERSORUM REGIS sollemnitas'))).toBe(true)
  })

  it('a weekday before a Sunday of Ordinary Time, and before a solemnity', () => {
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2026-11-15', 'sunday', 'Dominica XXXIII per annum Hebdomada 1 Psalterii'))).toBe(true)
    expect(hasFirstVespersOfNextDay('weekday', 'Feria quarta, Tempus per annum, Hebdomada 12 Hebdomada 4 Psalterii', eve('2026-06-24', 'solemnity', 'IN NATIVITATE S. IOANNIS BAPTISTÆ sollemnitas'))).toBe(true)
  })

  it('not before a weekday, a memorial, or a feast on a weekday', () => {
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2026-11-17', 'weekday', 'Feria tertia'))).toBe(false)
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2026-11-17', 'memorial', 'S. Elisabeth memoria'))).toBe(false)
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2026-08-06', 'feast', 'In Transfiguratione Domini festum'))).toBe(false)
  })

  it('a feast of the Lord on a Sunday has them, a feast of a saint does not', () => {
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2024-01-07', 'feast', 'IN BAPTISMATE DOMINI festum'))).toBe(true)
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2026-08-09', 'feast', 'S. Laurentii, diaconi et martyris festum'))).toBe(false)
  })

  it('a day that ranks higher keeps its own Vespers', () => {
    // a solemnity before a Sunday of Ordinary Time, a feast of the Lord before one (Lateran, in any case)
    expect(hasFirstVespersOfNextDay('solemnity', 'SS. PETRI ET PAULI, APOSTOLORUM sollemnitas', eve('2024-06-30', 'sunday', 'Dominica XIII per annum Hebdomada 1 Psalterii'))).toBe(false)
    expect(hasFirstVespersOfNextDay('feast', 'In dedicatione basilicæ Lateranensis festum', eve('2024-11-10', 'sunday', 'Dominica XXXII per annum Hebdomada 4 Psalterii'))).toBe(false)
    // a Sunday of Lent before the solemnity of Saint Joseph moved to the Monday
    expect(hasFirstVespersOfNextDay('sunday', 'Dominica Quarta Quadragesimæ Hebdomada 4 Psalterii', eve('2023-03-20', 'solemnity', 'S. IOSEPH, SPONSI BEATÆ MARIÆ VIRGINIS sollemnitas'))).toBe(false)
    expect(hasFirstVespersOfNextDay('weekday', 'SABBATO SANCTO', eve('2026-04-05', 'solemnity', 'DOMINICA PASCHÆ IN RESURRECTIONE DOMINI sollemnitas'))).toBe(false)
  })

  it('a Sunday in Ordinary Time gives way to a solemnity of the next day, an equal solemnity does not', () => {
    expect(hasFirstVespersOfNextDay('sunday', 'Dominica XIII per annum Hebdomada 1 Psalterii', eve('2026-06-29', 'solemnity', 'SS. PETRI ET PAULI, APOSTOLORUM sollemnitas'))).toBe(true)
    expect(hasFirstVespersOfNextDay('sunday', 'Dominica Quarta Adventus Hebdomada 4 Psalterii', eve('2023-12-25', 'solemnity', 'IN NATIVITATE DOMINI sollemnitas'))).toBe(true)
    expect(hasFirstVespersOfNextDay('solemnity', 'IN NATIVITATE S. IOANNIS BAPTISTÆ sollemnitas', eve('2022-06-24', 'solemnity', 'SACRATISSIMI CORDIS IESU sollemnitas'))).toBe(true)
  })

  it('follows the engine where its collect is the next day\'s', () => {
    // the Saturday of the Transfiguration: the engine prays the Sunday's First Vespers
    expect(hasFirstVespersOfNextDay('feast', 'In Transfiguratione Domini festum', eve('2022-08-07', 'sunday', 'Dominica XIX per annum Hebdomada 3 Psalterii', ['c1', 'c2']), ['c1'])).toBe(true)
    expect(hasFirstVespersOfNextDay('feast', 'In Transfiguratione Domini festum', eve('2022-08-07', 'sunday', 'Dominica XIX per annum Hebdomada 3 Psalterii', ['c2']), ['c1'])).toBe(false)
    // a collect shared with a plain weekday does not make it a First Vespers
    expect(hasFirstVespersOfNextDay('weekday', weekday, eve('2026-11-17', 'weekday', 'Feria tertia', ['c1']), ['c1'])).toBe(false)
  })

  it('without the next day, nothing', () => {
    expect(hasFirstVespersOfNextDay('weekday', weekday, null)).toBe(false)
  })

  it('collects the ORATIO blocks of the chosen hours, in all versions', () => {
    const cel = {
      hours: [
        { code: 'mv', versions: [{ parts: [{ title: 'HYMNUS', block: 'h' }, { title: 'ORATIO', block: 'o1' }] }, { parts: [{ title: 'ORATIO', block: 'o2' }] }] },
        { code: 'mk', versions: [{ parts: [{ choice: 'x', default: 0, options: [] }, { title: 'ORATIO CONCLUSIVA', block: 'o3' }] }] },
      ],
    }
    expect(collectBlocks(cel, ['mv'])).toEqual(['o1', 'o2'])
  })
})
