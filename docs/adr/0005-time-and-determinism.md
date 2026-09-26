# ADR 0005: UTC everywhere, a controllable clock, a pure schedule

- Status: accepted; display rule superseded by [0007](0007-studio-local-time.md)
- Date: 2026-09-25

## Context

Tests must assert exact times and exercise time rules deterministically.
Two examples: the cancellation cutoff, and a class that has already
started. Emulators, simulators and CI machines run in different time zones.

## Decision

- **UTC everywhere:**
  - The API returns ISO 8601 UTC timestamps (`...Z`).
  - Every UI shows times as `HH:MM UTC` and dates as `Sat 26 Sep 2026`,
    formatted from UTC fields, never from the device's zone.
- **"Now" is the test session's clock, never the wall clock:**
  - The clock can be frozen, set or advanced with `POST /test/clock`.
  - A single request can override it with `X-Test-Now`.
  - Clients never compute time rules. They render the booleans the API
    returns (`has_started`, `can_cancel`).
- **The schedule is a pure function of `(studio_id, date)`,** using a PRNG
  seeded with `"<studio_id>:<YYYY-MM-DD>"`. The same date always gives the
  same classes, ids, instructors and seat counts, and every date has a
  schedule.
- **Anchor classes** are placed relative to the session clock when the
  session is seeded, so they are always in the near future after a reset.

## Consequences

- Users see UTC times. That's odd for a product, correct for a fixture.
- Seasonal rules (outdoor classes in May–September, January early slots,
  a reduced August) can be tested by requesting a date. No clock change
  is needed.
