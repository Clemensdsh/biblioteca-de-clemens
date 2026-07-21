import type { ExportedOfficeHour, LiturgicalBlock, LiturgicalBlockType, MajorHourMetadata, MajorHourName, MinorHourName, MinorHourMetadata, Office1962Day, OfficeHour, SourceRef } from './schema.ts'
import { normalizeLatinTechnical } from './normalizeLatin.ts'
import { parseMatutinum } from './parsers/matutinum/parseMatutinum.ts'

const ORDINARY_COMPLETORIUM = 'web/www/horas/Ordinarium/Completorium.txt'
const ORDINARY_LAUDES = 'web/www/horas/Ordinarium/Laudes.txt'
const ORDINARY_MINOR = 'web/www/horas/Ordinarium/Minor.txt'
const ORDINARY_PRIMA = 'web/www/horas/Ordinarium/Prima.txt'
const ORDINARY_VESPERAE = 'web/www/horas/Ordinarium/Vespera.txt'
const COMMON_PRAYERS = 'web/www/horas/Latin/Psalterium/Common/Prayers.txt'
const COMMON_RUBRICS = 'web/www/horas/Latin/Psalterium/Common/Rubricae.txt'
const MAJOR_SPECIAL = 'web/www/horas/Latin/Psalterium/Special/Major Special.txt'
const MINOR_SPECIAL = 'web/www/horas/Latin/Psalterium/Special/Minor Special.txt'
const PRIMA_SPECIAL = 'web/www/horas/Latin/Psalterium/Special/Prima Special.txt'
const PSALM_PATH = 'web/www/horas/Latin/Psalterium/Psalmorum'
const MARTYROLOGY_PATH = 'web/www/horas/Latin/Martyrologium'
const majorHourNames = ['laudes', 'vesperae'] as const
const minorHourNames = ['tertia', 'sexta', 'nona'] as const

export function buildOffice1962DayFromExport(exported: ExportedOfficeHour): Office1962Day {
  const hour = parseExportedOfficeHour(exported)

  return {
    schemaVersion: '0.2.0',
    engineVersion: exported.engineVersion,
    language: exported.language,
    date: exported.date,
    liturgicalTitle: exported.liturgicalTitle,
    rank: exported.rank,
    commemorations: [],
    hours: {
      [exported.hour]: hour,
    },
    sourceRefs: exported.sourceRefs,
    warnings: hour.warnings,
  }
}

export function parseExportedOfficeHour(exported: ExportedOfficeHour): OfficeHour {
  if (exported.hour === 'matutinum')
    return parseMatutinum(exported)
  if (isMajorHourName(exported.hour))
    return parseMajorHour(exported)
  if (isMinorHourName(exported.hour))
    return parseMinorHour(exported)
  if (exported.hour === 'prima')
    return parsePrima(exported)
  if (exported.hour !== 'completorium')
    throw new Error(`Phase 5 parser supports Matutinum, Completorium, Laudes, Tertia, Sexta, Nona, Prima, and Vesperae; received ${exported.hour}`)

  const blocks: LiturgicalBlock[] = []

  for (const unit of exported.units) {
    const heading = firstRawHeading(unit.raw)
    const lines = htmlToLines(unit.html)
    const raw = unit.raw

    switch (heading) {
      case 'Incipit':
        blocks.push(block(exported, raw, 'blessing', 'incipit', 'Incipit', lines, {
          formula: 'private-opening-blessing',
        }))
        break
      case 'Lectio brevis':
        blocks.push(block(exported, raw, 'reading', 'lectio-brevis', heading, lines, readingMetadata(lines)))
        break
      case undefined:
        blocks.push(...parseUntitledUnit(exported, raw, lines))
        break
      case 'Psalmi':
      case 'Psalmi{ex Psalterio secundum diem}':
      case 'Psalmi{ex Psalterio secundum tempora}':
      case 'Psalmi{Psalmi et Antiphona de Dominica}':
        blocks.push(...parsePsalmUnit(exported, raw, lines, 'psalmody-1'))
        break
      case 'Hymnus':
        blocks.push(block(exported, raw, 'hymn', 'hymnus', heading, lines, hymnMetadata(lines)))
        break
      case 'Hymnus{omittitur}':
        blocks.push(block(exported, raw, 'rubric', 'hymnus-omittitur', 'Hymnus omittitur', lines, {
          omitted: true,
          specialStructure: 'easter',
        }))
        break
      case 'Capitulum Responsorium Versus':
        blocks.push(...parseCapitulumResponsoryVersus(exported, raw, lines))
        break
      case 'Canticum: Nunc dimittis':
        blocks.push(...parseCanticleUnit(exported, raw, lines))
        break
      case 'Oratio':
        blocks.push(block(exported, raw, 'prayer', 'oratio', heading, lines, {
          prayerKey: 'oratio_Visita',
        }))
        break
      case 'Conclusio':
        blocks.push(...parseConclusio(exported, raw, lines))
        break
      case 'Antiphona finalis B.M.V.':
        blocks.push(...parseMarianAntiphon(exported, raw, lines))
        break
      default:
        blocks.push(block(exported, raw, 'unknown', slugify(heading), heading, lines))
    }
  }

  const warnings = [
    ...exported.warnings,
    ...blocks.flatMap(item => item.warnings),
  ]

  return {
    name: exported.hour,
    title: 'Completorium',
    blocks,
    sourceRefs: exported.sourceRefs,
    warnings,
  }
}

export function blockPlainText(block: LiturgicalBlock): string {
  return normalizeLatinTechnical([
    block.title,
    ...block.text,
  ].filter(Boolean).join('\n'))
}

