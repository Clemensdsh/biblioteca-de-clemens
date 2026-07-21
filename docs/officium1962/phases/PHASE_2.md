# Phase 2 Summary: Completorium Vertical Slice

Date: 2026-07-20

## Status

Complete for the Phase 2 scope.

## Implemented

- Replaced the experimental raw `completorium.json` output with structured `Office1962Day` JSON.
- Preserved raw Divinum Officium adapter output under `raw/completorium-export.json` for audit and oracle comparison.
- Added typed Completorium blocks:
  - blessing
  - reading
  - dialogue
  - antiphon
  - psalm
  - hymn
  - capitulum
  - responsory
  - versicle
  - canticle
  - prayer
  - marian-antiphon
  - rubric
- Added metadata for psalm number, segment, verses, Gloria Patri presence or omission, antiphon association, responsory parts, seasonal Marian antiphons, private-recitation formulas, and special structures.
- Added per-block sourceRefs with upstream commit, source path, section, and transformation notes.
- Added sourceRef integrity tests for prayer, hymn, psalm, antiphon, Marian antiphon, reading, and responsory blocks.
- Added `scripts/officium1962/compare-with-upstream.mjs`.
- Generated oracle comparison outputs:
  - `docs/officium1962/reports/completorium-oracle-comparison.md`
  - `public/data/officium1962/reports/completorium-oracle-comparison.json`
- Added an isolated development preview under `playground/officium1962/`.
- Updated `Office1962Viewer.vue` to consume structured JSON only.
- Kept Officium components out of production routes and navigation.

## Verified Dates

- 2026-07-20: ordinary weekday
- 2026-07-19: Sunday
- 2026-04-02: Holy Thursday, special Completorium
- 2026-04-05: Easter Sunday
- 2026-08-15: Assumption
- 2026-11-02: All Souls, defunctorum structure
- 2026-12-25: Christmas

## Oracle Comparison

Date-level counts:

- exact: 7
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

Block-level counts:

- exact: 113
- normalized-equivalent: 0
- expected-structural-difference: 0
- mismatch: 0
- unresolved: 0

The oracle is the pinned Divinum Officium Perl engine at commit `515a213f79951c563be4f599ca591c63aa63bb6d`, invoked through the local adapter with Latin and `Rubrics 1960 - 1960`.

## SourceRef Limitation

The upstream Perl pipeline resolves many textual inclusions before the adapter receives each unit. When the original file line range is no longer available after `specials` and `resolve_refs`, the structured exporter records the upstream file and section instead of inventing line numbers. This applies especially to common prayers, special seasonal text, and fully expanded psalms.

## Preview

Run:

```bash
pnpm officium1962:preview
```

Open:

```text
http://127.0.0.1:4862/playground/officium1962/
```

The preview is not part of the Valaxy production route tree or navigation.

## Verification

- `pnpm officium1962:validate`: pass, 20 tests plus oracle comparison.
- `pnpm test`: pass, 6 files / 66 tests.
- `pnpm build`: pass.
- Playground build check: pass with `pnpm exec vite build --config playground/officium1962/vite.config.mjs --outDir .tmp-officium1962-preview-build`.

## Isolation Confirmation

- Existing Prima files under `features/prima1962`, `public/data/prima1962`, and martyrology components were not modified.
- Existing `/martyrology/` route and related files were not modified.
- No production route, homepage, or navigation entry imports `components/officium1962`.
- The default Valaxy build does not execute Perl and does not request Divinum Officium online.
- Spanish data, `Martyrologium1960`, and `missa` data were not imported.

## Not Included

- Tertia, Sexta, Nona, Prima, Laudes, Vesperae, and Matutinum.
- Year generation and deduplication.
- Production `/officium-1962/` candidate page.
