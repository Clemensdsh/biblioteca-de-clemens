// What the day decides in the Ordo Missae: the flags that switch variable texts on and off
// (`%if` blocks of resources/missale/ordo-missae.txt), the saint's name that fills the “N.” of
// prefaces and of the Eucharistic Prayers, and the cautions for the Eucharistic Prayers III and IV.

import type { InjectionKey, Ref } from 'vue'
import { saintNameZh } from '../liturgiaHorarum/titleZh'
import type { Celebration, SeasonDay } from './calendar'
import type { PrefaceChoice } from './praefatio'

export interface MissaleVars { N?: { la?: string, zh?: string } }

export interface MissaleCtx {
  /** named conditions of `%if` blocks */
  flags: Record<string, boolean>
  /** show every branch of the conditional blocks instead of choosing by the day */
  showAll: boolean
  vars: MissaleVars
  /** a caution shown at the head of an option (by option id) */
  warnings: Record<string, string>
  /** the option shown when none was chosen (by group id) */
  defaults: Record<string, string>
}

export const MISSALE_CTX: InjectionKey<Ref<MissaleCtx>> = Symbol('missale-ctx')

export const EMPTY_CTX: MissaleCtx = { flags: {}, showAll: false, vars: {}, warnings: {}, defaults: {} }

/** `a&!b|c`: OR of ANDs of (possibly negated) flags; an unknown flag is false */
export function evalWhen(expr: string, flags: Record<string, boolean>): boolean {
  return expr.split('|').some(term => term.split('&').every((atom) => {
    const name = atom.trim()
    return name.startsWith('!') ? !flags[name.slice(1)] : Boolean(flags[name])
  }))
}

const RANK_WORD = /^(.*?),?\s+(sollemnitas|festum|memoria(?: ad libitum)?|pro commemoratione|Hebdomada \d+ Psalterii)$/

/** the Latin title without its rank word */
export function titleMain(title: string): string {
  return RANK_WORD.exec(title)?.[1] ?? title
}

export interface DayFlagOptions {
  /** a deacon serves */
  deacon: boolean
  /** the chosen form of the penitential act (id) */
  paenitentia?: string
}

export function dayFlags(day: SeasonDay, cel: Celebration, options: DayFlagOptions): Record<string, boolean> {
  const title = cel.title_la
  const md = day.date.slice(5)
  const nativitas = md >= '12-25' || md === '01-01'
  const epiphania = /^IN EPIPHANIA DOMINI/.test(title)
  // from the Easter Vigil to the Second Sunday of Easter
  const pascha = day.easterOctave || (day.season === 'triduum' && day.weekday === 6)
  const ascensio = /^IN ASCENSIONE DOMINI/.test(title)
  const pentecostes = /^DOMINICA PENTECOSTES/.test(title)
  return {
    nativitas,
    epiphania,
    pascha,
    ascensio,
    pentecostes,
    propria: nativitas || epiphania || pascha || ascensio || pentecostes,
    defuncti: cel.rank === 'commemoration_of_all_souls',
    deacon: options.deacon,
    paenitentia3: options.paenitentia === 'paenitentia-3',
  }
}

/** the saint of the day, for “N.”: Latin in the genitive as the title gives it, Chinese from the General Calendar names */
export function saintVars(cel: Celebration | undefined): MissaleVars {
  if (!cel)
    return {}
  const main = titleMain(cel.title_la)
  const zh = saintNameZh(main)
  if (!zh)
    return {}
  const la = /^(?:ss?|b|bb)\.\s+([^,]+)/i.exec(main)?.[1]?.trim()
  return { N: { la, zh } }
}

/** cautions for the Eucharistic Prayers III and IV (Institutio Generalis, n. 365) */
export function eucharisticWarnings(day: SeasonDay, cel: Celebration, preface?: PrefaceChoice): Record<string, string> {
  const warnings: Record<string, string> = {}
  const major = ['solemnity', 'feast'].includes(cel.rank)
  if (day.weekday !== 0 && !major)
    warnings['prex-3'] = '礼规提示：感恩经第三式宜用于主日和节日（节日、庆日）；本日为平日或纪念日，通常改用第二式或第一式。'
  const properPreface = Boolean(preface?.proper) || day.season !== 'per-annum' || major || cel.rank === 'commemoration_of_all_souls'
  if (properPreface)
    warnings['prex-4'] = '礼规提示：感恩经第四式有固定、不可更换的颂谢词，遇有专用颂谢词的弥撒（将临期、圣诞期、四旬期、复活期，以及有专用颂谢词的节日、庆日）不宜使用；多用于没有专用颂谢词的常年期弥撒。'
  return warnings
}
