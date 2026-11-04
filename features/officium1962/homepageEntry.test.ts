import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = readFileSync('valaxy.config.ts', 'utf8')
const styles = readFileSync('styles/index.scss', 'utf8')
const page = readFileSync('pages/officium-1962/index.vue', 'utf8')
const flags = readFileSync('config/features.ts', 'utf8')
const errors = readFileSync('features/officium1962/runtime/errors.ts', 'utf8')
const playground = [
  readFileSync('playground/officium1962/index.html', 'utf8'),
  readFileSync('playground/officium1962/main.mjs', 'utf8'),
].join('\n')

describe('1962 Roman Office homepage entry and product name', () => {
  it('keeps the six primary homepage destinations in the requested order', () => {
    const labels = ['文章', '圣人录译稿', '周年瞻礼经', '罗马大日课', '哥特日课', '时辰礼仪']
    const positions = labels.map(label => config.indexOf(`'${label}'`))

    expect(positions.every(position => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
    expect(config.indexOf("name: '每日圣人录'")).toBeGreaterThan(positions.at(-1)!)
  })

  it('moves 关于 into the social row, between X and Telegram', () => {
    const site = readFileSync('site.config.ts', 'utf8')
    const order = ["name: 'X'", "name: '关于'", "name: 'Telegram'"].map(name => site.indexOf(name))
    expect(order.every(position => position >= 0)).toBe(true)
    expect(order).toEqual([...order].sort((left, right) => left - right))
    expect(config).not.toContain("url: '/about/'")
    expect(styles).toContain('.link-item[href="/breviarium-gothicum/"]')
    expect(readFileSync('components/YunSocialLinkItem.vue', 'utf8')).toContain("social.link.startsWith('/')")
  })

  it('uses the production route once and keeps the feature enabled', () => {
    expect(config.match(/url: '\/officium-1962\/'/g)).toHaveLength(1)
    expect(config).toContain("name: '罗马大日课'")
    expect(flags).toContain('officium1962: true')
  })

  it('defines two three-item rows and an independent daily link', () => {
    expect(styles).toContain('grid-area: 1 / 1 / auto / span 2')
    expect(styles).toContain('grid-area: 1 / 3 / auto / span 2')
    expect(styles).toContain('grid-area: 1 / 5 / auto / span 2')
    expect(styles).toContain('grid-area: 2 / 1 / auto / span 2')
    expect(styles).toContain('grid-area: 2 / 3 / auto / span 2')
    expect(styles).toContain('grid-area: 2 / 5 / auto / span 2')
    expect(styles).toContain('grid-area: 3 / 1 / auto / -1')
    expect(styles).not.toMatch(/link-item\[href="\/officium-1962\/"\][^{]*\{[^}]*flex-basis:\s*100%/s)
  })

  it('uses the unified product name in page and social metadata', () => {
    expect(page).toContain("title: '罗马大日课'")
    expect(page).toContain("property: 'og:title', content: '罗马大日课'")
    expect(page).toContain('<h1>罗马大日课</h1>')
    expect(page).toContain('Officium Romanum · Rubrics 1960 · Latin')
  })

  it('does not expose the retired product names in current UI sources', () => {
    const currentUi = `${config}\n${page}\n${errors}\n${playground}`
    expect(currentUi).not.toMatch(/罗马日课 1962|罗马日课1962|Officium Romanum 1962|Officium 1962/)
    expect(playground).toContain('1962罗马大日课')
  })
})
