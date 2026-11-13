// Chinese for the day's title as the engine prints it (Latin), for the title line of the page.
//
// Saints and feasts: celebrationNamesZh.json, the names of GCatholic's Chinese General Calendar
// (gcatholic.org/calendar/<year>/General-D-zt, 2024–2029) matched by date and rank, in simplified
// characters. Weekdays and Sundays of the seasons: by rule, named as GCatholic names them.

import NAMES from './celebrationNamesZh.json'

/** Chinese name of a saint's or a feast's day, by the Latin title without its rank. */
export function celebrationNameZh(main: string): string | null {
  return (NAMES as Record<string, string>)[main] ?? null
}
//
// Plain TypeScript with erasable syntax only (Node can run the tests' corpus check directly).

const DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
export function zhNumber(n: number): string {
  if (n < 10)
    return DIGITS[n]
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return `${tens === 1 ? '' : DIGITS[tens]}十${DIGITS[ones]}`
}

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 }
function fromRoman(s: string): number {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]]
    const next = ROMAN[s[i + 1]] ?? 0
    total += v < next ? -v : v
  }
  return total
}

const ORDINAL: Record<string, number> = { prima: 1, secunda: 2, tertia: 3, quarta: 4, quinta: 5, sexta: 6, septima: 7 }
const WEEKDAY: Record<string, string> = { secunda: '星期一', tertia: '星期二', quarta: '星期三', quinta: '星期四', sexta: '星期五' }
const FERIA_ROMAN: Record<string, string> = { II: '星期一', III: '星期二', IV: '星期三', V: '星期四', VI: '星期五' }
const SEASON: Record<string, string> = {
  'per annum': '常年期',
  'adventus': '将临期',
  'quadragesimæ': '四旬期',
  'paschale': '复活期',
  'paschæ': '复活期',
  'nativitatis': '圣诞期',
}

/** The rank word at the end of a Latin title, in Chinese. */
export const RANK_ZH: Record<string, string> = {
  'sollemnitas': '节日',
  'festum': '庆日',
  // memoria = obligatory memorial, memoria ad libitum = optional memorial
  'memoria': '必行纪念',
  'memoria ad libitum': '自由纪念',
  'pro commemoratione': '追念',
}

export function psalterWeekZh(latin: string): string | null {
  const m = /^Hebdomada (\d) Psalterii$/.exec(latin)
  return m ? `圣咏集第${zhNumber(Number(m[1]))}周` : null
}

/**
 * Chinese for a title without its trailing rank / psalter week (the page splits those off).
 * Names follow GCatholic's Chinese General Calendar (gcatholic.org/calendar/…/General-D-zt), which
 * names some days by date: Advent 17–24 December, the days of the Christmas octave, and the
 * Christmas weekdays before and after the Epiphany. date (YYYY-MM-DD) is needed for those.
 * Returns null where no rule applies (saints, feasts of the Lord and of Our Lady).
 */
export function titleZh(main: string, date?: string): string | null {
  const t = main.trim()
  const lower = t.toLowerCase()
  let m: RegExpExecArray | null

  // fixed days
  const FIXED: Array<[RegExp, string]> = [
    [/^dominica paschæ in resurrectione domini$/, '耶稣复活主日'],
    [/^dominica pentecostes$/, '五旬节主日'],
    [/^dominica in palmis de passione domini$/, '基督苦难主日'],
    [/^dominica in octava paschæ/, '复活期第二主日'],
    [/^feria iv cinerum$/, '圣灰礼仪星期三'],
    [/^feria vi in passione domini$/, '圣周五：救主受难纪念'],
    [/^sabbato sancto$/, '圣周六'],
  ]
  for (const [re, zh] of FIXED) {
    if (re.test(lower))
      return zh
  }
  // All Souls falling on a Sunday: the commemoration replaces the Sunday
  if (/in commemoratione omnium fidelium defunctorum/.test(lower))
    return '追思已亡诸信者'

  const month = date ? Number(date.slice(5, 7)) : 0
  const dayOfMonth = date ? Number(date.slice(8, 10)) : 0

  // Sundays
  if ((m = /^dominica ([ivxl]+) per annum$/i.exec(t)))
    return `常年期第${zhNumber(fromRoman(m[1].toUpperCase()))}主日`
  if ((m = /^dominica (\w+) (adventus|quadragesimæ|paschæ)$/i.exec(t)) && ORDINAL[m[1].toLowerCase()])
    return `${SEASON[m[2].toLowerCase()]}第${zhNumber(ORDINAL[m[1].toLowerCase()])}主日`
  if ((m = /^dominica ([ivxl]+) post nativitatem$/i.exec(t)))
    return `圣诞后第${zhNumber(fromRoman(m[1].toUpperCase()))}主日`

  // Octaves and Holy Week (Latin in capitals or not)
  if ((m = /^(feria (\w+)|sabbatum) infra octavam (paschæ|nativitatis)$/i.exec(t))) {
    const weekday = m[2] ? WEEKDAY[m[2].toLowerCase()] : '星期六'
    if (m[3].toLowerCase() !== 'paschæ' && month === 12 && dayOfMonth >= 26)
      return `圣诞庆期第${zhNumber(dayOfMonth - 24)}日`
    return weekday ? `${m[3].toLowerCase() === 'paschæ' ? '复活' : '圣诞'}八日庆期${weekday}` : null
  }
  if ((m = /^feria (\w+)(?: in hebdomada sancta|, hebdomada sancta, hebdomada \d+)$/i.exec(t)) && WEEKDAY[m[1].toLowerCase()])
    return m[1].toLowerCase() === 'quinta' ? '圣周四：主的晚餐' : `圣周${WEEKDAY[m[1].toLowerCase()].slice(2)}`

  // after Ash Wednesday
  if ((m = /^(feria (\w+)|sabbatum) post cineres, tempus quadragesimæ$/i.exec(t))) {
    const day = m[2] ? WEEKDAY[m[2].toLowerCase()] : '星期六'
    return day ? `圣灰礼仪后${day}` : null
  }

  // ordinary weekdays of a season: "Feria quarta, Tempus per annum, Hebdomada 32"
  if ((m = /^(feria (\w+)|sabbatum), tempus (per annum|adventus|quadragesimæ|paschale|nativitatis), hebdomada (\d+)$/i.exec(t))) {
    const day = m[2] ? WEEKDAY[m[2].toLowerCase()] ?? FERIA_ROMAN[m[2].toUpperCase()] : '星期六'
    const season = SEASON[m[3].toLowerCase()]
    if (!day || !season)
      return null
    if (season === '将临期' && month === 12 && dayOfMonth >= 17)
      return `将临期十二月${zhNumber(dayOfMonth)}日`
    if (season === '圣诞期' && month === 1)
      return dayOfMonth < 6 ? `圣诞期平日${day}` : `主显节后${day}`
    return `${season}第${zhNumber(Number(m[4]))}周${day}`
  }
  return null
}
