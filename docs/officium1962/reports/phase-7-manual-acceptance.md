# Phase 7 Manual Acceptance

Date: 2026-07-22

Method: production build served by Vite preview and inspected through headless Chrome at desktop and 390 px mobile viewports. Each entry verified the displayed civil date, liturgical title, requested hour, non-empty block count, absence of error state, and absence of horizontal overflow.

| Date | Liturgical title | Matutinum | Laudes | Prima | Vesperae | Completorium |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 2026-07-22 | S. Mariæ Magdalenæ Pœnitentis, III class | 44 | 25 | 17 | 9 | 21 |
| 2026-07-19 | Dominica VIII Post Pentecosten, II class | 45 | 25 | 17 | 9 | 21 |
| 2026-08-15 | In Assumptione B.M.V., I class | 69 | 25 | 17 | 9 | 21 |
| 2026-11-02 | Commemoratio Omnium Fidelium Defunctorum, I class | 60 | 23 | 6 | 9 | 7 |
| 2026-12-24 | Vigilia Nativitatis Domini, I class | 44 | 25 | 17 | 9 | 21 |
| 2026-12-25 | Nativitas Domini, I class | 70 | 25 | 17 | 9 | 21 |
| 2026-04-02 | Feria Quinta in Cena Domini, I class | 60 | 23 | 11 | 9 | 6 |
| 2026-04-03 | Feria Sexta in Passione et Morte Domini, I class | 60 | 23 | 11 | 9 | 6 |
| 2026-04-04 | Sabbato Sancto, I class | 60 | 23 | 11 | 9 | 6 |
| 2026-04-05 | Dominica Resurrectionis, I class | 27 | 24 | 13 | 9 | 16 |

## Special Structure Checks

- Sunday, Assumption, All Souls, Christmas, Triduum, and Easter titles matched the release calendar.
- Assumption Matutinum exposed three nocturns and 14 long-page anchors.
- Triduum Matutinum and reduced minor/Compline structures rendered without fabricated sections.
- Easter Matutinum rendered the shorter 27-block Paschal structure.
- Vesperae displayed the release metadata marker for upstream-resolved special/concurrence structure.
- Source disclosure, rubric visibility, font scaling, dark theme, mobile layout, and print media were exercised.

## URL And Errors

- Hard refresh preserved `date` and `hour`.
- Browser backward/forward changed 2026-08-15 back to 2026-07-23 and forward again with the selected hour intact.
- Invalid civil date, invalid hour, and unsupported 2025 URL each displayed an explicit Chinese error.
- A URL without query parameters selected browser-local `2026-07-22`, confirming the local civil-date path in the audit environment.
- Browser console errors: 0.
