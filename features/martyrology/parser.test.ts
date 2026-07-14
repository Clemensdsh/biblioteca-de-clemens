import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  monthDayToChineseHeading,
  parseMartyrologyDayFromTranslation,
  parseTranslationMarkdown,
} from './parser'

const translationMarkdown = readFileSync(
  resolve(process.cwd(), 'pages/martyrologium-translation/index.md'),
  'utf8',
)

describe('martyrology parser', () => {
  it('formats month-day keys as Chinese headings used by the source document', () => {
    expect(monthDayToChineseHeading('07-15')).toBe('七月十五日')
    expect(monthDayToChineseHeading('12-31')).toBe('十二月三十一日')
  })

  it('extracts the requested day without leaking the next day', () => {
    const day = parseMartyrologyDayFromTranslation(translationMarkdown, '07-15')

    expect(day).not.toBeNull()
    expect(day?.date_chinese).toBe('七月十五日')
    expect(day?.date_roman).toContain('Die 15 iúlii')
    expect(day?.entries.length).toBeGreaterThan(20)
    expect(day?.entries[0]?.text).toContain('圣文都辣')
    expect(day?.content_html).toContain('class="raw-luna-title"')
    expect(day?.content_html).toContain('class="raw-entry"')
    expect(day?.content_html).not.toContain('## 七月十六日')
  })

  it('keeps notes separate from the proclaimed fixed elogium', () => {
    const day = parseMartyrologyDayFromTranslation(translationMarkdown, '07-15')

    expect(day?.content_html).not.toContain('七月十五日校注')
    expect(day?.notes_html).toContain('七月十五日校注')
    expect(day?.notes_html).toContain('class="raw-note"')
  })

  it('parses short readings and prayers from the recitation section', () => {
    const parsed = parseTranslationMarkdown(translationMarkdown)

    expect(parsed.readings.length).toBeGreaterThanOrEqual(58)
    expect(parsed.readings.some(reading => reading.occasion === 'ordinary')).toBe(true)
    expect(parsed.prayers.length).toBeGreaterThanOrEqual(37)
    expect(parsed.prayers[0]?.id).toBe(0)
    expect(parsed.prayers[0]?.text).toMatch(/阿们。$/)
  })
})
