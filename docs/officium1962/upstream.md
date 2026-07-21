# Divinum Officium Upstream

## Repository

- URL: https://github.com/DivinumOfficium/divinum-officium
- Local mirror: `vendor/divinum-officium/`
- Clone recorded: 2026-07-20T19:32:00-04:00
- Branch: `master`
- Commit: `515a213f79951c563be4f599ca591c63aa63bb6d`
- Main-project tracking: the local mirror is ignored by `.gitignore` and is not committed.

The URL is the GitHub repository named in the upstream README as the Divinum Officium project source repository.

## License

The upstream README contains the MIT License text. No separate top-level `LICENSE` file was present at this commit.

## Directories Read By This Project

- `web/cgi-bin/horas/`
- `web/cgi-bin/DivinumOfficium/`
- `web/www/horas/`
- `web/www/Tabulae/`
- `lexicon-tools/` during Docker image build, because the upstream Dockerfile builds the lexicon storable.

## Explicitly Ignored

- `web/www/horas/Spanish/` is not present in this upstream tree; the actual Spanish directory is `web/www/horas/Espanol/`, and it is ignored.
- `web/www/horas/Latin/Martyrologium1960/`
- `web/www/missa/`
- `web/cgi-bin/missa/`
- Other rubrical versions and monastic/proper-order variants except insofar as the upstream code contains shared functions that are loaded but not selected.

## Local Patches

No upstream source files have been modified. The adapter lives outside the upstream tree under `scripts/officium1962/`.

## Runtime Verification

The host does not have `perl` on PATH. The upstream Dockerfile was used to build a local image:

```bash
docker build -t biblioteca-do-upstream:515a213f vendor/divinum-officium
```

Because the repository was cloned on Windows, direct CGI execution through Starman hit a CRLF shebang issue. The adapter therefore invokes Perl explicitly inside the container:

```bash
node scripts/officium1962/run-do-export.mjs --date=2026-07-20 --hour=completorium
```

Verified dates for Latin `Rubrics 1960 - 1960`, Completorium only:

- 2026-07-20: 13 exported units, 0 warnings
- 2026-07-21: 13 exported units, 0 warnings
- 2026-07-26: 13 exported units, 0 warnings

## Regeneration

Current experimental single-day command:

```bash
pnpm officium1962:build-day --date=2026-07-20 --hours=completorium
```

Current output:

```text
public/data/officium1962/experimental/days/2026-07-20/completorium.json
```

This is an experimental Phase 1/2 slice. It is not yet the final deduplicated year/month data model.

Current Phase 6 annual release command:

```bash
pnpm officium1962:build-year --year=2026 --hours=all-supported --resume --strict
```

Annual validation:

```bash
pnpm officium1962:validate-year --year=2026
pnpm officium1962:compare-year-sample
```

Release output:

```text
public/data/officium1962/manifest.json
public/data/officium1962/shared/
public/data/officium1962/years/2026/
```

Annual raw exports are not committed and are only kept under ignored `.work/officium1962/raw/` when `--keep-raw` is used.
