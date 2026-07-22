# Phase 7A: Production Loader And Page Candidate

Date: 2026-07-22

## Status

Complete. The feature flag remains disabled and no navigation entry has been added.

## Baseline

- Git branch: `main`.
- Starting HEAD and `origin/main`: `7c126f2732a358fa8c88752c6ba6da02ca8aacab`.
- `pnpm test`: 6 files, 167 tests passed.
- `pnpm build`: passed.
- Playground build: passed; 8.77 kB JavaScript, 3.17 kB gzip.
- `pnpm officium1962:validate-year --year=2026`: 365 days, 2920 date/hour outputs, 55184 occurrences, 8713 shared blocks.

## Implemented

- Added `/officium-1962/` as a production page candidate.
- Added a single feature flag at `config/features.ts`; it remains `false` through Phase 7A.
- Added typed production runtime modules under `features/officium1962/runtime/`.
- Root manifest, year manifest, calendar, day documents, shared manifest, and needed shared chunks load through runtime `fetch` calls.
- All checked release files reject unknown schema versions, an unexpected upstream commit, and checksum mismatches.
- The loader caches promises to suppress concurrent duplicate requests and removes failed promises so retries remain possible.
- Hour reconstruction loads only shared chunks needed by the selected hour. It does not expand all eight hours.
- Added explicit runtime errors and Chinese user-facing messages with separate developer details.
- Added URL parsing and browser-local civil-date helpers without UTC string conversion.
- Added date navigation, eight-hour selection, history-backed query state, and refresh-stable URL state.
- Kept `experimental`, raw exports, Perl, Docker, vendor, external Divinum Officium requests, Prima resolver, and Martyrology data outside production runtime.

## Verification

- `pnpm test`: 9 files, 189 tests passed.
- `pnpm build`: passed without SSG or SSR errors.
- Production loader tests cover manifests, calendar, day, shared chunks, caching, request suppression, schema rejection, unavailable year/date, checksum failure, network error, retry, missing block, and base path.
- URL tests cover valid and invalid parameters, default hour, local civil date, leap dates, boundaries, and stable query serialization.

## Isolation

- `features/prima1962/` was not modified.
- `pages/martyrology/`, `features/martyrology/`, and martyrology components were not modified.
- The new page imports neither resolver.
- No navigation or deployment configuration changed in Phase 7A.
