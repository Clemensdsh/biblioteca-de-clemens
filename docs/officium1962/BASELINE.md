# Officium Romanum 1962 Baseline

Baseline captured: 2026-07-20T19:31:08-04:00

## Project Context

- Package manager: pnpm
- Framework/build: Valaxy 0.28.11 with valaxy-theme-yun 0.28.11
- Test command: `pnpm test`
- Build command: `pnpm build`
- Existing test files:
  - `components/saturday-mary-office/daytimeHour.test.ts`
  - `components/saturday-mary-office/concludingPrayerSeason.test.ts`
  - `features/martyrology/parser.test.ts`
  - `features/martyrology/liturgicalCalendar.test.ts`
  - `features/prima1962/resolver.test.ts`

## Git Baseline

- Branch: `main`
- Upstream: `origin/main`
- Working tree before Phase 0 changes: clean

## Baseline Results

### Tests

Command: `pnpm test`

Result: pass

- Test files: 5 passed
- Tests: 46 passed
- Duration reported by Vitest: 664 ms

### Build

Command: `pnpm build`

Result: pass

- Valaxy SSG build completed
- RSS/Atom/JSON feed generation completed
- No Officium Romanum 1962 code or data was present in the production entry at baseline

## Isolation Requirements Confirmed

- Existing `/martyrology/` route is explicitly handled in `vite.config.ts` as a client-date route.
- Existing Prima and martyrology features are under `features/prima1962`, `features/martyrology`, `components/martyrology`, and Saturday Mary components.
- The new module will use separate paths:
  - `features/officium1962/`
  - `components/officium1962/`
  - `scripts/officium1962/`
  - `public/data/officium1962/`
  - `docs/officium1962/`
  - `vendor/divinum-officium/`

## Notes

- `vendor/divinum-officium/` is ignored by the main repository so the nested upstream Git mirror is not committed.
- No production route, navigation entry, global style, dependency version, existing Prima module, or `/martyrology/` file was modified in Phase 0.
