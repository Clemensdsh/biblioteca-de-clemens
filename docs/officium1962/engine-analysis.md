# Divinum Officium Engine Analysis

## Parameters

The Office CGI entry is `web/cgi-bin/horas/Pofficium.pl`, a thin wrapper over `officium.pl`.

Relevant CGI parameters and runtime globals:

- Date: `date1` in `m-d-yyyy` form, for example `07-20-2026`.
- Hour: `command=prayCompletorium`, `prayMatutinum`, `prayLaudes`, `prayPrima`, `prayTertia`, `praySexta`, `prayNona`, or `prayVesperae`.
- Version: `$version`, defaulted by `web/www/horas/horas.setup`; for this project it is fixed to `Rubrics 1960 - 1960`.
- Language: `$lang1`; for this project it is fixed to `Latin`.
- Diocese: `$dioecesis`, fixed to `Generale` for this stage.
- Expansion: `$expand`, fixed to `tota` for expanded text.

The public setup values are defined in:

- `web/www/horas/horas.setup`
- `web/www/horas/horas.dialog`
- `web/www/Tabulae/data.txt`

## Calendar Entry

Calendar calculation is entered through `precedence($date1)` in `web/cgi-bin/horas/horascommon.pl`.

Important globals populated by `precedence` include:

- `$winner`
- `%winner`
- `$commemoratio`
- `%commemoratio`
- `$scriptura`
- `%scriptura`
- `$commune`
- `%commune`
- `$rank`
- `@dayname`
- `$vespera`
- `$cvespera`

Version-specific calendar data is loaded through `DivinumOfficium::Directorium` and the `web/www/Tabulae/` files. For `Rubrics 1960 - 1960`, the version table points to `1960` data.

## Office Assembly Entry

`horas($hora)` in `web/cgi-bin/horas/horas.pl` assembles one hour.

The key internal pipeline is:

```text
getordinarium($lang, $hora)
  -> specials(\@script, $lang)
  -> print_content($lang1, \@script1, ...)
```

`getordinarium` reads the hour skeleton from `web/www/horas/Ordinarium/<Hour>.txt`. `specials` expands seasonal, sanctoral, psalm, capitulum, responsory, collect and rubrical substitutions.

## Internal Structure Before HTML

There is a useful intermediate array, `@script1`, before final HTML rendering. It contains expanded Office script lines and references. `print_content` then calls:

```text
getunit(\@script1, $index)
setcell($text, $lang)
resolve_refs($text, $lang)
```

The current adapter intercepts this level and exports each `getunit` unit with:

- stable preliminary unit ID
- raw script text
- resolved HTML fragment
- shared sourceRef pointing to the upstream assembly pipeline

This is not yet the final block model. Phase 2 must parse these units into typed liturgical blocks such as rubric, dialogue, antiphon, psalm, hymn, reading, responsory and prayer.

## HTML Boundary

HTML begins in `setcell` and `resolve_refs` in `web/cgi-bin/horas/webdia.pl` and `web/cgi-bin/horas/horas.pl`.

The stable interception point is before `print_content` writes table cells. If a later section cannot be represented from raw script lines alone, controlled HTML fragment parsing will be added with fixture tests.

## Environment Dependencies

The upstream code assumes:

- Perl and CGI-related modules.
- `$Bin` points to `web/cgi-bin/horas`.
- `getini('horas')` loads `web/www/horas/horas.ini`.
- `$datafolder` points to `web/www/horas`.
- Runtime globals are shared in package `main`.

The local adapter sets these values explicitly and runs inside the upstream Docker environment.

## Current Execution Path

The host lacks Perl, so the Phase 1 adapter uses Docker:

```bash
node scripts/officium1962/run-do-export.mjs --date=2026-07-20 --hour=completorium
```

The Node wrapper:

1. Reads the pinned upstream commit.
2. Runs `scripts/officium1962/do-export.pl` inside `biblioteca-do-upstream:515a213f`.
3. Writes JSON inside the container to a mounted temporary file.
4. Reads the file from Node to preserve UTF-8 on Windows.

## Known Findings

- Direct HTTP execution through Starman returned 500 in this Windows-built image because CGI scripts had CRLF shebangs and could not be executed directly. Explicit `perl Pofficium.pl` works.
- The adapter currently exports Completorium successfully for three dates.
- The current output is semantic enough to avoid scraping the public website, but it is not yet the final typed JSON block model.
- No Spanish, Martyrologium1960, or missa data is selected or exported.
