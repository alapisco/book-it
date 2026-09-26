# Design: Week calendar grid

- Version: 1
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/week-calendar.md v1

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes | no (redirects, nothing rendered) | no | no |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| NavLink "Calendar" | shell | In `nav.bar`, between Schedule and My bookings | web | — |
| CalendarScreen | calendar | Root | web | — |
| WeekBar | calendar | "‹ Previous week", week text, "Next week ›" | web | `ScheduleWeek` |
| WeekGrid | calendar | 7 equal columns | web | `GET /schedule/week` |
| DayColumn | calendar | Header ("Mon 21") and a stack of blocks | web | `ScheduleDay` |
| ClassBlock | calendar | Link: time, name, optional "Booked" | web | `StudioClass` |

## States

| State | Visible | Identifiers |
|---|---|---|
| loading | WeekBar with the requested week (if any), "Loading week…" | `calendar.screen`, `calendar.loading` |
| empty | "No classes this week." | `calendar.empty` |
| error | API `message` | `calendar.error` |
| populated | the grid | `calendar.grid`, `calendar.day.column` × 7, `calendar.day.header` × 7, `calendar.class.block` × N |

- **Week bar identifiers:** `calendar.week.prev`, `calendar.week.text`,
  `calendar.week.next`. The buttons are disabled until data is loaded.
- **Block contents:** `calendar.class.time`, `calendar.class.name`, and
  `calendar.class.booked` (only when booked).
- **Styling:** full or started classes render greyed, but stay clickable.

## Breakpoint behaviour (web vs wap)

| web (≥ 768 px) | wap (< 768 px) |
|---|---|
| Calendar route and nav link | No nav link; `/calendar` redirects to `/schedule`; no `calendar.*` identifier exists |

## Native behaviour (android / ios)

None. There is no route, tab or identifier.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `nav.calendar.link` |
| AC-2, AC-5 | `calendar.week.text`, `calendar.week.prev`, `calendar.week.next` |
| AC-3 | `calendar.day.column`, `calendar.day.header`, `aria-current` |
| AC-4 | `calendar.class.block`, `calendar.class.time`, `calendar.class.name`, `calendar.class.booked` |
| AC-6 | `calendar.class.block` → `class.screen` |
| AC-7 | absence of `nav.calendar.link` and `calendar.*` |
| EC-4, EC-5 | `calendar.error`, `calendar.empty` |

## Open questions

None.