function parseMajorHour(exported: ExportedOfficeHour): OfficeHour {
  const blocks: LiturgicalBlock[] = []
  let psalmodyIndex = 0

  for (const unit of exported.units) {
    const heading = firstRawHeading(unit.raw)
    const lines = htmlToLines(unit.html)
    const raw = unit.raw

    if (isOmittedHeading(heading)) {
      blocks.push(omittedBlock(exported, raw, heading, lines))
    }
    else if (heading === 'Incipit') {
      blocks.push(block(exported, raw, 'dialogue', 'incipit', 'Incipit', lines, {
        includesGloriaPatri: hasGloriaPatri(lines),
        includesAlleluia: lines.some(line => line.includes('Allelu')),
      }))
    }
    else if (isPsalmodyHeading(heading)) {
      const hasPsalmody = firstPsalmOrCanticleIndex(lines) >= 0
      if (hasPsalmody) {
        psalmodyIndex += 1
        blocks.push(...parsePsalmUnit(exported, raw, lines, `psalmody-${psalmodyIndex}`))
      }
      else {
        blocks.push(emptyMajorSectionBlock(exported, raw, heading, lines, 'psalmi'))
      }
    }
    else if (!heading && raw.trim().startsWith('&psalm(')) {
      psalmodyIndex += 1
      const psalmTitle = lines.find(line => line.startsWith('Psalmus ') || line.startsWith('Canticum ')) || 'Psalmus'
      blocks.push(...parsePsalmUnit(exported, raw, lines, psalmBlockId(psalmTitle, raw)))
    }
    else if (!heading && firstPsalmOrCanticleIndex(lines) >= 0) {
      psalmodyIndex += 1
      const psalmTitle = lines.find(line => line.startsWith('Psalmus ') || line.startsWith('Canticum ')) || 'Psalmus'
      blocks.push(...parsePsalmUnit(exported, raw, lines, psalmBlockId(psalmTitle, raw)))
    }
    else if (!heading && raw.trim().startsWith('!')) {
      blocks.push(block(exported, raw, 'rubric', `rubric-${unit.id.slice(-3)}`, undefined, lines, {
        sourceKind: 'ordinary',
        specialStructure: 'easter',
      }, lines))
    }
    else if (heading?.startsWith('Versus (In loco Capituli)')) {
      blocks.push(block(exported, raw, lines.some(line => line.startsWith('Ant. ')) ? 'antiphon' : 'versicle', 'versus-in-loco-capituli', heading, lines, {
        replacesCapitulum: true,
        specialStructure: exported.liturgicalTitle.includes('Resurrectionis') ? 'easter' : 'special',
      }))
    }
    else if (heading?.startsWith('Capitulum Hymnus Versus') || heading?.startsWith('Capitulum Responsorium Hymnus Versus')) {
      blocks.push(...parseCapitulumHymnusVersus(exported, raw, lines, heading))
    }
    else if (heading === 'Hymnus') {
      const hymnLines = lines.filter(line => line !== 'Hymnus')
      if (hymnLines.length)
        blocks.push(block(exported, raw, 'hymn', 'hymnus', heading, lines, hymnMetadata(lines)))
      else
        blocks.push(emptyMajorSectionBlock(exported, raw, heading, lines, 'hymnus'))
    }
    else if (heading?.startsWith('Canticum: Benedictus') || heading?.startsWith('Canticum: Magnificat')) {
      blocks.push(...parseGospelCanticle(exported, raw, lines, heading))
    }
    else if (heading?.startsWith('Oratio')) {
      blocks.push(...parseMajorOratio(exported, raw, lines, heading))
    }
    else if (heading?.startsWith('Suffragium')) {
      blocks.push(block(exported, raw, 'commemoration', 'suffragium', heading, lines, {
        sourceKind: 'ordinary',
        suffrage: true,
      }))
    }
    else if (heading === 'Conclusio') {
      blocks.push(block(exported, raw, 'blessing', 'conclusio', heading, lines, {
        formula: 'major-hour-conclusion',
      }))
    }
    else {
      blocks.push(block(exported, raw, 'unknown', slugify(heading || `unit-${unit.id}`), heading, lines))
    }
  }

  const metadata = majorHourMetadata(exported.hour as MajorHourName, blocks)
  for (const item of blocks)
    item.metadata = { ...(item.metadata || {}), majorHour: metadata }

  return {
    name: exported.hour,
    title: hourTitle(exported.hour),
    metadata,
    blocks,
    sourceRefs: exported.sourceRefs,
    warnings: [
      ...exported.warnings,
      ...blocks.flatMap(item => item.warnings),
    ],
  }
}

