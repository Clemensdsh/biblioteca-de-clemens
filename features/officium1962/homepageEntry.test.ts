import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = readFileSync('valaxy.config.ts', 'utf8')
const styles = readFileSync('styles/index.scss', 'utf8')
const page = readFileSync('pages/officium-1962/index.vue', 'utf8')
const flags = readFileSync('config/features.ts', 'utf8')
const errors = readFileSync('features/officium1962/runtime/errors.ts', 'utf8')

describe('1962 Roman Office homepage entry and product name', () => {
  it('keeps the five primary homepage destinations in the requested order', () => {
    const labels = ['文章', '圣人录译稿', '周年瞻礼经', '1962罗马大日课', '关于']
    const positions = labels.map(label => config.indexOf(`'${label}'`))

    expect(positions.every(position => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
    expect(config.indexOf("name: '每日圣人录'")).toBeGreaterThan(positions.at(-1)!)
  })

  it('uses the production route once and keeps the feature enabled', () => {
    expect(config.match(/url: '\/officium-1962\/'/g)).toHaveLength(1)
    expect(config).toContain("name: '1962罗马大日课'")
    expect(flags).toContain('officium1962: true')
  })

  it('defines a three-item first row, centered two-item second row, and independent daily link', () => {
    expect(styles).toContain('grid-area: 1 / 1 / auto / span 2')
    expect(styles).toContain('grid-area: 1 / 3 / auto / span 2')
    expect(styles).toContain('grid-area: 1 / 5 / auto / span 2')
    expect(styles).toContain('grid-area: 2 / 2 / auto / span 2')
    expect(styles).toContain('grid-area: 2 / 4 / auto / span 2')
    expect(styles).toContain('grid-area: 3 / 1 / auto / -1')
    expect(styles).not.toMatch(/link-item\[href="\/officium-1962\/"\][^{]*\{[^}]*flex-basis:\s*100%/s)
  })

  it('uses the unified product name in page and social metadata', () => {
    expect(page).toContain("title: '1962罗马大日课'")
    expect(page).toContain("property: 'og:title', content: '1962罗马大日课'")
    expect(page).toContain('<h1>1962罗马大日课</h1>')
    expect(page).toContain('Officium Romanum · Rubrics 1960 · Latin')
  })

  it('does not expose the retired product names in current UI sources', () => {
    const currentUi = `${config}\n${page}\n${errors}`
    expect(currentUi).not.toMatch(/罗马日课 1962|罗马日课1962|Officium Romanum 1962|Officium 1962/)
  })
})
