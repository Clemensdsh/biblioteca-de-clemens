import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync('pages/officium-1962/index.vue', 'utf8')
const runtime = [
  'features/officium1962/runtime/index.ts',
  'features/officium1962/runtime/http.ts',
  'features/officium1962/runtime/loadDay.ts',
  'features/officium1962/runtime/reconstructHour.ts',
].map(path => readFileSync(path, 'utf8')).join('\n')

describe('Officium 1962 production isolation candidate', () => {
  it('uses only the release data root at runtime', () => {
    expect(runtime).toContain('data/officium1962')
    expect(runtime).not.toMatch(/experimental|\/raw\//)
  })

  it('does not import Prima or Martyrology resolvers', () => {
    expect(page + runtime).not.toMatch(/features\/prima1962|features\/martyrology|useMartyrologyPage/)
  })

  it('does not include production Perl, Docker, vendor, Spanish, Martyrologium1960, or missa paths', () => {
    expect(runtime).not.toMatch(/\.pl\b|Docker|vendor\/divinum-officium|Spanish|Martyrologium1960|missa/i)
  })

  it('fetches annual data rather than importing it into JavaScript', () => {
    expect(runtime).not.toMatch(/public\/data|days\/2026-|blocks-\d{3}\.json/)
    expect(runtime).toContain('fetchJson')
  })

  it('keeps the feature flag in one shared configuration location', () => {
    const config = readFileSync('config/features.ts', 'utf8')
    expect(config.match(/officium1962:\s*(?:true|false)/g)).toHaveLength(1)
    expect(page).toContain('featureFlags.officium1962')
  })

  it('uses the same flag to include the single production navigation entry', () => {
    const navigation = readFileSync('valaxy.config.ts', 'utf8')
    expect(navigation).toContain('...(featureFlags.officium1962')
    expect(navigation.match(/url: '\/officium-1962\/'/g)).toHaveLength(1)
  })
})
