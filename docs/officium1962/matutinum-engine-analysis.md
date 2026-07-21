# Matutinum Engine Analysis

Date: 2026-07-20

Pinned upstream commit: `515a213f79951c563be4f599ca591c63aa63bb6d`

## Upstream Entry Points

Matutinum is assembled through the same `horas($hora)` pipeline described in `engine-analysis.md`:

```text
getordinarium($lang, 'Matutinum')
  -> specials(\@script, $lang)
  -> getunit / resolve_refs
```

The ordinary skeleton is `web/www/horas/Ordinarium/Matutinum.txt`. It delegates the substantive logic to Perl script functions:

- `invitatorium($lang)` in `web/cgi-bin/horas/specmatins.pl`
- `hymnusmatutinum($lang)` in `web/cgi-bin/horas/specmatins.pl`
- `psalmi_matutinum($lang)` in `web/cgi-bin/horas/specmatins.pl`
- `lectiones($num, $lang)` and related helpers in `web/cgi-bin/horas/specmatins.pl`
- Matutinum psalm expansion through `web/cgi-bin/horas/specials/psalmi.pl`
- Absolutiones and benedictiones from `web/www/horas/Latin/Psalterium/Benedictions.txt`

## One Or Three Nocturns

The upstream output reveals the resolved form before HTML rendering:

- One-nocturn offices have a single implicit `Ad Nocturnum` structure and no `!Nocturnus II` or `!Nocturnus III` markers.
- Three-nocturn offices emit `!Nocturnus I`, `!Nocturnus II`, and `!Nocturnus III` markers inside psalmody units.
- In Rubrics 1960, many III class offices have one nocturn with nine psalms and three lessons.
- I class feasts and other high-ranked days commonly have three nocturns with nine lessons.

The local parser derives `nocturnCount` from resolved nocturn markers and lesson distribution, not by recalculating rubrical precedence.

## Three Or Nine Lessons

The upstream `lectiones` path decides lesson count through `$rule`, `$rank`, `gettype1960()`, and the presence of `9 lectiones` or special 1960 contractions. The local exporter records the resolved result:

- `lessonCount = 3` when the output contains lessons 1-3 only.
- `lessonCount = 9` when the output contains lessons 1-9.
- Bare Triduum lessons appear as `&lectio(n)` without `Jube, Domine` or `Benedictio`.

## Psalmody And Antiphons

Psalmody is selected by `psalmi_matutinum($lang)`, with ordinary psalter data from:

- `web/www/horas/Latin/Psalterium/Psalmi/Psalmi matutinum.txt`
- Proper, temporal, sanctoral, and common antiphons through `getproprium('Ant Matutinum')`
- Paschal alterations through `ant_matutinum_paschal`

The resolved output uses one unit per antiphon/psalm pair, except the first psalm of a nocturn may be in the same unit as the nocturn heading.

## Invitatory

`invitatorium($lang)` reads `web/www/horas/Latin/Psalterium/Special/Matutinum Special.txt` and `web/www/horas/Latin/Psalterium/Invitatorium.txt`. It resolves:

- `Domine, labia mea aperies`
- `Deus in adjutorium`
- Alleluia or seasonal replacement
- Invitatory antiphon
- Psalm 94 text
- Repetition pattern
- Advent, Lent, Passiontide, Paschal, Triduum, and Requiem variants

The local parser keeps Invitatorium as an `invitatory` block with explicit antiphon repetitions and Psalm 94 text metadata.

## Absolutiones And Benedictiones

Absolutions and blessings come mainly from `web/www/horas/Latin/Psalterium/Benedictions.txt`. The engine chooses the set based on nocturn number, lesson number, office form, Evangelical lessons, and special rules.

In ordinary Matutinum, each lesson unit begins:

```text
V. Jube, Domine, benedicere.
Benedictio. ...
```

In Sacred Triduum Matutinum, lessons are exported as bare `&lectio(n)` units, with blessings omitted. The local parser records this as `metadata.blessingOmitted = true` on the reading block.

## Scripture, Hagiography, Homily

`lectiones` chooses readings from:

- `%scriptura` and `web/www/horas/Latin/Tempora/` for Scripture and annual progression
- `%winner` and `web/www/horas/Latin/Sancti/` for sanctoral legend or proper readings
- `%commune` and `web/www/horas/Latin/Commune/` for common fallback
- homily material from temporal, sanctoral, or common files

The local classifier records:

- `scripture`
- `hagiographic`
- `homily`
- `patristic`
- `common`
- `special`

The classification is based on the resolved Latin output and source context, not on a client-side rubrical calculation.

## Responsories

Matins responsories are attached in `lectiones` after each lesson unless Te Deum replaces the final responsory. `responsory_gloria()` decides whether Gloria Patri is included and how final repetitions are formed.

The local parser creates `matins-responsory` blocks with:

- nocturn
- lesson number
- responsory number
- incipit
- versicle
- response
- Gloria Patri flag
- final repetition flag

## Te Deum

`tedeum_required($num)` decides inclusion. Its major conditions include:

- final lesson number
- `9 lectiones`
- `no Te Deum`
- Requiem common exclusion
- Advent and Lent temporal exclusions
- Sundays, sanctoral feasts, Paschal and Nativity exceptions

The local parser only records whether Te Deum is actually present in the resolved upstream output.

## Special Days

The verified fixture set includes:

- Advent feria and December 17-24
- Christmas and Epiphany
- Septuagesima/Lent/Passiontide
- Palm Sunday
- Sacred Triduum
- Easter Sunday and Eastertide
- Ascension, Pentecost, Trinity, Corpus Christi, Sacred Heart
- All Saints and All Souls
- I class, II class, III class, Vigil, commemoration, and leap day examples

Triduum and All Souls are not normalized into ordinary Matutinum. Their omitted or replaced structures are preserved as resolved by Divinum Officium.

## SourceRef Limits

The Perl engine resolves many `@` references, Commune fallbacks, and conditional substitutions before `resolve_refs` returns the final unit. At the current adapter interception point, exact source line ranges and complete reference chains are no longer always available.

The local sourceRefs therefore record:

- upstream commit
- ordinary Matutinum skeleton
- likely special/common/proper source family
- section or resolved lesson number
- transformation path

For lessons, the sourceRefs include `Tempora`, `Sancti`, and/or `Commune` families according to reading classification. This avoids claiming a false single line origin where the Perl engine has already merged or substituted content.
