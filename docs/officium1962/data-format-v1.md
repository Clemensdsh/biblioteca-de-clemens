# Officium 1962 Data Format v1

Schema version: `officium1962.v1`

## Root Manifest

Path: `public/data/officium1962/manifest.json`

Lists available generated years, the shared manifest, report path, experimental fixture path, generator version, generation timestamp, and pinned upstream commit.

## Year Manifest

Path: `public/data/officium1962/years/2026/manifest.json`

Contains year, date range, day count, supported hours, calendar path, month chunk paths, day file paths, and checksums. It does not contain full liturgical text.

## Calendar

Path: `public/data/officium1962/years/2026/calendar.json`

Each calendar day contains civil date, liturgical title, rank, season estimate, available hours, month chunk, and day file. It is intended for date pickers and prefetching.

## Month Index

Path pattern: `public/data/officium1962/years/2026/months/MM.json`

Each file contains the same lightweight day summaries for one month. It supports month-level prefetch without downloading the year text.

## Day Document

Path pattern: `public/data/officium1962/years/2026/days/YYYY-MM-DD.json`

A day document contains metadata and hour occurrence lists. It references shared blocks by `blockId` and preserves per-occurrence order and metadata:

```json
{
  "blockId": "shared-...",
  "occurrenceId": "office-1962-2026-07-20-matutinum-...",
  "order": 1,
  "occurrenceMetadata": {}
}
```

Day documents do not duplicate full Latin text.

## Shared Blocks

Path pattern: `public/data/officium1962/shared/blocks-NNN.json`

Shared blocks contain the canonical Latin text, block type, title, verses, rubric lines, sourceRefs, and content hash. `shared/manifest.json` maps each `blockId` to its chunk.

## Identity

- `contentHash` is SHA-256 over canonical block content and sourceRefs.
- `blockId` is derived from the content hash.
- `occurrenceId` preserves the original date/hour parser identity.
- Occurrence metadata stores date/hour-specific liturgical context such as lesson number, nocturn number, antiphon repetition, and Vesperae context.

## SourceRefs

Each shared block records upstream commit, path, section when available, and transformation notes. SourceRefs retain the pinned commit `515a213f79951c563be4f599ca591c63aa63bb6d`.

## Unknown Schema

The playground release loader rejects any document whose `schemaVersion` is not `officium1962.v1`. It does not guess or silently render unknown formats.

## Exclusions

Release data excludes annual raw Divinum Officium exports. It also excludes Spanish/Espanol data, `Latin/Martyrologium1960`, Mass data, existing `features/prima1962`, and existing `/martyrology/` data.
