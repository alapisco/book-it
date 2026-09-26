# Tech spec: Domain and seed data

- Version: 2
- Status: approved
- Date: 2026-09-27
- Implements: docs/prd/domain-and-seed-data.md v2 (no design spec: no UI); ADR 0007

## Overview

- **fixtures/:** `studios.json` (studios and class templates),
  `schedule-rules.json` (the seasonal rules), `anchors.json`,
  `users.json` and `bookings.json` (seed bookings).
- **api/bookit/schedule.py:** the pure generator
  `generate_day(studio, date) -> list[GeneratedClass]`.
- **api/bookit/sessions.py:** `SessionState.seed(now)` builds users,
  bookings and anchors from the fixtures.
- **api/bookit/catalog.py:** `find_class(session, class_id)` resolves both
  anchor and generated ids, and `to_model()` computes the derived fields.

## API contract

| Model | Fields |
|---|---|
| `Studio` | `id: str`, `name: str`, `description: str` |
| `StudioClass` | `id`, `studio_id`, `studio_name`, `name`, `category`, `instructor: str`; `start_at`, `end_at: datetime`; `duration_min`, `capacity`, `spots_left: int`; `is_full`, `has_started`, `is_outdoor`, `is_anchor: bool`; `my_booking_id: str \| null` |
| `ErrorBody` | `error: {code: str, message: str}` |

`GET /studios` requires authentication and returns `Studio[]` in fixture order.

## State and rules

**Generator** (pure; no session input):

```
rng = random.Random(f"{studio_id}:{date.isoformat()}")
for template in studio.templates:                 # fixture order
    skip if template.outdoor and date.month not in rules.outdoor_months
    skip if date.weekday() not in template.weekdays   # 0 = Monday
    hours = template.hours
          + [rules.january_early_hour] if date.month == 1 and template.january_early
    for hour in sorted(set(hours)):
        keep = rules.august_keep_probability if date.month == 8 else rules.keep_probability
        if rng.random() >= keep and not (january and hour == january_early_hour): continue
        instructor = rng.choice(template.instructors)
        filler = capacity if rng.random() < rules.full_probability
                 else rng.randint(0, capacity - 1)
```

- Class id: `f"{studio_id}-{date:%Y%m%d}-{hour:02d}00-{slug}"`.
- `start_at`: `date` at `hour:00` UTC. `end_at = start_at + duration_min`.
- Rule values (`schedule-rules.json`): `keep_probability 0.85`,
  `august_keep_probability 0.5`, `outdoor_months [5..9]`,
  `january_early_hour 6`, `full_probability 0.15`.

**Derived fields,** computed per request with `now` = the request's clock:
- `spots_left = max(0, capacity - filler - count(bookings on class))`
- `is_full = spots_left == 0`
- `has_started = now >= start_at`
- `my_booking_id` is set when the caller holds a booking on the class.

**Session seed** (`SessionState.seed(now)`):
- `T0 = now` floored to the hour.
- Each anchor gets `start_at = T0 + offset_hours`, a fixed `capacity` and
  a fixed `filler`.
- Users are loaded from `users.json`, and bookings from `bookings.json`
  with fixed ids (e.g. `bk-ava-open`).

**Class lookup:** an anchor id is looked up in `session.anchors`.
Otherwise the id is parsed with
`^(harbor|summit|ember)-(\d{8})-(\d{4})-([a-z0-9-]+)$`, that studio and
date are regenerated, and the id is matched. No match means
`404 CLASS_NOT_FOUND`.

## Implementation by platform

- **api:** `bookit/fixtures.py` loads JSON once, from
  `BOOKIT_FIXTURES_DIR` (default `<repo>/fixtures`). The generator and the
  derived fields are as above.
- **web, wap, android, ios:** consume `StudioClass` through the generated
  types. Times are formatted from UTC fields (ADR 0005), with one small
  `format.ts` per client.

## Identifiers

None. There's no UI.

## Test-support hooks

The anchors and seed users are the hooks. Reset re-runs `seed(now)`.

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-6 | `schedule.generate_day`, `GET /schedule` |
| AC-7, AC-8 | `SessionState.seed`, `anchors.json`, `GET /schedule` |
| AC-9 | `users.json`, `bookings.json` |
| AC-10 | `studios.json` |
| EC-1–EC-4 | query validation, `catalog.find_class`, derived `has_started` |

## Open questions

None.

## Changelog

- v2 (M4): studio local time.
  - `fixtures/studios.json` gains `timezone` (`Europe/Madrid`),
    `neighborhood` and `accent`.
  - `bookit/localtime.py` holds `TZ = ZoneInfo(...)`, `to_local(dt) -> str`
    (naive `YYYY-MM-DDTHH:MM:SS`) and `local_today(now) -> date`.
  - The generator builds `start_at = datetime.combine(day, time(hour), tzinfo=TZ).astimezone(UTC)`,
    so `day` and `hour` are local. Ids keep the local date and time.
  - `classes_on(day)` returns the generated classes for local `day`, plus
    anchors whose local start date is `day`.
  - `to_model` adds `start_local`, `end_local`, `studio_neighborhood` and
    `studio_accent`.
  - `/schedule` defaults to `local_today(now)`.
  - `tzdata` is added to `api/requirements.txt`, so slim containers have
    the zone database.
  - Renamed anchors, guests and `beach-yoga` → `park-yoga`.
