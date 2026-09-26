# Tech spec: Week view

- Version: 4
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/week-calendar.md v3, docs/design/week-calendar.md v3

## Overview

- **fixtures:** `feature-flags.json` sets `week_calendar` to `false` on web
  and `true` on wap, android and ios.
- **api:**
  - `GET /schedule/week` is unchanged in shape except for the new
    `today: date` (studio local).
  - `require_flag("week_calendar")` now refuses `X-Platform: web`.
- **web:**
  - `pages/CalendarPage.tsx` and the `calendar.*` identifiers are deleted.
  - `/calendar` and `/week` redirect to `/schedule` at ≥ 768 px.
- **wap:**
  - `pages/WeekPage.tsx`, route `/week` (flag-gated), and `nav.week.link`
    in the bottom tabs.
- **android / ios:**
  - `src/app/(tabs)/week.tsx`, and a Week tab in `(tabs)/_layout.tsx`.

## API contract

`ScheduleWeek`:
- `week_start`, `week_end`, `previous_week`, `next_week`, `today: date`
- `now: datetime`
- `days: ScheduleDay[7]`

All dates are studio local (ADR 0007).

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /schedule/week?date=` | bearer | `200 ScheduleWeek` | 400 `INVALID_PLATFORM`, 401, 403 `FEATURE_UNAVAILABLE` (web), 422 |

## State and rules

- `d` is `date` or the local `today`.
- `week_start = d - d.weekday()` days.
- Each day is built by the shared `schedule_day()`.

## Implementation by platform

**wap** (`WeekPage`):
- **Data:** the `week` search param, with the "result remembers its key"
  loading pattern. `selected` is held in `useState`, initialised per
  PRD AC-4 whenever a result arrives.
- **Strip:**
  - a `<div role="tablist">` of 7 `<button role="tab">`
  - `aria-selected` on the selected pill, `aria-current="date"` on today
  - `position: sticky` under the week header
- **List:**
  - one `<section>` per day, with its heading marked `data-day={date}`
    (a data attribute, not an identifier)
  - `scroll-margin-top` equal to the strip height
  - tapping a pill runs `section.scrollIntoView({ block: 'start' })`
- **Cards:** the same markup and availability helper as the Schedule card,
  but under `week.*` identifiers.
- **Open and back (AC-7, v4):** a card links to
  `/classes/<id>?back=<encoded /week?week=<week_start>&day=<class date>>`
  (`browse-and-book` tech spec v5). `WeekPage` reads `day`: when it falls
  inside the loaded week it is the initial selection (and the list scrolls
  to it); otherwise AC-4 applies. Changing week with prev/next replaces
  the params with `{week}`, so `day` is dropped and AC-4 applies.

**android / ios** (`(tabs)/week.tsx`):
- **Back (AC-7, v4):** a card press stores the class's date in a
  `returnDay` ref before `router.push`. The focus reload uses it (when it
  is inside the loaded week) instead of `initialDay`, jumps to it, and
  clears it, so a plain tab switch still resets per AC-4.
- **List:** a `ScrollView` with `stickyHeaderIndices` for the strip.
- **Offsets:** each section records `y` via `onLayout` into a `useRef`
  map. Tapping a pill calls `scrollRef.current.scrollTo({ y: offset[date] })`.
- **Accessibility:**
  - Pill: `accessibilityRole="button"`,
    `accessibilityState={{ selected }}`, and `accessibilityHint="today"`
    on today's pill.
  - Pills and cards that contain identified children use
    `accessible={false}`.
- **Refresh:** `useFocusEffect` reloads on focus.

**Shared helpers:**
- **`format.ts`:** gains `formatWeekRange(start, end)`
  (`21 – 27 Sep 2026` / `28 Sep – 4 Oct 2026`) and
  `formatSectionHeader(date, n)` (`MONDAY 21 SEP · 14 classes` /
  `· No classes`).
- **`availability.ts`:** maps a class to the tone of its seat label.

## Identifiers

`docs/design/testids.md` § week, plus `nav.week.link`. The `calendar.*`
identifiers and `nav.calendar.link` are removed from the registry in the
same change.

## Test-support hooks

The clock and `X-Test-Now` (DST week: 26 Oct 2026). `u-ava`'s anchors
give the booked dots.

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-7, EC-2, EC-4–EC-6 | `WeekPage`, `(tabs)/week.tsx` |
| AC-8 | web routes and `WebNav` (no link) |
| AC-9, EC-1, EC-3 | `routes/catalog.py`, flags fixture |

## Open questions

None.

## Changelog

- v2 (M4): replaces the web-only grid (v1) with a mobile day strip + list; flag flip; `today` field.
- v3: wap class detail opened from the week returns to that week (`?from=week`).
- v4: Back restores the week and the opened class's day on wap (`?back=…&day=`) and native (`returnDay` ref).
