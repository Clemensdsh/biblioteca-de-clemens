import { cachePromise } from './cache'
import { MissingSharedBlockError } from './errors'
import { assertReleaseIdentity, fetchJson } from './http'
import type { RuntimeContext, SharedChunk, SharedManifest } from './types'

export function loadSharedChunk(context: RuntimeContext, manifest: SharedManifest, file: string): Promise<SharedChunk> {
  return cachePromise(context.cache.sharedChunks, file, async () => {
    const entry = manifest.chunks.find(item => item.file === file)
    if (!entry)
      throw new MissingSharedBlockError(`Shared chunk ${file} is not listed in the manifest`, { path: file })
    const chunk = await fetchJson<SharedChunk>(context, `shared/${file}`, entry.checksum)
    assertReleaseIdentity(chunk, `shared chunk ${file}`)
    if (!Array.isArray(chunk.blocks) || chunk.blocks.length !== entry.blockCount)
      throw new MissingSharedBlockError(`Shared chunk ${file} has an invalid block count`, { path: file })
    return chunk
  })
}
