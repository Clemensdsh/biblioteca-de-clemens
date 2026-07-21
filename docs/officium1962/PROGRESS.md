# Officium Romanum 1962 Progress

Last updated: 2026-07-21T01:44:57-04:00

## Current Phase

Phase 6 complete and checkpointed: 2026 full-year release data, deduplication, annual validation, and release-format playground are complete. Phase 7 production integration has not started.

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
- Added Phase 5 structured output for Matutinum.
- Added isolated Matutinum parser modules under `features/officium1962/parsers/matutinum/`.
- Added Matutinum-specific block types for invitatory, absolution, matins responsory, and Te Deum.
- Added structured one-nocturn and three-nocturn metadata with nocturn, lesson, psalm, versicle, absolution, and responsory IDs.
- Added reading kind classification for scripture, hagiographic, homily, patristic, common, and special readings.
- Added Triduum bare-lesson handling without fabricated blessings.
- Added Matutinum fixture manifest with 29 dates.
- Added Matutinum oracle comparison report.
- Updated the isolated playground selector with Matutinum first.
- Added `--hours=all-supported` to the day builder.
- Rechecked Completorium, Phase 3, and Phase 4 oracle comparisons after Phase 5 changes.
- Added Phase 6 full-year builder, annual validator, release manifests, shared block deduplication, and fixed annual sample oracle.
- Generated 2026 release data for 365 days and 2920 date/hour outputs.
- Added release-format playground loading through `manifest.json`, year/day files, and shared chunks.
- Added Phase 6 reports for build, validation, oracle summary, deduplication, reproducibility, and performance.
- Added checkpoint `docs/officium1962/CHECKPOINT_2026_PHASE_6_COMPLETE.md` for continuing work after Phase 6.

## In Progress

- None for Phase 6.

## Not Started

- Phase 7 production integration candidate.

## Blockers

- None currently.

## Latest Test And Build Results

- `pnpm officium1962:validate`: pass, 1 file / 121 tests plus Completorium, Phase 3, Phase 4, Matutinum, annual validation, and annual sample oracle comparisons.
- `pnpm test`: pass, 6 files / 167 tests.
- `pnpm build`: pass.
- `pnpm officium1962:build-year --year=2026 --hours=all-supported --resume --strict`: pass.
- `pnpm officium1962:validate-year --year=2026`: pass, 365 days, 2920 date/hour outputs, 55184 occurrences, 8713 shared blocks.
- `node scripts/officium1962/compare-year-sample.mjs`: pass, 192 date/hour outputs and 3826 blocks exact.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=completorium`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=tertia,sexta,nona,prima`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=laudes,vesperae`: pass.
- `pnpm officium1962:build-day --date=2026-07-20 --hours=matutinum`: pass.
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
- 2026-01-01 Matutinum: generated and oracle exact
- 2026-01-06 Matutinum: generated and oracle exact
- 2026-02-28 Matutinum: generated and oracle exact
- 2026-03-01 Matutinum: generated and oracle exact
- 2026-03-19 Matutinum: generated and oracle exact
- 2026-03-25 Matutinum: generated and oracle exact
- 2026-03-29 Matutinum: generated and oracle exact
- 2026-04-02 Matutinum: generated as Holy Thursday special structure and oracle exact
- 2026-04-03 Matutinum: generated as Good Friday special structure and oracle exact
- 2026-04-04 Matutinum: generated as Holy Saturday special structure and oracle exact
- 2026-04-05 Matutinum: generated as Easter special structure and oracle exact
- 2026-05-14 Matutinum: generated and oracle exact
- 2026-05-24 Matutinum: generated and oracle exact
- 2026-05-31 Matutinum: generated and oracle exact
- 2026-06-04 Matutinum: generated and oracle exact
- 2026-06-12 Matutinum: generated and oracle exact
- 2026-06-29 Matutinum: generated and oracle exact
- 2026-07-19 Matutinum: generated and oracle exact
- 2026-07-20 Matutinum: generated and oracle exact
- 2026-08-15 Matutinum: generated and oracle exact
- 2026-11-01 Matutinum: generated and oracle exact
- 2026-11-02 Matutinum: generated as defunctorum structure and oracle exact
- 2026-12-08 Matutinum: generated and oracle exact
- 2026-12-17 Matutinum: generated and oracle exact
- 2026-12-23 Matutinum: generated and oracle exact
- 2026-12-24 Matutinum: generated and oracle exact
- 2026-12-25 Matutinum: generated and oracle exact
- 2026-12-31 Matutinum: generated and oracle exact
- 2028-02-29 Matutinum: generated and oracle exact

## Mismatch Count

- Date-level mismatch: 0.
- Block-level mismatch: 0.
- Annual sample mismatch: 0.
- Reports:
  - `docs/officium1962/reports/completorium-oracle-comparison.md`
  - `public/data/officium1962/reports/completorium-oracle-comparison.json`
  - `docs/officium1962/reports/minor-hours-oracle-comparison.md`
  - `public/data/officium1962/reports/minor-hours-oracle-comparison.json`
  - `docs/officium1962/reports/major-hours-oracle-comparison.md`
  - `public/data/officium1962/reports/major-hours-oracle-comparison.json`
  - `docs/officium1962/reports/matutinum-oracle-comparison.md`
  - `public/data/officium1962/reports/matutinum-oracle-comparison.json`

## Unresolved Count

- Date-level unresolved: 0.
- Block-level unresolved: 0.
- Adapter warnings for verified Completorium, Phase 3, Phase 4, and Matutinum dates: 0.
- Source line ranges remain limited where the upstream Perl pipeline has already resolved inclusions; file and section are recorded.
- Deduplication and year generation remain unresolved.
- Phase 6 release data: mismatch 0, unresolved 0.
- Annual release data: 365 days, 2920 date/hour outputs, 55184 occurrences, 8713 shared blocks, 0 orphan blocks.

## Next Step

Proceed to Phase 7 production integration candidate only after reading `docs/officium1962/CHECKPOINT_2026_PHASE_6_COMPLETE.md` and this progress file. Do not redo Phase 6, update Divinum Officium, change the fixed upstream commit, or enable production routing/navigation until explicitly requested.
