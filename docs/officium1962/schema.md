# Officium 1962 Experimental Schema

Current structured day schema version: `0.2.0`.

## Day

`Office1962Day` stores one civil date and one or more generated hours. Each generated hour is a structured `OfficeHour` keyed by hour name.

## Hour Blocks

All hours expose a flat `blocks` array for rendering and oracle comparison. Blocks have:

- stable `id`
- known `type`
- Latin `text`
- optional `metadata`
- non-empty `sourceRefs`
- `warnings`

The flat array is not the only semantic model. Complex hours also store hierarchy in metadata.

## Matutinum Metadata

Matutinum uses:

```ts
metadata: {
  nocturnCount: 1 | 3
  lessonCount: 3 | 9
  officeForm: 'ferial' | 'sunday' | 'festal' | 'vigil' | 'requiem' | 'triduum' | 'special'
  teDeumIncluded: boolean
  invitatoryIncluded: boolean
  sourceClassifications: string[]
  nocturns: Array<{
    number: 1 | 2 | 3
    psalmBlockIds: string[]
    versicleBlockId?: string
    absolutionBlockId?: string
    lessonBlockIds: string[]
    responsoryBlockIds: string[]
  }>
}
```

Matutinum-specific block types:

- `invitatory`
- `absolution`
- `matins-responsory`
- `te-deum`

Lesson readings remain `reading` blocks with `metadata.lessonNumber`, `metadata.nocturn`, and `metadata.readingKind`.

## SourceRefs

SourceRefs record the pinned upstream commit and source family. Because the Perl engine resolves references and Commune fallbacks before the adapter receives each unit, line-level source ranges are not always available. The schema therefore records file families, section names, and transformation steps rather than fabricating precise line ranges.
