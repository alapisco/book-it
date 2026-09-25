# PRD: Test support

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25

## Summary

These endpoints and headers exist only for the automation framework. They
let a test reset state, isolate itself from parallel workers, control
time, inject failures and force conflict states. They matter as much as
the product features.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | The API controls apply to every client. The web app forwards the test session from `?testSession=`. |
| wap | yes | Same build as web. |
| android | yes | The app forwards the test session from a deep link or build env. |
| ios | yes | Same as android. |

## User stories

- **US-1** As a test author, I want to reset my state to seed, so that every test starts from known data.
- **US-2** As a test author, I want my state isolated from other parallel workers, so that tests don't interfere.
- **US-3** As a test author, I want to set, freeze and advance time, so that time rules are testable without waiting.
- **US-4** As a test author, I want to inject latency, server errors, timeouts and expired tokens, so that I can exercise the framework's retry and observability behaviour.
- **US-5** As a test author, I want to fill a class on demand, so that I can reproduce "the class filled while I was booking".
- **US-6** As a UI test author, I want to point the web and native UIs at my test session, so that UI tests get the same isolation.

## Acceptance criteria

**Session isolation (US-2, US-6)**
- **AC-1** A request without `X-Test-Session` uses session `default`.
- **AC-2** A booking made with `X-Test-Session: a` is absent from every
  response made with `X-Test-Session: b`, and `spots_left` for that class
  differs by exactly 1 between the two sessions.
- **AC-3** A token issued in session `a` returns `401 UNAUTHORIZED` when
  used in session `b`.
- **AC-4** Opening the web app with `?testSession=w1` on any URL makes every
  later API request from that browser carry `X-Test-Session: w1`, until
  another `?testSession=` is given.
- **AC-5** Opening the native app with
  `bookit://login?testSession=m1` (or building it with
  `EXPO_PUBLIC_TEST_SESSION=m1`) makes every later API request carry
  `X-Test-Session: m1`.

**Reset (US-1)**
- **AC-6** `POST /test/reset` returns `200` with `{session, now, anchors:
  [{id, start_at}]}`. Afterwards, the caller's session holds exactly the
  seed users, the seed bookings and freshly placed anchors. All tokens
  are invalidated, all seat overrides removed, chaos is cleared, and the
  clock is kept.
- **AC-7** Reset in session `a` leaves session `b` unchanged.

**Clock (US-3)**
- **AC-8** `POST /test/clock {"now": T, "frozen": true}` makes every later
  request in the session observe `now = T` until the clock is changed.
- **AC-9** `POST /test/clock {"now": T, "frozen": false}` sets the clock to
  T and lets it run in real time from there.
- **AC-10** `POST /test/clock/advance {"seconds": N}` moves the clock
  forward by N seconds, whether frozen or running.
- **AC-11** `DELETE /test/clock` returns the session to wall-clock time.
- **AC-12** `GET /test/clock` returns `{now, frozen}`.
- **AC-13** A request carrying `X-Test-Now: T` observes `now = T` for that
  request only; the session clock is unchanged.
- **AC-14** Every time rule uses the session clock: `has_started`,
  `can_cancel`, upcoming bookings, and the default schedule date.

**Chaos (US-4)**
- **AC-15** `PUT /test/chaos` sets the session's chaos config. `GET` returns
  it. `DELETE` clears it. Chaos never applies to `/test/*` or `/health`.
- **AC-16** With `latency_ms: L`, each affected response arrives at
  least L ms after the request.
- **AC-17** With `error_status: S` (500–599), affected requests return
  status S with code `CHAOS_ERROR`. With `error_count: N`, only the next N
  affected requests fail, and later ones succeed. Omitting `error_count`
  means every affected request fails.
- **AC-18** With `timeout_ms: T`, affected requests wait T ms, then return
  `504` with code `TIMEOUT`.
- **AC-19** With `expire_tokens: true`, every request that needs
  authentication returns `401 TOKEN_EXPIRED`. The web and native UIs then
  show the login screen with the message "Your session has expired.
  Please log in again."
- **AC-20** With `path_prefix: P`, only requests whose path starts with P
  are affected.

**Conflict states (US-5)**
- **AC-21** `POST /test/classes/{id}/fill` returns `200` with the class,
  now showing `spots_left: 0`. A later `POST /bookings` for it returns
  `409 CLASS_FULL`.
- **AC-22** The conflict codes are `CLASS_FULL`, `ALREADY_BOOKED`,
  `BOOKING_LIMIT_REACHED`, `CLASS_STARTED` and
  `CANCELLATION_WINDOW_CLOSED`. Each is reachable from seed state, as
  specified in `browse-and-book` and `my-bookings-and-cancel`.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | `X-Test-Session: bad id!` | `400 INVALID_TEST_SESSION` |
| EC-2 | `X-Test-Now: yesterday` | `400 INVALID_TEST_NOW` |
| EC-3 | `PUT /test/chaos {"error_status": 404}` | `422 VALIDATION_ERROR` (only 500–599 allowed) |
| EC-4 | `POST /test/classes/unknown/fill` | `404 CLASS_NOT_FOUND` |
| EC-5 | `X-Test-Now` given without a timezone | Interpreted as UTC |

## API requirements

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/test/reset` | — | `200 ResetResult` |
| GET | `/test/clock` | — | `200 ClockState` |
| POST | `/test/clock` | `{now: datetime, frozen: bool = true}` | `200 ClockState` |
| POST | `/test/clock/advance` | `{seconds: int}` | `200 ClockState` |
| DELETE | `/test/clock` | — | `200 ClockState` |
| GET | `/test/chaos` | — | `200 ChaosConfig` |
| PUT | `/test/chaos` | `ChaosConfig` | `200 ChaosConfig` |
| DELETE | `/test/chaos` | — | `200 ChaosConfig` (all off) |
| POST | `/test/classes/{class_id}/fill` | — | `200 StudioClass` |
| GET | `/health` | — | `200 {"status": "ok"}` |

`ChaosConfig` has these fields: `latency_ms: int = 0`,
`error_status: int | null`, `error_count: int | null`,
`timeout_ms: int | null`, `expire_tokens: bool = false`,
`path_prefix: str | null`.

The `/test/*` endpoints need no authentication.

## Out of scope

- Protecting the test endpoints. This is a local fixture.
- Listing or deleting sessions.
- Chaos per individual request (via a header).

## Decisions taken by default (review)

1. Reset keeps the clock, so a test can set the clock and then reset to
   place anchors relative to it.
2. Reset invalidates tokens, so UI tests log in after resetting.
3. Chaos is per session and persists until it is cleared or the session
   is reset.
