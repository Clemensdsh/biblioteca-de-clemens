# Phase 3 Summary: Minor Hours And Prima

Date: 2026-07-20

## Status

Complete for the Phase 3 scope.

## Implemented

- Added structured Rubrics 1960 / Latin export support for:
  - Tertia
  - Sexta
  - Nona
  - Prima
- Added a shared Horae minores parser path for Tertia, Sexta, and Nona.
- Added `MinorHourName` and `MinorHourMetadata` to the schema.
- Added Prima-specific blocks without importing or reusing the existing `features/prima1962` resolver or `/martyrology/` page:
  - martyrology
  - pretiosa
  - chapter-office
  - lectio brevis
  - final blessing
- Added support for omitted sections in special days.
- Added support for Easter `Versus (In loco Capituli)`.
- Added support for defunctorum small-hour structures on All Souls.
- Updated the offline day builder to accept comma or whitespace-separated hour lists.
- Generalized `compare-with-upstream.mjs` to compare arbitrary generated hours.
- Added Phase 3 oracle reports:
  - `docs/officium1962/reports/minor-hours-oracle-comparison.md`
  - `public/data/officium1962/reports/minor-hours-oracle-comparison.json`
- Updated the isolated playground with a date and hour selector.

## Verified Dates

All four Phase 3 hours were generated and compared for:

- 2026-07-20: ordinary weekday
- 2026-07-19: Sunday
- 2026-04-02: Holy Thursday special structure
- 2026-04-05: Easter Sunday
- 2026-08-15: Assumption
- 2026-11-02: All Souls defunctorum structure
- 2026-12-25: Christmas

## Oracle Comparison

Phase 3 date/hour-level counts:

- exact: 28
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

Phase 3 block-level counts:

- exact: 305
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

Completorium was rechecked after Phase 3:

- date exact: 7
- block exact: 113
- mismatch: 0
- unresolved: 0

## Isolation Confirmation

- Existing `features/prima1962`, `public/data/prima1962`, martyrology components, and `/martyrology/` files were not modified.
- Phase 3 Prima is parsed only from the pinned Divinum Officium Latin / Rubrics 1960 output.
- No production page, route, homepage, or navigation entry imports Officium 1962 code.
- The default production build still does not execute Perl and does not contact Divinum Officium online.
- The fixed upstream commit remains `515a213f79951c563be4f599ca591c63aa63bb6d`.

## Verification

- `pnpm officium1962:validate`: pass, 58 feature tests plus both oracle comparisons.
- `pnpm test`: pass, 6 files / 104 tests.
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

The playground can switch among Completorium, Tertia, Sexta, Nona, and Prima for generated fixture dates.

## Not Included

- Laudes
- Vesperae
- Matutinum
- Full-year generation and deduplication
- Production route candidate
