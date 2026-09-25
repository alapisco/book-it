# Tech spec: Test support

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/test-support.md v1 (no design spec: no UI)

## Overview

- **One HTTP middleware** in `api/bookit/main.py`, running in this order:
  1. Resolve the session from `X-Test-Session`.
  2. Resolve `now` from `X-Test-Now` or the session clock.
  3. Apply chaos.
  4. Store `session` and `now` on `request.state`.
- **`api/bookit/routes/testsupport.py`:** reset, clock, chaos and fill.
- **Clients:** the web and native `api.ts` modules attach
  `X-Test-Session`, and handle `401` by returning to login.

## API contract

| Model | Fields |
|---|---|
| `ResetResult` | `session: str`, `now: datetime`, `anchors: [{id: str, start_at: datetime}]` |
| `ClockState` | `now: datetime`, `frozen: bool` |
| `ClockSet` | `now: datetime`, `frozen: bool = true` |
| `ClockAdvance` | `seconds: int` |
| `ChaosConfig` | `latency_ms: int ≥ 0 = 0`, `error_status: int 500–599 \| null`, `error_count: int ≥ 1 \| null`, `timeout_ms: int ≥ 0 \| null`, `expire_tokens: bool = false`, `path_prefix: str \| null` |

The endpoints are as listed in the PRD's API table.

**Errors:**
- `400 INVALID_TEST_SESSION`
- `400 INVALID_TEST_NOW`
- `422 VALIDATION_ERROR`
- `504 TIMEOUT`
- `5xx CHAOS_ERROR` (message "Something went wrong.")
- `401 TOKEN_EXPIRED`

## State and rules

- `STORE: dict[str, SessionState]` is created lazily and seeded on first
  use with the `now` of that first request.
- **`SessionState` holds:**
  - `users`, `tokens: dict[token, user_id]`, `bookings: dict[id, Booking]`,
    `next_booking_seq`
  - `anchors`, `filler_overrides: dict[class_id, int]`
  - `clock_frozen_at: datetime | None`, `clock_offset: timedelta`
  - `chaos: ChaosConfig`
- **Clock:** `session.now()` is `clock_frozen_at` if set, else
  `utcnow() + clock_offset`.
  - `POST /test/clock` with `frozen` sets `clock_frozen_at`; without it,
    it sets `clock_offset = now - utcnow()`.
  - `advance` adds to whichever of the two is active.
- **`X-Test-Now`** is parsed with `datetime.fromisoformat`. A value
  without an offset is treated as UTC.
- **Chaos order** (only paths outside `/test` and `/health`, filtered by
  `path_prefix`):
  1. `await sleep(latency_ms)`.
  2. If `timeout_ms` is set: `await sleep(timeout_ms)`, then `504 TIMEOUT`.
  3. If `error_status` is set: return it with `CHAOS_ERROR`, decrementing
     `error_count` and clearing `error_status` when the count reaches 0.
  4. `expire_tokens` is checked in the auth dependency, so it only
     affects endpoints that need authentication.
- **Fill:** `filler_overrides[id] = capacity - count(bookings on id)`.
- **Reset:** `STORE[id] = SessionState.seed(now)`, carrying the old clock
  fields over.
- **Concurrency:** all route handlers are `async def` and never await
  while mutating state. The event loop therefore serializes mutations, so
  two concurrent bookings of `anchor-last-seat` produce exactly one `201`
  and one `409`.

## Implementation by platform

- **api:** as above. CORS allows every origin, method and header, because
  the web app on :5173 calls the API on :8000.
- **web:** in `src/api.ts`, on module load, `?testSession=` from
  `location.search` is stored in `localStorage["bookit.testSession"]`.
  Every request sends it. On a `401`, the stored token is cleared and the
  app goes to `/login`, adding `?reason=expired` when the code is
  `TOKEN_EXPIRED`.
- **wap:** same code as web.
- **android / ios:** `src/api.ts` holds `testSession` in a module
  variable, initialised from `EXPO_PUBLIC_TEST_SESSION`. The root layout
  reads `testSession` from the incoming URL (`expo-linking`
  `useURL`) and updates it. A `401` does
  `router.replace({pathname: "/login", params: {reason: "expired"}})`,
  with the reason only for `TOKEN_EXPIRED`.

## Identifiers

`login.error.message` shows the expired-session message (PRD AC-19).

## Test-support hooks

This whole spec is test support.

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-3, EC-1 | middleware session resolution, token lookup per session |
| AC-4, AC-5 | `web/src/api.ts`, `app/src/api.ts`, `app/src/app/_layout.tsx` |
| AC-6, AC-7 | `POST /test/reset` |
| AC-8–AC-14, EC-2, EC-5 | clock endpoints, `X-Test-Now` in middleware |
| AC-15–AC-20, EC-3 | chaos endpoints, middleware, auth dependency |
| AC-21, AC-22, EC-4 | `POST /test/classes/{id}/fill`, booking rules |

## Open questions

None.
