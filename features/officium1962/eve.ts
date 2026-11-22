// First Vespers: when the Vespers of a day, and the Compline after them, are the next day's.
//
// Divinum Officium resolves the concurrence of the two days itself and prints the winner's
// Vespers under the day's own title, so the page would name the wrong office. The collect is the
// mark: the Vespers of D are First Vespers of D+1 when their collect is the one of D+1's Lauds
// (and not D's own, unless D+1 is a Sunday: on a ferial Saturday the Sunday collect is also
// the Saturday's). Checked over the whole of 2026 against the calendar: every Saturday before a
// Sunday, every eve of a feast of the first class, and nothing else.
//
// Plain TypeScript with erasable syntax only (Node can run the tests directly).

interface BlockLike {
  type: string
  text?: string[]
}

/** Letters only, without accents and case: the same prayer from two places compares equal. */
function letters(text: string[] | undefined): string {
  return (text ?? []).join(' ').normalize('NFD').replace(/[^A-Za-z]/g, '').toLowerCase()
}

/** The collect of an hour: its first prayer that is more than a versicle and a short formula. */
export function collectOf(blocks: BlockLike[]): string | undefined {
  const prayers = blocks.filter(block => block.type === 'prayer').map(block => letters(block.text))
  return prayers.find(prayer => prayer.length > 120) ?? prayers[0]
}

/** 0 = Sunday; the date is YYYY-MM-DD. */
export function isSunday(date: string): boolean {
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 0
}

export function isFirstVespersOfNextDay(
  vespers: BlockLike[],
  ownLauds: BlockLike[],
  nextLauds: BlockLike[],
  nextDate: string,
): boolean {
  const collect = collectOf(vespers)
  if (!collect || collect !== collectOf(nextLauds))
    return false
  return isSunday(nextDate) || collect !== collectOf(ownLauds)
}
