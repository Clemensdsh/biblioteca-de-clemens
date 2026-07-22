# Officium Romanum 1962 Progress

Last updated: 2026-07-22

## Current Phase

Phase 0 through Phase 7 and the final production archive are complete. The production feature flag and the single `罗马日课 1962` navigation entry are enabled. The 2026 Latin translation corpus has been extracted as an offline workspace; the production website still displays Latin only.

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
- Recorded the Phase 7 starting baseline at HEAD `7c126f2`: 6 files / 167 tests, production build passed, playground build passed, and annual validation passed.
- Added the production release loader under `features/officium1962/runtime/` with schema, upstream commit, checksum, reference, cache, duplicate request, network, unavailable date/year, and base-path handling.
- Added browser-local civil-date and query-state helpers without UTC conversion.
- Added the `/officium-1962/` production page candidate behind the disabled single-source feature flag in `config/features.ts`.
- Added Phase 7A loader, URL-state, and isolation tests.
- Completed `docs/officium1962/phases/PHASE_7A.md`.
- Completed production continuous-book styling, Matutinum anchors, Vesperae special metadata, Chinese error states, source/license disclosure, theme dark mode, and print styles.
- Added production SEO metadata and verified the SSG HTML output.
- Added accessibility and production page tests plus an eight-hour real-release integration test.
- Completed `docs/officium1962/phases/PHASE_7B.md` and `docs/officium1962/reports/phase-7-accessibility.md`.
- Enabled the single production feature flag and added exactly one `罗马日课 1962` entry to the existing page navigation.
- Added the client-date SSG shell route after detecting and fixing a hard-refresh hydration error.
- Added Netlify/Vercel cache policy for release JSON without marking ordinal shared chunks immutable.
- Verified production route refresh, JSON MIME, URL history, errors, desktop/mobile layout, dark mode, print, and 50 requested date/hour acceptance combinations.
- Completed the final production browser audit with 0 console errors and no desktop or 390 px mobile overflow.
- Added Phase 7 performance, accessibility, manual acceptance, production runbook, and phase completion documentation.
- Re-ran the complete oracle chain: Completorium 7/113, minor hours 28/305, major hours 14/234, Matutinum 29/1632, and annual sample 192/3826 exact; mismatch 0 and unresolved 0.
- Re-ran annual validation: 365 days, 2920 date/hour outputs, 55184 occurrences, and 8713 shared blocks.
- Re-ran the full suite: 11 files / 200 tests passed; production and playground builds passed.
- Measured route bundle, cold loads, same-day/same-month/cross-month cache behavior, and local article-ready time.
- Verified flag-off build rollback and restored the enabled final build.
- Completed Phase 7C and its performance/manual acceptance reports.
- Confirmed Cloudflare Pages first clone timeout, successful Retry deployment, and production deployment of commit `10d951f5901a6d2991063763d7b7d471566c688a`.
- Verified `https://biblioteca-de-clemens.pages.dev/officium-1962/` and `https://clemensdsh.xyz/officium-1962/` return the production page.
- Added deterministic, checksum-validating Latin corpus extraction and validation commands that read release JSON only.
- Extracted 9102 canonical entries: 8713 shared blocks, 387 release metadata entries, and 2 production display labels.
- Preserved all 55184 release occurrences, 100% sourceRefs coverage, 365 calendar rows, and 67 commemoration mappings.
- Generated the editable Simplified Chinese translation template without translations, plus CSV, by-type, source, occurrence, duplicate, coverage, and roundtrip views.
- Added translation merge preservation, deprecated-ID handling, production isolation, stable ID, Unicode, protected-character, forbidden-path, and deterministic output tests.
- Added `docs/officium1962/TRANSLATION_WORKFLOW.md` and `docs/officium1962/FINAL_CHECKPOINT.md`.

## In Progress

- None.

## Not Started

- Optional Chinese translation and review work; it is outside the completed production/archive scope.

## Blockers

- None currently.

## Latest Test And Build Results

- `pnpm officium1962:extract-corpus`: pass, 9102 corpus entries, 8713 shared blocks, 55184 release occurrences, 100% sourceRefs.
- `pnpm officium1962:validate-corpus`: pass, deterministic roundtrip and production isolation.
- `pnpm officium1962:validate`: pass, 7 files / 169 tests plus Completorium, minor hours, major hours, Matutinum, annual validation, and annual sample oracle comparisons.
- `pnpm test`: pass, 12 files / 215 tests.
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
- Phase 6 deduplication and year generation are resolved for the 2026 release; multi-year packaging remains future work.
- Phase 6 release data: mismatch 0, unresolved 0.
- Annual release data: 365 days, 2920 date/hour outputs, 55184 occurrences, 8713 shared blocks, 0 orphan blocks.

## Next Step

Optional future work begins in `resources/officium1962-latin/translation-template.zh-Hans.jsonl`. The website must remain Latin-only until reviewed and approved translation chunks are separately designed, validated, and deployed.
