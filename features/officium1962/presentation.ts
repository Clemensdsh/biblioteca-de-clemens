/**
 * 1962 日课展示层：把上游文本里的出处括注 `{…}`、`%…%`、`_` 分隔符、章节号、经文出处等
 * 整理成可读的显示结构。只影响显示；中文查表仍使用原始行。
 */
import type { LiturgicalBlock } from './schema'

export interface SourceTag {
  /** 显示文字（中文） */
  text: string
  /** 上游拉丁原文，作悬停提示 */
  latin: string
  /** source＝出处（显示「出处：」前缀）；status＝状态（省略、预告等） */
  kind: 'source' | 'status'
}

const SOURCE_ZH: Record<string, string> = {
  'ex Proprio Sanctorum': '圣人本日专用',
  'ex Proprio de Tempore': '时期本日专用',
  'ex Commune aut Festo': '共同礼（圣人通用）或节日专用',
  'ex Psalterio secundum diem': '按日圣咏集',
  'ex Psalterio secundum tempora': '按时期圣咏集',
  'Per Annum': '常年期',
}

const STATUS_ZH: Record<string, string> = {
  omittitur: '省略',
  anticipatur: '预告次日',
}

export function parseSourceTag(latin: string): SourceTag {
  const raw = latin.trim()
  if (STATUS_ZH[raw])
    return { text: STATUS_ZH[raw], latin: raw, kind: 'status' }
  const antiphon = /^Antiphona\s+(.+)$/.exec(raw)
  if (antiphon && SOURCE_ZH[antiphon[1]])
    return { text: `${SOURCE_ZH[antiphon[1]]}（对经）`, latin: raw, kind: 'source' }
  if (SOURCE_ZH[raw])
    return { text: SOURCE_ZH[raw], latin: raw, kind: 'source' }
  return { text: raw, latin: raw, kind: 'status' }
}

const HEADER_WITH_TAG = /^([^{}]*?)\s*\{([^{}]*)\}\s*$/

function normKey(value: string) {
  return value.replace(/[{}\s]/g, '').toLowerCase()
}

export type SegmentKind = 'text' | 'rubric'

export interface LineSegment {
  text: string
  kind: SegmentKind
}

export type DisplayItem =
  | { kind: 'gap' }
  | {
    kind: 'line'
    /** 原始行（中文查表用） */
    raw: string
    /** 章节号（圣咏节号或读经节号），单独排版 */
    ref?: string
    segments: LineSegment[]
    /** 是否为经文出处提示（如 Prov. 31:10-11） */
    citation: boolean
    /** 整行都是礼仪指示 */
    rubric: boolean
    dialogue: boolean
  }

export interface PreparedBlock {
  title: string
  tag?: SourceTag
  /** 标题以外的补充说明，例如「Capitulum · Hymnus · Versus」 */
  tagScope?: string
  items: DisplayItem[]
  /** 去重后的附加红字 */
  rubricLines: string[]
}

const WHOLE_RUBRIC = /(?:\bsecreto\b|\bomittitur\b|\bomittuntur\b|Examen conscientiæ)/
const INLINE_RUBRIC = /\((?:genuflectitur|fit reverentia|sequens versus|percutit sibi pectus)[^)]*\)/gi
const LABEL = /^(Benedictio|Absolutio)\.\s+/
const PSALM_REF = /^(\d+:\d+[a-z]?)\s+(?=\S)/
const READING_REF = /^(\d+)\s+(?=\p{L})/u
const CITATION = /^(?:[1-3]\s)?[A-Za-zÆæ]+\.?\s\d+(?::\d+[a-z]?)?(?:\s*[-–,]\s*\d+(?::\d+[a-z]?)?[a-z]?)*$/

/** 去掉 % 记号、多余空格和行末重复句点 */
export function cleanLine(line: string) {
  return line
    .replace(/%([^%]+)%/g, '$1')
    .replace(/(?<=\S)\s{2,}(?=\S)/g, ' ')
    .replace(/([^.])\.\.(\s*)$/, '$1.$2')
    .trim()
}

