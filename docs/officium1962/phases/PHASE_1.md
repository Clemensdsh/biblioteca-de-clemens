# Phase 1 Summary

Date: 2026-07-20

## Completed

- Cloned Divinum Officium into ignored local mirror `vendor/divinum-officium/`.
- Pinned upstream commit: `515a213f79951c563be4f599ca591c63aa63bb6d`.
- Confirmed branch: `master`.
- Confirmed upstream license: MIT License in `README.md`.
- Built local Docker image: `biblioteca-do-upstream:515a213f`.
- Confirmed host has no `perl` on PATH, so local execution uses Docker.
- Verified local engine execution without requesting the public Divinum Officium website.
- Documented engine entry points and the current interception strategy.

## Verified Dates

Latin `Rubrics 1960 - 1960`, Completorium only:

- 2026-07-20: 13 units, 0 warnings
- 2026-07-21: 13 units, 0 warnings
- 2026-07-26: 13 units, 0 warnings

## Current Adapter State

- `scripts/officium1962/do-export.pl` loads upstream code and exports JSON from the internal Office script array.
- `scripts/officium1962/run-do-export.mjs` runs the Perl wrapper inside Docker and preserves UTF-8 through a mounted temporary file.
- `scripts/officium1962/build-day.mjs` can write an experimental single-day JSON file.
- Basic TypeScript schema and normalization tests exist under `features/officium1962/`.

## Limitations

- Only Completorium has been verified.
- Output units are not yet final typed liturgical blocks.
- sourceRefs are currently pipeline-level, not per-origin-file line references.
- No deduplication layer exists yet.
- No Vue preview exists yet.
- No year generation exists yet.

## Next Phase

Phase 2: turn Completorium units into typed blocks, add parser fixtures, build the first isolated Vue renderer, and compare normalized output against the upstream oracle.
