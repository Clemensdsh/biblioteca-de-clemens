// Chinese for the day's title as the engine prints it (Latin), for the title line of the page.
//
// Weekdays and Sundays of the seasons follow fixed patterns and are translated by rule.
// Saints and feasts need a reviewed list of names (not yet here): for them only the rank is
// given in Chinese, and the caller keeps the Latin name.
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
  'memoria': '纪念',
  'memoria ad libitum': '任选纪念',
  'pro commemoratione': '追念',
}

export function psalterWeekZh(latin: string): string | null {
  const m = /^Hebdomada (\d) Psalterii$/.exec(latin)
  return m ? `圣咏集第${zhNumber(Number(m[1]))}周` : null
}

/**
 * Chinese for a title without its trailing rank / psalter week (the page splits those off).
 * Returns null where no rule applies (saints, feasts of the Lord and of Our Lady).
 */
export function titleZh(main: string): string | null {
  const t = main.trim()
  const lower = t.toLowerCase()
  let m: RegExpExecArray | null

  // fixed days
  const FIXED: Array<[RegExp, string]> = [
    [/^dominica paschæ in resurrectione domini$/, '主复活节'],
    [/^dominica pentecostes$/, '圣神降临节'],
    [/^dominica in palmis de passione domini$/, '圣枝主日（主受难主日）'],
    [/^dominica in octava paschæ/, '复活期第二主日（救主慈悲主日）'],
    [/^feria iv cinerum$/, '圣灰礼仪日'],
    [/^feria vi in passione domini$/, '主受难日'],
    [/^sabbato sancto$/, '圣周星期六'],
  ]
  for (const [re, zh] of FIXED) {
    if (re.test(lower))
      return zh
  }
  // All Souls falling on a Sunday: the commemoration replaces the Sunday
  if (/in commemoratione omnium fidelium defunctorum/.test(lower))
    return '追思已亡节'

  // Sundays
  if ((m = /^dominica ([ivxl]+) per annum$/i.exec(t)))
    return `常年期第${zhNumber(fromRoman(m[1].toUpperCase()))}主日`
  if ((m = /^dominica (\w+) (adventus|quadragesimæ|paschæ)$/i.exec(t)) && ORDINAL[m[1].toLowerCase()])
    return `${SEASON[m[2].toLowerCase()]}第${zhNumber(ORDINAL[m[1].toLowerCase()])}主日`
  if ((m = /^dominica ([ivxl]+) post nativitatem$/i.exec(t)))
    return `圣诞后第${zhNumber(fromRoman(m[1].toUpperCase()))}主日`

  // Octaves and Holy Week (Latin in capitals or not)
  if ((m = /^(feria (\w+)|sabbatum) infra octavam (paschæ|nativitatis)$/i.exec(t))) {
    const day = m[2] ? WEEKDAY[m[2].toLowerCase()] : '星期六'
    return day ? `${m[3].toLowerCase() === 'paschæ' ? '复活' : '圣诞'}八日庆期${day}` : null
  }
  if ((m = /^feria (\w+) in hebdomada sancta$/i.exec(t)) && WEEKDAY[m[1].toLowerCase()])
    return `圣周${WEEKDAY[m[1].toLowerCase()]}`
  if ((m = /^feria (\w+), hebdomada sancta, hebdomada \d+$/i.exec(t)) && WEEKDAY[m[1].toLowerCase()])
    return `圣周${WEEKDAY[m[1].toLowerCase()]}`

  // after Ash Wednesday
  if ((m = /^(feria (\w+)|sabbatum) post cineres, tempus quadragesimæ$/i.exec(t))) {
    const day = m[2] ? WEEKDAY[m[2].toLowerCase()] : '星期六'
    return day ? `圣灰礼仪后${day}` : null
  }

  // ordinary weekdays of a season: "Feria quarta, Tempus per annum, Hebdomada 32"
  if ((m = /^(feria (\w+)|sabbatum), tempus (per annum|adventus|quadragesimæ|paschale|nativitatis), hebdomada (\d+)$/i.exec(t))) {
    const day = m[2] ? WEEKDAY[m[2].toLowerCase()] ?? FERIA_ROMAN[m[2].toUpperCase()] : '星期六'
    const season = SEASON[m[3].toLowerCase()]
    return day && season ? `${season}第${zhNumber(Number(m[4]))}周${day}` : null
  }
  return null
}
