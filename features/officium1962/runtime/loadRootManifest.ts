import { assertReleaseIdentity, fetchJson } from './http'
import type { RootManifest, RuntimeContext, SharedManifest } from './types'

export function loadRootManifest(context: RuntimeContext): Promise<RootManifest> {
  if (!context.cache.rootManifest) {
    context.cache.rootManifest = fetchJson<RootManifest>(context, 'manifest.json')
      .then((manifest) => {
        assertReleaseIdentity(manifest, 'root manifest')
        if (!Array.isArray(manifest.availableYears) || !manifest.availableYears.length)
          throw new Error('Root manifest has no available years')
        return manifest
      })
      .catch((error) => {
        context.cache.rootManifest = undefined
        throw error
      })
  }
  return context.cache.rootManifest
}

export async function loadSharedManifest(context: RuntimeContext, root?: RootManifest): Promise<SharedManifest> {
  if (!context.cache.sharedManifest) {
    context.cache.sharedManifest = (async () => {
      const manifest = root || await loadRootManifest(context)
      const value = await fetchJson<SharedManifest>(context, manifest.shared.path, manifest.shared.checksum)
      assertReleaseIdentity(value, 'shared manifest')
      return value
    })().catch((error) => {
      context.cache.sharedManifest = undefined
      throw error
    })
  }
  return context.cache.sharedManifest
}
