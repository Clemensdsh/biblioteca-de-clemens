import { InvalidChecksumError, ManifestLoadError, UnsupportedSchemaError } from './errors'
import { PINNED_UPSTREAM_COMMIT, RELEASE_SCHEMA_VERSION, type RuntimeContext } from './types'

export function releaseUrl(context: RuntimeContext, path: string): string {
  if (/^[a-z]+:/i.test(path) || path.includes('..'))
    throw new ManifestLoadError(`Unsafe release path: ${path}`, { path })
  const base = context.basePath === '/' ? '/' : `/${context.basePath.replace(/^\/+|\/+$/g, '')}/`
  return `${base}data/officium1962/${path.replace(/^\/+/, '')}`
}

export async function fetchJson<T>(context: RuntimeContext, path: string, checksum?: string): Promise<T> {
  const url = releaseUrl(context, path)
  let response: Response
  try {
    response = await context.fetch(url, { headers: { Accept: 'application/json' } })
  }
  catch (cause) {
    throw new ManifestLoadError(`Network error loading ${url}`, { path: url, cause })
  }
  if (!response.ok)
    throw new ManifestLoadError(`HTTP ${response.status} loading ${url}`, { path: url, status: response.status })

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (checksum) {
    const actual = await sha256Bytes(bytes)
    if (actual !== checksum)
      throw new InvalidChecksumError(`Checksum mismatch for ${url}`, { path: url, expected: checksum, actual })
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T
  }
  catch (cause) {
    throw new ManifestLoadError(`Invalid JSON in ${url}`, { path: url, cause })
  }
}

export function assertReleaseIdentity(value: unknown, label: string) {
  const item = value as { schemaVersion?: string, upstreamCommit?: string }
  if (item?.schemaVersion !== RELEASE_SCHEMA_VERSION) {
    throw new UnsupportedSchemaError(`${label} uses ${item?.schemaVersion || 'no schemaVersion'}`, {
      expected: RELEASE_SCHEMA_VERSION,
      actual: item?.schemaVersion,
    })
  }
  if (item.upstreamCommit !== PINNED_UPSTREAM_COMMIT) {
    throw new ManifestLoadError(`${label} uses an unexpected upstream commit`, {
      expected: PINNED_UPSTREAM_COMMIT,
      actual: item.upstreamCommit,
    })
  }
}

export async function sha256Bytes(bytes: Uint8Array): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('')
}
