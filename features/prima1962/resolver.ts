import defaultFixedTexts from '../../public/data/prima1962/fixed-texts.json'
import defaultLectioBrevis from '../../public/data/prima1962/lectio-brevis.json'
import defaultManifest from '../../public/data/prima1962/manifest.json'
import defaultPsalmody from '../../public/data/prima1962/psalmody.json'
import defaultPsalmsLatin from '../../public/data/prima1962/psalms-latin.json'
import { StaticCalendarProvider } from './calendarProvider'
import { addLocalDays, dayOfWeek, diffLocalDays, getGregorianEaster, localDateToString, monthDay } from './localDate'
import type { BilingualLiturgicalBlock, LocalDate, Prima1962CalendarProvider, Prima1962Resolution, SourceReference } from './types'

type PsalmodyDay = keyof typeof defaultPsalmody
type FixedTexts = typeof defaultFixedTexts
type LectioKey = keyof typeof defaultLectioBrevis

type Prima1962Data = {
  fixedTexts: typeof defaultFixedTexts
  lectioBrevis: typeof defaultLectioBrevis
  manifest: typeof defaultManifest
  psalmody: typeof defaultPsalmody
  psalmsLatin: typeof defaultPsalmsLatin
}

let runtimeDataPromise: Promise<Prima1962Data> | undefined

export async function resolvePrima1962(date: LocalDate, provider: Prima1962CalendarProvider = new StaticCalendarProvider()): Promise<Prima1962Resolution> {
  const { fixedTexts, lectioBrevis, manifest, psalmody, psalmsLatin } = await loadPrima1962Data()
  const calendarDay = await provider.getDay(date)
  const officeDate = localDateToString(date)
  const martyrologyDate = localDateToString(addLocalDays(date, 1))
  const temporalKey = calendarDay.temporalKey || 'per-annum'
  const psalmodyKey = psalmodyKeyFor(date, temporalKey)
  const psalmodyDay = psalmody[psalmodyKey]
  const seasonalAntiphon = antiphonForDate(date, temporalKey, psalmody)
  const acclamation = isAlleluiaSuppressed(date) ? 'laus-tibi' : 'alleluia'
  const responsoryMode = responsoryModeFor(temporalKey)
  const lectioKey = lectioKeyFor(date, temporalKey)
  const warnings = warningsFor(date, temporalKey, calendarDay.rank)
  const sourceRefs: SourceReference[] = [
    { file: 'public/data/prima1962/manifest.json', section: manifest.upstreamCommit },
    { file: 'web/www/horas/Latin/Psalterium/Special/Prima Special.txt' },
    { file: 'web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt' },
  ]

  const antiphon = withSource({
    id: seasonalAntiphon?.id ? `antiphon.${seasonalAntiphon.id}` : `antiphon.${psalmodyKey}`,
    type: 'verse',
    latin: seasonalAntiphon?.latin || psalmodyDay.antiphon,
    chinese: seasonalAntiphon?.chinese || ('antiphonChinese' in psalmodyDay ? String(psalmodyDay.antiphonChinese || '') : ''),
    translationStatus: seasonalAntiphon?.chinese || ('antiphonChinese' in psalmodyDay && psalmodyDay.antiphonChinese) ? 'temporary-translation' : 'missing',
    sourceRefs: seasonalAntiphon?.sourceRefs || [],
  }, seasonalAntiphon?.sourceRefs?.[0]?.file || 'web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt', seasonalAntiphon ? seasonalAntiphon.id : `Prima ${psalmodyKey}`)

  const psalms = psalmodyDay.psalms.map(spec => ({
    number: spec.replace(/\(.+\)/, ''),
    verses: spec.match(/\((.+)\)/)?.[1],
    text: ((psalmsLatin as Record<string, BilingualLiturgicalBlock[]>)[spec] || []).map(item => withSource({
      ...item,
      type: 'psalm-verse',
    }, item.sourceRefs?.[0]?.file || `Psalm ${spec}`)),
  }))

  const includeQuicumque = shouldIncludeQuicumque(date, temporalKey)
  const responsoryBlocks = responsoryBlocksFor(responsoryMode, fixedTexts, temporalKey)

  const blocks: BilingualLiturgicalBlock[] = [
    ...fixedTexts.opening.filter(item => item.id !== (acclamation === 'alleluia' ? 'common.laus-tibi' : 'common.alleluia')),
    heading('prima.psalmody.heading', 'Psalmody', '圣咏吟唱'),
    antiphon,
    ...psalms.flatMap(psalm => psalm.text),
    antiphon,
    heading('prima.capitulum.heading', 'Capitulum', '短章'),
    fixedTexts.capitulum,
    ...fixedTexts.responsory.versum,
    heading('prima.responsory.heading', 'Responsorium breve', '短答唱咏'),
    ...responsoryBlocks,
    heading('prima.collect.heading', 'Oratio', '祷词'),
    fixedTexts.collect,
    heading('prima.pretiosa.heading', 'Pretiosa', 'Pretiosa'),
    ...fixedTexts.pretiosa,
    heading('prima.chapter.heading', 'Officium Capituli', '会院小课'),
    ...fixedTexts.chapter,
    heading('prima.lectio.heading', 'Lectio brevis', '短读经'),
    fixedTexts.lectioFormulae.privateBlessing,
    lectioBrevis[lectioKey],
    ...fixedTexts.lectioFormulae.conclusion,
    heading('prima.ending.heading', 'Conclusio', '结尾'),
    ...fixedTexts.ending,
  ]

  return {
    officeDate,
    martyrologyDate,
    officeTitle: `Prima (${calendarDay.celebration || calendarDay.season})`,
    officeRank: calendarDay.rank,
    temporalKey,
    sanctoralKey: calendarDay.sanctoralKey,
    openingAcclamation: acclamation,
    hymn: fixedTexts.hymn,
    psalmGloriaOmitted: shouldOmitPsalmGloria(temporalKey),
    antiphon,
    psalms,
    includeQuicumque,
    quicumque: includeQuicumque ? fixedTexts.quicumque : undefined,
    capitulum: fixedTexts.capitulum,
    responsory: {
      mode: responsoryMode,
      properVerse: responsoryBlocks.find(item => item.type === 'verse') || responsoryBlocks[0],
      properResponse: responsoryBlocks.find(item => item.type === 'response') || responsoryBlocks[0],
      blocks: responsoryBlocks,
    },
    collect: fixedTexts.collect,
    lectioBrevis: lectioBrevis[lectioKey],
    martyrologyOmitted: shouldOmitMartyrology(temporalKey),
    sourceRefs,
    warnings,
    blocks,
  }
}

