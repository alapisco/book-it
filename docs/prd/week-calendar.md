# PRD: Week calendar grid

- Version: 1
- Status: approved
- Date: 2026-09-26

## Summary

On desktop web, a user can see a whole week of classes at once, as a
seven-column grid from Monday to Sunday, and open any class from it. This
feature exists on web only.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Parity matrix. A seven-column grid needs desktop width. |
| wap | **no** | Parity matrix. The same build as web hides it below 768 px, so the framework must skip it by viewport-defined platform, not by build. |
| android | **no** | Parity matrix. |
| ios | **no** | Parity matrix. |

Flag: `week_calendar` is true on web only. The API returns
`403 FEATURE_UNAVAILABLE` for `X-Platform` values `wap`, `android` and
`ios`.

## User stories

- **US-1** As a desktop user, I want to see a week of classes at a glance, so that I can plan my week.
- **US-2** As a desktop user, I want to move between weeks.
- **US-3** As a desktop user, I want to open a class from the calendar.

## Acceptance criteria

- **AC-1** (US-1) The web nav bar shows a "Calendar" link to `/calendar`.
  The wap drawer and the native tabs don't have one.
- **AC-2** (US-1) `/calendar` without a `week` parameter shows the week
  (Monday to Sunday) containing the session clock's current UTC date. The
  header reads, e.g., `Mon 21 Sep – Sun 27 Sep 2026`.
- **AC-3** (US-1) The grid has exactly 7 day columns in Monday-to-Sunday
  order. Each column header reads, e.g., `Mon 21`. The column for the
  session's current date has `aria-current="date"`.
- **AC-4** (US-1) Each column lists that day's classes, as returned by
  `GET /schedule` for the date, in `start_at` order. Each block shows the
  start time (`07:00`) and the class name. A block the user has booked
  also shows "Booked".
- **AC-5** (US-2) "Previous week" and "Next week" move by exactly 7 days
  and set `?week=<Monday YYYY-MM-DD>`.
- **AC-6** (US-3) Selecting a block opens class detail
  (`/classes/{id}`).
- **AC-7** On wap (viewport under 768 px), `/calendar` redirects to
  `/schedule`, and no calendar identifier is rendered.
- **AC-8** `GET /schedule/week?date=D` returns `200` with `week_start`
  (the Monday on or before D), `week_end` (Sunday), `previous_week`,
  `next_week` and `days` (7 × `ScheduleDay`).

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | `GET /schedule/week` with `X-Platform: wap`, `android` or `ios` | `403 FEATURE_UNAVAILABLE` |
| EC-2 | `?week=2026-09-23` (a Wednesday) | Shows the week starting Mon 21 Sep |
| EC-3 | `GET /schedule/week?date=2026-02-30` | `422 VALIDATION_ERROR` |
| EC-4 | Chaos `error_status: 500` on `/schedule/week` | Page shows "Something went wrong." |
| EC-5 | A week whose days have no classes | "No classes this week." (not reachable with current generator rules) |

## API requirements

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/schedule/week?date=YYYY-MM-DD` (optional; default is the session's today) | bearer | `200 ScheduleWeek` |

`ScheduleWeek` has these fields:
- `week_start`, `week_end`, `previous_week`, `next_week: date`
- `now: datetime`
- `days: ScheduleDay[7]`

## Test-support needs

The clock (the default week and the today marker), anchors (the booked
badge via `u-ava`), and chaos.

## Out of scope

Drag and drop, a time-of-day axis with proportional heights, filters.

## Decisions taken by default (review)

1. Weeks run Monday to Sunday, in UTC.
2. Blocks are stacked per day in time order, not placed on an hour axis.
