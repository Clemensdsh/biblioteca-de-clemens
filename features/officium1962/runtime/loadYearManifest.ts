import { cachePromise } from './cache'
import { UnavailableYearError } from './errors'
import { assertReleaseIdentity, fetchJson } from './http'
import { loadRootManifest } from './loadRootManifest'
import type { RuntimeContext, YearManifest } from './types'

export function loadYearManifest(context: RuntimeContext, year: number): Promise<YearManifest> {
  return cachePromise(context.cache.yearManifests, year, async () => {
    const root = await loadRootManifest(context)
    const entry = root.availableYears.find(item => item.year === year)
    if (!entry)
      throw new UnavailableYearError(`Year ${year} is not listed in the root manifest`, { actual: String(year) })
    const manifest = await fetchJson<YearManifest>(context, entry.path, entry.checksum)
    assertReleaseIdentity(manifest, `year ${year} manifest`)
    if (manifest.year !== year)
      throw new UnavailableYearError(`Year manifest mismatch for ${year}`, { expected: String(year), actual: String(manifest.year) })
    return manifest
  })
}
