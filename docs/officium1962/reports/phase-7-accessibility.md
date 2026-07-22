# Phase 7 Accessibility

Date: 2026-07-22

## Automated Checks

- Form controls use visible labels.
- Icon-only previous/next day and hour buttons use Chinese `aria-label` and `title` attributes.
- The selected hour uses `aria-current="page"`.
- Loading uses a polite live region; errors use an assertive alert region.
- Heading order is page `h1`, office `h2`, and block/warning `h3`/`h2` at the appropriate section level.
- Matutinum has a labelled anchor navigation region.
- Focus-visible outlines are 3 px and offset from controls.
- Controls have a stable minimum 40 px height; mobile hour controls use a two-column grid.
- Rubrics have a semantic Chinese `aria-label`, so rubric meaning is not conveyed by red color alone.
- Hidden source details are not mounted when the source preference is off.
- Print CSS hides controls, debug details, help text, source details, site navigation, and footer.
- Tests: `features/officium1962/productionPage.test.ts`.

## Contrast

Contrast ratios against the page background were calculated from the production CSS values:

- Light rubric `#982b2b` on `#ffffff`: 7.73:1.
- Light heading `#6d3530` on `#ffffff`: 9.54:1.
- Dark rubric `#ee9d97` on `#1a1a1d`: 8.19:1.
- Dark heading `#f0b3ad` on `#1a1a1d`: 9.72:1.

All four exceed WCAG AA requirements for normal text.

## Manual Browser Checks

- Date input accepted focus and exposed its visible label.
- Keyboard focus styling is present on controls, links, summaries, and date/range inputs.
- Back/forward history retained date and hour state.
- Desktop and 390 px mobile viewports showed no horizontal overflow.
- Mobile hour buttons stayed in a stable two-column grid.
- A three-nocturn Matutinum exposed 14 usable anchors.
- Dark theme computed page and rubric colors remained readable.
- Print media computed controls/help as hidden and the article as visible.
- Source disclosure rendered for all 69 sampled Matutinum blocks when enabled.
- Browser console errors: 0.
