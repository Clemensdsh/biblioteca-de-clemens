import type { ExportedOfficeHour, LiturgicalBlock, LiturgicalBlockType, OfficeHour, SourceRef } from '../../schema.ts'
import { normalizeLatinTechnical } from '../../normalizeLatin.ts'

const ORDINARY_MATUTINUM = 'web/www/horas/Ordinarium/Matutinum.txt'
const MATUTINUM_SPECIAL = 'web/www/horas/Latin/Psalterium/Special/Matutinum Special.txt'
const BENEDICTIONS = 'web/www/horas/Latin/Psalterium/Benedictions.txt'
const COMMON_PRAYERS = 'web/www/horas/Latin/Psalterium/Common/Prayers.txt'
const PSALM_PATH = 'web/www/horas/Latin/Psalterium/Psalmorum'
const TEMPORA_PATH = 'web/www/horas/Latin/Tempora'
const SANCTI_PATH = 'web/www/horas/Latin/Sancti'
const COMMUNE_PATH = 'web/www/horas/Latin/Commune'

interface MatutinumState {
  currentNocturn: 1 | 2 | 3
  seenNocturnHeading: boolean
  lessonCount: number
  teDeumIncluded: boolean
  nocturns: Array<{
    number: 1 | 2 | 3
    psalmBlockIds: string[]
    versicleBlockId?: string
    absolutionBlockId?: string
    lessonBlockIds: string[]
    responsoryBlockIds: string[]
  }>
}