function parseMinorHour(exported: ExportedOfficeHour): OfficeHour {
  const blocks: LiturgicalBlock[] = []
  for (const unit of exported.units) {
    const heading = firstRawHeading(unit.raw)
    const lines = htmlToLines(unit.html)
    const raw = unit.raw

    if (isOmittedHeading(heading)) {
      blocks.push(omittedBlock(exported, raw, heading, lines))
    }
    else if (heading === 'Incipit') {
      blocks.push(block(exported, raw, 'dialogue', 'incipit', 'Incipit', lines, {
        includesGloriaPatri: hasGloriaPatri(lines),
        includesAlleluia: lines.some(line => line.includes('Allelúja')),
      }))
    }
    else if (heading === 'Hymnus') {
      blocks.push(block(exported, raw, 'hymn', 'hymnus', 'Hymnus', lines, hymnMetadata(lines)))
    }
    else if (isPsalmodyHeading(heading)) {
      blocks.push(...parsePsalmUnit(exported, raw, lines, 'psalmody-1'))
    }
    else if (!heading && isDefunctorumSpecial(raw)) {
      blocks.push(parseDefunctorumSpecial(exported, raw, lines))
    }
    else if (!heading && raw.includes("'#Martyrologium'")) {
      blocks.push(block(exported, raw, 'martyrology', 'martyrologium-anticipatum', 'Martyrologium', lines, {
        anticipated: true,
        sourceKind: 'divinum-officium-latin-martyrologium',
        isolatedFromExistingMartyrologyPage: true,
        specialStructure: 'defunctorum',
      }))
    }
    else if (!heading && raw.trim().startsWith('&psalm(')) {
      const psalmTitle = lines.find(line => line.startsWith('Psalmus ')) || 'Psalmus'
      blocks.push(...parsePsalmUnit(exported, raw, lines, psalmBlockId(psalmTitle)))
    }
    else if (heading?.startsWith('Capitulum Responsorium Versus')) {
      blocks.push(...parseCapitulumResponsoryVersus(exported, raw, lines))
    }
    else if (heading?.startsWith('Versus (In loco Capituli)')) {
      blocks.push(block(exported, raw, 'antiphon', 'versus-in-loco-capituli', heading, lines, {
        replacesCapitulum: true,
        specialStructure: 'easter',
      }))
    }
    else if (heading?.startsWith('Oratio')) {
      blocks.push(block(exported, raw, 'prayer', 'oratio', heading, lines, {
        sourceKind: heading.includes('Proprio') ? 'proper' : 'ordinary',
      }))
    }
    else if (heading === 'Conclusio') {
      blocks.push(block(exported, raw, 'blessing', 'conclusio', 'Conclusio', lines, {
        formula: 'minor-hour-conclusion',
      }))
    }
    else {
      blocks.push(block(exported, raw, 'unknown', slugify(heading || `unit-${unit.id}`), heading, lines))
    }
  }

  const metadata = minorHourMetadata(exported.hour as MinorHourName, blocks)
  for (const item of blocks)
    item.metadata = { ...(item.metadata || {}), minorHour: metadata }

  return {
    name: exported.hour,
    title: hourTitle(exported.hour),
    blocks,
    sourceRefs: exported.sourceRefs,
    warnings: [
      ...exported.warnings,
      ...blocks.flatMap(item => item.warnings),
    ],
  }
}

function parsePrima(exported: ExportedOfficeHour): OfficeHour {
  const blocks: LiturgicalBlock[] = []
  for (const unit of exported.units) {
    const heading = firstRawHeading(unit.raw)
    const lines = htmlToLines(unit.html)
    const raw = unit.raw

    if (isOmittedHeading(heading)) {
      blocks.push(omittedBlock(exported, raw, heading, lines))
    }
    else if (heading === 'Incipit') {
      blocks.push(block(exported, raw, 'dialogue', 'incipit', 'Incipit', lines, {
        includesGloriaPatri: hasGloriaPatri(lines),
        includesAlleluia: lines.some(line => line.includes('Allelúja')),
      }))
    }
    else if (heading === 'Hymnus') {
      blocks.push(block(exported, raw, 'hymn', 'hymnus', 'Hymnus', lines, hymnMetadata(lines)))
    }
    else if (isPsalmodyHeading(heading)) {
      blocks.push(...parsePsalmUnit(exported, raw, lines, 'psalmody-1'))
    }
    else if (!heading && isDefunctorumSpecial(raw)) {
      blocks.push(parseDefunctorumSpecial(exported, raw, lines))
    }
    else if (!heading && raw.includes("'#Martyrologium'")) {
      blocks.push(block(exported, raw, 'martyrology', 'martyrologium-anticipatum', 'Martyrologium', lines, {
        anticipated: true,
        sourceKind: 'divinum-officium-latin-martyrologium',
        isolatedFromExistingMartyrologyPage: true,
        specialStructure: 'defunctorum',
      }))
    }
    else if (!heading && raw.trim().startsWith('&psalm(')) {
      const psalmTitle = lines.find(line => line.startsWith('Psalmus ')) || 'Psalmus'
      blocks.push(...parsePsalmUnit(exported, raw, lines, psalmBlockId(psalmTitle)))
    }
    else if (heading?.startsWith('Capitulum Responsorium Versus')) {
      blocks.push(...parseCapitulumResponsoryVersus(exported, raw, lines))
    }
    else if (heading?.startsWith('Versus (In loco Capituli)')) {
      blocks.push(block(exported, raw, 'antiphon', 'versus-in-loco-capituli', heading, lines, {
        replacesCapitulum: true,
        specialStructure: 'easter',
      }))
    }
    else if (heading?.startsWith('Oratio')) {
      blocks.push(...parsePrimaOratio(exported, raw, lines))
    }
    else if (heading?.startsWith('Martyrologium')) {
      blocks.push(block(exported, raw, 'martyrology', 'martyrologium-anticipatum', heading, lines, {
        anticipated: true,
        sourceKind: 'divinum-officium-latin-martyrologium',
        isolatedFromExistingMartyrologyPage: true,
      }))
    }
    else if (!heading && raw.trim().startsWith('$Pretiosa')) {
      blocks.push(block(exported, raw, 'pretiosa', 'pretiosa', 'Pretiosa', lines, {
        formula: 'pretiosa',
      }))
    }
    else if (heading === 'De Officio Capituli') {
      blocks.push(block(exported, raw, 'chapter-office', 'officium-capituli', heading, lines, {
        includesTripleDeusInAdjutorium: lines.filter(line => line.includes('Deus in adjutórium')).length === 3,
        includesKyrie: lines.some(line => line.includes('Kýrie')),
      }, extractRubricLines(lines)))
    }
    else if (heading?.startsWith('Lectio brevis')) {
      blocks.push(block(exported, raw, 'reading', 'lectio-brevis', heading, lines, {
        ...readingMetadata(lines),
        includesBenediction: lines.some(line => line.startsWith('Benedictio.')),
      }))
    }
    else if (heading === 'Conclusio') {
      blocks.push(block(exported, raw, 'blessing', 'conclusio', heading, lines, {
        formula: 'prima-final-blessing',
      }))
    }
    else {
      blocks.push(block(exported, raw, 'unknown', slugify(heading || `unit-${unit.id}`), heading, lines))
    }
  }

  return {
    name: exported.hour,
    title: 'Prima',
    blocks,
    sourceRefs: exported.sourceRefs,
    warnings: [
      ...exported.warnings,
      ...blocks.flatMap(item => item.warnings),
    ],
  }
}

