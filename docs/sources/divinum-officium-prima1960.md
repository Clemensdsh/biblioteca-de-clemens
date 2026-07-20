# Divinum Officium Prima 1960 Source Notes

- Upstream repository: https://github.com/DivinumOfficium/divinum-officium
- Local path used: `Q:\GithubSRC\divinum-officium`
- Commit hash: `7357486cedf0bd65298bb9da4760f7e4c40ea882`
- Extraction date: 2026-07-16
- License: MIT, as stated in the upstream `README.md`.

## Files Read

- `web/www/horas/Latin/Psalterium/Special/Prima Special.txt`
- `web/www/horas/Latin/Psalterium/Common/Prayers.txt`
- `web/www/horas/Latin/Psalterium/Common/Rubricae.txt`
- `web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt`
- `web/cgi-bin/horas/specials/psalmi.pl` for the local resolver rule that Roman Prima uses the first antiphon of seasonal minor-hour antiphon groups.
- Selected `web/www/horas/Latin/Tempora/Quad*.txt` and `Quadp*.txt` files for proper Sunday `Ant Prima` overrides in Septuagesima, Lent and Passiontide.
- `web/www/horas/Latin/Psalterium/Psalmorum/Psalm*.txt` for the Prima psalms currently referenced by the generated data
- `resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt` for Chinese Psalm text aligned by Vulgate Psalm number.

## Generated Data

- `public/data/prima1962/manifest.json`
- `public/data/prima1962/fixed-texts.json`
- `public/data/prima1962/psalmody.json`
- `public/data/prima1962/psalms-latin.json`
- `public/data/prima1962/psalms-chinese.json`
- `public/data/prima1962/lectio-brevis.json`
- `public/data/prima1962/translation-status.json`
- `resources/texts/prima1962-antiphons-bilingual.txt`
- `docs/prima1962-psalm-alignment-report.md`

## Normalization

- Display Latin is normalized from `Jam` to `Iam`.
- Selected historical `J` spellings are normalized to `I` in displayed fixed texts.
- `adjutorium` is normalized to `adiutorium` in displayed fixed texts.
- Lookup normalization additionally strips accents and handles `æ/ae`, `œ/oe`, punctuation and case.
- Sigaō Psalm text is read from the Vulgate-numbered verse file, converted from Traditional to Simplified Chinese with OpenCC, and displayed only by matching Psalm and verse number.
- Psalm superscriptions such as "达味诗歌" are removed where the corresponding Latin office Psalm text does not include them.
- Seasonal Prima antiphons are normalized from `Psalmi minor.txt` by retaining the Roman-use section when a later duplicate section is marked for another tradition such as Cistercian.
- `J/I` spelling normalization is applied to generated displayed antiphons where the page already uses 1962-style `I` spellings elsewhere.

## Data Not Imported

The directory `web/www/horas/Latin/Martyrologium1960/` was deliberately not read, copied, transformed, or imported. This feature uses the existing site translation of the new Roman Martyrology for the martyrology body.

## Missale Meum Check

Missale Meum was checked as a possible 1962 calendar source. Its public repository describes a Python/FastAPI backend with calendar and propers, and states that its API is free and documented by OpenAPI. Its public site describes it as a 1962 Roman Missal resource with feast ranks, colour and commemorations.

It was not used as a runtime dependency because this page needs a Prima office resolver, not only a Mass calendar. The current implementation uses local static data generated from Divinum Officium and a local supplemental calendar approximation with warnings where full oracle verification is still required.

Sources checked:

- https://github.com/mmolenda/missalemeum
- https://www.missalemeum.com/en
