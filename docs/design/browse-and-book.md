# Design: Browse and book

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/browse-and-book.md v1

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes | yes | yes | yes |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| ScheduleScreen | schedule | Root | all | — |
| DateBar | schedule | "‹ Previous day", date text, "Next day ›" | all | `ScheduleDay.date/previous_date/next_date` |
| ScheduleGrid | schedule | 3-column grid of class cards | web | `GET /schedule` |
| ScheduleList | schedule | Stacked full-width rows | wap, android, ios | `GET /schedule` |
| ClassCard | schedule | Name, studio, time, seat label, "Booked" badge; the whole card is tappable | all | `StudioClass` |
| ClassScreen | class | Root | all | `GET /classes/{id}` |
| BackLink | class | "← Schedule" | all | — |
| ClassDetails | class | Name, studio, instructor, time, seats | all | `StudioClass` |
| ClassAction | class | Exactly one of: Book button, booked badge + bookings link, started badge, full badge | all | `StudioClass` |
| BookingConfirm (modal) | class | Centred dialog over a dimmed backdrop | web | `POST /bookings` |
| BookingConfirm (sheet) | class | Panel anchored to the bottom edge, full width, over a dimmed backdrop | wap, android, ios | `POST /bookings` |

## States

**Schedule (ScheduleGrid / ScheduleList).** The DateBar is visible in every state.

| State | Visible | Identifiers |
|---|---|---|
| loading | "Loading classes…" | `schedule.loading` |
| empty | "No classes on this day." | `schedule.empty` |
| error | the API `message` | `schedule.error` |
| populated | grid (web) or list (others) of cards | `schedule.grid` or `schedule.list`, `schedule.class.card` × N |

A card contains:
- `schedule.class.name`
- `schedule.class.studio`
- `schedule.class.time` (`07:00–08:00 UTC`)
- `schedule.class.spots` ("Started" / "Full" / "1 spot left" / "N spots left")
- `schedule.class.booked` ("Booked"), only when `my_booking_id` is set

**Class detail.** The BackLink is visible in every state, as
`class.back.link`.

| State | Visible | Identifiers |
|---|---|---|
| loading | "Loading class…" | `class.loading` |
| empty | Impossible: an unknown id is a `404`, rendered as error | — |
| error | the API `message` (e.g. "Class not found.") | `class.error` |
| populated | details and one action | `class.name.text`, `class.studio.text`, `class.instructor.text` ("with Maya Chen"), `class.time.text`, `class.spots.text` ("3 of 16 spots left" / "Full"), plus one of the actions below |

Actions, with the first match winning:
1. `class.booked.badge` "You're booked" and `class.bookings.link` "View my bookings"
2. `class.started.badge` "Class has started"
3. `class.full.badge` "Class full"
4. `class.book.button` "Book"

**BookingConfirm.** The container is `booking.confirm.modal` on web and
`booking.confirm.sheet` elsewhere.

| State | Visible | Interactive | Identifiers |
|---|---|---|---|
| idle | summary, both buttons | both | `booking.confirm.summary`, `booking.confirm.submit`, `booking.confirm.dismiss` |
| loading | spinner in submit | dismiss only | + `booking.confirm.loading` |
| error | API `message` above the buttons | both (submit retries) | + `booking.confirm.error` |
| success | closes; ClassAction shows the booked badge | — | `class.booked.badge` |

"Empty" doesn't apply to the confirmation, because it always has a class.

## Breakpoint behaviour (web vs wap)

| Component | web (≥ 768 px) | wap (< 768 px) |
|---|---|---|
| Schedule container | `ScheduleGrid`: `<div role="list">` in 3 columns, as `schedule.grid` | `ScheduleList`: `<ul>`, one row per class, as `schedule.list` |
| ClassCard | Tile: name on top, meta below, seat label bottom-right | Row: time on the left, name and studio in the middle, seat label on the right |
| Confirmation | `Modal`, as `booking.confirm.modal` | `BottomSheet`, as `booking.confirm.sheet` |
| DateBar, class detail | Shared components | Shared components |

The card inner identifiers and the confirmation inner identifiers are
shared. Only the containers differ.

## Native behaviour (android / ios)

- **Schedule:** a `ScrollView` with every row rendered, so that Appium sees
  all cards without virtualisation.
- **Class detail:** a stack screen over the tabs, without a header. It
  uses `class.back.link`.
- **Confirmation:** a React Native `Modal` (`transparent`,
  `animationType="slide"`). Its content view is `booking.confirm.sheet`,
  anchored to the bottom.
- android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1, AC-4 | `schedule.date.text`, `schedule.date.prev`, `schedule.date.next` |
| AC-2, AC-3 | `schedule.class.card`, `schedule.class.name`, `schedule.class.studio`, `schedule.class.time`, `schedule.class.spots`, `schedule.class.booked` |
| AC-5 | `schedule.empty` |
| AC-6 | `class.name.text`, `class.studio.text`, `class.instructor.text`, `class.time.text`, `class.spots.text` |
| AC-7 | `class.booked.badge`, `class.bookings.link`, `class.started.badge`, `class.full.badge`, `class.book.button` |
| AC-8 | `class.back.link` |
| AC-9 | `booking.confirm.modal` / `booking.confirm.sheet`, `booking.confirm.summary`, `booking.confirm.dismiss` |
| AC-10 | `booking.confirm.submit`, `booking.confirm.loading` |
| AC-11, AC-13 | `class.booked.badge`, `class.spots.text` |
| AC-12, EC-1–EC-6 | `booking.confirm.error` (or `class.error` for EC-1 via URL) |
| EC-9, EC-10 | `schedule.error`, `schedule.loading` |

## Open questions

None.
