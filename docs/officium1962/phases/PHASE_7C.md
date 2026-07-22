# Phase 7C: Navigation, Deployment, Performance, And Rollback

Date: 2026-07-22

## Status

Complete. The production feature flag is enabled.

## Production Enablement

- Changed the single flag `config/features.ts` to `officium1962: true`.
- Added one `罗马日课 1962` entry to the existing `themeConfig.pages` list next to the liturgical page links.
- Kept the existing Prima/Martyrology entry unchanged.
- Added `/officium-1962` to the existing client-date SSG shell list after browser testing found and then verified a hard-refresh hydration issue.
- Added conservative release cache headers for Netlify and Vercel. Shared chunk filenames are ordinal rather than content-hashed, so they deliberately use revalidation instead of unsafe immutable caching.

## Deployment Verification

- `/officium-1962/?date=2026-07-22&hour=vesperae`: 200 HTML on hard refresh.
- Root manifest, year manifest, calendar, day document, and shared chunk: 200 with `application/json` MIME.
- Current deployment base path is `/`; the loader also has a tested non-root base-path option.
- GitHub Pages receives a concrete `dist/officium-1962/index.html`; Netlify keeps the existing SPA fallback.
- Browser query navigation, backward, and forward history passed.
- Unknown date/hour/year states display errors and do not silently substitute another date.

## Rollback Verification

The flag was temporarily changed to `false` and a production build was run:

- Build passed.
- Navigation entry matches: 0.
- Route artifact remained present: yes.
- Route disabled-state marker matches: 1.

The flag was then restored to `true` and rebuilt:

- Navigation entry matches: 1.
- Enabled route marker matches: 1.

No release data was deleted or changed during rollback testing.

## Browser Verification

- Production preview: `http://127.0.0.1:4860/officium-1962/`.
- Desktop viewport: 1407 CSS px, no overflow, 69-block Assumption Matutinum rendered with 14 anchors.
- Mobile viewport: 390 CSS px, no overflow, same 69 blocks and 14 anchors.
- Dark theme uses the site `html.dark` state and readable custom rubric colors.
- Print media hides controls and help/source debug while preserving the article.
- Source toggle rendered 69 source disclosures for the Assumption Matutinum.
- Font control changed computed article size from 16.64 px to 19.968 px.
- No browser console errors remained.

## Performance

See `docs/officium1962/reports/phase-7-production-performance.md`.