async function loadPrima1962Data(): Promise<Prima1962Data> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return {
      fixedTexts: defaultFixedTexts,
      lectioBrevis: defaultLectioBrevis,
      manifest: defaultManifest,
      psalmody: defaultPsalmody,
      psalmsLatin: defaultPsalmsLatin,
    }
  }

  runtimeDataPromise ||= Promise.all([
    fetchJson<typeof defaultFixedTexts>('/data/prima1962/fixed-texts.json'),
    fetchJson<typeof defaultLectioBrevis>('/data/prima1962/lectio-brevis.json'),
    fetchJson<typeof defaultManifest>('/data/prima1962/manifest.json'),
    fetchJson<typeof defaultPsalmody>('/data/prima1962/psalmody.json'),
    fetchJson<typeof defaultPsalmsLatin>('/data/prima1962/psalms-latin.json'),
  ]).then(([fixedTexts, lectioBrevis, manifest, psalmody, psalmsLatin]) => ({
    fixedTexts,
    lectioBrevis,
    manifest,
    psalmody,
    psalmsLatin,
  }))

  return runtimeDataPromise
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' })
  if (!response.ok)
    throw new Error(`Unable to load Prima 1962 data: ${path}`)
  return response.json() as Promise<T>
}

export function psalmodyKeyFor(date: LocalDate, temporalKey?: string): PsalmodyDay {
  if (temporalKey === 'triduum')
    return 'Dominica'
  const names: PsalmodyDay[] = ['Dominica', 'Feria II', 'Feria III', 'Feria IV', 'Feria V', 'Feria VI', 'Sabbato']
  return names[dayOfWeek(date)]
}

