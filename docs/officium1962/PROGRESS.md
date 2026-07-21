# Officium Romanum 1962 Progress

Last updated: 2026-07-20T20:42:30-04:00

## Current Phase

Phase 2 complete: Completorium vertical slice.

## Completed

- Read `package.json`, `vite.config.ts`, `valaxy.config.ts`, existing test file list, and Git state.
- Confirmed package scripts:
  - `pnpm test`
  - `pnpm build`
- Ran baseline tests: 5 test files passed, 46 tests passed.
- Ran baseline build: Valaxy SSG build passed.
- Added `vendor/divinum-officium/` to `.gitignore`.
- Established isolated documentation and module directories.
- Cloned Divinum Officium into `vendor/divinum-officium/`.
- Pinned upstream commit `515a213f79951c563be4f599ca591c63aa63bb6d`.
- Built Docker image `biblioteca-do-upstream:515a213f` from the upstream Dockerfile.
- Created an external Perl adapter and Node runner under `scripts/officium1962/`.
- Exported experimental JSON for 2026-07-20 Completorium.
- Added basic TypeScript schema and Latin technical normalization tests.
- Added a preliminary Completorium unit classifier that maps exported units into typed liturgical blocks.
- Added isolated Vue components:
  - `components/officium1962/Office1962Viewer.vue`
  - `components/officium1962/LiturgicalBlockRenderer.vue`
- Confirmed these components are not imported by production routes.
- Converted Completorium output from raw DO units into structured `Office1962Day` JSON.
- Preserved raw DO adapter output under each date's `raw/` directory.
- Generated structured Completorium data for seven Phase 2 fixture dates.
- Added per-block sourceRefs with upstream commit, path, section, and transformation notes.
- Added oracle comparison script and reports for Completorium.
- Added isolated `playground/officium1962/` preview.
- Updated Officium Vue components so they consume structured JSON rather than parsing raw DO output.
- Added Phase 2 tests covering schema, block order, stable IDs, sourceRefs, NFC, HTML leakage, psalm segmentation, antiphon repetition, Gloria Patri, seasonal Marian antiphons, private formulas, special days, renderer isolation, and oracle results.

## In Progress

- None for Phase 2.

## Not Started

- Phase 3 small hours.
- 2026 full-year generation.

## Blockers

- None currently.

## Latest Test And Build Results

- `pnpm officium1962:validate`: pass, 1 file / 20 tests plus oracle comparison.
- `pnpm test`: pass, 6 files / 66 tests.
- `pnpm build`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=completorium`: pass.
- `pnpm exec vite build --config playground/officium1962/vite.config.mjs --outDir .tmp-officium1962-preview-build`: pass.

## Upstream Commit

- `515a213f79951c563be4f599ca591c63aa63bb6d`

## Verified Dates

- 2026-07-20 Completorium: 13 units, 0 warnings
- 2026-07-19 Completorium: generated and oracle exact
- 2026-04-02 Completorium: generated as Holy Thursday special structure and oracle exact
- 2026-04-05 Completorium: generated and oracle exact
- 2026-08-15 Completorium: generated and oracle exact
- 2026-11-02 Completorium: generated as defunctorum special structure and oracle exact
- 2026-12-25 Completorium: generated and oracle exact

## Mismatch Count

- Date-level mismatch: 0.
- Block-level mismatch: 0.
- Reports:
  - `docs/officium1962/reports/completorium-oracle-comparison.md`
  - `public/data/officium1962/reports/completorium-oracle-comparison.json`

## Unresolved Count

- Date-level unresolved: 0.
- Block-level unresolved: 0.
- Adapter warnings for verified Completorium dates: 0.
- Source line ranges remain limited where the upstream Perl pipeline has already resolved inclusions; file and section are recorded.
- Deduplication, year generation, and all non-Completorium hours remain unresolved.

## Next Step

Begin Phase 3 only after review: add Tertia, Sexta, Nona, and Prima without touching existing Prima or `/martyrology/`.
