# Identifier registry

Source of truth for every `data-testid` (web/wap) and `testID` (React
Native) in this repository. `scripts/check_testids.py` parses this file;
an identifier used in `web/` or `app/` that is not listed here is rejected
by the write hook and the pre-commit hook.

## Rules

- Format `screen.element.qualifier`: 2 or 3 dot-separated segments, each
  matching `[a-z][a-z0-9-]*`.
- One identifier = one logical element, identical string on every platform
  that renders it.
- Add the entry **here first** (via `/design <feature>`), then write code.
- Never rename or delete an entry that the automation framework may use
  without updating the feature's design spec in the same commit.

## Format

One table per screen. The validator reads only the first column of rows
whose first cell is a backticked identifier; every other column is for
humans.

| Column | Meaning |
|---|---|
| `id` | The identifier, in backticks |
| `element` | Kind of element: button, input, link, text, list-item, container, sheet, modal |
| `platforms` | Where it renders: any of `web`, `wap`, `android`, `ios` (`all` = all four) |
| `spec` | Design spec that introduced it (`docs/design/<feature>.md`) |
| `notes` | State it belongs to, repetition, anything a test author needs |

## Retired identifiers

These identifiers were removed from the registry, so the validator rejects them.

| Identifier(s) | Retired in | Replaced by |
|---|---|---|
| `nav.menu.toggle`, `nav.menu.drawer`, `nav.menu.close` | M4 (ADR 0008) | `nav.tabs` and its tab links |
| `nav.calendar.link`, `calendar.*` (14) | M4 (`week-calendar` v2) | `nav.week.link`, `week.*` |

## Screen: login

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `login.screen` | container | all | login.md | Root of the login screen; present in every state (no app shell) |
| `login.email.input` | input | all | login.md | Email field |
| `login.password.input` | input | all | login.md | Password field, masked |
| `login.submit` | button | all | login.md | Disabled while either field is empty or request is in flight |
| `login.submit.loading` | container | all | login.md | Spinner shown inside submit while request is in flight |
| `login.error.message` | text | all | login.md | After a failed attempt (API `message`), or on arrival with the session-expired message |

## Screen: nav

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `nav.bar` | container | web | app-shell.md | Top navigation bar on every logged-in screen |
| `nav.tabs` | container | wap | app-shell.md | Bottom tab bar (M4); native tab bars have no container identifier |
| `nav.schedule.link` | link | all | app-shell.md | web: in `nav.bar`; wap: tab in `nav.tabs`; native: tab button |
| `nav.bookings.link` | link | all | app-shell.md | web: in `nav.bar` ("My bookings"); wap: tab "Bookings"; native: tab button |
| `nav.week.link` | link | wap, android, ios | week-calendar.md | Week tab (M4); absent on web |
| `nav.policies.link` | link | all | studio-policies.md | web: in `nav.bar`; wap: tab in `nav.tabs`; native: tab button |

## Screen: schedule

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `schedule.screen` | container | all | browse-and-book.md | Root; present in every state |
| `schedule.date.prev` | button | all | browse-and-book.md | "‹ Previous day" |
| `schedule.date.text` | text | all | browse-and-book.md | e.g. "Sat 26 Sep 2026" |
| `schedule.date.next` | button | all | browse-and-book.md | "Next day ›" |
| `schedule.loading` | container | all | browse-and-book.md | Loading state |
| `schedule.empty` | text | all | browse-and-book.md | "No classes on this day." |
| `schedule.error` | text | all | browse-and-book.md | API error `message` |
| `schedule.grid` | container | web | browse-and-book.md | Populated container on web |
| `schedule.list` | container | wap, android, ios | browse-and-book.md | Populated container elsewhere |
| `schedule.class.card` | list-item | all | browse-and-book.md | Repeated, one per class, in `start_at` order; tap opens class detail |
| `schedule.class.name` | text | all | browse-and-book.md | Inside a card |
| `schedule.class.studio` | text | all | browse-and-book.md | Inside a card |
| `schedule.class.time` | text | all | browse-and-book.md | "07:00–08:00" (studio local time) |
| `schedule.class.spots` | text | all | browse-and-book.md | "Started" / "Full" / "1 spot left" / "N spots left" |
| `schedule.class.booked` | text | all | browse-and-book.md | "Booked"; only when the user holds a booking |