export function parseMatutinum(exported: ExportedOfficeHour): OfficeHour {
  const blocks: LiturgicalBlock[] = []
  const state: MatutinumState = {
    currentNocturn: 1,
    seenNocturnHeading: false,
    lessonCount: 0,
    teDeumIncluded: false,
    nocturns: [],
  }
  ensureNocturn(state, 1)

  for (const unit of exported.units) {
    const raw = unit.raw
    const heading = firstRawHeading(raw)
    const lines = htmlToLines(unit.html)

    if (isOmittedHeading(heading)) {
      blocks.push(block(exported, raw, 'rubric', `${slugify((heading || 'omittitur').replace(/\{omittitur\}/, ''))}-omittitur`, (heading || 'Omittitur').replace(/\{omittitur\}/, ' omittitur'), lines, {
        omitted: true,
        specialStructure: specialStructure(exported),
      }, lines))
    }
    else if (heading === 'Incipit') {
      blocks.push(block(exported, raw, 'dialogue', 'incipit', 'Incipit', lines, {
        includesDomineLabia: lines.some(line => line.includes('lábia')),
        includesDeusInAdiutorium: lines.some(line => line.includes('Deus') && line.includes('adjutórium')),
        includesGloriaPatri: hasGloriaPatri(lines),
        includesAlleluia: lines.some(line => line.includes('Allelúja')),
      }))
    }
    else if (heading?.startsWith('Invitatorium')) {
      blocks.push(parseInvitatory(exported, raw, lines, heading))
    }
    else if (heading?.startsWith('Hymnus')) {
      blocks.push(block(exported, raw, 'hymn', 'hymnus', heading, lines, {
        stanzas: stanzas(lines),
      }))
    }
    else if (heading?.startsWith('Psalmi cum lectionibus') || raw.trim().startsWith('!Nocturnus') || raw.trim().startsWith('Ant. ')) {
      const psalmBlocks = parsePsalmodyUnit(exported, raw, lines, state)
      blocks.push(...psalmBlocks)
      for (const item of psalmBlocks.filter(item => item.type === 'psalm'))
        currentNocturn(state).psalmBlockIds.push(item.id)
    }
    else if (!heading && raw.trim().startsWith('!')) {
      blocks.push(block(exported, raw, 'rubric', `rubric-${unit.id.slice(-3)}`, undefined, lines, {
        specialStructure: specialStructure(exported),
      }, lines))
    }
    else if (raw.trim().startsWith('V. Jube')) {
      const lessonBlocks = parseLessonUnit(exported, raw, lines, state)
      blocks.push(...lessonBlocks)
      for (const item of lessonBlocks) {
        if (item.type === 'reading')
          currentNocturn(state).lessonBlockIds.push(item.id)
        if (item.type === 'matins-responsory')
          currentNocturn(state).responsoryBlockIds.push(item.id)
        if (item.type === 'te-deum')
          state.teDeumIncluded = true
      }
    }
    else if (raw.trim().startsWith('&lectio(')) {
      const lessonBlocks = parseBareLessonUnit(exported, raw, lines, state)
      blocks.push(...lessonBlocks)
      for (const item of lessonBlocks) {
        if (item.type === 'reading')
          currentNocturn(state).lessonBlockIds.push(item.id)
        if (item.type === 'matins-responsory')
          currentNocturn(state).responsoryBlockIds.push(item.id)
        if (item.type === 'te-deum')
          state.teDeumIncluded = true
      }
    }
    else if (raw.trim().startsWith('$rubrica Pater') || raw.trim().startsWith('$Pater')) {
      const item = parseAbsolution(exported, raw, lines, state)
      blocks.push(item)
      currentNocturn(state).absolutionBlockId = item.id
    }
    else if (raw.trim().startsWith('V. ') || raw.trim().startsWith('R. ')) {
      const item = block(exported, raw, 'versicle', `nocturn-${state.currentNocturn}-versicle`, 'Versiculus', lines, {
        nocturn: state.currentNocturn,
        versicle: lines.find(line => line.startsWith('℣.')),
        response: lines.find(line => line.startsWith('℟.')),
      })
      blocks.push(item)
      currentNocturn(state).versicleBlockId = item.id
    }
    else if (heading?.startsWith('Oratio')) {
      blocks.push(block(exported, raw, 'prayer', 'oratio', heading, lines, {
        sourceKind: heading.includes('Tempore') ? 'temporal' : heading.includes('Sanctorum') ? 'sanctoral' : 'ordinary',
      }))
    }
    else if (heading === 'Conclusio') {
      blocks.push(block(exported, raw, 'blessing', 'conclusio', heading, lines, {
        formula: 'matutinum-conclusion',
      }))
    }
    else if (raw.trim().startsWith('$rubrica Matutinum')) {
      blocks.push(block(exported, raw, 'rubric', 'reliqua-omittuntur', undefined, lines, {
        conclusionRubric: true,
      }, lines))
    }
    else {
      blocks.push(block(exported, raw, 'unknown', slugify(heading || `unit-${unit.id}`), heading, lines))
    }
  }

  const nocturns = state.nocturns.filter(nocturn => nocturn.psalmBlockIds.length || nocturn.lessonBlockIds.length)
  const metadata = {
    nocturnCount: nocturns.length === 3 ? 3 : 1,
    lessonCount: state.lessonCount === 9 ? 9 : 3,
    officeForm: officeForm(exported),
    teDeumIncluded: state.teDeumIncluded,
    invitatoryIncluded: blocks.some(item => item.type === 'invitatory'),
    sourceClassifications: sourceClassifications(blocks),
    nocturns,
  }

  for (const item of blocks)
    item.metadata = { ...(item.metadata || {}), matutinum: metadata }

  return {
    name: 'matutinum',
    title: 'Matutinum',
    metadata,
    blocks,
    sourceRefs: exported.sourceRefs,
    warnings: [
      ...exported.warnings,
      ...blocks.flatMap(item => item.warnings),
    ],
  }
}

