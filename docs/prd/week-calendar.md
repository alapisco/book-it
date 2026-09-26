# PRD: Week view

- Version: 3
- Status: approved
- Date: 2026-09-26

## Summary

On mobile (wap, android, ios), a user sees a whole week of classes on one
screen:
- **A day strip:** seven day buttons with a class count and a
  "you're booked" dot.
- **A list:** the week's classes grouped under one heading per day.

Tapping a day jumps the list to that day. Desktop web doesn't have this
feature.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | **no** | Parity matrix (from v2). Desktop is the least-used surface. Web keeps the day-by-day schedule. |
| wap | yes | Parity matrix. The same web build renders it below 768 px and not above, so the framework must treat wap as a platform, not a viewport (ADR 0003). |
| android | yes | Parity matrix. |
| ios | yes | Parity matrix. |

Flag: `week_calendar` is `false` on web and `true` on wap, android and
ios. The API returns `403 FEATURE_UNAVAILABLE` for `X-Platform: web`.

## User stories

- **US-1** As a mobile user, I want to see a whole week at a glance, so that I can plan my week.
- **US-2** As a mobile user, I want to jump straight to a particular day in that week.
- **US-3** As a mobile user, I want to move between weeks.
- **US-4** As a mobile user, I want to open a class from the week.

## Acceptance criteria

All dates and times are in studio local time (ADR 0007).

**Layout (US-1)**
- **AC-1** The "Week" tab (wap, android, ios) opens the week view for the
  week (Monday to Sunday) containing today.
  - The header reads `21 – 27 Sep 2026`.
  - A week spanning two months reads `28 Sep – 4 Oct 2026`.
- **AC-2** The day strip has exactly 7 day buttons, Monday to Sunday.
  - Each shows the weekday abbreviation (`Mon`), the day of the month
    (`21`) and that day's class count (`14`).
  - Today's button is outlined.
  - A button shows a dot when the user has a booking that day.
- **AC-3** Below the strip, the list shows 7 day sections in order.
  - Each section has a heading, `MONDAY 21 SEP · 14 classes`. A day with
    no classes reads `… · No classes` and has an empty section.
  - Under each heading are that day's class cards in `start_at` order.
  - A card shows the time range (`07:00–08:00`), the class name, the
    studio and the colour-coded seat label, plus "Booked" when the user
    holds a booking. This is the same content as a Schedule card.

**Jump (US-2)**
- **AC-4** Initially, the selected button is today's in the current week,
  or Monday in any other week. The list starts at the top of the
  selected day's section. Returning from class detail (AC-7) is the
  exception.
- **AC-5** Tapping a day button selects it (and only it) and scrolls the
  list so that the day's section heading is visible at the top. It
  doesn't filter: the other days' sections stay in the list.

**Week navigation (US-3)**
- **AC-6** "Previous week" and "Next week" move by exactly 7 days, update
  `?week=<Monday>` (wap URL or native route param), reload, and reset the
  selection per AC-4.

**Open (US-4)**
- **AC-7** Tapping a class card opens class detail. Back returns to the
  week view on the same week, with the opened class's day selected and
  its section at the top of the list, on wap, android and ios. This holds
  even when Back is pressed before class detail has finished loading
  (`browse-and-book` AC-8).

**Absence on web**
- **AC-8** On web (768 px or more):
  - there's no "Week" link
  - `/week` and the old `/calendar` redirect to `/schedule`
  - no `week.*` identifier is rendered
- **AC-9** `GET /schedule/week?date=D` returns `200` for `X-Platform` wap,
  android or ios, or without `X-Platform`. The body contains:
  - `week_start` (Monday) and `week_end` (Sunday)
  - `previous_week` and `next_week`
  - `today` (the local date)
  - `now`
  - `days`: 7 × `ScheduleDay`

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | `GET /schedule/week` with `X-Platform: web` | `403 FEATURE_UNAVAILABLE` |
| EC-2 | `?week=2026-09-23` (a Wednesday) | Shows the week starting Mon 21 Sep |
| EC-3 | `GET /schedule/week?date=2026-02-30` | `422 VALIDATION_ERROR` |
| EC-4 | Chaos `error_status: 500` on `/schedule/week` | The error state shows "Something went wrong."; there's no strip |
| EC-5 | Every day has no classes | The strip shows 0 on every day, and the list shows "No classes this week." |
| EC-6 | A week containing a daylight-saving change (e.g. the week of 26 Oct 2026) | Every class shows its template local time; counts are unaffected |
| EC-7 | Chaos `{"latency_ms": 3000, "path_prefix": "/classes/"}`; on the next week, tap Thursday then a Thursday card, press Back at once | Next week, Thursday selected, Thursday's section at the top |

## API requirements

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/schedule/week?date=YYYY-MM-DD` (optional; default is today, local) | bearer | `200 ScheduleWeek` |

`ScheduleWeek` has these fields:
- `week_start`, `week_end`, `previous_week`, `next_week`, `today: date`
- `now: datetime`
- `days: ScheduleDay[7]`

The class count is `len(day.classes)`. The booked dot is any class with
`my_booking_id`.

## Test-support needs

- **The clock:** sets the default week and today's button.
- **`u-ava`'s anchor bookings:** dots and "Booked" cards.
- **Chaos.**
- **`X-Test-Now`:** for DST weeks.

## Out of scope

- Filtering by studio or category.
- Syncing the selected day as the user scrolls: selection changes only on
  tap.
- A desktop version.

## Decisions taken by default (review)

1. Weeks run Monday to Sunday, in studio local time.
2. Tapping a day jumps; it doesn't filter.
3. No scroll-sync, because a PoC doesn't need it and it would make
   assertions timing-sensitive.

## Changelog

- v2 (M4): platforms flipped. It was web-only; it's now wap, android and
  ios, and absent on web. The 7-column grid is replaced by a day strip +
  list suited to phones. The `calendar.*` identifiers are retired in
  favour of `week.*`. `ScheduleWeek` gains `today`.
- v3: Back from class detail restores the week and the opened class's day (AC-4, AC-7, EC-7).
