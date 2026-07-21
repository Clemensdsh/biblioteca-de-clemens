export const office1962HourNames = [
  'matutinum',
  'laudes',
  'prima',
  'tertia',
  'sexta',
  'nona',
  'vesperae',
  'completorium',
] as const

export type OfficeHourName = typeof office1962HourNames[number]
export type MinorHourName = 'tertia' | 'sexta' | 'nona'
export type MajorHourName = 'laudes' | 'vesperae'

export interface MinorHourMetadata {
  hour: MinorHourName
  psalmodySource:
    | 'ferial-psalter'
    | 'festal'
    | 'proper'
    | 'special'
  antiphonSource?: SourceRef
  capitulumSource?: SourceRef
  responsorySource?: SourceRef
  collectSource?: SourceRef
}

export interface MajorHourMetadata {
  hour: MajorHourName
  psalmodySource:
    | 'ferial-psalter'
    | 'festal'
    | 'proper'
    | 'special'
  gospelCanticle: 'benedictus' | 'magnificat'
  concurrenceResolvedByUpstream?: boolean
  antiphonSource?: SourceRef
  capitulumSource?: SourceRef
  hymnSource?: SourceRef
  collectSource?: SourceRef
}

export interface SourceRef {
  upstreamCommit: string
  path: string
  section?: string
  lineStart?: number
  lineEnd?: number
  transformation?: string[]
}

export interface OfficeWarning {
  code: string
  message: string
  severity?: 'info' | 'warning' | 'error'
}

export interface ExportedOfficeUnit {
  id: string
  raw: string
  html: string
}

export interface ExportedOfficeHour {
  schemaVersion: string
  engineVersion: 'Rubrics 1960 - 1960'
  language: 'la'
  date: string
  hour: OfficeHourName
  liturgicalTitle: string
  rank?: string
  upstreamCommit: string
  sourceRefs: SourceRef[]
  warnings: OfficeWarning[]
  units: ExportedOfficeUnit[]
}

export type LiturgicalBlockType =
  | 'heading'
  | 'rubric'
  | 'dialogue'
  | 'invitatory'
  | 'hymn'
  | 'antiphon'
  | 'marian-antiphon'
  | 'psalm'
  | 'canticle'
  | 'capitulum'
  | 'reading'
  | 'responsory'
  | 'matins-responsory'
  | 'versicle'
  | 'prayer'
  | 'commemoration'
  | 'absolution'
  | 'te-deum'
  | 'blessing'
  | 'martyrology'
  | 'chapter-office'
  | 'pretiosa'
  | 'creed'
  | 'spacer'
  | 'unknown'

export interface LiturgicalBlock {
  id: string
  type: LiturgicalBlockType
  title?: string
  text: string[]
  verses?: string[]
  rubricLines?: string[]
  metadata?: Record<string, unknown>
  sourceRefs: SourceRef[]
  warnings: OfficeWarning[]
}

export interface OfficeHour {
  name: OfficeHourName
  title: string
  blocks: LiturgicalBlock[]
  metadata?: Record<string, unknown>
  sourceRefs: SourceRef[]
  warnings: OfficeWarning[]
}

export interface OracleComparisonEntry {
  date: string
  hour: OfficeHourName
  status: 'exact' | 'normalized-equivalent' | 'expected-structural-difference' | 'mismatch' | 'unresolved'
  blockResults: Array<{
    blockId: string
    type: LiturgicalBlockType
    status: OracleComparisonEntry['status']
    message?: string
  }>
  counts: Record<OracleComparisonEntry['status'], number>
  notes: string[]
}

export interface Office1962Day {
  schemaVersion: string
  engineVersion: 'Rubrics 1960 - 1960'
  language: 'la'
  date: string
  liturgicalTitle: string
  rank?: string
  commemorations: unknown[]
  hours: Partial<Record<OfficeHourName, OfficeHour>>
  sourceRefs: SourceRef[]
  warnings: OfficeWarning[]
}

export function isOfficeHourName(value: string): value is OfficeHourName {
  return (office1962HourNames as readonly string[]).includes(value)
}