function parseInvitatory(exported: ExportedOfficeHour, raw: string, lines: string[], heading: string): LiturgicalBlock {
  const text = lines.filter(line => line !== heading && !line.startsWith('Invitatorium '))
  const antiphons = text.filter(line => line.startsWith('Ant. '))
  const psalmVerses = text.filter(line => !line.startsWith('Ant. ') && !line.startsWith('℣.') && !line.startsWith('℟.') && line !== '_')
  return block(exported, raw, 'invitatory', 'invitatorium', heading, lines, {
    antiphon: antiphons[0],
    antiphonRepetitions: antiphons,
    psalmNumber: '94',
    psalmVerses,
    repetitionPattern: text.map((line, index) => ({
      index,
      kind: line.startsWith('Ant. ') ? 'antiphon' : line.startsWith('℣.') || line.startsWith('℟.') ? 'gloria' : 'psalm-verse',
      text: line,
    })),
    includesGloriaPatri: hasGloriaPatri(text),
    sourceKind: heading.includes('Tempore') ? 'temporal' : heading.includes('Commune') ? 'common' : heading.includes('Sanctorum') ? 'sanctoral' : 'ordinary',
  })
}

function parsePsalmodyUnit(exported: ExportedOfficeHour, raw: string, lines: string[], state: MatutinumState): LiturgicalBlock[] {
  const nocturnHeading = lines.find(line => /^Nocturnus I{1,3}$/.test(line))
  if (nocturnHeading) {
    state.currentNocturn = romanToNocturn(nocturnHeading)
    state.seenNocturnHeading = true
    ensureNocturn(state, state.currentNocturn)
  }

  const firstAntiphonIndex = lines.findIndex(line => line.startsWith('Ant. '))
  const psalmStart = lines.findIndex(line => line.startsWith('Psalmus '))
  const closingAntiphonIndex = lines.findLastIndex(line => line.startsWith('Ant. '))
  const openingAntiphon = firstAntiphonIndex >= 0 && firstAntiphonIndex < psalmStart ? lines[firstAntiphonIndex] : undefined
  const psalmTitle = psalmStart >= 0 ? lines[psalmStart] : 'Psalmus'
  const psalmKey = psalmBlockId(psalmTitle, raw)
  const psalmLines = psalmStart >= 0
    ? lines.slice(psalmStart, closingAntiphonIndex > psalmStart ? closingAntiphonIndex : undefined)
    : []
  const result: LiturgicalBlock[] = []

  if (nocturnHeading) {
    result.push(block(exported, raw, 'heading', `nocturn-${state.currentNocturn}`, nocturnHeading, [nocturnHeading], {
      nocturn: state.currentNocturn,
    }))
  }
  if (openingAntiphon) {
    result.push(block(exported, raw, 'antiphon', `${psalmKey}-antiphon-open`, 'Antiphona', [openingAntiphon], {
      nocturn: state.currentNocturn,
      position: 'before-psalm',
      repeated: closingAntiphonIndex > psalmStart,
      antiphonKey: slugify(openingAntiphon.replace(/^Ant\.\s*/, '')),
    }))
  }
  if (psalmStart >= 0) {
    result.push(block(exported, raw, 'psalm', psalmKey, psalmTitle, psalmLines.slice(1), {
      nocturn: state.currentNocturn,
      psalmNumber: psalmNumber(psalmTitle) || psalmNumberFromRaw(raw),
      segment: psalmSegment(psalmTitle),
      verses: psalmLines.filter(line => /^\d+:\d+/.test(line)),
      includesGloriaPatri: hasGloriaPatri(psalmLines),
      gloriaPatriOmitted: psalmLines.some(line => line.includes('Gloria omittitur')),
      includesRequiemAeternam: psalmLines.some(line => line.includes('Réquiem ætérnam')),
      antiphonKey: openingAntiphon ? slugify(openingAntiphon.replace(/^Ant\.\s*/, '')) : undefined,
    }))
  }
  if (closingAntiphonIndex > psalmStart) {
    result.push(block(exported, raw, 'antiphon', `${psalmKey}-antiphon-close`, 'Antiphona repetita', [lines[closingAntiphonIndex]], {
      nocturn: state.currentNocturn,
      position: 'after-psalm',
      repeated: true,
      antiphonKey: slugify(lines[closingAntiphonIndex].replace(/^Ant\.\s*/, '')),
    }))
  }
  return result
}

