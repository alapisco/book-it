# PRD: App shell and navigation

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25

## Summary

This PRD covers the frame every screen lives in: routing, navigation
between the schedule and "My bookings", the authentication gate, and how
each platform presents navigation. Navigation is the first place web and
wap use visibly different component trees.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | A top navigation bar. |
| wap | yes | A hamburger menu with a drawer. This is a different tree from web (ADR 0003), so the framework must abstract navigation. |
| android | yes | Bottom tabs. |
| ios | yes | Bottom tabs, the same code as android. |

## User stories

- **US-1** As a user, I want to move between the schedule and my bookings from any logged-in screen.
- **US-2** As a user who isn't logged in, I want to be sent to the login screen, so that I never see a broken screen.
- **US-3** As a test author, I want every screen reachable by URL or deep link, so that tests can start mid-flow.

## Acceptance criteria

- **AC-1** (US-1) On web, every logged-in screen shows a navigation bar
  with "Schedule" and "My bookings" links.
- **AC-2** (US-1) On wap, every logged-in screen shows a menu button.
  Tapping it opens a drawer with "Schedule" and "My bookings". Tapping
  either link navigates there and closes the drawer.
- **AC-3** (US-1) On android and ios, logged-in screens other than class
  detail show a bottom tab bar with "Schedule" and "My bookings".
- **AC-4** (US-2) Opening any route without a valid token shows the login
  screen. After a successful login, the schedule screen is shown.
- **AC-5** (US-2) Any API response of `401` clears the stored token and
  shows the login screen.
- **AC-6** (US-3) These routes exist:

  | Screen | Web/wap path | Native deep link |
  |---|---|---|
  | Login | `/login` | `bookit://login` |
  | Schedule | `/schedule?date=YYYY-MM-DD` (date optional) | `bookit://schedule?date=YYYY-MM-DD` |
  | Class detail | `/classes/{class_id}` | `bookit://classes/{class_id}` |
  | My bookings | `/bookings` | `bookit://bookings` |

  `/` redirects to `/schedule`.
- **AC-7** On web and wap, the root element carries `data-platform="web"`
  at viewport widths of 768 px or more, and `data-platform="wap"` below 768 px.
- **AC-8** The navigation and login screen never show a logout control.
  Tests log out by resetting (`test-support` AC-6) or clearing storage.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Unknown web path, e.g. `/nope` | Redirect to `/schedule` (and to `/login` if not logged in) |
| EC-2 | Viewport crosses 768 px mid-session | The tree swaps; route and token are kept, open dialogs close |

## API requirements

None beyond `GET /me`, which the shell may use to validate the stored
token (see `login`).

## Test-support needs

`?testSession=` and the deep-link `testSession` (`test-support` AC-4, AC-5).

## Out of scope

Logout, a user profile screen, settings.

## Decisions taken by default (review)

1. The breakpoint is 768 px.
2. There's no logout button. The brief's core flow doesn't include one, and tests reset instead.
3. Class detail is a full screen on every platform (not a modal), with its own back link.