function parseUntitledUnit(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock[] {
  if (raw.trim().startsWith('$Confiteor')) {
    return [block(exported, raw, 'dialogue', 'defunctorum-confiteor', 'Confiteor', lines, {
      specialStructure: 'defunctorum',
      includesConfiteor: lines.some(line => line.startsWith('Confíteor ')),
      ordinaryOpeningOmitted: true,
    }, extractRubricLines(lines))]
  }

  if (raw.includes("Oratio mortuorum1")) {
    return [block(exported, raw, 'prayer', 'oratio-mortuorum', 'Oratio defunctorum', lines, {
      specialStructure: 'defunctorum',
      prayerKey: 'Oratio mortuorum1',
    }, extractRubricLines(lines))]
  }

  if (raw.includes("&special('Conclusio'")) {
    return [block(exported, raw, 'blessing', 'conclusio-defunctorum', 'Conclusio defunctorum', lines, {
      specialStructure: 'defunctorum',
      formula: 'requiem-aeternam',
    })]
  }

  if (raw.includes('Completorium singulare')) {
    return [block(exported, raw, 'dialogue', 'completorium-singulare-confiteor', 'Completorium singulare', lines, {
      specialStructure: 'sacred-triduum',
      includesConfiteor: lines.some(line => line.startsWith('Confíteor ')),
      ordinaryOpeningOmitted: true,
    }, extractRubricLines(lines))]
  }

  if (raw.trim().startsWith('&psalm(233)')) {
    return [block(exported, raw, 'canticle', 'nunc-dimittis', 'Canticum Simeonis', lines, {
      canticle: 'Nunc dimittis',
      source: 'Luc. 2:29-32',
      verses: lines.filter(line => /^\d+:\d+/.test(line)),
      includesGloriaPatri: hasGloriaPatri(lines),
      gloriaPatriOmitted: lines.some(line => line.includes('Gloria omittitur')),
      includesRequiemAeternam: lines.some(line => line.includes('Réquiem ætérnam')),
      specialStructure: exported.liturgicalTitle.includes('Defunctorum') ? 'defunctorum' : 'sacred-triduum',
    })]
  }

  if (raw.includes('Christus factus est')) {
    return [block(exported, raw, 'prayer', 'triduum-silent-ending', 'Conclusio sub silentio', lines, {
      specialStructure: 'sacred-triduum',
      includesPaterNoster: lines.some(line => line.startsWith('Pater noster')),
      silentConclusion: true,
    }, extractRubricLines(lines))]
  }

  if (raw.trim().startsWith('&psalm(')) {
    const psalmTitle = lines.find(line => line.startsWith('Psalmus ')) || 'Psalmus'
    return parsePsalmUnit(exported, raw, lines, psalmBlockId(psalmTitle))
  }

  if (raw.includes('$Adjutorium nostrum')) {
    return [block(exported, raw, 'dialogue', 'confiteor-converte-nos', 'Confiteor et Converte nos', lines, {
      privateRecitation: true,
      includesConfiteor: lines.some(line => line.startsWith('Confíteor ')),
      includesConverteNos: lines.some(line => line.includes('Convérte nos')),
    }, extractRubricLines(lines))]
  }

  if (raw.includes('$Deus in adjutorium')) {
    return [block(exported, raw, 'dialogue', 'deus-in-adjutorium', 'Deus in adjutorium', lines, {
      includesGloriaPatri: hasGloriaPatri(lines),
      includesAlleluia: lines.some(line => line.includes('Allelúja')),
    })]
  }

  return [block(exported, raw, 'unknown', `untitled-${hashText(raw).slice(0, 8)}`, undefined, lines)]
}

function parsePsalmUnit(exported: ExportedOfficeHour, raw: string, lines: string[], fallbackKey: string): LiturgicalBlock[] {
  const blocks: LiturgicalBlock[] = []
  const firstAntiphonIndex = lines.findIndex(line => line.startsWith('Ant. '))
  const psalmStart = firstPsalmOrCanticleIndex(lines)
  const closingAntiphonIndex = lines.findLastIndex(line => line.startsWith('Ant. '))
  const openingAntiphon = firstAntiphonIndex > -1 && firstAntiphonIndex < psalmStart ? lines[firstAntiphonIndex] : undefined

  if (openingAntiphon && psalmStart > -1) {
    blocks.push(block(exported, raw, 'antiphon', `${fallbackKey}-antiphon-open`, 'Antiphona', [openingAntiphon], {
      position: 'before-psalmody',
      repeated: closingAntiphonIndex > psalmStart,
      antiphonKey: normalizeAntiphonKey(openingAntiphon),
    }))
  }

  const psalmLines = closingAntiphonIndex > psalmStart && closingAntiphonIndex !== lines.indexOf(openingAntiphon || '')
    ? lines.slice(psalmStart, closingAntiphonIndex)
    : lines.slice(psalmStart)
  const psalmTitle = psalmLines[0] || 'Psalmus'
  const psalmSourceNumber = psalmNumber(psalmTitle) || psalmNumberFromRaw(raw)
  const blockType = psalmTitle.startsWith('Canticum ') ? 'canticle' : 'psalm'
  blocks.push(block(exported, raw, blockType, psalmBlockId(psalmTitle, raw), psalmTitle, psalmLines.slice(1), {
    canticle: blockType === 'canticle' ? psalmTitle : undefined,
    psalmNumber: psalmNumber(psalmTitle),
    psalmSourceNumber,
    segment: psalmSegment(psalmTitle),
    verses: psalmLines.filter(line => /^\d+:\d+/.test(line)),
    includesGloriaPatri: hasGloriaPatri(psalmLines),
    gloriaPatriOmitted: psalmLines.some(line => line.includes('Gloria omittitur')),
    includesRequiemAeternam: psalmLines.some(line => line.includes('Réquiem ætérnam')),
    antiphonKey: openingAntiphon ? normalizeAntiphonKey(openingAntiphon) : undefined,
  }))

  const closingAntiphon = closingAntiphonIndex > psalmStart ? lines[closingAntiphonIndex] : undefined
  if (closingAntiphon) {
    blocks.push(block(exported, raw, 'antiphon', `${fallbackKey}-antiphon-close`, 'Antiphona repetita', [closingAntiphon], {
      position: 'after-psalmody',
      repeated: true,
      antiphonKey: normalizeAntiphonKey(closingAntiphon),
    }))
  }

  return blocks
}

function parseCapitulumResponsoryVersus(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock[] {
  const bodyLines = lines.filter(line => line !== 'Capitulum Responsorium Versus')
  const dividerIndexes = indexesOf(bodyLines, '_')
  const firstDivider = dividerIndexes[0] ?? 3
  const secondDivider = dividerIndexes[1] ?? bodyLines.length
  const capitulumLines = bodyLines.slice(0, firstDivider)
  const responsoryLines = bodyLines.slice(firstDivider + 1, secondDivider)
  const versicleLines = bodyLines.slice(secondDivider + 1)

  return [
    block(exported, raw, 'capitulum', 'capitulum', 'Capitulum', capitulumLines, readingMetadata(capitulumLines)),
    block(exported, raw, 'responsory', 'responsorium-breve', 'Responsorium breve', responsoryLines, responsoryMetadata(responsoryLines)),
    block(exported, raw, 'versicle', 'versus-custodi-nos', 'Versus', versicleLines, {
      versicle: versicleLines.find(line => line.startsWith('℣.')),
      response: versicleLines.find(line => line.startsWith('℟.')),
    }),
  ]
}

function parseCapitulumHymnusVersus(exported: ExportedOfficeHour, raw: string, lines: string[], heading: string): LiturgicalBlock[] {
  const bodyLines = lines.filter(line => line !== heading)
  const hymnIndex = bodyLines.findIndex(line => line === 'Hymnus')
  const dividerIndexes = indexesOf(bodyLines, '_')
  const firstDivider = dividerIndexes[0] ?? (hymnIndex > -1 ? hymnIndex : bodyLines.length)
  const lastDivider = dividerIndexes.at(-1) ?? bodyLines.length
  const capitulumLines = bodyLines.slice(0, firstDivider)
  const betweenFirstAndHymn = hymnIndex > firstDivider
    ? bodyLines.slice(firstDivider + 1, hymnIndex)
    : []
  const hymnLines = hymnIndex > -1
    ? bodyLines.slice(hymnIndex, lastDivider > hymnIndex ? lastDivider : bodyLines.length)
    : []
  const versicleLines = lastDivider < bodyLines.length - 1
    ? bodyLines.slice(lastDivider + 1)
    : []

  const blocks: LiturgicalBlock[] = []
  if (capitulumLines.length) {
    blocks.push(block(exported, raw, 'capitulum', 'capitulum', 'Capitulum', capitulumLines, {
      ...readingMetadata(capitulumLines),
      sourceKind: heading.includes('Proprio') ? 'proper' : 'ordinary',
    }))
  }
  if (betweenFirstAndHymn.length) {
    blocks.push(block(exported, raw, 'responsory', 'responsorium-breve', 'Responsorium breve', betweenFirstAndHymn, responsoryMetadata(betweenFirstAndHymn)))
  }
  if (hymnLines.length) {
    blocks.push(block(exported, raw, 'hymn', 'hymnus', 'Hymnus', hymnLines, hymnMetadata(hymnLines)))
  }
  if (versicleLines.length) {
    blocks.push(block(exported, raw, 'versicle', 'versus', 'Versus', versicleLines, {
      versicle: versicleLines.find(line => line.startsWith('℣.')),
      response: versicleLines.find(line => line.startsWith('℟.')),
    }))
  }
  return blocks.length
    ? blocks
    : [emptyMajorSectionBlock(exported, raw, heading, lines, slugify(heading))]
}

function parseGospelCanticle(exported: ExportedOfficeHour, raw: string, lines: string[], heading: string): LiturgicalBlock[] {
  const isBenedictus = heading.startsWith('Canticum: Benedictus')
  const canticleKey = isBenedictus ? 'benedictus' : 'magnificat'
  const canticleTitle = isBenedictus ? 'Canticum Zachariae' : 'Canticum B. Mariae Virginis'
  const source = isBenedictus ? 'Luc. 1:68-79' : 'Luc. 1:46-55'
  const openingAntiphon = lines.find(line => line.startsWith('Ant. '))
  const canticleStart = lines.findIndex(line => line.startsWith('Canticum '))
  const closingAntiphonIndex = lines.findLastIndex(line => line.startsWith('Ant. '))
  const canticleLines = canticleStart >= 0
    ? lines.slice(canticleStart, closingAntiphonIndex > canticleStart ? closingAntiphonIndex : undefined)
    : []
  const antiphonKey = openingAntiphon ? normalizeAntiphonKey(openingAntiphon) : canticleKey

  return [
    block(exported, raw, 'antiphon', `${canticleKey}-antiphon-open`, `Antiphona ad ${canticleKey}`, openingAntiphon ? [openingAntiphon] : [], {
      position: 'before-canticle',
      repeated: true,
      antiphonKey,
      sourceKind: heading.includes('Proprio') ? 'proper' : 'ordinary',
    }),
    block(exported, raw, 'canticle', canticleKey, canticleTitle, canticleLines.slice(1), {
      canticle: canticleKey,
      source,
      verses: canticleLines.filter(line => /^\d+:\d+/.test(line)),
      includesGloriaPatri: hasGloriaPatri(canticleLines),
      antiphonKey,
      sourcePsalm: isBenedictus ? '231' : '232',
    }),
    block(exported, raw, 'antiphon', `${canticleKey}-antiphon-close`, `Antiphona repetita ad ${canticleKey}`, closingAntiphonIndex > canticleStart ? [lines[closingAntiphonIndex]] : [], {
      position: 'after-canticle',
      repeated: true,
      antiphonKey,
      sourceKind: heading.includes('Proprio') ? 'proper' : 'ordinary',
    }),
  ]
}

function parseMajorOratio(exported: ExportedOfficeHour, raw: string, lines: string[], heading: string): LiturgicalBlock[] {
  const bodyLines = lines.filter(line => line !== heading)
  const commemorationIndexes = bodyLines
    .map((line, index) => line.startsWith('Commemoratio ') ? index : -1)
    .filter(index => index >= 0)

  if (!commemorationIndexes.length) {
    return [block(exported, raw, 'prayer', 'oratio', heading, lines, {
      sourceKind: heading.includes('Proprio') ? 'proper' : 'ordinary',
      includesBenedicamusDomino: lines.some(line => line.includes('Benedicamus') || line.includes('Benedicámus')),
    })]
  }

  const blocks: LiturgicalBlock[] = []
  const mainLines = bodyLines.slice(0, commemorationIndexes[0])
  if (mainLines.length) {
    blocks.push(block(exported, raw, 'prayer', 'oratio', heading, mainLines, {
      sourceKind: heading.includes('Proprio') ? 'proper' : 'ordinary',
    }))
  }

  for (let index = 0; index < commemorationIndexes.length; index += 1) {
    const start = commemorationIndexes[index]
    const end = commemorationIndexes[index + 1] ?? bodyLines.length
    const commemorationLines = bodyLines.slice(start, end)
    const title = commemorationLines[0] || 'Commemoratio'
    blocks.push(block(exported, raw, 'commemoration', `commemoratio-${index + 1}`, title, commemorationLines, {
      commemorationTitle: title,
      includesAntiphon: commemorationLines.some(line => line.startsWith('Ant. ')),
      includesCollect: commemorationLines.some(line => line === 'Oremus.' || line === 'Orémus.'),
      sourceKind: 'proper',
    }))
  }

  return blocks
}

function parseCanticleUnit(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock[] {
  const openingAntiphon = lines.find(line => line.startsWith('Ant. '))
  const canticleStart = lines.findIndex(line => line.startsWith('Canticum Simeonis'))
  const closingAntiphonIndex = lines.findLastIndex(line => line.startsWith('Ant. '))
  const canticleLines = lines.slice(canticleStart, closingAntiphonIndex > canticleStart ? closingAntiphonIndex : undefined)
  const antiphonKey = openingAntiphon ? normalizeAntiphonKey(openingAntiphon) : 'salva-nos'

  return [
    block(exported, raw, 'antiphon', 'nunc-dimittis-antiphon-open', 'Antiphona ad Nunc dimittis', openingAntiphon ? [openingAntiphon] : [], {
      position: 'before-canticle',
      repeated: true,
      antiphonKey,
    }),
    block(exported, raw, 'canticle', 'nunc-dimittis', 'Canticum Simeonis', canticleLines.slice(1), {
      canticle: 'Nunc dimittis',
      source: 'Luc. 2:29-32',
      verses: canticleLines.filter(line => /^\d+:\d+/.test(line)),
      includesGloriaPatri: hasGloriaPatri(canticleLines),
      antiphonKey,
    }),
    block(exported, raw, 'antiphon', 'nunc-dimittis-antiphon-close', 'Antiphona repetita ad Nunc dimittis', closingAntiphonIndex > canticleStart ? [lines[closingAntiphonIndex]] : [], {
      position: 'after-canticle',
      repeated: true,
      antiphonKey,
    }),
  ]
}

function parseConclusio(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock[] {
  const blessingIndex = lines.findIndex(line => line.startsWith('Benedictio.'))
  return [
    block(exported, raw, 'dialogue', 'benedicamus-domino', 'Benedicamus Domino', lines.slice(0, blessingIndex), {
      formula: 'benedicamus-domino',
    }),
    block(exported, raw, 'blessing', 'final-blessing', 'Benedictio finalis', lines.slice(blessingIndex), {
      formula: 'completorium-final-blessing',
    }),
  ]
}

function parseMarianAntiphon(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock[] {
  const divinumIndex = lines.findIndex(line => line.startsWith('℣. Divínum auxílium'))
  const antiphonLines = divinumIndex > -1 ? lines.slice(0, divinumIndex) : lines
  const blessingLines = divinumIndex > -1 ? lines.slice(divinumIndex) : []

  return [
    block(exported, raw, 'marian-antiphon', 'marian-antiphon', 'Antiphona finalis B.M.V.', antiphonLines, {
      antiphonKey: detectMarianAntiphon(antiphonLines),
      seasonalVariant: detectMarianAntiphon(antiphonLines),
      includesPrayer: antiphonLines.some(line => line === 'Orémus.'),
    }),
    block(exported, raw, 'blessing', 'divinum-auxilium', 'Divinum auxilium', blessingLines, {
      formula: 'divinum-auxilium',
    }),
  ]
}

function parsePrimaOratio(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock[] {
  const benedicamusIndex = lines.findIndex(line => line.includes('Benedicámus Dómino'))
  if (benedicamusIndex < 0) {
    return [block(exported, raw, 'prayer', 'oratio', 'Oratio', lines, {
      prayerKey: 'oratio_Domine',
    })]
  }

  return [
    block(exported, raw, 'prayer', 'oratio', 'Oratio', lines.slice(0, benedicamusIndex), {
      prayerKey: 'oratio_Domine',
    }),
    block(exported, raw, 'dialogue', 'benedicamus-domino', 'Benedicamus Domino', lines.slice(benedicamusIndex), {
      formula: 'benedicamus-domino',
      withinPrimaBeforeMartyrology: true,
    }),
  ]
}

function omittedBlock(exported: ExportedOfficeHour, raw: string, heading: string | undefined, lines: string[]): LiturgicalBlock {
  const section = (heading || 'Omittitur').replace(/\{omittitur\}/, '')
  return block(exported, raw, 'rubric', `${slugify(section)}-omittitur`, `${section} omittitur`, lines, {
    omitted: true,
    specialStructure: exported.liturgicalTitle.includes('Cena Domini') ? 'sacred-triduum' : 'special',
  })
}

function emptyMajorSectionBlock(exported: ExportedOfficeHour, raw: string, heading: string | undefined, lines: string[], key: string): LiturgicalBlock {
  return block(exported, raw, 'rubric', `${key}-empty`, heading || key, lines, {
    empty: true,
    emptyMajorSection: key,
    resolvedByUpstream: true,
    specialStructure: exported.liturgicalTitle.includes('Cena Domini') ? 'sacred-triduum' : 'special',
  })
}

function isDefunctorumSpecial(raw: string): boolean {
  return raw.includes("Oratio mortuorum") || raw.includes("&special('Conclusio'")
}

function parseDefunctorumSpecial(exported: ExportedOfficeHour, raw: string, lines: string[]): LiturgicalBlock {
  if (raw.includes("Oratio mortuorum")) {
    return block(exported, raw, 'prayer', 'oratio-mortuorum', 'Oratio defunctorum', lines, {
      specialStructure: 'defunctorum',
      prayerKey: raw.includes('mortuorum1') ? 'Oratio mortuorum1' : 'Oratio mortuorum',
    }, extractRubricLines(lines))
  }

  return block(exported, raw, 'blessing', 'conclusio-defunctorum', 'Conclusio defunctorum', lines, {
    specialStructure: 'defunctorum',
    formula: 'requiem-aeternam',
  })
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
      ? [{ code: 'unknown-block-type', message: `Could not classify block ${id}`, severity: 'warning' }]
      : [],
  }
}

function sourceRefsFor(exported: ExportedOfficeHour, raw: string, type: LiturgicalBlockType, title: string | undefined, text: string[]): SourceRef[] {
  const base = { upstreamCommit: exported.upstreamCommit }
  const refs: SourceRef[] = [{
    ...base,
    path: ordinaryPathFor(exported.hour),
    section: title || firstRawHeading(raw) || 'expanded unit',
    transformation: ['getordinarium', 'specials', `parse-${exported.hour}-block`],
  }]

  if (type === 'psalm') {
    const number = psalmNumber(title || text[0] || '') || psalmNumberFromRaw(raw)
    if (number) {
      refs.push({
        ...base,
        path: `${PSALM_PATH}/Psalm${number}.txt`,
        section: `Psalm ${number}`,
        transformation: ['resolve_refs', 'psalm expansion'],
      })
    }
  }

  if (type === 'canticle') {
    const number = canticlePsalmNumber(title, raw)
    refs.push({
      ...base,
      path: `${PSALM_PATH}/Psalm${number}.txt`,
      section: canticleSection(title, number),
      transformation: ['resolve_refs', 'canticle expansion'],
    })
  }

  if (['dialogue', 'prayer', 'blessing', 'marian-antiphon', 'commemoration'].includes(type)) {
    refs.push({
      ...base,
      path: COMMON_PRAYERS,
      section: sourceSectionFromRaw(raw, title),
      transformation: ['resolve_refs', 'common prayers'],
    })
  }

  if (['hymn', 'capitulum', 'responsory', 'versicle', 'antiphon'].includes(type)) {
    refs.push({
      ...base,
      path: specialPathFor(exported.hour),
      section: title || type,
      transformation: ['specials', `${exported.hour} special text`],
    })
  }

  if (type === 'martyrology') {
    refs.push({
      ...base,
      path: MARTYROLOGY_PATH,
      section: 'anticipated day from Divinum Officium Latin Martyrologium',
      transformation: ['specials', 'martyrologium anticipatum'],
    })
  }

  if (text.some(line => /Examen conscientiæ|secreto/i.test(line))) {
    refs.push({
      ...base,
      path: COMMON_RUBRICS,
      section: 'rubrica examen',
      transformation: ['resolve_refs', 'rubric expansion'],
    })
  }

  return refs
}

function isMinorHourName(value: string): value is MinorHourName {
  return (minorHourNames as readonly string[]).includes(value)
}

function isMajorHourName(value: string): value is MajorHourName {
  return (majorHourNames as readonly string[]).includes(value)
}

function hourTitle(hour: string): string {
  return hour.charAt(0).toUpperCase() + hour.slice(1)
}

function ordinaryPathFor(hour: string): string {
  if (hour === 'completorium')
    return ORDINARY_COMPLETORIUM
  if (hour === 'laudes')
    return ORDINARY_LAUDES
  if (hour === 'prima')
    return ORDINARY_PRIMA
  if (hour === 'vesperae')
    return ORDINARY_VESPERAE
  if (isMinorHourName(hour))
    return ORDINARY_MINOR
  return `web/www/horas/Ordinarium/${hourTitle(hour)}.txt`
}

function specialPathFor(hour: string): string {
  if (isMajorHourName(hour))
    return MAJOR_SPECIAL
  if (hour === 'prima')
    return PRIMA_SPECIAL
  return MINOR_SPECIAL
}

function isPsalmodyHeading(heading: string | undefined): boolean {
  return Boolean(heading?.startsWith('Psalmi'))
}

function isOmittedHeading(heading: string | undefined): boolean {
  return Boolean(heading?.includes('{omittitur}'))
}

function minorHourMetadata(hour: MinorHourName, blocks: LiturgicalBlock[]): MinorHourMetadata {
  const firstAntiphon = blocks.find(item => item.type === 'antiphon')
  const capitulum = blocks.find(item => item.type === 'capitulum')
  const responsory = blocks.find(item => item.type === 'responsory')
  const collect = blocks.find(item => item.type === 'prayer')

  return {
    hour,
    psalmodySource: firstAntiphon?.title?.includes('Dominica') ? 'festal' : 'ferial-psalter',
    antiphonSource: firstAntiphon?.sourceRefs[0],
    capitulumSource: capitulum?.sourceRefs[0],
    responsorySource: responsory?.sourceRefs[0],
    collectSource: collect?.sourceRefs[0],
  }
}

function majorHourMetadata(hour: MajorHourName, blocks: LiturgicalBlock[]): MajorHourMetadata {
  const firstAntiphon = blocks.find(item => item.type === 'antiphon')
  const capitulum = blocks.find(item => item.type === 'capitulum')
  const hymn = blocks.find(item => item.type === 'hymn')
  const collect = blocks.find(item => item.type === 'prayer')
  const hasEmptyPsalmody = blocks.some(item => item.metadata?.emptyMajorSection === 'psalmi')

  return {
    hour,
    psalmodySource: hasEmptyPsalmody
      ? 'special'
      : firstAntiphon?.metadata?.sourceKind === 'proper'
        ? 'proper'
        : 'ferial-psalter',
    gospelCanticle: hour === 'laudes' ? 'benedictus' : 'magnificat',
    concurrenceResolvedByUpstream: hour === 'vesperae',
    antiphonSource: firstAntiphon?.sourceRefs[0],
    capitulumSource: capitulum?.sourceRefs[0],
    hymnSource: hymn?.sourceRefs[0],
    collectSource: collect?.sourceRefs[0],
  }
}

function sourceSectionFromRaw(raw: string, title: string | undefined): string {
  const tokens = raw.match(/[$&][A-Za-z0-9_ ]+/g)?.map(token => token.slice(1).trim()) || []
  return tokens[0] || title || 'common prayer'
}

function firstRawHeading(raw: string): string | undefined {
  const first = raw.split(/\r?\n/).find(line => line.trim())
  if (!first?.startsWith('#'))
    return undefined
  return first.replace(/^#+/, '').trim()
}

function htmlToLines(html: string): string[] {
  return normalizeLatinTechnical(html)
    .replace(/<br\/?>/gi, '\n')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\{::\}/g, '')
    .split('\n')
    .map(line => normalizeLatinTechnical(line))
    .filter(Boolean)
}

function hasGloriaPatri(lines: string[]): boolean {
  return lines.some(line => line.includes('Glória Patri'))
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
  const segment = psalmSegment(title)?.replace(/\W+/g, '-') || 'full'
  const ordinal = title.match(/\[(\d+)\]/)?.[1] || '1'
  return `${title.startsWith('Canticum ') ? 'canticle' : 'psalm'}-${number}-${segment}-${ordinal}`
}

function firstPsalmOrCanticleIndex(lines: string[]): number {
  return lines.findIndex(line => line.startsWith('Psalmus ') || line.startsWith('Canticum '))
}

function canticlePsalmNumber(title: string | undefined, raw: string): string {
  const normalizedTitle = normalizeLatinTechnical(title || '')
  if (normalizedTitle.includes('Simeonis') || raw.includes('&psalm(233)'))
    return '233'
  if (normalizedTitle.includes('Zachariae') || normalizedTitle.includes('Zachariæ') || raw.includes('&psalm(231)'))
    return '231'
  if (normalizedTitle.includes('Mariae') || normalizedTitle.includes('Mariæ') || raw.includes('&psalm(232)'))
    return '232'
  return psalmNumberFromRaw(raw) || '233'
}

function canticleSection(title: string | undefined, number: string): string {
  if (number === '231')
    return 'Benedictus'
  if (number === '232')
    return 'Magnificat'
  if (number === '233')
    return 'Nunc dimittis'
  return title || `Psalm ${number}`
}

function readingMetadata(lines: string[]): Record<string, unknown> {
  return {
    citation: lines.find(line => /^[1-4]?\s?[A-Z][a-z]+\s+\d+:\d+/.test(line)),
    includesTuAutem: lines.some(line => line.includes('Tu autem')),
  }
}

function hymnMetadata(lines: string[]): Record<string, unknown> {
  return {
    stanzas: lines.join('\n').split('\n_\n').map(stanza => stanza.split('\n').filter(Boolean)),
  }
}

function responsoryMetadata(lines: string[]): Record<string, unknown> {
  return {
    incipit: lines.find(line => line.startsWith('℟.br.')) || lines[0],
    repeat: lines.filter(line => line.startsWith('℟.')).at(-1),
    versicle: lines.find(line => line.startsWith('℣.') && !line.includes('Glória Patri')),
    response: lines.find(line => line.startsWith('℟.') && !line.startsWith('℟.br.')),
    includesGloriaPatri: hasGloriaPatri(lines),
    seasonalVariant: 'ordinary',
  }
}

function extractRubricLines(lines: string[]): string[] {
  return lines.filter(line => /Examen conscientiæ|secreto|\(percutit sibi pectus\)/i.test(line))
}

function normalizeAntiphonKey(line: string): string {
  return slugify(line.replace(/^Ant\.\s*/, '').replace(/\*/g, '').replace(/[.,;:]/g, ''))
}

function detectMarianAntiphon(lines: string[]): string {
  const joined = lines.join(' ')
  if (joined.includes('Alma Redemptóris'))
    return 'alma-redemptoris-mater'
  if (joined.includes('Ave, Regína cælórum'))
    return 'ave-regina-caelorum'
  if (joined.includes('Regína cæli'))
    return 'regina-caeli'
  if (joined.includes('Salve, Regína'))
    return 'salve-regina'
  return 'unknown'
}

function indexesOf(lines: string[], value: string): number[] {
  return lines.reduce<number[]>((indexes, line, index) => {
    if (line === value)
      indexes.push(index)
    return indexes
  }, [])
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

function hashText(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}