export function validateExportedOfficeHour(value: unknown): string[] {
  const errors: string[] = []
  const item = value as Partial<ExportedOfficeHour>

  if (!item || typeof item !== 'object')
    return ['export must be an object']

  if (item.schemaVersion !== '0.1.0')
    errors.push('schemaVersion must be 0.1.0')
  if (item.engineVersion !== 'Rubrics 1960 - 1960')
    errors.push('engineVersion must be Rubrics 1960 - 1960')
  if (item.language !== 'la')
    errors.push('language must be la')
  if (typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date))
    errors.push('date must be YYYY-MM-DD')
  if (typeof item.hour !== 'string' || !isOfficeHourName(item.hour))
    errors.push('hour must be a supported Office hour')
  if (typeof item.liturgicalTitle !== 'string' || !item.liturgicalTitle.trim())
    errors.push('liturgicalTitle is required')
  if (typeof item.upstreamCommit !== 'string' || !/^[0-9a-f]{40}$/.test(item.upstreamCommit))
    errors.push('upstreamCommit must be a full Git SHA')
  if (!Array.isArray(item.sourceRefs) || item.sourceRefs.length === 0)
    errors.push('sourceRefs must be non-empty')
  if (!Array.isArray(item.units) || item.units.length === 0)
    errors.push('units must be non-empty')

  item.sourceRefs?.forEach((ref, index) => {
    if (!ref.path)
      errors.push(`sourceRefs[${index}].path is required`)
    if (!ref.upstreamCommit)
      errors.push(`sourceRefs[${index}].upstreamCommit is required`)
  })

  item.units?.forEach((unit, index) => {
    if (!unit.id)
      errors.push(`units[${index}].id is required`)
    if (typeof unit.raw !== 'string' || !unit.raw.trim())
      errors.push(`units[${index}].raw is required`)
    if (typeof unit.html !== 'string' || !unit.html.trim())
      errors.push(`units[${index}].html is required`)
  })

  return errors
}

export function validateOffice1962Day(value: unknown): string[] {
  const errors: string[] = []
  const item = value as Partial<Office1962Day>

  if (!item || typeof item !== 'object')
    return ['day must be an object']

  if (item.schemaVersion !== '0.2.0')
    errors.push('schemaVersion must be 0.2.0')
  if (item.engineVersion !== 'Rubrics 1960 - 1960')
    errors.push('engineVersion must be Rubrics 1960 - 1960')
  if (item.language !== 'la')
    errors.push('language must be la')
  if (typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date))
    errors.push('date must be YYYY-MM-DD')
  if (typeof item.liturgicalTitle !== 'string' || !item.liturgicalTitle.trim())
    errors.push('liturgicalTitle is required')
  if (!item.hours || typeof item.hours !== 'object')
    errors.push('hours is required')

  for (const [hourName, hour] of Object.entries(item.hours || {})) {
    if (!isOfficeHourName(hourName))
      errors.push(`hours.${hourName} is not supported`)
    if (!hour)
      continue
    if (!Array.isArray(hour.blocks) || hour.blocks.length === 0)
      errors.push(`hours.${hourName}.blocks must be non-empty`)
    hour.blocks?.forEach((block, index) => {
      if (!block.id)
        errors.push(`hours.${hourName}.blocks[${index}].id is required`)
      if (!block.type || block.type === 'unknown')
        errors.push(`hours.${hourName}.blocks[${index}].type must be known`)
      if (!Array.isArray(block.text))
        errors.push(`hours.${hourName}.blocks[${index}].text must be an array`)
      if (!Array.isArray(block.sourceRefs) || block.sourceRefs.length === 0)
        errors.push(`hours.${hourName}.blocks[${index}].sourceRefs must be non-empty`)
      block.sourceRefs?.forEach((ref, refIndex) => {
        if (!ref.upstreamCommit)
          errors.push(`hours.${hourName}.blocks[${index}].sourceRefs[${refIndex}].upstreamCommit is required`)
        if (!ref.path)
          errors.push(`hours.${hourName}.blocks[${index}].sourceRefs[${refIndex}].path is required`)
      })
    })
  }

  return errors
}
