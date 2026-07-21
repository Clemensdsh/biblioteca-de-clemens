# Officium 1962 Year Build Analysis

Date: 2026-07-20

## Existing Chain

The Phase 5 chain is deterministic at the single date/hour level when the same pinned upstream commit, Docker image, date, hour, language, and version are used. `run-do-export.mjs` invokes the local Divinum Officium Perl adapter with Latin and `Rubrics 1960 - 1960`; `build-day.mjs` parses that output through the local structured parser and validates the experimental day JSON.

The fixed upstream commit remains:

```text
515a213f79951c563be4f599ca591c63aa63bb6d
```

## Determinism Checks

- Block IDs are derived from civil date, hour, and parser keys, so they are stable across repeated runs for the same upstream output.
- SourceRefs are generated from the pinned upstream commit, fixed path rules, resolved raw sections, and parser transformations; they do not include temporary paths.
- Existing experimental raw fixtures are used only by oracle tests and remain under `public/data/officium1962/experimental/`.
- Full-year raw exports should not be written to `public`. The year builder writes reusable structured cache files under `.cache/officium1962/structured/` and writes optional raw audit files only under `.work/officium1962/raw/` when `--keep-raw` is provided.

## Release Packaging

The Phase 6 release format separates:

- shared text blocks in `public/data/officium1962/shared/`
- day occurrence files in `public/data/officium1962/years/2026/days/`
- month indexes in `public/data/officium1962/years/2026/months/`
- a lightweight calendar index in `public/data/officium1962/years/2026/calendar.json`
- reports in `public/data/officium1962/reports/`

The playground must load these release files through fetch calls. It must not import annual data into JavaScript.

## Resume Strategy

The year builder treats `.cache/officium1962/structured/<year>/<date>/<hour>.json` as the recoverable unit. A cache file is skipped only when it parses, validates, has the expected date and hour, and has the fixed upstream commit. Otherwise it is regenerated. Release manifests are written after packaging, not used as proof that an interrupted source export succeeded.

All writes use a temporary file followed by rename, so interrupted writes do not leave a half-valid JSON document at the target path.

## Concurrency

The upstream Perl engine uses global state during a request, and the current adapter launches one Docker process per date/hour. The Phase 6 default is `--jobs=1`. The script accepts `--jobs` for future extension but serializes work in this phase to avoid Docker/Perl global-state and Windows path-race risks.

## Current Duplication Expectations

The largest repeated material is expected to be:

- fixed opening and conclusion formulae
- fixed hymns
- repeated psalms and canticles
- common responsories, blessings, absolutions, and Marian antiphons
- repeated feria/seasonal ordinary blocks

The release packer deduplicates blocks by canonical content and sourceRefs, while occurrence metadata preserves date/hour-specific order, lesson number, nocturn number, Vesperae context, repeated antiphons, and original parser ID.

## Raw Data Boundary

The following remain public because they are stable oracle fixtures:

- Phase 2 through Phase 5 experimental fixtures
- machine-readable oracle reports

The 2026 annual raw DO exports are not public release data. They are temporary unless `--keep-raw` writes them into ignored `.work/officium1962/raw/`.

## Known Limits

- The Phase 6 release build reuses the already validated Phase 2-5 parser behavior and does not change those parsers.
- Full block-by-block oracle is retained for existing fixtures and a fixed annual sample; the whole 2920 date/hour set uses lightweight reconstructed-text checks because full oracle for every hour would be expensive.
