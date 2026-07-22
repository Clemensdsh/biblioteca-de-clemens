import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync('pages/officium-1962/index.vue', 'utf8')
const viewer = readFileSync('components/officium1962/Office1962Viewer.vue', 'utf8')
const renderer = readFileSync('components/officium1962/LiturgicalBlockRenderer.vue', 'utf8')

describe('Officium 1962 production page semantics', () => {
  it('provides a single h1 followed by office h2 and block h3 headings', () => {
    expect(page.match(/<h1/g)).toHaveLength(1)
    expect(viewer).toContain('<h2>{{ day.liturgicalTitle }}</h2>')
    expect(renderer).toContain('<h3 v-if="block.title"')
  })

  it('labels date, font, toggle, and icon controls', () => {
    expect(page).toContain('<span>民用日期</span>')
    expect(page).toContain('<span>正文字号</span>')
    expect(page).toContain('aria-label="上一天"')
    expect(page).toContain('aria-label="下一天"')
    expect(page).toContain('aria-label="上一时辰"')
    expect(page).toContain('aria-label="下一时辰"')
  })

  it('marks the current hour and exposes loading and error live regions', () => {
    expect(page).toContain(':aria-current="selectedHour === hour ? \'page\' : undefined"')
    expect(page).toContain('aria-live="polite"')
    expect(page).toContain('aria-live="assertive"')
  })

  it('provides keyboard-visible focus and mobile touch targets', () => {
    expect(page).toContain(':focus-visible')
    expect(page).toContain('outline: 3px solid')
    expect(page).toContain('min-height: 2.5rem')
  })

  it('provides Matutinum anchors and labels rubric text semantically', () => {
    expect(viewer).toContain('aria-label="Matutinum 夜课目录"')
    expect(viewer).toContain(':href="`#${link.id}`"')
    expect(renderer).toContain('礼仪指示：')
  })

  it('has a scoped dark-theme adaptation and print rules', () => {
    expect(page).toContain(':global(html.dark) .officium1962-page')
    expect(page).toContain('@media print')
    expect(page).toContain('.no-print')
    expect(renderer).toContain('break-inside: avoid')
  })

  it('keeps source debug content out of the office article by default', () => {
    expect(page.indexOf('<Office1962Viewer')).toBeLessThan(page.indexOf('officium1962-notes'))
    expect(renderer).toContain('<details v-if="showSources"')
    expect(renderer).not.toContain('v-html')
  })

  it('stores only three lightweight display preferences', () => {
    const persistedKeys = [...page.matchAll(/persistPreference\('([^']+)'/g)].map(match => match[1])
    expect(persistedKeys.sort()).toEqual(['font', 'rubrics', 'sources'])
    expect(page).not.toMatch(/localStorage\.(?:setItem|getItem)\(['"]officium1962\.(?:date|hour|day|text)/)
  })

  it('declares complete SEO metadata without generating daily routes', () => {
    expect(page).toContain("rel: 'canonical'")
    expect(page).toContain("property: 'og:title'")
    expect(page).toContain("name: 'robots'")
    expect(page).not.toMatch(/prerender|generateStaticParams|2026-\d{2}-\d{2}.*route/)
  })
})
