// First Vespers: when the Evening Prayer of a day (and the Night Prayer after it) belongs to the
// next day's Sunday, solemnity or feast of the Lord. The Breviar data already holds the right
// text for those two hours, but a day has only one title, so the page would still show the
// day's own celebration over the next day's prayers. This decides, by the table of liturgical
// days (Universal Norms on the Liturgical Year and the General Calendar, 59–61; General
// Instruction 61), whether the page should name the next day's celebration instead.
//
// Plain TypeScript with erasable syntax only (Node can run the tests directly).

/** The celebration kept the next day (its default), as far as the title line needs it. */
export interface Eve {
  date: string
  rank: string
  title_la: string
  /** ids of the collect blocks of its Vespers and Lauds, which the First Vespers share */
  collects: string[]
}

// Table of liturgical days, as numbered there (a lower number precedes):
//   2 Nativity, Epiphany, Ascension, Pentecost, Easter; Sundays of Advent, Lent and Easter
//   3 other solemnities of the General Calendar; the Commemoration of All the Faithful Departed
//   5 feasts of the Lord in the General Calendar
//   6 Sundays of Christmas and Ordinary Time
//   7 other feasts
const HIGHEST_SOLEMNITY = /IN NATIVITATE DOMINI|IN EPIPHANIA|IN ASCENSIONE|PENTECOSTES|DOMINICA PASCHÆ/
const SEASON_SUNDAY = /Adventus|Quadragesimæ|Paschæ|IN PALMIS/i
const LORD_FEAST = /IN BAPTISMATE DOMINI|IN PRÆSENTATIONE DOMINI|IN TRANSFIGURATIONE DOMINI|IN EXALTATIONE SANCTÆ CRUCIS|IN DEDICATIONE BASILICÆ LATERANENSIS|SANCTÆ FAMILIÆ/i
const NO_LEVEL = 99

function level(rank: string, title: string): number {
  switch (rank) {
    case 'solemnity':
      return HIGHEST_SOLEMNITY.test(title) ? 2 : 3
    case 'commemoration_of_all_souls':
      return 3
    case 'sunday':
      if (/COMMEMORATIONE OMNIUM FIDELIUM/.test(title))
        return 3
      return SEASON_SUNDAY.test(title) ? 2 : 6
    case 'feast':
      return LORD_FEAST.test(title) ? 5 : 7
    default:
      return NO_LEVEL
  }
}

/** 0 = Sunday; the date is YYYY-MM-DD. */
function weekday(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

/**
 * Whether the Evening Prayer of a day with this celebration is the First Vespers of the next
 * day, and so is the Night Prayer after it. Only a Sunday, a solemnity, or a feast of the Lord
 * that falls on a Sunday has First Vespers, and only when it ranks higher than the day on which
 * the prayer is said (the Nativity, as the vigil, also before an Advent Sunday). Holy Saturday
 * has none: the Easter Vigil takes the evening.
 */
export function hasFirstVespersOfNextDay(rank: string, title: string, eve: Eve | null | undefined, collects: string[] = []): boolean {
  if (!eve || /SABBATO SANCTO/i.test(title))
    return false
  const next = level(eve.rank, eve.title_la)
  const eligible = eve.rank === 'solemnity' || eve.rank === 'sunday'
    || (eve.rank === 'feast' && next === 5 && weekday(eve.date) === 0)
  if (!eligible)
    return false
  const here = level(rank, title)
  // between two solemnities of the same rank (the Nativity on a Sunday of Advent, the Sacred
  // Heart after a transferred Nativity of John the Baptist) the later one takes the evening
  if (next < here || (next === here && eve.rank === 'solemnity'))
    return true
  // The engine does not follow the table everywhere (it gives the Sunday's First Vespers after
  // the Transfiguration on a Saturday, though a feast of the Lord ranks higher): where the
  // Vespers' collect is the one of the next day, the prayer is that day's.
  return collects.some(block => eve.collects.includes(block))
}

interface HourLike { code: string, versions: Array<{ parts: object[] }> }

/** The ids of the collect blocks (ORATIO) of the given hours of a celebration, in all versions. */
export function collectBlocks(cel: { hours: HourLike[] }, codes: string[]): string[] {
  return cel.hours
    .filter(hour => codes.includes(hour.code))
    .flatMap(hour => hour.versions.flatMap(version => version.parts.flatMap((part) => {
      const { title, block } = part as { title?: string | null, block?: string }
      return title === 'ORATIO' && block ? [block] : []
    })))
}
