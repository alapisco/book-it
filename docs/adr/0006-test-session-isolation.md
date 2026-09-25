# ADR 0006: All state is namespaced by test session

- Status: accepted
- Date: 2026-09-25

## Context

The framework runs tests in parallel workers against one API process.
Workers must not see or clobber each other's bookings, clocks or chaos
settings.

## Decision

- **Header:** every request may carry `X-Test-Session: <id>`, matching
  `[A-Za-z0-9_-]{1,64}`. Without it, the session is `default`.
- **State:** each session has its own copy of all mutable state: tokens,
  bookings, seat overrides, clock and chaos. It is seeded on first use.
- **Reset:** `POST /test/reset` re-seeds only the caller's session.
- **UI clients:** the web app takes `?testSession=<id>` on any URL and
  keeps it in `localStorage`. The native app takes `testSession` from a
  deep link query (`bookit://...?testSession=<id>`) or from
  `EXPO_PUBLIC_TEST_SESSION`. Both send it as `X-Test-Session`.

## Consequences

- A token only works in the session that issued it. Using it from another
  session returns `401 UNAUTHORIZED`.
- Sessions are never garbage-collected. They live for the process
  lifetime, which is fine for a fixture.
