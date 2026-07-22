# Officium Romanum 1962 Production Runbook

## Production Surface

- Public URL: `https://clemensdsh.xyz/officium-1962/`
- Current release year: 2026 only
- Schema: `officium1962.v1`
- Upstream commit: `515a213f79951c563be4f599ca591c63aa63bb6d`
- Release data: `public/data/officium1962/manifest.json`, `shared/`, and `years/2026/`

The production runtime downloads release JSON only. It does not use experimental fixtures, raw exports, Perl, Docker, `vendor/divinum-officium`, the public Divinum Officium website, `features/prima1962`, or `/martyrology/` data.

## Feature Flag

The single source of truth is `config/features.ts`:

```ts
export const featureFlags = {
  officium1962: true,
} as const
```

- Enable: set `officium1962` to `true`, build, and deploy.
- Disable: set it to `false`, build, and deploy.

When disabled, the navigation entry disappears and the route displays a clear disabled state. Release data stays in place, and existing Prima and Martyrology behavior is unaffected.

## Build And Test

```text
pnpm install --frozen-lockfile
pnpm test
pnpm officium1962:validate
pnpm build
pnpm exec vite build --config playground/officium1962/vite.config.mjs --outDir .tmp-officium1962-preview-build
```

Run the isolated playground with:

```text
pnpm officium1962:preview
```

Run the production browser audit against a preview or deployed URL with:

```text
node scripts/officium1962/audit-production-page.mjs --url=http://127.0.0.1:4860
```

The audit requires a local Chrome installation. Its screenshots and logs are written under ignored `artifacts/officium1962/phase7-browser-audit/`.

## Deployment Verification

1. Verify `/officium-1962/?date=2026-07-22&hour=vesperae` returns HTML on a hard refresh.
2. Verify the root manifest, year manifest, calendar, a day file, and a shared chunk return `200` with `application/json`.
3. Verify the page shows the requested civil date and hour after refresh and browser back/forward.
4. Verify an invalid date and unsupported year display errors instead of substituted content.
5. Inspect the network log: a normal cold load must fetch only the manifests, calendar, one day document, and required shared chunks.
6. Run `pnpm officium1962:validate-year --year=2026` and the production browser audit.

Netlify and Vercel cache headers are in `netlify.toml` and `vercel.json`. Root manifests revalidate immediately, year/shared manifests and calendar revalidate after five minutes, and day/chunk files after one hour. Checksums reject mixed or corrupt resources. Ordinal shared chunks are deliberately not immutable.

## Cache Recovery

- Runtime promise caches are in memory and clear on a full page reload.
- After replacing release files, purge the deployment/CDN cache or issue a fresh deployment.
- Do not publish manifests before all referenced files are present.
- If checksum errors appear after deployment, restore the prior complete data release, purge the CDN cache, and reload. Do not bypass checksum validation.

## Page Rollback

1. Set `featureFlags.officium1962` to `false` in `config/features.ts`.
2. Run `pnpm test` and `pnpm build`.
3. Deploy the resulting site.
4. Confirm the navigation entry is absent and `/officium-1962/` shows the disabled state.

This rollback does not delete data or touch Prima/Martyrology modules.

## Data Rollback

Restore `public/data/officium1962/manifest.json`, `shared/`, and `years/2026/` together from the last known-good Git commit, then deploy and purge caches. Never roll back only a manifest or only shared chunks because their checksums and references form one release.

## Adding A Year

Generation is a maintainer operation, not a production runtime dependency. Use the pinned ignored upstream checkout and local generation toolchain:

```text
pnpm officium1962:build-year --year=YYYY --hours=all-supported --resume --strict
pnpm officium1962:validate-year --year=YYYY
```

The current builder was validated as a single-year 2026 release pipeline. Before publishing another year, rebuild/package every retained year as one coherent shared-block release, verify root `availableYears`, all year manifests, checksums, orphan count, and annual oracle samples. Do not merge only a new `years/YYYY/` directory into the current shared manifest. Publish referenced files first and the root manifest last.

## Functional Boundaries

- `/officium-1962/`: complete Latin Office under Rubrics 1960 from the pinned release data.
- Existing Prima page: its existing structure and Chinese/new-calendar martyrology behavior.
- `/martyrology/`: the existing new-calendar martyrology.

These surfaces may link to one another but do not share resolver state or liturgical data. Spanish, `Martyrologium1960`, and `missa` paths are not part of this release.