## Screen: class

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `class.screen` | container | all | browse-and-book.md | Root; present in every state |
| `class.back.link` | link | all | browse-and-book.md | Returns to the screen the class was opened from, in its state (schedule date; week and day; My bookings), even while loading. No origin: schedule on the class's date. Web label names the origin ("← Schedule" / "← My bookings") |
| `class.loading` | container | all | browse-and-book.md | Loading state |
| `class.error` | text | all | browse-and-book.md | API error `message`, e.g. "Class not found." |
| `class.name.text` | text | all | browse-and-book.md | |
| `class.studio.text` | text | all | browse-and-book.md | |
| `class.instructor.text` | text | all | browse-and-book.md | "with <instructor>" |
| `class.time.text` | text | all | browse-and-book.md | "Sat 26 Sep 2026 · 07:00–08:00" (studio local time) |
| `class.spots.text` | text | all | browse-and-book.md | "N of C spots left" / "Full" |
| `class.book.button` | button | all | browse-and-book.md | Only when bookable |
| `class.booked.badge` | text | all | browse-and-book.md | "You're booked" |
| `class.bookings.link` | link | all | browse-and-book.md | "View my bookings"; with the booked badge |
| `class.checkin.link` | link | android, ios | qr-check-in.md | "Show check-in code"; with the booked badge |
| `class.started.badge` | text | all | browse-and-book.md | "Class has started" |
| `class.full.badge` | text | all | browse-and-book.md | "Class full" |
| `class.waitlist.join` | button | web, wap, android | waitlist.md | "Join waitlist"; full, not started, not booked, not waitlisted |
| `class.waitlist.loading` | container | web, wap, android | waitlist.md | Spinner inside the join button |
| `class.waitlist.error` | text | web, wap, android | waitlist.md | API error `message` after a failed join |
| `class.waitlist.position` | text | web, wap, android | waitlist.md | "You're #N on the waitlist" |

## Screen: booking

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `booking.confirm.modal` | modal | web | browse-and-book.md | Confirmation container on web |
| `booking.confirm.sheet` | sheet | wap, android, ios | browse-and-book.md | Confirmation container elsewhere |
| `booking.confirm.summary` | text | all | browse-and-book.md | "<name> · <date> · <HH:MM> · <studio>" |
| `booking.confirm.submit` | button | all | browse-and-book.md | "Confirm booking"; disabled while loading |
| `booking.confirm.dismiss` | button | all | browse-and-book.md | "Not now" |
| `booking.confirm.loading` | container | all | browse-and-book.md | Spinner inside submit |
| `booking.confirm.error` | text | all | browse-and-book.md | API error `message` |
| `booking.cancel.modal` | modal | web | my-bookings-and-cancel.md | Cancel confirmation container on web |
| `booking.cancel.sheet` | sheet | wap, android, ios | my-bookings-and-cancel.md | Cancel confirmation container elsewhere |
| `booking.cancel.summary` | text | all | my-bookings-and-cancel.md | "<name> · <date> · <HH:MM>" |
| `booking.cancel.confirm` | button | all | my-bookings-and-cancel.md | "Cancel booking"; disabled while loading |
| `booking.cancel.dismiss` | button | all | my-bookings-and-cancel.md | "Keep booking" |
| `booking.cancel.loading` | container | all | my-bookings-and-cancel.md | Spinner inside confirm |
| `booking.cancel.error` | text | all | my-bookings-and-cancel.md | API error `message` |

## Screen: bookings

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `bookings.screen` | container | all | my-bookings-and-cancel.md | Root; present in every state |
| `bookings.loading` | container | all | my-bookings-and-cancel.md | Loading state |
| `bookings.empty` | text | all | my-bookings-and-cancel.md | "You have no upcoming bookings." |
| `bookings.empty.browse` | link | all | my-bookings-and-cancel.md | "Browse schedule" |
| `bookings.error` | text | all | my-bookings-and-cancel.md | API error `message` |
| `bookings.table` | container | web | my-bookings-and-cancel.md | Populated container on web |
| `bookings.list` | container | wap, android, ios | my-bookings-and-cancel.md | Populated container elsewhere |
| `bookings.item` | link | all | my-bookings-and-cancel.md | Repeated, one per booking, `start_at` order; tap (outside its buttons) opens class detail (v3) |
| `bookings.item.name` | text | all | my-bookings-and-cancel.md | Class name |
| `bookings.item.studio` | text | all | my-bookings-and-cancel.md | Studio name |
| `bookings.item.time` | text | all | my-bookings-and-cancel.md | "Sat 26 Sep 2026 · 07:00" (studio local time) |
| `bookings.item.cancel` | button | all | my-bookings-and-cancel.md | Only when `can_cancel` |
| `bookings.item.cancel-closed` | text | all | my-bookings-and-cancel.md | "Cancellation closed"; only when not `can_cancel` |
| `bookings.item.export` | button | web | ics-export.md | "Export .ics"; in every table row |
| `bookings.export.error` | text | web | ics-export.md | API error `message` above the table |
| `bookings.item.checked-in` | text | android, ios | qr-check-in.md | "Checked in"; only when `checked_in_at` is set |

## Screen: waitlist

Rendered inside the bookings screen, only where the `waitlist` flag is true.

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `waitlist.section` | container | web, wap, android | waitlist.md | "Waitlist" section; only when the user has entries |
| `waitlist.table` | container | web | waitlist.md | Entries container on web |
| `waitlist.list` | container | wap, android | waitlist.md | Entries container elsewhere |
| `waitlist.item` | list-item | web, wap, android | waitlist.md | Repeated, one per entry, class `start_at` order |
| `waitlist.item.name` | text | web, wap, android | waitlist.md | Class name |
| `waitlist.item.time` | text | web, wap, android | waitlist.md | "Sat 26 Sep 2026 · 07:00" (studio local time) |
| `waitlist.item.position` | text | web, wap, android | waitlist.md | "#N on the waitlist" |
| `waitlist.item.leave` | button | web, wap, android | waitlist.md | "Leave waitlist" |
| `waitlist.leave.loading` | container | web, wap, android | waitlist.md | Spinner inside the leave button |
| `waitlist.leave.error` | text | web, wap, android | waitlist.md | API error `message` after a failed leave |

