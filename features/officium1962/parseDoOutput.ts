import type { ExportedOfficeHour, LiturgicalBlock, LiturgicalBlockType, Office1962Day, OfficeHour, SourceRef } from './schema.ts'
import { normalizeLatinTechnical } from './normalizeLatin.ts'

const ORDINARY_COMPLETORIUM = 'web/www/horas/Ordinarium/Completorium.txt'
const COMMON_PRAYERS = 'web/www/horas/Latin/Psalterium/Common/Prayers.txt'
const COMMON_RUBRICS = 'web/www/horas/Latin/Psalterium/Common/Rubricae.txt'
const MINOR_SPECIAL = 'web/www/horas/Latin/Psalterium/Special/Minor Special.txt'
const PSALM_PATH = 'web/www/horas/Latin/Psalterium/Psalmorum'

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
  if (exported.hour !== 'completorium') {
    throw new Error(`Phase 2 parser only supports Completorium, received ${exported.hour}`)
  }

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
  const psalmStart = lines.findIndex(line => line.startsWith('Psalmus '))
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
  blocks.push(block(exported, raw, 'psalm', psalmBlockId(psalmTitle), psalmTitle, psalmLines.slice(1), {
    psalmNumber: psalmNumber(psalmTitle),
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
    path: ORDINARY_COMPLETORIUM,
    section: title || firstRawHeading(raw) || 'expanded unit',
    transformation: ['getordinarium', 'specials', 'parse-completorium-block'],
  }]

  if (type === 'psalm') {
    const number = psalmNumber(title || text[0] || '')
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
    refs.push({
      ...base,
      path: `${PSALM_PATH}/Psalm233.txt`,
      section: 'Nunc dimittis',
      transformation: ['resolve_refs', 'canticle expansion'],
    })
  }

  if (['dialogue', 'prayer', 'blessing', 'marian-antiphon'].includes(type)) {
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
      path: MINOR_SPECIAL,
      section: title || type,
      transformation: ['specials', 'minor special complectorium'],
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

function psalmSegment(title: string): string | undefined {
  return title.match(/\(([^)]+)\)/)?.[1]
}

function psalmBlockId(title: string): string {
  const number = psalmNumber(title) || 'unknown'
  const segment = psalmSegment(title)?.replace(/\W+/g, '-') || 'full'
  const ordinal = title.match(/\[(\d+)\]/)?.[1] || '1'
  return `psalm-${number}-${segment}-${ordinal}`
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
