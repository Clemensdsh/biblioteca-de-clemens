# Officium Romanum 1962 Licenses

## Divinum Officium

- Source: https://github.com/DivinumOfficium/divinum-officium
- Commit: `515a213f79951c563be4f599ca591c63aa63bb6d`
- License: MIT License as included in the upstream `README.md`

The local upstream mirror remains in `vendor/divinum-officium/` and is ignored by the main repository.

## Generated Data

The experimental fixtures and Phase 6 release JSON under `public/data/officium1962/` are generated from the pinned Divinum Officium source and data by local scripts in `scripts/officium1962/`.

Phase 6 release data:

- Schema: `officium1962.v1`
- Year: 2026
- Generated from upstream commit `515a213f79951c563be4f599ca591c63aa63bb6d`
- Generated through local scripts only; no public Divinum Officium website scraping

The Phase 7 production page presents this release with a concise attribution panel naming Divinum Officium, the MIT license, Rubrics 1960, Latin, the fixed commit, the 2026 release year, and this site's structured transformation. No upstream frontend CSS or JavaScript is used.

## Production Dependency

- `@unhead/vue` 2.1.15: MIT License, used for route metadata.

The remaining production framework dependencies and their licenses continue to be managed by the site's existing package manifest and lockfile.

## Explicit Non-Inclusions

- No Spanish data is exported.
- No `Latin/Martyrologium1960` data is exported.
- No Mass data from `web/www/missa/` or `web/cgi-bin/missa/` is exported.
- Existing `features/prima1962` and `/martyrology/` data are not used by this module.
