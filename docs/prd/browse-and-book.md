# PRD: Browse and book

- Version: 3
- Status: approved
- Date: 2026-09-26

## Summary

A logged-in user browses the schedule one day at a time across all three
studios, opens a class, and confirms a booking. The API enforces seats,
start time, duplicates and the booking limit. Each has a distinct
conflict code.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Core flow. The schedule is a grid, and confirmation is a modal. |
| wap | yes | Core flow. The schedule is a stacked list, and confirmation is a bottom sheet, i.e. a different tree (ADR 0003). |
| android | yes | Core flow. Stacked list and bottom sheet. |
| ios | yes | Core flow. Same as android. |

## User stories

- **US-1** As a user, I want to see one day's classes across all studios, so that I can pick one.
- **US-2** As a user, I want to move to the previous or next day.
- **US-3** As a user, I want a class's details (studio, instructor, time, seats) before I book.
- **US-4** As a user, I want to confirm before a booking is made, so that I don't book by accident.
- **US-5** As a user, I want to be told exactly why a booking failed.

## Acceptance criteria

**Schedule**
- **AC-1** (US-1) Opening the schedule without a date shows today's date in studio local time (ADR 0007).
- **AC-2** (US-1) The schedule lists every class returned by `GET /schedule` for that date, in `start_at` order. Each entry shows the name, the studio name and neighbourhood, the local time as `HH:MM–HH:MM`, and a seat label:
  - "Started" when `has_started`
  - "Full" when `is_full`
  - "1 spot left" when `spots_left` = 1
  - otherwise "N spots left"
- **AC-3** (US-1) Entries for classes the user has booked also show "Booked".
- **AC-4** (US-2) "Previous day" and "Next day" change the date by exactly one day and update the URL or deep link `date` parameter.
- **AC-5** (US-1) A date with no classes shows "No classes on this day." This can't happen from the generator, but covers anchors-only filtering and future rule changes.

**Class detail**
- **AC-6** (US-3) Selecting a class opens class detail, showing:
  - the name and studio name
  - "with <instructor>"
  - `Sat 26 Sep 2026 · 07:00–08:00` (studio local time)
  - "N of C spots left" or "Full"
- **AC-7** (US-3) The action area shows exactly one of these, checked in order:
  1. "You're booked" plus a "View my bookings" link, if `my_booking_id` is set
  2. "Class has started", if `has_started`
  3. "Class full", if `is_full`
  4. otherwise a "Book" button
- **AC-8** (US-3) "← Schedule" returns to the schedule for the class's date.
  Exceptions: a class opened from the week returns to that week
  (`week-calendar` AC-7), and one opened from My bookings returns to My
  bookings (`my-bookings-and-cancel` AC-11).

**Booking**
- **AC-9** (US-4) "Book" opens a confirmation showing
  `<name> · <date> · <HH:MM> · <studio>`, with "Confirm booking" and
  "Not now". "Not now" closes it without any API call.
- **AC-10** (US-4) "Confirm booking" sends `POST /bookings`. While it's in
  flight, the confirm button is disabled and a loading indicator shows.
- **AC-11** (US-4) On `201`, the confirmation closes, and class detail
  shows "You're booked" with `spots_left` reduced by exactly 1.
- **AC-12** (US-5) On an error, the confirmation stays open and shows the
  API `message` verbatim. "Not now" then closes it and reloads class
  detail.
- **AC-13** Logged in as `u-ben` with a fresh reset, booking
  `anchor-last-seat` succeeds, and the class then shows "Full" to every
  user in the session.

## Error and edge cases

Booking rules are checked in the order below. The first failing rule wins.

| ID | Trigger (from seed state) | Expected |
|---|---|---|
| EC-1 | Unknown `class_id` | `404 CLASS_NOT_FOUND` "Class not found." |
| EC-2 | Class `has_started` (e.g. `anchor-cancel-closed` after `POST /test/clock/advance {"seconds": 25200}`) | `409 CLASS_STARTED` "This class has already started." |
| EC-3 | `u-ava` books `anchor-cancel-open` | `409 ALREADY_BOOKED` "You have already booked this class." |
| EC-4 | `u-cara` books `anchor-last-seat` | `409 BOOKING_LIMIT_REACHED` "You have reached the limit of 3 upcoming bookings." |
| EC-5 | `u-ben` books `anchor-full` | `409 CLASS_FULL` "This class is full." |
| EC-6 | Class detail opened with 1 spot, then `POST /test/classes/{id}/fill`, then Confirm | `409 CLASS_FULL` shown in the confirmation |
| EC-7 | Two concurrent `POST /bookings` for `anchor-last-seat` by `u-ben` and `u-ava` | Exactly one `201`, one `409 CLASS_FULL` |
| EC-8 | `GET /schedule?date=2026-02-30` | `422 VALIDATION_ERROR` |
| EC-9 | Chaos `error_status: 500` on `/schedule` | Schedule shows "Something went wrong." |
| EC-10 | Chaos `latency_ms: 3000` | The loading state stays visible for at least 3 s |

## API requirements

| Method | Path | Body / query | Success |
|---|---|---|---|
| GET | `/schedule` | `date: YYYY-MM-DD` (optional, default: session today), `studio_id` (optional) | `200 ScheduleDay` |
| GET | `/classes/{class_id}` | — | `200 StudioClass` |
| POST | `/bookings` | `{class_id: str}` | `201 Booking` |
| GET | `/studios` | — | `200 Studio[]` |

- `ScheduleDay`: `date`, `previous_date`, `next_date: date`,
  `now: datetime`, `classes: StudioClass[]`.
- `Booking`: `id`, `class_id`, `user_id: str`, `created_at: datetime`,
  `can_cancel: bool`, `cancel_deadline: datetime`,
  `studio_class: StudioClass`.

All of these need authentication.

## Test-support needs

The anchors `anchor-full`, `anchor-last-seat` and `anchor-cancel-open`;
the seed users; `fill`; the clock; chaos.

## Out of scope

Filtering or searching the schedule in the UI, week views (M3
`week-calendar`), waitlist (M3), payments.

## Decisions taken by default (review)

1. Browsing is one day across all studios. No studio filter in the UI; the
   API has `studio_id` for API tests.
2. The confirmation copy is "Confirm booking" / "Not now". "Cancel" is
   avoided, so it isn't confused with cancelling a booking.
3. There's no success toast. Class detail changing to "You're booked" is
   the success signal.

## Changelog

- v2 (M4): times are shown in studio local time with no zone suffix (ADR 0007); the seat label is colour-coded on every platform with the availability scale in `docs/design/visual-language.md` (it was web-only); the studio line includes the neighbourhood.
- v3: AC-8 lists its exceptions: a class opened from the week (`week-calendar` AC-7) or from My bookings (`my-bookings-and-cancel` v3).
