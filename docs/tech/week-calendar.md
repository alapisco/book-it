# Tech spec: Week calendar grid

- Version: 1
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/week-calendar.md v1, docs/design/week-calendar.md v1

## Overview

- **api:** `GET /schedule/week` in `routes/catalog.py`, gated by
  `require_flag("week_calendar")`.
- **web:** `pages/CalendarPage.tsx`, the `/calendar` route, and
  `nav.calendar.link` in `WebNav` (rendered because the flag is true).
- **wap:** `CalendarPage` renders `<Navigate to="/schedule">` when
  `!flagsFor(isWap).week_calendar`.
- **android / ios:** nothing.

## API contract

| Model | Fields |
|---|---|
| `ScheduleWeek` | `week_start`, `week_end`, `previous_week`, `next_week: date`; `now: datetime`; `days: ScheduleDay[]` (7) |

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /schedule/week?date=` | bearer | `200 ScheduleWeek` | 400 `INVALID_PLATFORM`, 401, 403 `FEATURE_UNAVAILABLE`, 422 |

## State and rules

- `week_start = d - d.weekday()` days, where `d` is `date` or the
  session's today.
- Each day is built exactly like `GET /schedule`: `classes_on` +
  `to_model`, via a shared `schedule_day()` helper.

## Implementation by platform

**api:** a `schedule_day(c, user, day)` helper, used by both `/schedule`
and `/schedule/week`.

**web:**
- `CalendarPage`: the `week` search param, and the same "result
  remembers its key" loading pattern as `SchedulePage`.
- `format.ts` gains `formatWeek(start, end)` and `formatDayHeader(date)`.
- `WebNav` renders the "Calendar" link only if `flagsFor(false).week_calendar`.

**wap:** the redirect. `WapNav` has no calendar link.

## Identifiers

`docs/design/testids.md` § calendar, plus `nav.calendar.link`.

## Test-support hooks

The clock sets the default week and today's column. `u-ava`'s anchor
bookings give "Booked" blocks.

## Traceability

| PRD | Where |
|---|---|
| AC-1 | `WebNav` |
| AC-2–AC-6, EC-2, EC-4, EC-5 | `CalendarPage` |
| AC-7 | `CalendarPage` redirect, `WapNav` |
| AC-8, EC-1, EC-3 | `routes/catalog.py` |

## Open questions

None.
