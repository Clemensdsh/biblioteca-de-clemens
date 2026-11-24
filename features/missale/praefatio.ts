// Which prefaces a day's Mass may take (Missale Romanum 2002), from the rubric printed with each
// preface: the season's prefaces for the Masses of the season; a feast's or a saint's own; the
// common prefaces when neither applies. Ids are those of praefationes.json.
//
// Saints are sorted by the words of their title (martyr, bishop, virgin …) — a reading of the title,
// not of the Missal's assignments; the page says so. Some Masses have a proper preface printed with
// them in the Proper of Seasons or of Saints, not among the prefaces of the Ordo: those are named
// (`proper`) but their text is not in the page yet.

import type { Celebration, SeasonDay } from './calendar'

export interface ProperPreface { la: string, zh: string }

export interface PrefaceChoice {
  /** ids in praefationes.json, the usual one first */
  options: string[]
  /** a proper preface the Mass has, not among the prefaces of the Ordo */
  proper?: ProperPreface
  /** why, in Chinese */
  reason: string
}

const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}-${i + 1}`)
const NATIVITAS = range('nat', 3)
const PASCHA = range('pasch', 5)
const COMMUNES = range('comm', 6)
const DOMINICAE = range('dom', 8)
const SANCTI = ['sanct-1', 'sanct-2']

// Masses with a proper preface printed in the Proper (2002), by the start of their Latin title
const PROPER: Array<[RegExp, ProperPreface, string[]?]> = [
  [/^IN BAPTISMATE DOMINI/, { la: 'De Baptismate Domini', zh: '主受洗' }],
  [/^In Præsentatione Domini/, { la: 'De mysterio Præsentationis Domini', zh: '献耶稣于圣殿的奥迹' }],
  [/^DOMINICA IN PALMIS/, { la: 'De Passione Domini', zh: '主的苦难' }],
  [/^DOMINICA PENTECOSTES/, { la: 'De mysterio Pentecostes', zh: '五旬节的奥迹' }],
  [/^SANCTISSIMÆ TRINITATIS/, { la: 'De mysterio Sanctissimæ Trinitatis', zh: '天主圣三的奥迹' }],
  [/^SACRATISSIMI CORDIS IESU/, { la: 'De immensa caritate Christi', zh: '基督无限的爱' }],
  [/^DOMINI NOSTRI IESU CHRISTI UNIVERSORUM REGIS/, { la: 'De Christo universorum Rege', zh: '基督普世君王' }],
  [/^IN ANNUNTIATIONE DOMINI/, { la: 'De Incarnationis mysterio', zh: '圣言降生的奥迹' }],
  [/^IN NATIVITATE S\. IOANNIS BAPTISTÆ/, { la: 'De missione Præcursoris', zh: '前驱者的使命' }],
  [/^SS\. PETRI ET PAULI, APOSTOLORUM/, { la: 'De duplici missione Petri et Pauli in Ecclesia', zh: '伯多禄与保禄在教会内的双重使命' }],
  [/^In Transfiguratione Domini/, { la: 'De Transfiguratione', zh: '主显圣容' }],
  [/^IN ASSUMPTIONE BEATÆ MARIÆ VIRGINIS/, { la: 'De gloria Mariæ assumptæ', zh: '圣母蒙召升天的光荣' }],
  [/^In Exaltatione Sanctæ Crucis/, { la: 'De victoria Crucis gloriosæ', zh: '光荣十字架的胜利' }, ['pass-1']],
  [/^OMNIUM SANCTORUM/, { la: 'De gloria Matris nostræ Ierusalem', zh: '我们的母亲——耶路撒冷的光荣' }],
  [/^In dedicatione basilicæ/, { la: 'De mysterio templi Dei, quod est Ecclesia', zh: '天主的圣殿——教会的奥迹' }],
  [/^IN CONCEPTIONE IMMACULATA/, { la: 'De mysterio Mariæ et Ecclesiæ', zh: '玛利亚与教会的奥迹' }],
]

/** a saint's kind, by the words of the title */
function saintPrefaces(title: string): { ids: string[], kind: string } {
  if (/Mari(æ|ae)\b.*Virgin|B\. Mari|Mariæ in sabbato|Matris Ecclesiæ|Dominæ Nostræ/i.test(title))
    return { ids: ['bmv-1', 'bmv-2'], kind: '圣母' }
  if (/archangel|Angelorum/i.test(title))
    return { ids: ['angeli'], kind: '天使' }
  if (/\bIOSEPH\b|Ioseph, (sponsi|opificis)/i.test(title))
    return { ids: ['ioseph'], kind: '圣若瑟' }
  if (/apostol|evangelist/i.test(title))
    return { ids: ['ap-1', 'ap-2', ...SANCTI], kind: '宗徒或圣史' }
  if (/martyr/i.test(title))
    return { ids: ['mart-1', 'mart-2', ...SANCTI], kind: '殉道者' }
  if (/episcop|papæ|papae|presbyter|doctor|pastor|diacon/i.test(title))
    return { ids: ['past', ...SANCTI], kind: '牧者' }
  if (/virgin|abbat|religios|monach|eremit/i.test(title))
    return { ids: ['virg', ...SANCTI], kind: '贞女或会士' }
  return { ids: SANCTI, kind: '圣人' }
}

/** the prefaces of the season for a day with no proper one (a weekday, a Sunday, a memorial's other choice) */
function seasonPrefaces(day: SeasonDay): { ids: string[], reason: string } {
  switch (day.season) {
    case 'adventus':
      return day.lateAdvent
        ? { ids: ['adv-2'], reason: '将临期 12 月 17 至 24 日用将临期颂谢词（二）' }
        : { ids: ['adv-1'], reason: '将临期至 12 月 16 日用将临期颂谢词（一）' }
    case 'nativitas':
      return day.afterEpiphany
        ? { ids: ['epiph', ...NATIVITAS], reason: '主显节后至主受洗节前可用主显节或圣诞节颂谢词' }
        : { ids: NATIVITAS, reason: '圣诞期平日用圣诞节颂谢词' }
    case 'quadragesima':
      if (day.week === 5)
        return { ids: ['pass-1'], reason: '四旬期第五周平日用主受难颂谢词（一）' }
      if (day.weekday === 0)
        return { ids: ['quad-1', 'quad-2'], reason: '四旬期主日（无专用颂谢词时）用四旬期颂谢词（一）（二）' }
      return { ids: ['quad-3', 'quad-4', 'quad-1', 'quad-2'], reason: '四旬期平日用四旬期颂谢词，尤其（三）（四）' }
    case 'hebdomada-sancta':
      return { ids: ['pass-2'], reason: '圣周星期一至星期三用主受难颂谢词（二）' }
    case 'triduum':
      return { ids: [], reason: '' }
    case 'pascha':
      if (day.easterOctave)
        return { ids: ['pasch-1'], reason: '复活八日庆期内用复活期颂谢词（一），念“今天”' }
      if (day.afterAscension)
        return { ids: ['asc-1', 'asc-2', ...PASCHA], reason: '升天节后至五旬节前可用升天节或复活期颂谢词' }
      return { ids: PASCHA, reason: '复活期用复活期颂谢词' }
    case 'per-annum':
      return day.weekday === 0
        ? { ids: DOMINICAE, reason: '常年期主日用常年主日颂谢词' }
        : { ids: COMMUNES, reason: '常年期平日用通用颂谢词' }
  }
}

export function prefacesFor(day: SeasonDay, cel: Celebration): PrefaceChoice {
  const title = cel.title_la
  const md = day.date.slice(5)

  // the Triduum
  if (day.season === 'triduum') {
    if (day.weekday === 4)
      return { options: ['euch-1'], reason: '主的晚餐弥撒用圣体颂谢词（一）。同日上午的祝圣圣油弥撒有专用颂谢词（De sacerdotio Christi et de ministerio sacerdotum，司铎职务），暂未收录。' }
    if (day.weekday === 5)
      return { options: [], reason: '主受难日不举行弥撒。' }
    return { options: ['pasch-1'], reason: '圣周六白天不举行弥撒；复活前夕守夜礼的弥撒用复活期颂谢词（一），念“今夜”。' }
  }
  if (cel.rank === 'commemoration_of_all_souls')
    return { options: range('def', 5), reason: '追思已亡用追思亡者颂谢词' }

  for (const [pattern, proper, also = []] of PROPER) {
    if (pattern.test(title))
      return { options: also, proper, reason: also.length ? '也可用下列颂谢词。' : '' }
  }

  // feasts kept with the season's own prefaces
  if (/^IN NATIVITATE DOMINI|SANCTÆ FAMILIÆ/.test(title) || (md >= '12-25' && md <= '12-31'))
    return { options: NATIVITAS, reason: '圣诞八日庆期内的弥撒（即使另有专用颂谢词）用圣诞节颂谢词' }
  if (md === '01-01')
    return { options: ['bmv-1'], reason: '天主之母节用圣母颂谢词（一），念“在天主之母节日”' }
  if (/^IN EPIPHANIA DOMINI/.test(title))
    return { options: ['epiph'], reason: '主显节用主显节颂谢词' }
  if (/^IN ASCENSIONE DOMINI/.test(title))
    return { options: ['asc-1', 'asc-2'], reason: '耶稣升天节用升天节颂谢词' }
  if (/^SANCTISSIMI CORPORIS ET SANGUINIS CHRISTI/.test(title))
    return { options: ['euch-1', 'euch-2'], reason: '基督圣体圣血节用圣体颂谢词' }
  if (/^DOMINICA PASCHÆ|INFRA OCTAVAM PASCHÆ|IN OCTAVA PASCHÆ/.test(title) || day.easterOctave)
    return { options: ['pasch-1'], reason: '复活节及八日庆期用复活期颂谢词（一），念“今天”' }

  // Lent Sundays 1–5: proper prefaces (3–5 with the year A Gospels)
  if (day.season === 'quadragesima' && day.weekday === 0) {
    const lent: Record<number, ProperPreface> = {
      1: { la: 'De tentatione Domini', zh: '主受试探' },
      2: { la: 'De Transfiguratione Domini', zh: '主显圣容' },
      3: { la: 'De Samaritana', zh: '撒玛黎雅妇人' },
      4: { la: 'De Caeco nato', zh: '胎生瞎子' },
      5: { la: 'De Lazaro', zh: '拉匝禄' },
    }
    const proper = lent[day.week]
    if (proper) {
      const reason = day.week >= 3
        ? '专用颂谢词在读甲年福音时用；读乙、丙年福音时用四旬期颂谢词（一）（二）。'
        : '专用颂谢词未收录时，本页列出四旬期颂谢词（一）（二）以供对照。'
      return { options: ['quad-1', 'quad-2'], proper, reason }
    }
  }

  const season = seasonPrefaces(day)
  // in Lent, the Holy Week and 17–24 December a memorial is only commemorated: the Mass is the weekday's
  const commemoratedOnly = ['quadragesima', 'hebdomada-sancta'].includes(day.season) || day.lateAdvent

  if (['solemnity', 'feast'].includes(cel.rank)) {
    const saint = saintPrefaces(title)
    return { options: saint.ids, reason: `${saint.kind}的节日用${saint.kind === '圣人' ? '圣人通用' : `${saint.kind}或圣人通用`}颂谢词（按庆日名称推定类别）` }
  }
  if (['memorial', 'optional_memorial'].includes(cel.rank) && !commemoratedOnly && !/pro commemoratione/.test(title)) {
    const saint = saintPrefaces(title)
    return {
      options: [...saint.ids, ...season.ids.filter(id => !saint.ids.includes(id))],
      reason: `纪念日可用${saint.kind}的颂谢词（按庆日名称推定类别），也可用${season.reason.replace(/^.*?用/, '')}`,
    }
  }
  return { options: season.ids, reason: season.reason }
}
