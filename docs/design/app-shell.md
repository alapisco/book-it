# Design: App shell and navigation

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/app-shell.md v1

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes (nav bar) | yes (hamburger + drawer) | yes (bottom tabs) | yes (bottom tabs) |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| NavBar | all logged-in | Top bar: "BookIt" wordmark on the left, links on the right | web | none |
| MenuToggle | all logged-in | "☰ Menu" button at the top left of a header strip | wap | none |
| MenuDrawer | all logged-in | Panel sliding in from the left over a dimmed backdrop; lists the links and a close button | wap | none |
| TabBar | Schedule, My bookings | Native bottom tabs | android, ios | none |
| NavLink "Schedule" | — | Goes to `/schedule` or the Schedule tab | all | none |
| NavLink "My bookings" | — | Goes to `/bookings` or the My bookings tab | all | none |

## States

The shell isn't data-bound. The login screen renders without the shell.

| Component | States |
|---|---|
| MenuDrawer | closed (not in the DOM) · open |
| NavLink | inactive · active (the current route is shown in bold and has `aria-current="page"` on web/wap) |

## Breakpoint behaviour (web vs wap)

| Aspect | web (≥ 768 px) | wap (< 768 px) |
|---|---|---|
| Container | `<header>` with `nav.bar` | `<header>` with `nav.menu.toggle`; drawer mounted only when open |
| Links | Inline in `nav.bar` | Inside `nav.menu.drawer` |
| Closing | n/a | `nav.menu.close`, tapping the backdrop, or tapping a link |

Both trees use the shared identifiers `nav.schedule.link` and
`nav.bookings.link`. On wap they exist only while the drawer is open.

## Native behaviour (android / ios)

- Bottom tabs, labelled "Schedule" and "My bookings", with
  `tabBarButtonTestID` = `nav.schedule.link` and `nav.bookings.link`.
- Class detail is pushed over the tabs, so the tab bar is hidden there.
  It has its own `class.back.link` (see `browse-and-book`).
- android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `nav.bar`, `nav.schedule.link`, `nav.bookings.link` |
| AC-2 | `nav.menu.toggle`, `nav.menu.drawer`, `nav.menu.close`, `nav.schedule.link`, `nav.bookings.link` |
| AC-3 | `nav.schedule.link`, `nav.bookings.link` |
| AC-4, AC-5 | `login.screen` |
| AC-7 | root `data-platform` attribute (not an identifier) |

## Open questions

None.
