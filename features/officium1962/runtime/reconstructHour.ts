import type { LiturgicalBlock, OfficeHourName } from '../schema'
import { InvalidDayDocumentError, MissingSharedBlockError } from './errors'
import { loadSharedChunk } from './loadSharedChunk'
import type { ReleaseDayDocument, RuntimeContext, SharedManifest } from './types'

export async function reconstructHour(context: RuntimeContext, day: ReleaseDayDocument, hourName: OfficeHourName, manifest: SharedManifest) {
  const releaseHour = day.hours[hourName]
  if (!releaseHour)
    throw new InvalidDayDocumentError(`${day.date} does not contain ${hourName}`)

  const chunkFiles = new Set<string>()
  for (const occurrence of releaseHour.occurrences) {
    const entry = manifest.blocks[occurrence.blockId]
    if (!entry)
      throw new MissingSharedBlockError(`Missing shared manifest entry ${occurrence.blockId}`)
    chunkFiles.add(entry.chunk)
  }
  const loaded = await Promise.all([...chunkFiles].map(file => loadSharedChunk(context, manifest, file)))
  const blocksById = new Map(loaded.flatMap(chunk => chunk.blocks).map(block => [block.id, block]))

  const blocks: LiturgicalBlock[] = releaseHour.occurrences.map((occurrence) => {
    const shared = blocksById.get(occurrence.blockId)
    const indexEntry = manifest.blocks[occurrence.blockId]
    if (!shared)
      throw new MissingSharedBlockError(`Missing shared block ${occurrence.blockId}`, { path: indexEntry?.chunk })
    if (shared.contentHash !== indexEntry.contentHash)
      throw new MissingSharedBlockError(`Shared block hash does not match manifest for ${occurrence.blockId}`)
    const metadata = occurrence.occurrenceMetadata
    return {
      id: occurrence.occurrenceId,
      type: shared.type,
      title: metadata?.title ?? shared.title,
      text: shared.text || [],
      verses: shared.verses || [],
      rubricLines: shared.rubricLines || [],
      metadata: metadata?.metadata || {},
      sourceRefs: metadata?.sourceRefs || shared.sourceRefs || [],
      warnings: metadata?.warnings || [],
    }
  })

  return { ...releaseHour, blocks }
}
