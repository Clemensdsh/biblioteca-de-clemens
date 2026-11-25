// Types of features/missale/ordoMissae.json (scripts/missale/build-missale.mjs).

/** minister = 执事或主祭（有执事时读作执事，无执事时读作主祭） */
export type Speaker = 'sacerdos' | 'populus' | 'diaconus' | 'omnes' | 'lector' | 'minister' | 'text'

export interface OrdoRubric { type: 'rubric', la: string[], zh: string }
export interface OrdoText {
  type: 'text'
  who: Speaker
  /** Latin lines */
  la: string[]
  /** Chinese; lines (joined with \n) match the Latin lines one to one when the counts agree, an empty line meaning “continues the line above” */
  zh: string
  notes?: string[]
  /** may be left out (shown in brackets) */
  optional?: boolean
  /** said silently by the priest */
  secret?: boolean
  /** the words of Christ at the consecration: set in heavy type */
  strong?: boolean
}
/** a text that changes every day (readings, collect …), not yet in the page */
export interface OrdoSlot { type: 'slot', id: string, la: string, zh: string, hint: string }
export interface OrdoOption { id: string, la: string, zh: string, items: OrdoItem[] }
export interface OrdoChoice { type: 'choice', id: string, options: OrdoOption[], inline?: boolean }
/** items shown only when `when` holds for the day (see conditions.ts) */
export interface OrdoCond { type: 'cond', when: string, items: OrdoItem[], else?: OrdoItem[] }
export type OrdoItem = OrdoRubric | OrdoText | OrdoSlot | OrdoChoice | OrdoCond

export interface OrdoPart { id: string, la?: string, zh?: string, items: OrdoItem[] }
export interface OrdoSection { id: string, la: string, zh: string, sub?: { la: string, zh: string }, parts: OrdoPart[] }

export interface OrdoData {
  schemaVersion: string
  source: { la: string, zh: string }
  sections: OrdoSection[]
}
