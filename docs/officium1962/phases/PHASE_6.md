# Phase 6 Summary: Full Year Release Data

Date: 2026-07-20

## Status

Complete for the Phase 6 scope.

## Implemented

- Added deterministic full-year builder: `pnpm officium1962:build-year --year=2026 --hours=all-supported --resume --strict`.
- Added resumable structured cache under `.cache/officium1962/structured/`.
- Added optional ignored raw audit output under `.work/officium1962/raw/` via `--keep-raw`.
- Added multi-hour local Perl adapter mode for annual generation without changing the pinned upstream repository.
- Generated 2026 release data for all eight supported hours.
- Added shared block deduplication and stable release manifests.
- Added annual validation command: `pnpm officium1962:validate-year --year=2026`.
- Added fixed annual sample oracle command: `pnpm officium1962:compare-year-sample`.
- Updated isolated playground to read release format by fetch, with shared chunk caching and debug load stats.
- Added data format documentation: `docs/officium1962/data-format-v1.md`.

## Release Data

- Days generated: 365.
- Date/hour outputs: 2920.
- Legal omissions: 0.
- Block occurrences: 55184.
- Shared blocks: 8713.
- Raw structured estimate: 221392867 bytes.
- Release size: 164920912 bytes.
- Gzip estimate: 15137598 bytes.
- Brotli estimate: 2989578 bytes.
- Deduplication ratio: 0.2619.
- Release schema: `officium1962.v1`.
- Upstream commit: `515a213f79951c563be4f599ca591c63aa63bb6d`.

## Reports

- `docs/officium1962/reports/year-2026-build.md`
- `docs/officium1962/reports/year-2026-validation.md`
- `docs/officium1962/reports/year-2026-oracle-summary.md`
- `docs/officium1962/reports/deduplication.md`
- `docs/officium1962/reports/reproducibility.md`
- `docs/officium1962/reports/performance.md`

Machine-readable reports are under `public/data/officium1962/reports/`.

## Oracle

Existing full fixture oracle baselines remain exact:

- Completorium: date/hour exact 7, block exact 113, mismatch 0, unresolved 0.
- Horae minores and Prima: date/hour exact 28, block exact 305, mismatch 0, unresolved 0.
- Laudes/Vesperae: date/hour exact 14, block exact 234, mismatch 0, unresolved 0.
- Matutinum: date/hour exact 29, block exact 1632, mismatch 0, unresolved 0.

Annual fixed sample oracle:

- Sample dates: 24.
- Date/hour outputs: 192.
- Block exact: 3826.
- Mismatch: 0.
- Unresolved: 0.

Whole-year lightweight comparison:

- Date/hour outputs: 2920.
- Mismatch: 0.
- Unresolved: 0.

## Validation

- `pnpm officium1962:validate-year --year=2026`: pass.
- Annual validation result: 365 days, 2920 date/hour outputs, 55184 occurrences, 8713 shared blocks, 0 orphan blocks, 0 HTML leaks, 0 forbidden source refs.
- `pnpm test`: pass, 6 files / 167 tests.
- `pnpm officium1962:validate`: pass, including Phase 2-5 oracle, annual validation, and annual sample oracle.
- `pnpm build`: pass.
- Playground Vite build: pass; JS bundle 8.77 kB before gzip.

## Isolation

- Existing `features/prima1962` was not modified.
- Existing `/martyrology/` was not modified.
- Homepage, navigation, and production routes remain untouched.
- The isolated playground remains the only preview entry.
- Annual release data is fetched at runtime by the playground and is not imported into JavaScript bundles.
- Annual raw exports are not in `public`.

## Preview

Run:

```bash
pnpm officium1962:preview
```

The playground loads:

- `public/data/officium1962/manifest.json`
- `public/data/officium1962/years/2026/...`
- `public/data/officium1962/shared/...`

It supports all eight hours and reports loaded files, request count, cached shared chunks, and current expanded day size in debug mode.
