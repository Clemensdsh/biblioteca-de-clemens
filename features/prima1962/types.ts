export type TranslationStatus =
  | 'existing-project-translation'
  | 'verified-source-translation'
  | 'temporary-translation'
  | 'missing'

export type BilingualBlockType =
  | 'rubric'
  | 'heading'
  | 'verse'
  | 'response'
  | 'prayer'
  | 'hymn-stanza'
  | 'psalm-verse'
  | 'reading'
  | 'notice'

export type SourceReference = {
  file: string
  section?: string
}

export interface BilingualLiturgicalBlock {
  id: string
  type: BilingualBlockType
  latin: string
  chinese: string
  translationStatus: TranslationStatus
  sourceRefs: SourceReference[]
}

export type LocalDate = {
  year: number
  month: number
  day: number
}

export type Prima1962CalendarDay = {
  date: string
  season: string
  rank: string
  color?: string
  celebration?: string
  temporalKey?: string
  sanctoralKey?: string
}

export interface Prima1962CalendarProvider {
  getDay(date: LocalDate): Promise<Prima1962CalendarDay>
}

export interface Prima1962Resolution {
  officeDate: string
  martyrologyDate: string
  officeTitle: string
  officeRank: string
  temporalKey?: string
  sanctoralKey?: string
  openingAcclamation: 'alleluia' | 'laus-tibi'
  hymn: BilingualLiturgicalBlock[]
  psalmGloriaOmitted: boolean
  antiphon: BilingualLiturgicalBlock
  psalms: Array<{
    number: string
    verses?: string
    text: BilingualLiturgicalBlock[]
  }>
  includeQuicumque: boolean
  quicumque?: BilingualLiturgicalBlock[]
  capitulum: BilingualLiturgicalBlock
  responsory: {
    mode: 'ordinary' | 'passion' | 'paschal'
    properVerse: BilingualLiturgicalBlock
    properResponse: BilingualLiturgicalBlock
    blocks: BilingualLiturgicalBlock[]
  }
  collect: BilingualLiturgicalBlock
  lectioBrevis: BilingualLiturgicalBlock
  martyrologyOmitted: boolean
  sourceRefs: SourceReference[]
  warnings: string[]
  blocks: BilingualLiturgicalBlock[]
}
