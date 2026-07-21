# Phase 5 Summary: Matutinum

Date: 2026-07-20

## Status

Complete for the Phase 5 scope.

## Implemented

- Added structured Rubrics 1960 / Latin Matutinum support.
- Added an isolated parser under `features/officium1962/parsers/matutinum/`.
- Added Matutinum block types:
  - `invitatory`
  - `absolution`
  - `matins-responsory`
  - `te-deum`
- Modeled Invitatorium with Psalm 94 and explicit antiphon repetition metadata.
- Modeled one-nocturn and three-nocturn forms.
- Modeled nocturn metadata, lesson numbering, blessing mapping, reading kinds, responsories, Te Deum, and special omitted structures.
- Added `public/data/officium1962/experimental/fixtures/matutinum-fixtures.json`.
- Added `docs/officium1962/reports/matutinum-oracle-comparison.md`.
- Added `public/data/officium1962/reports/matutinum-oracle-comparison.json`.
- Added `--hours=all-supported` to the day builder.
- Added Matutinum to the isolated playground without production route integration.

## Fixture Coverage

- Fixture count: 29 dates.
- One-nocturn fixtures: 12.
- Three-nocturn fixtures: 17.
- Total lessons represented: 189.
- Total Matutinum responsory blocks: 173.
- SourceRefs completeness: 1632/1632 blocks.
- Triduum and All Souls fixtures are included.
- Leap day fixture: `2028-02-29`.

## Oracle Comparison

- date/hour exact: 29
- block exact: 1632
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

Earlier oracle baselines after Phase 5:

- Completorium date exact: 7; block exact: 113; mismatch: 0; unresolved: 0.
- Horae minores and Prima date/hour exact: 28; block exact: 305; mismatch: 0; unresolved: 0.
- Laudes/Vesperae date/hour exact: 14; block exact: 234; mismatch: 0; unresolved: 0.

## Isolation Confirmation

- Existing `features/prima1962`, `public/data/prima1962`, martyrology components, and `/martyrology/` files were not modified.
- No production page, route, homepage, or navigation entry imports Officium 1962 code.
- The isolated playground remains the only preview entry.
- The fixed upstream commit remains `515a213f79951c563be4f599ca591c63aa63bb6d`.
- Full-year generation and production integration were not started.

## Verification

- `pnpm officium1962:validate`: pass, 117 feature tests plus Completorium, Phase 3, Phase 4, and Matutinum oracle comparisons.
- `pnpm test`: pass, 6 files / 163 tests.
- `pnpm build`: pass.
- `pnpm exec vite build --config playground/officium1962/vite.config.mjs --outDir .tmp-officium1962-preview-build`: pass.

## Preview

Run:

```bash
pnpm officium1962:preview
```

Open:

```text
http://127.0.0.1:4862/playground/officium1962/
```

The playground can switch among Matutinum, Laudes, Prima, Tertia, Sexta, Nona, Vesperae, and Completorium for generated fixture dates.
