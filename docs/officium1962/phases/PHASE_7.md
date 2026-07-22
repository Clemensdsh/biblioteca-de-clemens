# Phase 7: Production Integration

Date: 2026-07-22

## Status

Complete. `/officium-1962/` is enabled for production.

## Delivered

- A lazy production loader with manifest, schema, checksum, reference, base-path, caching, duplicate-request suppression, and explicit error handling.
- A query-driven production page supporting the 2026 local civil date and all eight canonical hours.
- Continuous-book presentation, Matutinum anchors, Vesperae metadata, commemorations, warnings, source/rubric/font preferences, dark mode, mobile layout, and print styles.
- SEO metadata, source/license disclosure, one navigation entry, conservative release cache headers, and a single feature flag.
- Unit, integration, isolation, URL-state, accessibility, release, browser, rollback, performance, and manual acceptance verification.

## Production Boundaries

- Reads only `public/data/officium1962/manifest.json`, `shared/`, and `years/2026/` release resources.
- Does not read experimental data, raw exports, Prima data, Martyrology data, Spanish, `Martyrologium1960`, or `missa`.
- Does not require Perl, Docker, the ignored vendor checkout, or any external Divinum Officium request at runtime.
- Keeps annual texts outside JavaScript bundles and fetches only the selected day and needed shared chunks.

## Measurements

- Total production JavaScript: 2,749,690 B, an increase of 20,979 B.
- Officium route chunk: 20,439 B raw, 8,181 B gzip, 7,011 B Brotli.
- 2026-07-22 Laudes cold load: 9 release requests, 912,379 B encoded transfer, 867 ms local article-ready time.
- 2026-08-15 Matutinum cold load: 9 release requests, 903,072 B encoded transfer, 670 ms local article-ready time.
- Same-day hour switch: 0 new requests. Same-month and cross-month date switches: 2 new requests each in the sampled flow.

## Acceptance

- All eight hours render from the release integration test.
- All 50 required date/hour manual browser states passed.
- Desktop and 390 px mobile layouts had no horizontal overflow.
- Dark, print, keyboard semantics, error states, history, and local-date behavior passed.
- Single-point rollback was built and verified before restoring the flag to enabled.

See the Phase 7 reports and `PRODUCTION_RUNBOOK.md` for operational details.
