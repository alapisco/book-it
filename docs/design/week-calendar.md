# Design: Week view

- Version: 2
- Status: draft (M4, awaiting review)
- Date: 2026-09-27
- Implements: docs/prd/week-calendar.md v2; uses docs/design/visual-language.md

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| no (no link; `/week` and `/calendar` redirect) | yes | yes | yes |

## Layout

```
┌──────────────────────────────┐
│ BookIt · Week                │  app bar
├──────────────────────────────┤
│ ‹    21 – 27 Sep 2026     ›  │  WeekHeader
│ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐ │
│ │Mo││Tu││We││Th││Fr││Sa││Su│ │  DayStrip (sticky under the header)
│ │21││22││23││24││25││26││27│ │
│ │14││16││15││14││12││13││ 6│ │
│ └──┘└──┘└──┘└──┘└──┘└•─┘└──┘ │
├──────────────────────────────┤
│ MONDAY 21 SEP · 14 classes   │  DaySection heading
│ ▌07:00–08:00  Vinyasa Flow   │  WeekClassCard (accent bar ▌)
│ ▌Harbor Yoga · Chamberí  9 left
│ …                            │
└──────────────────────────────┘
│ Schedule │ Week │ Bookings │ Policies │
```

## Component inventory

| Component | Purpose | Platforms | Data source |
|---|---|---|---|
| WeekScreen | Root | wap, android, ios | — |
| WeekHeader | `ChevronLeft` button, the range text, `ChevronRight` button | wap, android, ios | `ScheduleWeek` |
| DayStrip | 7 equal-width day buttons in one row, sticky below WeekHeader | wap, android, ios | `ScheduleWeek.days` |
| DayPill | The weekday abbreviation (`Mon`); the day number (`21`), large; the class count (`14`), small; plus a 6 px dot under the count when the user has a booking that day | wap, android, ios | `ScheduleDay` |
| WeekList | Scrollable list of 7 DaySections. On native it's a `ScrollView` that renders every row (no virtualization) | wap, android, ios | `ScheduleWeek.days` |
| DaySection | Uppercase heading, then cards or "No classes" | wap, android, ios | `ScheduleDay` |
| WeekClassCard | Card with a studio accent bar. Contents: time range; class name; "Studio · Neighbourhood"; seat label (availability scale); "Booked" badge | wap, android, ios | `StudioClass` |

**DayPill visuals:**

| State | Look |
|---|---|
| default | `surface` background, `border` outline |
| today | 2 px `primary` outline |
| selected | `primary` fill, `on-primary` text |
| today and selected | filled |

## States

| State | Visible | Identifiers |
|---|---|---|
| loading | WeekHeader (buttons disabled; range empty until loaded), "Loading week…" | `week.screen`, `week.loading` |
| error | WeekHeader, API `message` | `week.error` |
| empty (all 7 days have 0 classes) | WeekHeader, DayStrip with 0s, "No classes this week." | `week.empty` |
| populated | everything | `week.strip`, `week.day.pill` × 7, `week.list`, `week.section` × 7, `week.class.card` × N |

**Identifiers inside each element:**

| Element | Identifiers |
|---|---|
| WeekHeader | `week.range.prev`, `week.range.text`, `week.range.next` |
| DayPill | `week.day.name`, `week.day.number`, `week.day.count`, `week.day.booked` (only when booked) |
| DaySection | `week.section.header` |
| WeekClassCard | `week.class.time`, `week.class.name`, `week.class.studio`, `week.class.spots`, `week.class.booked` (only when booked) |

**Selection:**
- The selected pill has `aria-selected="true"` on wap, and
  `accessibilityState={{ selected: true }}` on native.
- Today's pill has `aria-current="date"` on wap, and
  `accessibilityHint="today"` on native.

**Jump:**
- Tapping a pill scrolls the list so that section's header sits directly
  under the sticky strip.
- wap uses `element.scrollIntoView` with a scroll-margin equal to the
  strip height.
- Native uses `scrollTo({ y })`, with offsets measured by each section's
  `onLayout`.

## Breakpoint behaviour (web vs wap)

| web (≥ 768 px) | wap (< 768 px) |
|---|---|
| Feature absent: no nav link; `/week` → `/schedule`; no `week.*` identifier | Full week view as above |

## Native behaviour (android / ios)

- The same components as wap: `ScrollView`, `Pressable` pills and
  `onLayout` offsets.
- Pills and cards whose children carry identifiers use
  `accessible={false}` (app-shell tech spec v2, the iOS nested-identifier
  rule).
- The route is `/week`, a tab. Tapping a card pushes `/classes/{id}`, and
  Back pops to the week.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `nav.week.link`, `week.screen`, `week.range.text` |
| AC-2 | `week.day.pill`, `week.day.name`, `week.day.number`, `week.day.count`, `week.day.booked`, `aria-current` / hint |
| AC-3 | `week.section`, `week.section.header`, `week.class.card`, `week.class.*` |
| AC-4, AC-5 | `week.day.pill` selected state; `week.section.header` visible after the tap |
| AC-6 | `week.range.prev`, `week.range.next` |
| AC-7 | `week.class.card` → `class.screen` → `class.back.link` → `week.screen` |
| AC-8 | absence of `nav.week.link` and `week.*` on web |
| EC-4, EC-5 | `week.error`, `week.empty` |

## Open questions

None.

## Changelog

- v2 (M4): replaces the web-only 7-column grid (v1) with a mobile day strip + list on wap, android and ios. All `calendar.*` identifiers are retired.
