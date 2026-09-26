# Design: App shell and navigation

- Version: 2
- Status: draft (M4, awaiting review)
- Date: 2026-09-27
- Implements: docs/prd/app-shell.md v2; uses docs/design/visual-language.md

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| top nav bar | app bar + bottom tabs | app bar + bottom tabs | app bar + bottom tabs |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| NavBar | all logged-in | White bar: `Dumbbell` + "BookIt" wordmark on the left; icon + label links on the right: Schedule, My bookings, Policies | web | — |
| AppBar | tab roots | `primary` bar, "BookIt · <title>" in `on-primary` | wap, android, ios | — |
| AppBar (pushed) | class detail, check-in | `primary` bar, `ChevronLeft` back control, title | wap, android, ios | — |
| TabBar | tab roots | Fixed bottom bar, 4 tabs (icon + label) | wap, android, ios | — |
| Tab / NavLink | — | One destination | all (per table below) | — |

| Destination | Icon | web | wap | android / ios |
|---|---|---|---|---|
| Schedule | `CalendarDays` | nav link | tab | tab |
| Week | `CalendarRange` | — | tab | tab |
| Bookings | `Ticket` | nav link "My bookings" | tab "Bookings" | tab "Bookings" |
| Policies | `ScrollText` | nav link | tab | tab |

## States

The shell isn't data-bound. The login screen and `/policies?embed=1`
render without it.

| Component | States |
|---|---|
| Tab / NavLink | inactive (`muted`), active (`primary`; `aria-current="page"` on web and wap, selected accessibility state on native) |

## Breakpoint behaviour (web vs wap)

| Aspect | web (≥ 768 px) | wap (< 768 px) |
|---|---|---|
| Top | `<header>` with `nav.bar` (wordmark + links) | `<header>` app bar with the title (no identifier; not interactive) |
| Destinations | links inside `nav.bar` | `<nav>` fixed to the bottom, as `nav.tabs`, with 4 tab links |
| Week | absent | present |
| Content padding | centred, max 1152 px | 16 px sides, with bottom padding clearing the tab bar |

The shared identifiers are `nav.schedule.link`, `nav.bookings.link` and
`nav.policies.link`. `nav.week.link` exists on wap only.

## Native behaviour (android / ios)

- **Tabs:** Expo Router tabs. Each has `tabBarIcon` (a lucide icon), a
  label, and `tabBarButtonTestID` = `nav.schedule.link`, `nav.week.link`,
  `nav.bookings.link` or `nav.policies.link`.
- **App bar:** the tab navigator's header styled as the AppBar
  (`headerStyle` `primary`, `headerTintColor` `on-primary`, title
  "BookIt · <title>").
- **Pushed screens:** class detail and check-in render their own AppBar
  (pushed variant). The back control carries the screen's existing back
  identifier (`class.back.link`, `checkin.back.link`).
- android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `nav.bar`, `nav.schedule.link`, `nav.bookings.link`, `nav.policies.link`; absence of `nav.week.link` |
| AC-2, AC-9 | `nav.tabs` (wap), `nav.schedule.link`, `nav.week.link`, `nav.bookings.link`, `nav.policies.link`; absence of `nav.menu.*` |
| AC-3 | `class.back.link`, `checkin.back.link` (pushed app bar) |
| AC-4, AC-5 | `login.screen` |
| AC-7 | root `data-platform` attribute (not an identifier) |
| EC-3 | absence of `nav.bar`, `nav.tabs` |

## Open questions

None.

## Changelog

- v2 (M4): wap moves from hamburger and drawer to app bar + bottom tabs (ADR 0008); Week tab; Policies on web; lucide icons. Retired `nav.menu.toggle`, `nav.menu.drawer` and `nav.menu.close`. Added `nav.tabs` and `nav.week.link`. `nav.calendar.link` is retired.
