# Officium Romanum 1962 Data Provenance

## Source

- Upstream repository: https://github.com/DivinumOfficium/divinum-officium
- Commit: `515a213f79951c563be4f599ca591c63aa63bb6d`
- Branch at clone: `master`
- Clone recorded: 2026-07-20T19:32:00-04:00
- Data generation environment: local Docker image built from the upstream Dockerfile, tagged `biblioteca-do-upstream:515a213f`

## Transformation

The current experimental adapter runs the upstream Office engine locally and intercepts its internal script array before the original `print_content` table rendering stage.

Current transformation stages:

1. Initialize Divinum Officium globals for Latin, `Rubrics 1960 - 1960`, `Generale`, and `tota`.
2. Run `precedence(date)` for calendar selection.
3. Run `getordinarium(language, hour)`.
4. Run `specials(script, language)`.
5. Split output through upstream `getunit`.
6. Resolve references through upstream `resolve_refs`.
7. Emit experimental JSON with raw unit text, resolved fragment, sourceRefs and warnings.

## Generated So Far

Experimental fixture data exists under:

- `public/data/officium1962/experimental/days/`
- `public/data/officium1962/experimental/fixtures/matutinum-fixtures.json`
- `public/data/officium1962/reports/`

Implemented hours:

- Matutinum
- Laudes
- Prima
- Tertia
- Sexta
- Nona
- Vesperae
- Completorium

Current Matutinum fixture coverage:

- 29 Matutinum fixture dates
- 12 one-nocturn fixtures
- 17 three-nocturn fixtures
- 189 lessons
- Sacred Triduum and All Souls included
- Leap day fixture `2028-02-29`

Phase 6 also generated release-format 2026 annual data under:

- `public/data/officium1962/manifest.json`
- `public/data/officium1962/shared/`
- `public/data/officium1962/years/2026/`
- `public/data/officium1962/provenance.json`
- `public/data/officium1962/reports/`

Annual release data uses schema `officium1962.v1`, shared block deduplication, day occurrence references, month indexes, and a lightweight calendar index. It contains 365 days and 2920 date/hour outputs.

Annual raw DO exports are not public release data. They are temporary unless `--keep-raw` writes them under ignored `.work/officium1962/raw/`.

## Attribution Text Candidate

Latin Office text and rubrical computation are derived from the Divinum Officium open-source project, MIT License, pinned at commit `515a213f79951c563be4f599ca591c63aa63bb6d`.

## Not Used

- Spanish or other modern-language Office files
- `web/www/horas/Latin/Martyrologium1960/`
- `web/www/missa/`
- public Divinum Officium website scraping
- iframe embedding
- Divinum Officium frontend HTML/CSS/JavaScript as site UI
- existing `features/prima1962/`
- existing `/martyrology/` page data or components

## Phase 6 Release Transformation

The annual builder:

1. Reuses the pinned local adapter and existing structured parsers.
2. Caches validated per-date/per-hour structured output under `.cache/officium1962/structured/`.
3. Deduplicates blocks by canonical text and sourceRefs.
4. Writes day documents that reference shared blocks and preserve occurrence metadata.
5. Writes manifests and checksums for root, year, calendar, month, day, and shared chunk files.

Machine-readable provenance is in `public/data/officium1962/provenance.json`.
