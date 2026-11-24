// Types of features/missale/ordoMissae.json (scripts/missale/build-missale.mjs).

export type Speaker = 'sacerdos' | 'populus' | 'diaconus' | 'omnes' | 'lector' | 'text'

export interface OrdoRubric { type: 'rubric', la: string[], zh: string }
export interface OrdoText { type: 'text', who: Speaker, la: string[], zh: string, notes?: string[] }
/** a text that changes every day (readings, collect …), not yet in the page */
export interface OrdoSlot { type: 'slot', id: string, la: string, zh: string, hint: string }
export interface OrdoOption { id: string, la: string, zh: string, items: OrdoItem[] }
export interface OrdoChoice { type: 'choice', id: string, options: OrdoOption[] }
export type OrdoItem = OrdoRubric | OrdoText | OrdoSlot | OrdoChoice

export interface OrdoPart { id: string, la?: string, zh?: string, items: OrdoItem[] }
export interface OrdoSection { id: string, la: string, zh: string, sub?: { la: string, zh: string }, parts: OrdoPart[] }

export interface OrdoData {
  schemaVersion: string
  source: { la: string, zh: string }
  sections: OrdoSection[]
}