## Screen: policies

On android and ios, the page identifiers (all except `policies.webview*`) appear inside the webview's web context, because the native app embeds the wap page.

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `policies.screen` | container | web, wap | studio-policies.md | Root; present in every state |
| `policies.loading` | container | web, wap | studio-policies.md | Loading state |
| `policies.empty` | text | web, wap | studio-policies.md | "No policies published." |
| `policies.error` | text | web, wap | studio-policies.md | API error `message` |
| `policies.tabs` | container | web | studio-policies.md | Tab list |
| `policies.studio.tab` | button | web | studio-policies.md | Repeated, one per studio; selected has `aria-selected="true"` |
| `policies.accordion` | container | wap | studio-policies.md | Accordion |
| `policies.studio.toggle` | button | wap | studio-policies.md | Repeated, one per studio; expanded has `aria-expanded="true"` |
| `policies.panel` | container | web, wap | studio-policies.md | The selected or expanded studio's rules |
| `policies.studio.name` | text | web | studio-policies.md | Panel heading, web only from M4 (on wap the toggle already names the studio) |
| `policies.rule.item` | list-item | web, wap | studio-policies.md | Repeated, one per rule |
| `policies.rule.title` | text | web, wap | studio-policies.md | Rule title |
| `policies.rule.text` | text | web, wap | studio-policies.md | Rule text |
| `policies.webview` | container | android, ios | studio-policies.md | Native webview root |
| `policies.webview.loading` | container | android, ios | studio-policies.md | Webview loading |
| `policies.webview.error` | text | android, ios | studio-policies.md | "Could not load the policies page." |

## Screen: checkin

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `checkin.screen` | container | android, ios | qr-check-in.md | Root; present in every state |
| `checkin.back.link` | link | android, ios | qr-check-in.md | "← Back"; returns to the previous screen (class detail) |
| `checkin.loading` | container | android, ios | qr-check-in.md | Initial load only |
| `checkin.error` | text | android, ios | qr-check-in.md | API error `message` |
| `checkin.class.name` | text | android, ios | qr-check-in.md | Class name |
| `checkin.qr.image` | container | android, ios | qr-check-in.md | QR of `bookit:checkin:<code>` |
| `checkin.code.text` | text | android, ios | qr-check-in.md | "XXXX-XXXX" |
| `checkin.status.text` | text | android, ios | qr-check-in.md | Status sentence (PRD AC-4) |

## Screen: week

The day strip + list (M4). Present on wap, android and ios; absent on web.

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `week.screen` | container | wap, android, ios | week-calendar.md | Root; present in every state |
| `week.range.prev` | button | wap, android, ios | week-calendar.md | Previous week (`ChevronLeft`) |
| `week.range.text` | text | wap, android, ios | week-calendar.md | "21 – 27 Sep 2026" |
| `week.range.next` | button | wap, android, ios | week-calendar.md | Next week (`ChevronRight`) |
| `week.loading` | container | wap, android, ios | week-calendar.md | Loading state |
| `week.error` | text | wap, android, ios | week-calendar.md | API error `message` |
| `week.empty` | text | wap, android, ios | week-calendar.md | "No classes this week." |
| `week.strip` | container | wap, android, ios | week-calendar.md | Day strip |
| `week.day.pill` | button | wap, android, ios | week-calendar.md | Repeated ×7, Mon→Sun; selected / today states per design |
| `week.day.name` | text | wap, android, ios | week-calendar.md | "Mon" |
| `week.day.number` | text | wap, android, ios | week-calendar.md | "21" |
| `week.day.count` | text | wap, android, ios | week-calendar.md | Class count, e.g. "14" |
| `week.day.booked` | container | wap, android, ios | week-calendar.md | Dot; only when the user has a booking that day |
| `week.list` | container | wap, android, ios | week-calendar.md | Scrollable list of the 7 sections |
| `week.section` | container | wap, android, ios | week-calendar.md | Repeated ×7 |
| `week.section.header` | text | wap, android, ios | week-calendar.md | "MONDAY 21 SEP · 14 classes" |
| `week.class.card` | link | wap, android, ios | week-calendar.md | Repeated; opens class detail |
| `week.class.time` | text | wap, android, ios | week-calendar.md | "07:00–08:00" |
| `week.class.name` | text | wap, android, ios | week-calendar.md | Class name |
| `week.class.studio` | text | wap, android, ios | week-calendar.md | "Harbor Yoga · Chamberí" |
| `week.class.spots` | text | wap, android, ios | week-calendar.md | Seat label, availability scale |
| `week.class.booked` | text | wap, android, ios | week-calendar.md | "Booked"; only when booked |