function parseAbsolution(exported: ExportedOfficeHour, raw: string, lines: string[], state: MatutinumState): LiturgicalBlock {
  return block(exported, raw, 'absolution', `nocturn-${state.currentNocturn}-absolutio`, 'Absolutio', lines, {
    nocturn: state.currentNocturn,
    paterNosterMode: raw.includes('totum secreto') ? 'totum-secreto' : 'secreto-usque-ad-et-ne-nos',
    absolution: lines.find(line => line.startsWith('Absolutio.')),
  })
}

function parseLessonUnit(exported: ExportedOfficeHour, raw: string, lines: string[], state: MatutinumState): LiturgicalBlock[] {
  const lessonTitleIndex = lines.findIndex(line => /^Lectio \d+/.test(line))
  const lessonNumber = lessonTitleIndex >= 0 ? Number(lines[lessonTitleIndex].match(/\d+/)?.[0]) : state.lessonCount + 1
  state.lessonCount = Math.max(state.lessonCount, lessonNumber)
  const nocturn = lessonNumber <= 3 ? 1 : lessonNumber <= 6 ? 2 : 3
  state.currentNocturn = nocturn
  ensureNocturn(state, nocturn)

  const blessingLines = lessonTitleIndex >= 0 ? lines.slice(0, lessonTitleIndex) : lines.slice(0, 3)
  const afterLessonTitle = lessonTitleIndex >= 0 ? lines.slice(lessonTitleIndex) : lines
  const firstDividerAfterLesson = afterLessonTitle.findIndex((line, index) => index > 0 && line === '_')
  const readingLines = firstDividerAfterLesson >= 0 ? afterLessonTitle.slice(0, firstDividerAfterLesson) : afterLessonTitle
  const tail = firstDividerAfterLesson >= 0 ? afterLessonTitle.slice(firstDividerAfterLesson + 1) : []
  const teDeumIndex = tail.findIndex(line => line === 'Te Deum')
  const responsoryLines = teDeumIndex >= 0 ? tail.slice(0, teDeumIndex) : tail
  const teDeumLines = teDeumIndex >= 0 ? tail.slice(teDeumIndex) : []
  const result: LiturgicalBlock[] = []

  result.push(block(exported, raw, 'blessing', `lesson-${lessonNumber}-benedictio`, 'Benedictio', blessingLines, {
    nocturn,
    lessonNumber,
    formula: blessingLines.find(line => line.startsWith('Benedictio.')),
    includesJubeDomine: blessingLines.some(line => line.includes('Jube')),
  }))
  result.push(block(exported, raw, 'reading', `lesson-${lessonNumber}`, `Lectio ${lessonNumber}`, readingLines, {
    nocturn,
    lessonNumber,
    readingKind: classifyReading(readingLines, exported),
    scriptureReference: readingLines.find(line => /^[1-4]?\s?[A-Z][a-z]+\s+\d+:\d+/.test(line)),
    author: authorLine(readingLines),
    workTitle: workTitleLine(readingLines),
    gospelReference: readingLines.find(line => /^Luc |^Matt |^Marc |^Joann /.test(line)),
    includesTuAutem: readingLines.some(line => line.includes('Tu autem')),
  }))
  if (responsoryLines.length) {
    result.push(block(exported, raw, 'matins-responsory', `lesson-${lessonNumber}-responsorium`, `Responsorium ${lessonNumber}`, responsoryLines, {
      nocturn,
      lessonNumber,
      responsoryNumber: lessonNumber,
      incipit: responsoryLines.find(line => line.startsWith('℟.')) || responsoryLines[0],
      versicle: responsoryLines.find(line => line.startsWith('℣.')),
      response: responsoryLines.findLast(line => line.startsWith('℟.')),
      gloriaPatriIncluded: hasGloriaPatri(responsoryLines),
      finalRepetitionIncluded: responsoryLines.filter(line => line.startsWith('℟.')).length > 1,
    }))
  }
  if (teDeumLines.length) {
    result.push(block(exported, raw, 'te-deum', 'te-deum', 'Te Deum', teDeumLines, {
      included: true,
      nocturn,
      afterLessonNumber: lessonNumber,
    }))
  }
  return result
}

