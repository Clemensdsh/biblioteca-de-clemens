export class Officium1962Cache {
  rootManifest?: Promise<import('./types').RootManifest>
  sharedManifest?: Promise<import('./types').SharedManifest>
  yearManifests = new Map<number, Promise<import('./types').YearManifest>>()
  calendars = new Map<number, Promise<import('./types').YearCalendar>>()
  days = new Map<string, Promise<import('./types').ReleaseDayDocument>>()
  sharedChunks = new Map<string, Promise<import('./types').SharedChunk>>()

  clear() {
    this.rootManifest = undefined
    this.sharedManifest = undefined
    this.yearManifests.clear()
    this.calendars.clear()
    this.days.clear()
    this.sharedChunks.clear()
  }

  snapshot() {
    return {
      yearManifests: this.yearManifests.size,
      calendars: this.calendars.size,
      days: this.days.size,
      sharedChunks: this.sharedChunks.size,
    }
  }
}

export function cachePromise<K, V>(map: Map<K, Promise<V>>, key: K, load: () => Promise<V>): Promise<V> {
  const existing = map.get(key)
  if (existing)
    return existing
  const pending = load().catch((error) => {
    map.delete(key)
    throw error
  })
  map.set(key, pending)
  return pending
}
