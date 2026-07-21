# Officium Romanum 1962 Progress

Last updated: 2026-07-20T22:05:30-04:00

## Current Phase

Phase 4 complete: Laudes and Vesperae vertical slice.

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
- Added Phase 3 structured output for Tertia, Sexta, Nona, and Prima.
- Added a shared Horae minores parser model for Tertia, Sexta, and Nona.
- Added Prima-specific parsing for martyrology anticipation, Pretiosa, Officium Capituli, Lectio brevis, and final blessing without touching the existing Prima or `/martyrology/` modules.
- Added Phase 3 oracle comparison report for seven dates and four hours.
- Updated the isolated playground with an hour selector.
- Rechecked Completorium oracle comparison after Phase 3 changes.
- Added Phase 4 structured output for Laudes and Vesperae.
- Added a shared major-hour parser model for Laudes and Vesperae.
- Added major-hour schema metadata for psalmody source, Gospel canticle, source refs, and upstream-resolved Vesperae concurrence.
- Added support for five-part Laudes psalmody, Old Testament canticles, Benedictus, Magnificat, `Capitulum Hymnus Versus`, `Versus (In loco Capituli)`, commemorations, omitted sections, and explicit upstream-empty Vesperae sections.
- Added Phase 4 oracle comparison report for seven dates and two hours.
- Updated the isolated playground selector with Laudes and Vesperae.
- Rechecked Completorium and Phase 3 oracle comparisons after Phase 4 changes.

## In Progress

- None for Phase 4.

## Not Started

- 2026 full-year generation.
- Matutinum.

## Blockers

- None currently.

## Latest Test And Build Results

- `pnpm officium1962:validate`: pass, 1 file / 80 tests plus Completorium, Phase 3, and Phase 4 oracle comparisons.
- `pnpm test`: pass, 6 files / 126 tests.
- `pnpm build`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=completorium`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=tertia,sexta,nona,prima`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=laudes,vesperae`: pass.
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
- 2026-07-20 Tertia/Sexta/Nona/Prima: generated and oracle exact
- 2026-07-19 Tertia/Sexta/Nona/Prima: generated and oracle exact
- 2026-04-02 Tertia/Sexta/Nona/Prima: generated as Holy Thursday special structures and oracle exact
- 2026-04-05 Tertia/Sexta/Nona/Prima: generated and oracle exact
- 2026-08-15 Tertia/Sexta/Nona/Prima: generated and oracle exact
- 2026-11-02 Tertia/Sexta/Nona/Prima: generated as defunctorum structures and oracle exact
- 2026-12-25 Tertia/Sexta/Nona/Prima: generated and oracle exact
- 2026-07-20 Laudes/Vesperae: generated and oracle exact
- 2026-07-19 Laudes/Vesperae: generated and oracle exact
- 2026-04-02 Laudes/Vesperae: generated as Holy Thursday special structures and oracle exact
- 2026-04-05 Laudes/Vesperae: generated as Easter special structures and oracle exact
- 2026-08-15 Laudes/Vesperae: generated and oracle exact
- 2026-11-02 Laudes/Vesperae: generated as defunctorum structures and oracle exact
- 2026-12-25 Laudes/Vesperae: generated and oracle exact

## Mismatch Count

- Date-level mismatch: 0.
- Block-level mismatch: 0.
- Reports:
  - `docs/officium1962/reports/completorium-oracle-comparison.md`
  - `public/data/officium1962/reports/completorium-oracle-comparison.json`
  - `docs/officium1962/reports/minor-hours-oracle-comparison.md`
  - `public/data/officium1962/reports/minor-hours-oracle-comparison.json`
  - `docs/officium1962/reports/major-hours-oracle-comparison.md`
  - `public/data/officium1962/reports/major-hours-oracle-comparison.json`

## Unresolved Count

- Date-level unresolved: 0.
- Block-level unresolved: 0.
- Adapter warnings for verified Completorium, Phase 3, and Phase 4 dates: 0.
- Source line ranges remain limited where the upstream Perl pipeline has already resolved inclusions; file and section are recorded.
- Deduplication, year generation, and Matutinum remain unresolved.

## Next Step

Proceed to Phase 5 Matutinum only after review; do not start it until Phase 4 is accepted.