function parseBareLessonUnit(exported: ExportedOfficeHour, raw: string, lines: string[], state: MatutinumState): LiturgicalBlock[] {
  const lessonNumber = Number(raw.match(/&lectio\((\d+)\)/)?.[1] || lines.find(line => /^Lectio \d+/.test(line))?.match(/\d+/)?.[0] || state.lessonCount + 1)
  state.lessonCount = Math.max(state.lessonCount, lessonNumber)
  const nocturn = lessonNumber <= 3 ? 1 : lessonNumber <= 6 ? 2 : 3
  state.currentNocturn = nocturn
  ensureNocturn(state, nocturn)

  const firstDividerAfterLesson = lines.findIndex((line, index) => index > 0 && line === '_')
  const readingLines = firstDividerAfterLesson >= 0 ? lines.slice(0, firstDividerAfterLesson) : lines
  const tail = firstDividerAfterLesson >= 0 ? lines.slice(firstDividerAfterLesson + 1) : []
  const teDeumIndex = tail.findIndex(line => line === 'Te Deum')
  const responsoryLines = teDeumIndex >= 0 ? tail.slice(0, teDeumIndex) : tail
  const teDeumLines = teDeumIndex >= 0 ? tail.slice(teDeumIndex) : []
  const result: LiturgicalBlock[] = [
    block(exported, raw, 'reading', `lesson-${lessonNumber}`, `Lectio ${lessonNumber}`, readingLines, {
      nocturn,
      lessonNumber,
      readingKind: classifyReading(readingLines, exported),
      scriptureReference: readingLines.find(line => /^[1-4]?\s?[A-Z][a-z]+\s+\d+:\d+/.test(line)),
      author: authorLine(readingLines),
      workTitle: workTitleLine(readingLines),
      blessingOmitted: true,
      specialStructure: specialStructure(exported),
    }),
  ]
  if (responsoryLines.length) {
    result.push(block(exported, raw, 'matins-responsory', `lesson-${lessonNumber}-responsorium`, `Responsorium ${lessonNumber}`, responsoryLines, {
      nocturn,
      lessonNumber,
      responsoryNumber: lessonNumber,
      incipit: responsoryLines.find(line => line.startsWith('℟.')) || responsoryLines[0],
      versicle: responsoryLines.find(line => line.startsWith('℣.')),
      response: responsoryLines.findLast(line => line.startsWith('℟.')),
      gloriaPatriIncluded: hasGloriaPatri(responsoryLines),
      finalRepetitionIncluded: responsoryLines.filter(line => line.startsWith('℟.')).length > 1,
      specialStructure: specialStructure(exported),
    }))
  }
  if (teDeumLines.length) {
    result.push(block(exported, raw, 'te-deum', 'te-deum', 'Te Deum', teDeumLines, {
      included: true,
      nocturn,
      afterLessonNumber: lessonNumber,
    }))
  }
  return result
}

function block(
  exported: ExportedOfficeHour,
  raw: string,
  type: LiturgicalBlockType,
  key: string,
  title: string | undefined,
  text: string[],
  metadata: Record<string, unknown> = {},
  rubricLines: string[] = [],
): LiturgicalBlock {
  const id = `office-1962-${exported.date}-${exported.hour}-${key}`
  const cleanText = text.filter(line => title ? line !== title : true).map(line => normalizeLatinTechnical(line))
  return {
    id,
    type,
    title,
    text: cleanText,
    verses: metadata.verses as string[] | undefined,
    rubricLines,
    metadata: Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined)),
    sourceRefs: sourceRefsFor(exported, raw, type, title, cleanText),
    warnings: type === 'unknown'
      ? [{ code: 'unknown-matutinum-block-type', message: `Could not classify Matutinum block ${id}`, severity: 'warning' }]
      : [],
  }
}

