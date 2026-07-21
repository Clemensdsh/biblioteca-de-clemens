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

- `public/data/officium1962/experimental/days/2026-07-20/completorium.json`

This is not yet final deduplicated production data.

## Attribution Text Candidate

Latin Office text and rubrical computation are derived from the Divinum Officium open-source project, MIT License, pinned at commit `515a213f79951c563be4f599ca591c63aa63bb6d`.

## Not Used

- Spanish or other modern-language Office files
- `web/www/horas/Latin/Martyrologium1960/`
- `web/www/missa/`
- public Divinum Officium website scraping
- iframe embedding
- Divinum Officium frontend HTML/CSS/JavaScript as site UI
