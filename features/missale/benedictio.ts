// Which solemn blessing (benedictiones.json) suits a day. The solemn blessing is optional
// ("quibusdam diebus vel occasionibus … iuxta rubricas"); the page offers these first and the rest
// on demand.

import type { Celebration, SeasonDay } from './calendar'

export interface BlessingChoice { options: string[], reason: string }

const PER_ANNUM = Array.from({ length: 6 }, (_, i) => `per-annum-${i + 1}`)

export function blessingsFor(day: SeasonDay, cel: Celebration): BlessingChoice {
  const title = cel.title_la
  const md = day.date.slice(5)
  if (cel.rank === 'commemoration_of_all_souls')
    return { options: ['defuncti'], reason: '追思亡者' }
  if (/^SS\. PETRI ET PAULI/.test(title))
    return { options: ['petrus-paulus'], reason: '圣伯多禄、圣保禄节' }
  if (/^OMNIUM SANCTORUM/.test(title))
    return { options: ['omnes-sancti'], reason: '诸圣节' }
  if (/dedicatione/i.test(title))
    return { options: ['dedicatio'], reason: '圣堂奉献' }
  if (['solemnity', 'feast'].includes(cel.rank) && /apostol|evangelist/i.test(title))
    return { options: ['apostoli'], reason: '宗徒庆日' }
  if (md === '01-01')
    return { options: ['initium-anni', 'bmv'], reason: '新年开始；天主之母节' }
  if (['solemnity', 'feast'].includes(cel.rank) && /Mari(æ|ae)\b.*Virgin|B\. Mari|GENETRICIS MARIÆ/i.test(title))
    return { options: ['bmv'], reason: '圣母庆节' }
  if (/^IN EPIPHANIA DOMINI/.test(title))
    return { options: ['epiphania'], reason: '主显节' }
  if (/^IN ASCENSIONE DOMINI/.test(title) || day.afterAscension)
    return { options: ['ascensio', 'tempus-paschale'], reason: '耶稣升天节及其后' }
  if (/^DOMINICA PENTECOSTES/.test(title))
    return { options: ['spiritus-sanctus'], reason: '五旬节' }
  switch (day.season) {
    case 'adventus':
      return { options: ['adventus'], reason: '将临期' }
    case 'nativitas':
      return { options: ['nativitas'], reason: '圣诞期' }
    case 'quadragesima':
      return day.weekday === 0
        ? { options: ['passio'], reason: '四旬期（2002 年版四旬期弥撒另有“为民祈祷” oratio super populum，本页暂未收录）' }
        : { options: [], reason: '四旬期平日弥撒用“为民祈祷”（oratio super populum），本页暂未收录' }
    case 'hebdomada-sancta':
      return { options: ['passio'], reason: '圣周' }
    case 'triduum':
      return day.weekday === 6
        ? { options: ['tempus-paschale'], reason: '复活前夕（《感恩祭典》另有“复活前夕与复活节”一式，2002 年拉丁本此处无）' }
        : { options: [], reason: '' }
    case 'pascha':
      return { options: ['tempus-paschale'], reason: '复活期' }
    case 'per-annum':
      return { options: PER_ANNUM, reason: '常年期' }
  }
}
