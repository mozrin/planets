# Atlas accessibility, responsive, and performance budgets

Use this checklist before each release that changes the website or catalogue.

## Accessibility release gate

- Keyboard: every route, search/filter, view toggle, card/profile link, and
  Load more control is reachable, operable, and has a visible focus state.
- Screen readers: navigation has labels and current-page state; loading uses
  `aria-busy`; errors use `role="alert"`; disabled planned actions expose their
  disabled state.
- Semantics: tables retain headers; card alternatives expose the same planet
  destination; external links declare new-window behavior in their text/icon.
- Motion: transitions must be decorative only; no task completion relies on
  motion, autoplay, or a timed animation.

## Responsive release gate

Manually verify public, auth, catalogue card/table, profile, and navigation at:

| Viewport | Requirement |
| --- | --- |
| 320 px | No clipped controls; navigation and filters wrap or scroll intentionally. |
| 768 px | Two-column card layouts remain readable; tables scroll horizontally. |
| 1280 px | Main content remains within the defined maximum measure. |

## Performance budgets

Measure using a production build and a normal authenticated data set.

| Metric | Budget |
| --- | --- |
| Initial compressed JavaScript | ≤ 250 KB gzip |
| Initial compressed CSS | ≤ 10 KB gzip |
| Catalogue API, broad search, 30 records | ≤ 500 ms locally / ≤ 1 s through development routing |
| Catalogue API, targeted search, 30 records | ≤ 250 ms locally |
| Additional catalogue page | ≤ 250 ms locally |

The catalogue displays client-observed request timing for routine checks. Log a
budget exception with its cause and remediation issue; do not silently raise a
budget.

## Current audit notes

- Infinite catalogue loading has a keyboard-accessible Load more fallback.
- API errors, empty catalogue results, profile-unavailable states, and auth
  bootstrap loading all have purposeful feedback.
- Native semantic buttons and a semantic table are used; no custom dialog is
  part of the primary routeable profile path.