function antiphonForDate(date: LocalDate, temporalKey: string, psalmody: typeof defaultPsalmody) {
  const properKey = properPrimaAntiphonKey(date)
  const proper = properKey ? (psalmody.properPrimaAntiphons as Record<string, AntiphonRecord | undefined> | undefined)?.[properKey] : undefined
  if (proper)
    return proper

  const seasonalKey = seasonalAntiphonKey(date, temporalKey)
  if (!seasonalKey)
    return undefined
  const antiphons = (psalmody.seasonalAntiphons as Record<string, AntiphonRecord[] | undefined> | undefined)?.[seasonalKey]
  if (!antiphons?.length)
    return undefined
  return antiphons[0]
}

type AntiphonRecord = {
  id: string
  latin: string
  chinese: string
  sourceRefs?: SourceReference[]
}

function seasonalAntiphonKey(date: LocalDate, temporalKey: string) {
  if (temporalKey === 'advent') {
    if (date.month === 12 && date.day >= 17 && date.day <= 23 && dayOfWeek(date) > 0)
      return `Adv4${dayOfWeek(date) + 1}`
    return `Adv${adventWeek(date)}`
  }
  if (temporalKey === 'lent')
    return 'Quad'
  if (temporalKey === 'passion' || temporalKey === 'holy-week')
    return 'Quad5'
  if (['easter', 'ascension', 'pentecost'].includes(temporalKey))
    return 'Pasch'
  return undefined
}

function properPrimaAntiphonKey(date: LocalDate) {
  if (dayOfWeek(date) !== 0)
    return undefined
  const diff = diffLocalDays(date, getGregorianEaster(date.year))
  const map: Record<number, string> = {
    [-63]: 'Tempora/Quadp1-0',
    [-56]: 'Tempora/Quadp2-0',
    [-49]: 'Tempora/Quadp3-0',
    [-42]: 'Tempora/Quad1-0',
    [-35]: 'Tempora/Quad2-0',
    [-28]: 'Tempora/Quad3-0',
    [-21]: 'Tempora/Quad4-0',
    [-14]: 'Tempora/Quad5-0',
    [-7]: 'Tempora/Quad6-0',
  }
  return map[diff]
}

function adventWeek(date: LocalDate) {
  const advent1 = adventFirstSunday(date.year)
  return Math.max(1, Math.min(4, Math.floor(diffLocalDays(date, advent1) / 7) + 1))
}

function adventFirstSunday(year: number): LocalDate {
  const christmas = { year, month: 12, day: 25 }
  const jsDay = new Date(year, 11, 25).getDay()
  const fourthAdvent = addLocalDays(christmas, -((jsDay || 7) - 1) - 1)
  return addLocalDays(fourthAdvent, -21)
}

export function shouldOmitMartyrology(temporalKey: string) {
  return temporalKey === 'triduum'
}

export function shouldIncludeQuicumque(date: LocalDate, temporalKey: string) {
  return temporalKey === 'trinity'
}

export function shouldOmitPsalmGloria(temporalKey: string) {
  return temporalKey === 'triduum'
}

export function isAlleluiaSuppressed(date: LocalDate) {
  const diff = diffLocalDays(date, getGregorianEaster(date.year))
  return diff >= -63 && diff < 0
}

function responsoryModeFor(temporalKey: string): 'ordinary' | 'passion' | 'paschal' {
  if (temporalKey === 'passion' || temporalKey === 'holy-week' || temporalKey === 'triduum')
    return 'passion'
  if (['easter', 'ascension', 'pentecost'].includes(temporalKey))
    return 'paschal'
  return 'ordinary'
}