function sourceRefsFor(exported: ExportedOfficeHour, raw: string, type: LiturgicalBlockType, title: string | undefined, text: string[]): SourceRef[] {
  const base = { upstreamCommit: exported.upstreamCommit }
  const refs: SourceRef[] = [{
    ...base,
    path: ORDINARY_MATUTINUM,
    section: title || firstRawHeading(raw) || 'expanded unit',
    transformation: ['getordinarium', 'specials', 'parse-matutinum-block'],
  }]
  const psalm = psalmNumber(title || text[0] || '') || psalmNumberFromRaw(raw)
  if (type === 'psalm' && psalm) {
    refs.push({ ...base, path: `${PSALM_PATH}/Psalm${psalm}.txt`, section: `Psalm ${psalm}`, transformation: ['resolve_refs', 'psalm expansion'] })
  }
  if (type === 'invitatory') {
    refs.push({ ...base, path: MATUTINUM_SPECIAL, section: 'Invitatorium', transformation: ['invitatorium', 'resolve_refs'] })
    refs.push({ ...base, path: 'web/www/horas/Latin/Psalterium/Invitatorium.txt', section: 'Psalmus 94', transformation: ['invitatorium', 'psalm 94 expansion'] })
  }
  if (['hymn', 'antiphon', 'versicle', 'matins-responsory'].includes(type)) {
    refs.push({ ...base, path: MATUTINUM_SPECIAL, section: title || type, transformation: ['specials', 'matutinum special text'] })
  }
  if (['absolution', 'blessing'].includes(type)) {
    refs.push({ ...base, path: BENEDICTIONS, section: title || type, transformation: ['lectiones', 'benedictions'] })
  }
  if (type === 'reading') {
    refs.push(...readingSourceRefs(exported, raw, text))
  }
  if (['dialogue', 'prayer', 'te-deum'].includes(type)) {
    refs.push({ ...base, path: COMMON_PRAYERS, section: type === 'te-deum' ? 'Te Deum' : sourceSectionFromRaw(raw, title), transformation: ['resolve_refs', 'common prayers'] })
  }
  return refs
}

function readingSourceRefs(exported: ExportedOfficeHour, raw: string, text: string[]): SourceRef[] {
  const base = { upstreamCommit: exported.upstreamCommit }
  const kind = classifyReading(text, exported)
  const section = text.find(line => /^Lectio \d+/.test(line)) || raw.match(/&lectio\((\d+)\)/)?.[0] || 'Lectio'
  const paths = kind === 'scripture'
    ? [TEMPORA_PATH]
    : kind === 'hagiographic'
      ? [SANCTI_PATH, COMMUNE_PATH]
      : kind === 'homily' || kind === 'patristic'
        ? [TEMPORA_PATH, COMMUNE_PATH, SANCTI_PATH]
        : [TEMPORA_PATH, SANCTI_PATH, COMMUNE_PATH]
  return paths.map(path => ({
    ...base,
    path,
    section,
    transformation: ['lectiones', `classify-${kind}`, 'resolved by Divinum Officium Perl'],
  }))
}

function htmlToLines(html: string): string[] {
  return normalizeLatinTechnical(html)
    .replace(/<br\/?>/gi, '\n')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\{::\}/g, '')
    .split('\n')
    .map(line => normalizeLatinTechnical(line))
    .filter(line => Boolean(line) && line !== '>')
}

