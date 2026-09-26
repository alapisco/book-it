# PRD: Waitlist

- Version: 2
- Status: approved
- Date: 2026-09-26

## Summary

When a class has no seats left, a user on a supporting platform can join
that class's waitlist instead of booking. When a booked seat is cancelled,
the first eligible user on the waitlist is booked into it immediately.
Users see their position, and can leave the waitlist, from "My bookings".

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Parity matrix. Baseline platform for the feature. |
| wap | yes | Parity matrix. Same feature as web, rendered through the wap component tree (stacked list), so the framework must abstract the UI, not the behaviour. |
| android | yes | Parity matrix. Proves the native codebase ships the feature on one OS. |
| ios | **no** | Parity matrix. A deliberate gap on one platform inside a shared native codebase. The framework must auto-skip waitlist tests on ios with a stated reason and show `no` in its parity matrix. On ios a full class shows as full, with no waitlist control, and the API refuses waitlist calls that identify as ios. |

Support comes from the platform flag `waitlist` (`fixtures/feature-flags.json`:
true on web, wap and android; false on ios). It never varies by studio.

## User stories

- **US-1** As a user, I want to join the waitlist for a full class, so that I can get a seat if one frees up.
- **US-2** As a waitlisted user, I want to see my position, so that I know how many people are ahead of me.
- **US-3** As a waitlisted user, I want to leave the waitlist, so that I am not booked into a class I no longer want.
- **US-4** As a waitlisted user, I want to be booked automatically when a seat frees up, so that I don't have to watch the class.
- **US-5** As a user on ios, I want to see that a class is full, so that I don't try to book it.
- **US-6** As a test author, I want the API to refuse waitlist calls from ios, so that the gap is observable at the API layer as well as in the UI.

## Acceptance criteria

Clock times refer to the session clock (`X-Test-Now` / `POST /test/clock`).
"Seed waitlist" means `anchor-full` holds two entries after reset, for the
guest users `u-guest-1` (position 1) and `u-guest-2` (position 2). Guests
exist only in seed data and cannot log in.

- **AC-1** (US-1) Given a class with `spots_left = 0` that has not started,
  and a user neither booked nor waitlisted on it, class detail on web, wap
  and android shows "Class full" and a "Join waitlist" control, and no
  "Book" control.
- **AC-2** (US-1) Given AC-1, when `u-ben` joins `anchor-full` after reset,
  the API returns `201` with `position: 3`. The class's `waitlist_count`
  goes from 2 to 3, and `my_waitlist_position` is 3.
- **AC-3** (US-2) After joining, class detail shows "You're #3 on the
  waitlist" in place of the "Join waitlist" control.
- **AC-4** (US-1) Given a class with `spots_left >= 1`, no "Join waitlist"
  control is shown on any platform.
- **AC-5** (US-2) "My bookings" on web, wap and android shows a "Waitlist"
  section when the user has at least one entry. Each entry shows the class
  name, `Sat 26 Sep 2026 · 07:00 UTC` and "#N on the waitlist". The
  section is separate from confirmed bookings and absent when the user has
  no entries.
- **AC-6** (US-3) "Leave waitlist" on an entry sends
  `DELETE /classes/{id}/waitlist`. On `204` the entry disappears, and
  `waitlist_count` drops by exactly 1.
- **AC-7** (US-2) Positions are 1-based and contiguous. When an entry is
  removed (by leaving or by promotion), every entry behind it moves up by
  exactly 1.
- **AC-8** (US-4) After reset, when `u-cara` cancels `bk-cara-full`, then
  within the same request `u-guest-1` holds a booking for `anchor-full`,
  their entry is removed, `spots_left` stays `0`, `waitlist_count` goes
  from 2 to 1, and `u-guest-2` moves to position 1.
- **AC-9** (US-4) When a seat frees on a class with an empty waitlist,
  `spots_left` increases by 1 and nobody is booked.
- **AC-10** (US-5) On ios, class detail for a full class shows "Class
  full", and no waitlist control or waitlist identifier exists in the view
  hierarchy.
- **AC-11** (US-5) On ios, "My bookings" shows no waitlist section, and the
  app makes no waitlist API calls.
- **AC-12** (US-1) Given a user viewing `anchor-last-seat` with 1 spot, when
  the class is filled (`POST /test/classes/anchor-last-seat/fill`) and the
  user confirms a booking, the confirmation shows "This class is full."
  After "Not now", class detail shows "Class full" plus "Join waitlist" on
  web, wap and android, and "Class full" alone on ios, without a page
  reload.