export function splitSegments(text: string): LineSegment[] {
  const segments: LineSegment[] = []
  let last = 0
  for (const match of text.matchAll(INLINE_RUBRIC)) {
    const index = match.index ?? 0
    if (index > last)
      segments.push({ text: text.slice(last, index), kind: 'text' })
    segments.push({ text: match[0], kind: 'rubric' })
    last = index + match[0].length
  }
  if (last < text.length)
    segments.push({ text: text.slice(last), kind: 'text' })
  return segments.length ? segments : [{ text, kind: 'text' }]
}

function buildItem(raw: string, blockType: string): DisplayItem {
  let text = cleanLine(raw)
  const rubric = WHOLE_RUBRIC.test(text)
  const dialogue = text.startsWith('℣.') || text.startsWith('℟.')
  if (rubric)
    return { kind: 'line', raw, segments: [{ text, kind: 'rubric' }], citation: false, rubric: true, dialogue }

  // 读经出处（如 1 Pet 5:8-9）要先于「节号」判断，否则开头的 1 会被当成节号
  if (CITATION.test(text))
    return { kind: 'line', raw, segments: [{ text, kind: 'text' }], citation: true, rubric: false, dialogue }

  let ref: string | undefined
  const psalmRef = PSALM_REF.exec(text)
  if (psalmRef) {
    ref = psalmRef[1]
    text = text.slice(psalmRef[0].length)
  }
  else if (blockType === 'reading') {
    const readingRef = READING_REF.exec(text)
    if (readingRef) {
      ref = readingRef[1]
      text = text.slice(readingRef[0].length)
    }
  }

  const citation = false
  const segments: LineSegment[] = []
  const label = !ref ? LABEL.exec(text) : null
  if (label) {
    segments.push({ text: label[1], kind: 'rubric' })
    segments.push({ text: ' ', kind: 'text' })
    text = text.slice(label[0].length)
  }
  segments.push(...splitSegments(text))
  return { kind: 'line', raw, ref, segments, citation, rubric: false, dialogue }
}

export function prepareBlock(block: LiturgicalBlock): PreparedBlock {
  let title = block.title || ''
  let tag: SourceTag | undefined
  let tagScope: string | undefined

  const titleMatch = HEADER_WITH_TAG.exec(title)
  if (titleMatch) {
    title = titleMatch[1].trim()
    tag = parseSourceTag(titleMatch[2])
  }

  let lines = [...(block.text || [])]
  // 首行是上游写入的「标题 {出处}」或「Capitulum Hymnus Versus {出处}」
  const headerMatch = lines.length ? HEADER_WITH_TAG.exec(lines[0]) : null
  if (headerMatch) {
    lines = lines.slice(1)
    const words = headerMatch[1].trim()
    if (!tag)
      tag = parseSourceTag(headerMatch[2])
    if (words && normKey(words) !== normKey(title))
      tagScope = words.split(/\s+/).join(' · ')
  }

  const items: DisplayItem[] = []
  for (const raw of lines) {
    if (raw.trim() === '_') {
      if (items.length && items[items.length - 1].kind !== 'gap')
        items.push({ kind: 'gap' })
      continue
    }
    items.push(buildItem(raw, block.type))
  }
  while (items.length && items[items.length - 1].kind === 'gap')
    items.pop()

  const seen = new Set((block.text || []).map(line => cleanLine(line)))
  const rubricLines = (block.rubricLines || []).filter((line) => {
    const cleaned = cleanLine(line)
    if (seen.has(cleaned))
      return false
    const header = HEADER_WITH_TAG.exec(cleaned)
    return !(header && normKey(header[1]) === normKey(title))
  }).map(cleanLine)

  return { title, tag, tagScope, items, rubricLines }
}

/** 夜课目录等处只需要不带出处括注的标题 */
export function plainTitle(title: string) {
  const match = HEADER_WITH_TAG.exec(title)
  return match ? match[1].trim() : title
}