function lectioKeyFor(date: LocalDate, temporalKey: string): LectioKey {
  if (temporalKey === 'advent')
    return 'Adv'
  if (temporalKey === 'christmas')
    return 'Nat'
  if (temporalKey === 'epiphany')
    return 'Epi'
  if (temporalKey === 'ascension')
    return 'Asc'
  if (temporalKey === 'lent')
    return 'Quad'
  if (temporalKey === 'passion' || temporalKey === 'holy-week')
    return 'Quad5'
  if (temporalKey === 'easter')
    return 'Pasch'
  if (temporalKey === 'pentecost')
    return 'Pent'
  if (temporalKey === 'triduum' || temporalKey === 'holy-week')
    return 'Quad5'
  return 'Per Annum'
}

function responsoryBlocksFor(mode: 'ordinary' | 'passion' | 'paschal', texts: FixedTexts, temporalKey: string) {
  const properVerse = responsoryProperVerseFor(temporalKey, texts)
  if (mode === 'passion')
    return replaceResponsoryProperVerse(texts.responsory.passion, properVerse)
  if (mode === 'paschal')
    return replaceResponsoryProperVerse(texts.responsory.paschal, properVerse)
  return replaceResponsoryProperVerse(texts.responsory.ordinary, properVerse)
}

function replaceResponsoryProperVerse(blocks: BilingualLiturgicalBlock[], properVerse: BilingualLiturgicalBlock) {
  return blocks.map((block) => {
    if ([
      'responsory.ordinary.2',
      'responsory.qui-sedes',
      'responsory.qui-surrexisti',
    ].includes(block.id)) {
      const alleluia = /allelúia/i.test(block.latin) && !/allelúia/i.test(properVerse.latin)
      return {
        ...properVerse,
        latin: alleluia ? `${properVerse.latin.replace(/\.$/, '')}, allelúia.` : properVerse.latin,
        chinese: alleluia ? `${properVerse.chinese.replace(/。$/, '')}，阿肋路亚。` : properVerse.chinese,
      }
    }
    return block
  })
}

function responsoryProperVerseFor(temporalKey: string, texts: FixedTexts): BilingualLiturgicalBlock {
  const properVerses = (texts.responsory as typeof texts.responsory & { properVerses?: Record<string, BilingualLiturgicalBlock> }).properVerses || {}
  const key = responsoryProperVerseKey(temporalKey)
  return properVerses[key] || properVerses.ordinary || texts.responsory.ordinary[1]
}

function responsoryProperVerseKey(temporalKey: string) {
  if (temporalKey === 'advent')
    return 'adv'
  if (temporalKey === 'christmas')
    return 'nat'
  if (temporalKey === 'epiphany')
    return 'epi'
  if (temporalKey === 'easter')
    return 'pasch'
  if (temporalKey === 'ascension')
    return 'asc'
  if (temporalKey === 'pentecost')
    return 'pent'
  if (temporalKey === 'corpus')
    return 'corp'
  if (temporalKey === 'heart')
    return 'heart'
  return 'ordinary'
}

function warningsFor(date: LocalDate, temporalKey: string, rank: string) {
  const warnings: string[] = []
  const md = monthDay(date)
  if (['triduum', 'all-souls'].includes(temporalKey))
    warnings.push('此日 Prima 结构含特殊规则；当前 resolver 标示省略或警告，未声称完整复刻全部红字。')
  if (/I classis/.test(rank))
    warnings.push('一等庆节的专用对经、圣咏和荣颂变化需用 Divinum Officium oracle 继续逐日校验；当前版本采用罗马礼 1960 小时辰通用表。')
  if (md === '02-29' || md === '02-28' || md === '03-01')
    warnings.push('闰年二月底日期已用本地日期计算避免 UTC 跨日；专有圣人日课转移规则仍需人工校验。')
  return warnings
}

function withSource(block: BilingualLiturgicalBlock, file: string, section?: string): BilingualLiturgicalBlock {
  return {
    ...block,
    sourceRefs: block.sourceRefs?.length ? block.sourceRefs : [{ file, section }],
  }
}

function heading(id: string, latin: string, chinese: string): BilingualLiturgicalBlock {
  return {
    id,
    type: 'heading',
    latin,
    chinese,
    translationStatus: 'existing-project-translation',
    sourceRefs: [],
  }
}