- **AC-13** (US-6) A waitlist endpoint called with `X-Platform: ios`
  returns `403 FEATURE_UNAVAILABLE` "This feature is not available on this
  platform." The same call with `X-Platform: web`, `wap` or `android`, or
  with no `X-Platform`, is processed normally.

## Error and edge cases

Join rules are checked in the order below; the first failing rule wins.

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Any waitlist call with `X-Platform: ios` | `403 FEATURE_UNAVAILABLE` |
| EC-2 | Any waitlist call for an unknown class id | `404 CLASS_NOT_FOUND` "Class not found." |
| EC-3 | Join when clock ≥ class start | `409 CLASS_STARTED` "This class has already started." |
| EC-4 | Join a class the user has booked (`u-cara` on `anchor-full`) | `409 ALREADY_BOOKED` "You have already booked this class." |
| EC-5 | Join twice | `409 ALREADY_WAITLISTED` "You are already on the waitlist for this class."; `waitlist_count` unchanged |
| EC-6 | Join at the booking limit | `409 BOOKING_LIMIT_REACHED` "You have reached the limit of 3 upcoming bookings." |
| EC-7 | Join when `spots_left >= 1` | `409 CLASS_NOT_FULL` "This class still has spots. Book it instead." |
| EC-8 | Leave a waitlist the user is not on | `404 NOT_WAITLISTED` "You are not on the waitlist for this class." |
| EC-9 | Any waitlist call with chaos `expire_tokens` on | `401 TOKEN_EXPIRED`; the UI shows `login.screen` with the session-expired message |
| EC-10 | A seat frees while the position-1 user is at the booking limit | That user is skipped and keeps position 1. The first eligible user behind them is booked. If nobody is eligible, `spots_left` increases by 1. |
| EC-11 | The class starts while users are waitlisted | Entries stay until `start_at`. From `start_at` on, `GET /me/waitlist` doesn't return them, and they are never promoted. |
| EC-12 | Any request with `X-Platform: desktop` | `400 INVALID_PLATFORM` |

Waitlist entries never count toward the booking limit.

## API requirements

| Method | Path | Success | Body |
|---|---|---|---|
| `POST` | `/classes/{class_id}/waitlist` | `201` | `WaitlistEntry` |
| `DELETE` | `/classes/{class_id}/waitlist` | `204` | — |
| `GET` | `/me/waitlist` | `200` | `WaitlistEntry[]`, upcoming only, ordered by class `start_at` |
| `GET` | `/classes/{class_id}`, `/schedule` | `200` | `StudioClass` gains `waitlist_count: int` and `my_waitlist_position: int \| null` |
| `DELETE` | `/bookings/{booking_id}` | `204` | Unchanged contract; now also promotes per AC-8 and EC-10 |

`WaitlistEntry` has these fields:
- `id`, `class_id`, `user_id: str`
- `position: int` (1-based, contiguous)
- `created_at: datetime`
- `studio_class: StudioClass`

All waitlist endpoints need authentication. The order is first come,
first served.

**`X-Platform` header** (optional on every request): one of `web`, `wap`,
`android`, `ios`. The web app sends `web` or `wap` depending on the tree
it renders; the native app sends `Platform.OS`. The header is defined in
`feature-flags` v2.

## Test-support needs

- `POST /test/reset` restores the seed waitlist (two guests on `anchor-full`) in the caller's session only.
- `X-Test-Session` namespaces waitlists.
- The clock, for EC-3 and EC-11.
- Anchors: `anchor-full` (AC-1, AC-2, AC-8) and `anchor-last-seat` (AC-12).
- Seed users: `u-ben` joins; `u-cara` cancels (AC-8) and is refused (EC-4, EC-6).
- `POST /test/classes/{id}/fill` for AC-12 and EC-10.
- Chaos `expire_tokens` (EC-9).

## Out of scope

- Notifying promoted users. The booking just appears in "My bookings".
- Offer/accept windows. Promotion is immediate.
- A maximum waitlist length.
- Joining or leaving from any screen other than class detail (join) and My bookings (leave).
- Waitlist on ios, including through the policies webview.

## Open questions

None.

## Changelog

- v2 (2026-09-26): resolved the v1 open questions with the QA lead.
  - Promotion is automatic.
  - Users at the booking limit are skipped at promotion and keep their place.
  - The API refuses ios via `X-Platform` (`403 FEATURE_UNAVAILABLE`).
  - `anchor-full` is seeded with two guest entries.
  - Flags come from `feature-flags` v1.
  - The error body follows ADR 0004.
  - Added `studio_class` to `WaitlistEntry`, fixed the join rule order,
    and made the ACs concrete against seed data.