function firstRawHeading(raw: string): string | undefined {
  const first = raw.split(/\r?\n/).find(line => line.trim())
  if (!first?.startsWith('#'))
    return undefined
  return first.replace(/^#+/, '').trim()
}

function isOmittedHeading(heading: string | undefined): boolean {
  return Boolean(heading?.includes('{omittitur}'))
}

function ensureNocturn(state: MatutinumState, number: 1 | 2 | 3): void {
  if (!state.nocturns.some(nocturn => nocturn.number === number))
    state.nocturns.push({ number, psalmBlockIds: [], lessonBlockIds: [], responsoryBlockIds: [] })
}

function currentNocturn(state: MatutinumState): MatutinumState['nocturns'][number] {
  ensureNocturn(state, state.currentNocturn)
  return state.nocturns.find(nocturn => nocturn.number === state.currentNocturn)!
}

function romanToNocturn(value: string): 1 | 2 | 3 {
  if (value.includes('III'))
    return 3
  if (value.includes('II'))
    return 2
  return 1
}

function officeForm(exported: ExportedOfficeHour): string {
  const title = exported.liturgicalTitle
  if (title.includes('Defunctorum'))
    return 'requiem'
  if (title.includes('Cena Domini') || title.includes('Parasceve') || title.includes('Sabbato Sancto'))
    return 'triduum'
  if (title.includes('Vigilia'))
    return 'vigil'
  if (title.includes('Dominica'))
    return 'sunday'
  if (title.includes('Feria'))
    return 'ferial'
  if (title.includes('classis'))
    return 'festal'
  return 'special'
}

function specialStructure(exported: ExportedOfficeHour): string {
  if (exported.liturgicalTitle.includes('Defunctorum'))
    return 'defunctorum'
  if (exported.liturgicalTitle.includes('Cena Domini') || exported.liturgicalTitle.includes('Parasceve') || exported.liturgicalTitle.includes('Sabbato Sancto'))
    return 'sacred-triduum'
  if (exported.liturgicalTitle.includes('Resurrectionis'))
    return 'easter'
  return 'special'
}

function sourceClassifications(blocks: LiturgicalBlock[]): string[] {
  return Array.from(new Set(blocks.flatMap(block => block.sourceRefs.map(ref => ref.path.split('/Latin/').at(-1) || ref.path))))
}

function classifyReading(lines: string[], exported: ExportedOfficeHour): string {
  const joined = lines.join('\n')
  if (/Léctio sancti Evangélii|Homilía/i.test(joined))
    return 'homily'
  if (/Sermo sancti|Ex libro|Tractátus|Homilía|Oratio \d/i.test(joined))
    return 'patristic'
  if (/^\d?\s?[A-Z][a-z]+\s+\d+:\d+/m.test(joined) || /De libro/i.test(joined))
    return 'scripture'
  if (exported.liturgicalTitle.includes('Defunctorum'))
    return 'special'
  if (exported.liturgicalTitle.includes('S. ') || exported.liturgicalTitle.includes('Beatæ'))
    return 'hagiographic'
  return 'common'
}

function authorLine(lines: string[]): string | undefined {
  return lines.find(line => /sancti|beáti|Sermo|Homilía/i.test(line) && !/^Lectio/.test(line))
}

function workTitleLine(lines: string[]): string | undefined {
  return lines.find(line => /lib\.|cap\.|tract\.|homil\.|Oratio/i.test(line))
}

function psalmNumber(title: string): string | undefined {
  return title.match(/Psalmus\s+(\d+)/)?.[1]
}

function psalmNumberFromRaw(raw: string): string | undefined {
  return raw.match(/&psalm\((\d+)/)?.[1]
}

function psalmSegment(title: string): string | undefined {
  return title.match(/\(([^)]+)\)/)?.[1]
}

function psalmBlockId(title: string, raw = ''): string {
  const number = psalmNumber(title) || psalmNumberFromRaw(raw) || 'unknown'
  const ordinal = title.match(/\[(\d+)\]/)?.[1] || '1'
  const segment = psalmSegment(title)?.replace(/\W+/g, '-') || 'full'
  return `matutinum-psalm-${number}-${segment}-${ordinal}`
}

function hasGloriaPatri(lines: string[]): boolean {
  return lines.some(line => line.includes('Glória Patri'))
}

function stanzas(lines: string[]): string[][] {
  return lines.join('\n').split('\n_\n').map(stanza => stanza.split('\n').filter(Boolean))
}

function sourceSectionFromRaw(raw: string, title: string | undefined): string {
  const tokens = raw.match(/[$&][A-Za-z0-9_ ]+/g)?.map(token => token.slice(1).trim()) || []
  return tokens[0] || title || 'common prayer'
}

function slugify(value: string): string {
  return normalizeLatinTechnical(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
