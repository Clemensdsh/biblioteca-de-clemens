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
    expect(parsed.readings.some(reading => reading.text.includes('圣人专用部分'))).toBe(false)
    expect(parsed.readings.some(reading => reading.text.includes('###'))).toBe(false)
    expect(parsed.readings.find(reading => reading.title === '常年期主日及平日（德三四14-20）')?.text)
      .toBe('敬畏上主之人的精神必然常存，在上主回顾下，必蒙祝福。因为他们的希望指向拯救他们的主，天主的眼常注视爱慕他的人。敬畏上主的人，无所畏惧，无所恐怖，因为上主是他的希望。敬畏上主的人，他的灵魂是有福的。他所仰望的是谁？谁又是他的扶助？上主的眼常注视爱慕他的人，他是大能的保障，是强有力的后盾，是隔除热气的屏风，是遮盖正午太阳的凉棚。是失足时的护卫，是跌倒时的救援；他鼓舞精神，开明眼目，赐与健康、生命和幸福。')
    expect(parsed.prayers.length).toBeGreaterThanOrEqual(37)
    expect(parsed.prayers[0]?.id).toBe(0)
    expect(parsed.prayers[0]?.text).toMatch(/阿们。$/)
  })
})
