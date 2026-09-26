# PRD: App shell and navigation

- Version: 2
- Status: draft (M4, awaiting review)
- Date: 2026-09-27

## Summary

This PRD covers the frame every screen lives in: routing, navigation, the
authentication gate, the app bar, and how each platform presents them.
From v2, wap uses the native apps' patterns (ADR 0008): a purple app bar
and bottom tabs. Desktop web keeps a top navigation bar.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | A top navigation bar: Schedule, My bookings, Policies. This is the desktop outlier (ADR 0008). |
| wap | yes | App bar plus bottom tabs: Schedule, Week, Bookings, Policies. It mirrors the native apps but is still a different tree from web (ADR 0003), so the framework must abstract web vs the mobile surfaces. |
| android | yes | App bar plus bottom tabs, the same four tabs as wap. |
| ios | yes | Same as android, same code. |

## User stories

- **US-1** As a user, I want to move between the app's main sections from any logged-in screen.
- **US-2** As a user who isn't logged in, I want to be sent to the login screen, so that I never see a broken screen.
- **US-3** As a test author, I want every screen reachable by URL or deep link, so that tests can start mid-flow.
- **US-4** As a test author, I want wap, android and ios to navigate the same way, so that one test body drives all three.

## Acceptance criteria

- **AC-1** (US-1) On web, every logged-in screen shows a top navigation
  bar with the "BookIt" wordmark and links "Schedule", "My bookings" and
  "Policies", each with an icon. Web has no "Week" link (`week-calendar`
  v2).
- **AC-2** (US-1, US-4) On wap, android and ios, every logged-in tab root
  shows:
  - a bottom tab bar with four tabs, in this order: "Schedule", "Week",
    "Bookings", "Policies"
  - an icon and a label on each tab
  - the active tab highlighted

  Tapping a tab shows its screen. wap has no menu button and no drawer.
- **AC-3** (US-1) On wap, android and ios, each tab root shows an app bar
  reading "BookIt · <screen title>". Pushed screens (class detail,
  check-in) show a back control and the screen title instead, and the
  tab bar is hidden.
- **AC-4** (US-2) Opening any route without a valid token shows the login
  screen. After a successful login, the schedule screen is shown.
- **AC-5** (US-2) Any API response of `401` clears the stored token and
  shows the login screen.
- **AC-6** (US-3) These routes exist:

  | Screen | Web/wap path | Native deep link |
  |---|---|---|
  | Login | `/login` | `bookit://login` |
  | Schedule | `/schedule?date=YYYY-MM-DD` (date optional) | `bookit://schedule?date=YYYY-MM-DD` |
  | Week | `/week?week=YYYY-MM-DD` (wap only; see `week-calendar`) | `bookit://week?week=YYYY-MM-DD` |
  | Class detail | `/classes/{class_id}` | `bookit://classes/{class_id}` |
  | My bookings | `/bookings` | `bookit://bookings` |
  | Policies | `/policies` | `bookit://policies` |

  `/` redirects to `/schedule`.
- **AC-7** On web and wap, the root element carries `data-platform="web"`
  at viewport widths of 768 px or more, and `data-platform="wap"` below
  768 px.
- **AC-8** The navigation and login screen never show a logout control.
  Tests log out by resetting (`test-support` AC-6) or clearing storage.
- **AC-9** The tab identifiers are identical on wap, android and ios
  (`nav.<tab>.link`). The web nav links use the same identifiers for the
  destinations web has.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Unknown web path, e.g. `/nope` | Redirect to `/schedule` (and to `/login` if not logged in) |
| EC-2 | Viewport crosses 768 px mid-session | The tree swaps; route and token are kept, open dialogs close. A web-only or wap-only route redirects to `/schedule` |
| EC-3 | `/policies?embed=1` (the native webview) | No app bar, no tab bar, no nav bar |

## API requirements

None beyond `GET /me`, which the shell may use to validate the stored
token (see `login`).

## Test-support needs

`?testSession=` and the deep-link `testSession` (`test-support` AC-4, AC-5).

## Out of scope

Logout, a user profile screen, settings, dark mode.

## Decisions taken by default (review)

1. The breakpoint is 768 px.
2. There's no logout button. The brief's core flow doesn't include one, and tests reset instead.
3. Class detail is a full screen on every platform, with a back control.

## Changelog

- v2 (M4):
  - wap replaces the hamburger and drawer with an app bar and bottom tabs
    (ADR 0008).
  - Added the Week tab (wap, android, ios) and a Policies link on web.
  - Icons from lucide (`docs/design/visual-language.md`).
  - Retired identifiers: `nav.menu.toggle`, `nav.menu.drawer`,
    `nav.menu.close`.
