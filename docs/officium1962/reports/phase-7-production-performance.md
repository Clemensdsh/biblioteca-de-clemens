# Phase 7 Production Performance

Date: 2026-07-22

## Build Output

| Metric | Phase 7 baseline | Production | Change |
| --- | ---: | ---: | ---: |
| Total JavaScript assets | 2,728,711 B | 2,749,690 B | +20,979 B |
| JavaScript files | 83 | 84 | +1 |
| Officium route chunk | n/a | 20,439 B | +20,439 B |
| Officium route chunk gzip | n/a | 8,181 B | +8,181 B |
| Officium route chunk Brotli | n/a | 7,011 B | +7,011 B |

- The homepage does not reference the Officium route chunk.
- `/martyrology/` does not reference the Officium route chunk.
- Release JSON remains fetched data and is absent from JavaScript bundles.

## Browser Cold Loads

Measured from local Vite production preview with headless Chrome. Transfer sizes are Chrome encoded transfer totals and include local preview compression.

| Scenario | Release requests | Transfer | Article ready |
| --- | ---: | ---: | ---: |
| 2026-07-22 Laudes cold load | 9 | 912,379 B | 867 ms |
| 2026-08-15 Matutinum cold load | 9 | 903,072 B | 670 ms |

Each cold load fetched root manifest, year manifest, calendar, one day document, shared manifest, and four needed shared chunks. It did not fetch the year corpus or all shared chunks.

## Navigation Cache

| Transition | New requests | Transfer | Reused state |
| --- | ---: | ---: | --- |
| Same day Laudes to Vesperae | 0 | 0 B | manifests, calendar, day, all needed chunks |
| Same month 2026-07-22 to 2026-07-23 | 2 | 139,403 B | manifests, calendar, prior chunks |
| Cross month 2026-07-23 to 2026-08-15 | 2 | 156,364 B | manifests, annual calendar, prior chunks |

The runtime promise cache suppressed duplicate network requests. Browser disk-cache hits were zero because already-loaded resources were not requested again.

## Interaction And Mobile

- A 69-block, three-nocturn Matutinum remained responsive while switching display preferences.
- Desktop and 390 px mobile simulations had no horizontal overflow.
- Long-page anchor navigation contained 14 links for the sampled festal Matutinum.
- Local article-ready timing is a practical interaction estimate, not a field Core Web Vitals measurement.

## Cache Policy

- Root manifest: revalidate every request.
- Year/shared manifest and calendar: 5-minute revalidation.
- Day documents and ordinal shared chunks: 1-hour revalidation.
- Checksums prevent mixed manifest/chunk versions from rendering corrupt text.
- Ordinal `blocks-NNN.json` files are not marked immutable because their filenames do not contain a content hash.
