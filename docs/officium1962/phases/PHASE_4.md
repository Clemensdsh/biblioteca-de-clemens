# Phase 4 Summary: Laudes And Vesperae

Date: 2026-07-20

## Status

Complete for the Phase 4 scope.

## Implemented

- Added structured Rubrics 1960 / Latin export support for:
  - Laudes
  - Vesperae
- Added a shared major-hour parser path for Laudes and Vesperae.
- Added `MajorHourName` and `MajorHourMetadata` to the schema.
- Added major-hour source routing for:
  - `web/www/horas/Ordinarium/Laudes.txt`
  - `web/www/horas/Ordinarium/Vespera.txt`
  - `web/www/horas/Latin/Psalterium/Special/Major Special.txt`
- Modeled Laudes psalmody as five units, including Old Testament canticles when Divinum Officium resolves them.
- Modeled Benedictus and Magnificat as canticle blocks with repeated antiphons.
- Modeled `Capitulum Hymnus Versus`, `Versus (In loco Capituli)`, omitted major-hour sections, suffrage/commemoration material, collect, and conclusion.
- Preserved upstream-resolved empty Vesperae sections explicitly instead of inventing missing psalmody or hymns.
- Recorded Vesperae concurrence as resolved by the pinned upstream engine, not recalculated in Vue.
- Added Phase 4 oracle comparison reports:
  - `docs/officium1962/reports/major-hours-oracle-comparison.md`
  - `public/data/officium1962/reports/major-hours-oracle-comparison.json`
- Updated the isolated playground hour selector to include Laudes and Vesperae.

## Verified Dates

Both Laudes and Vesperae were generated and compared for:

- 2026-07-20: ordinary weekday
- 2026-07-19: Sunday
- 2026-04-02: Holy Thursday special structure
- 2026-04-05: Easter Sunday
- 2026-08-15: Assumption
- 2026-11-02: All Souls defunctorum structure
- 2026-12-25: Christmas

## Oracle Comparison

Phase 4 date/hour-level counts:

- exact: 14
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

Phase 4 block-level counts:

- exact: 234
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

Earlier slices were rechecked after Phase 4:

- Completorium date exact: 7
- Completorium block exact: 113
- Phase 3 date/hour exact: 28
- Phase 3 block exact: 305
- mismatch: 0
- unresolved: 0

## Isolation Confirmation

- Existing `features/prima1962`, `public/data/prima1962`, martyrology components, and `/martyrology/` files were not modified.
- Phase 4 does not import or reuse existing Prima or martyrology code.
- No production page, route, homepage, or navigation entry imports Officium 1962 code.
- The isolated playground is still the only preview entry for these generated hours.
- The default production build still does not execute Perl and does not contact Divinum Officium online.
- The fixed upstream commit remains `515a213f79951c563be4f599ca591c63aa63bb6d`.

## Verification

- `pnpm officium1962:validate`: pass, 80 feature tests plus Completorium, Phase 3, and Phase 4 oracle comparisons.
- `pnpm test`: pass, 6 files / 126 tests.
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

The playground can switch among Completorium, Laudes, Tertia, Sexta, Nona, Prima, and Vesperae for generated fixture dates.

## Not Included

- Matutinum
- Full-year generation and deduplication
- Production route candidate
