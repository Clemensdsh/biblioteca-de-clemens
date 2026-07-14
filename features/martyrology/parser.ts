export type MartyrologyEntry = {
  number: number
  starred?: boolean
  text: string
}

export type MartyrologyDay = {
  date_roman: string
  date_chinese: string
  entries: MartyrologyEntry[]
  content_html: string
  notes_html?: string
}

export type Reading = {
  id: number
  title: string
  occasion: string
  text: string
}

export type Prayer = {
  id?: number
  title?: string
  text: string
}

export function parseMartyrologyDayFromTranslation(markdown: string, monthDay: string): MartyrologyDay | null {
  const heading = monthDayToChineseHeading(monthDay)
  const headingMatch = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'm').exec(markdown)
  if (!headingMatch)
    return null

  const start = headingMatch.index
  const afterHeading = markdown.slice(start + headingMatch[0].length)
  const nextDay = afterHeading.search(/\r?\n---\s*\r?\n\s*##\s+/)
  const end = nextDay >= 0 ? start + headingMatch[0].length + nextDay : markdown.length
  return parseMartyrologyMarkdown(markdown.slice(start, end))
}

function parseMartyrologyMarkdown(markdown: string): MartyrologyDay {
  const content = markdown.replace(/^---[\s\S]*?---\s*/, '')
  const lines = content.split(/\r?\n/)
  const chineseHeading = lines.find(line => /^##\s+/.test(line))?.replace(/^##\s+/, '').trim() || ''
  const romanLine = lines.find(line => /\*\*Die\s+/i.test(line)) || ''
  const romanMatch = romanLine.match(/\*\*([^*]+)\*\*\s*·\s*(.+)$/)
  const entries: MartyrologyEntry[] = []
  const notesStart = lines.findIndex(line => /^###\s+.*校注/.test(line))
  const entryLines = notesStart >= 0 ? lines.slice(0, notesStart) : lines
  let currentEntry: MartyrologyEntry | null = null

  for (const line of entryLines) {
    const match = line.match(/^\*\*(\d+)(\\?\*)?\\?\.\*\*\s*(.*)$/)
    if (match) {
      currentEntry = {
        number: Number(match[1]),
        starred: Boolean(match[2]),
        text: cleanInlineMarkdown(match[3]),
      }
      entries.push(currentEntry)
      continue
    }

    if (currentEntry && line.trim())
      currentEntry.text = cleanInlineMarkdown(`${currentEntry.text} ${line}`)
  }

  const notes = notesStart >= 0
    ? lines.slice(notesStart).join('\n').trim()
    : ''

  return {
    date_roman: romanMatch ? `${cleanInlineMarkdown(romanMatch[1])} · ${cleanInlineMarkdown(romanMatch[2])}` : '',
    date_chinese: chineseHeading,
    entries,
    content_html: renderMartyrologyContent(stripFixedContentHeader(entryLines).join('\n')),
    notes_html: notes ? renderMartyrologyContent(notes) : undefined,
  }
}

function stripFixedContentHeader(lines: string[]) {
  const lunaStart = lines.findIndex(line => /^月龄表/.test(line.trim()))
  return lunaStart >= 0 ? lines.slice(lunaStart) : lines
}

function renderMartyrologyContent(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(renderMartyrologyLine)
    .join('\n')
}

function renderMartyrologyLine(line: string) {
  const heading = line.match(/^#{2,3}\s+(.+)$/)
  if (heading)
    return `<h3>${renderInlineMarkdown(heading[1])}</h3>`

  const dateLine = line.match(/^\*\*Die\s+([^*]+)\*\*\s*·\s*(.+)$/)
  if (dateLine)
    return `<p class="raw-date"><strong>Die ${escapeHtml(dateLine[1])}</strong> · ${renderInlineMarkdown(dateLine[2])}</p>`

  const entry = line.match(/^\*\*(\d+)(\\?\*)?\\?\.\*\*\s*(.+)$/)
  if (entry) {
    const marker = `${entry[1]}${entry[2] ? '*' : ''}.`
    return `<p class="raw-entry"><span class="raw-number">${marker}</span> ${renderInlineMarkdown(entry[3])}</p>`
  }

  const note = line.match(/^(\d+)\\?\.\s+(.+)$/)
  if (note)
    return `<p class="raw-note"><span class="raw-number">${note[1]}.</span> ${renderInlineMarkdown(note[2])}</p>`

  if (/^月龄表（\*Luna\*）：$/.test(line))
    return '<p class="raw-luna-title">月龄表（Luna）：</p>'

  const quote = line.match(/^>\s*(.+)$/)
  if (quote)
    return `<p class="raw-luna">${renderInlineMarkdown(quote[1])}</p>`

  return `<p>${renderInlineMarkdown(line)}</p>`
}

function renderInlineMarkdown(text: string) {
  const escaped = text
    .replace(/\\\*/g, '\uE000')
    .replace(/\\\./g, '\uE001')
  return escapeHtml(escaped)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\uE000/g, '*')
    .replace(/\uE001/g, '.')
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function cleanInlineMarkdown(text: string) {
  return text
    .replace(/\\([.*])/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function monthDayToChineseHeading(monthDay: string) {
  const [month, day] = monthDay.split('-').map(Number)
  return `${toChineseMonth(month)}月${toChineseDay(day)}日`
}

function toChineseMonth(month: number) {
  const months = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
  return months[month] || String(month)
}

function toChineseDay(day: number) {
  const days = [
    '',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
    '十一',
    '十二',
    '十三',
    '十四',
    '十五',
    '十六',
    '十七',
    '十八',
    '十九',
    '二十',
    '二十一',
    '二十二',
    '二十三',
    '二十四',
    '二十五',
    '二十六',
    '二十七',
    '二十八',
    '二十九',
    '三十',
    '三十一',
  ]
  return days[day] || String(day)
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function parseTranslationMarkdown(markdown: string) {
  return {
    readings: parseReadings(markdown),
    prayers: parsePrayers(markdown),
  }
}

function parseReadings(markdown: string): Reading[] {
  const section = sliceSection(markdown, '## \u77ED\u8BFB\u7ECF', '## \u7977\u8BCD')
  const entryRegex = /^\*\*(\d+)\\?\.\*\*\s*(?:\*([^*]+)\*)?\s*(?:（([^）]+)）)?/gm
  const matches = [...section.matchAll(entryRegex)]
  const readingsList: Reading[] = []

  for (let index = 0; index < matches.length; index++) {
    const match = matches[index]
    const next = matches[index + 1]
    const id = Number(match[1])
    const baseTitle = cleanInlineMarkdown(match[2] || `短读经 ${id}`)
    const baseCitation = match[3] || ''
    const bodyStart = (match.index || 0) + match[0].length
    const bodyEnd = next?.index ?? section.length
    const body = section.slice(bodyStart, bodyEnd).trim()
    const variants = splitReadingVariants(body, baseCitation)
    const occasion = readingOccasion(id)

    for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
      const variant = variants[variantIndex]
      readingsList.push({
        id,
        title: `${baseTitle}${variant.citation ? `（${variant.citation}）` : ''}`,
        occasion,
        text: variant.text,
      })
    }
  }

  return readingsList
}

function splitReadingVariants(body: string, baseCitation: string) {
  const chunks = body.split(/\n(?=或：)/)
  return chunks
    .map((chunk, index) => {
      const citationMatch = chunk.match(/^或：(?:（([^）]+)）)?/)
      const citation = index === 0 ? baseCitation : (citationMatch?.[1] || baseCitation)
      const text = cleanReadingBody(chunk.replace(/^或：(?:（[^）]+）)?\s*/, ''))
      return { citation, text }
    })
    .filter(item => item.text)
}

function cleanReadingBody(text: string) {
  return cleanInlineMarkdown(text
    .replace(/^>\s*上主的圣言。?\s*$/gm, '')
    .replace(/^>\s*感谢天主。?\s*$/gm, '')
    .replace(/^上主的圣言。?\s*$/gm, '')
    .replace(/^℟\.\s*感谢天主。?\s*$/gm, '')
    .replace(/^感谢天主。?\s*$/gm, '')
    .replace(/^\s*(?:十二月|一月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月)[^\n]+：\s*$/gm, '')
    .replace(/^圣诞节八日庆期内主日：\s*$/gm, ''))
}

function parsePrayers(markdown: string): Prayer[] {
  const section = sliceSection(markdown, '## \u7977\u8BCD', '## \u6B89\u9053\u5723\u4EBA\u5F55\u548F\u5531\u8C03\u5F0F')
  const entryRegex = /^\*\*(\d+)\\?\.\*\*\s*(.+?)(?=^\*\*\d+\\?\.\*\*|\n>\s*\[\^|$)/gms
  const prayersList: Prayer[] = []

  for (const match of section.matchAll(entryRegex)) {
    prayersList.push({
      id: Number(match[1]),
      title: `第${toChineseNumber(Number(match[1]))}式`,
      text: cleanInlineMarkdown(match[2]),
    })
  }

  const openingPrayer = section
    .split('或任选以下祷词之一：')[0]
    ?.replace(/^##\s+祷词/m, '')
    .replace(/在诵读殉道圣人录[\s\S]*?程式：/, '')
    .trim()

  if (openingPrayer) {
    prayersList.unshift({
      id: 0,
      title: '',
      text: appendAmen(cleanInlineMarkdown(openingPrayer)),
    })
  }

  return prayersList
}

function appendAmen(text: string) {
  return text.endsWith('阿们。') ? text : `${text}阿们。`
}

function toChineseNumber(value: number) {
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value <= 10)
    return value === 10 ? '十' : digits[value]
  if (value < 20)
    return `十${digits[value - 10]}`
  const tens = Math.floor(value / 10)
  const ones = value % 10
  return `${digits[tens]}十${digits[ones]}`
}

function sliceSection(markdown: string, startHeading: string, endHeading: string) {
  const start = markdown.indexOf(startHeading)
  if (start < 0)
    return ''
  const end = markdown.indexOf(endHeading, start + startHeading.length)
  return markdown.slice(start + startHeading.length, end >= 0 ? end : markdown.length)
}

function readingOccasion(id: number) {
  if (id === 1) return 'advent'
  if (id === 2 || id === 3) return 'christmas'
  if (id === 4) return '12-26'
  if (id === 5) return '12-27'
  if (id === 6) return '12-28'
  if (id === 7) return 'holy-family'
  if (id === 8) return 'epiphany-eve'
  if (id === 9) return 'epiphany'
  if (id === 10) return 'lent'
  if (id === 11) return 'palm-sunday'
  if (id === 12) return 'holy-triduum'
  if (id === 13 || id === 14) return 'easter'
  if (id === 15) return 'ascension'
  if (id === 16) return 'pentecost'
  if (id === 17) return 'trinity-sunday'
  if (id === 18) return 'corpus-christi'
  if (id === 19) return 'sacred-heart'
  if (id === 20) return 'christ-king'
  if (id === 21) return 'ordinary'
  return `reading-${id}`
}

