# PRD: Waitlist

- Version: 1
- Status: draft
- Date: 2026-09-25

## Summary

When a class has no seats left, a user on a supporting platform can join
that class's waitlist instead of booking. When a booked seat is cancelled,
the first user on the waitlist is converted to a booking. Users can see
and leave their waitlist entries from "My bookings".

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Parity matrix. Baseline platform for the feature. |
| wap | yes | Parity matrix. Same feature as web rendered through the wap component tree (bottom sheet, stacked list), so the framework must abstract the UI, not the behaviour. |
| android | yes | Parity matrix. Proves the native codebase ships the feature on one OS. |
| ios | **no** | Parity matrix. Deliberate single-platform gap in the shared native codebase: the framework must auto-skip waitlist tests on ios with a stated reason and show `no` in its parity matrix. On ios a full class shows as full, with no waitlist control. |

Support is decided by the platform feature flag `waitlist` (true on web,
wap, android; false on ios). It never varies by studio.

## User stories

- **US-1** As a user, I want to join the waitlist for a full class, so that I can get a seat if one frees up.
- **US-2** As a waitlisted user, I want to see my position, so that I know how many people are ahead of me.
- **US-3** As a waitlisted user, I want to leave the waitlist, so that I am not booked into a class I no longer want.
- **US-4** As a waitlisted user, I want to be booked automatically when a seat frees up, so that I don't have to watch the class.
- **US-5** As a user on ios, I want to see that a class is full, so that I don't try to book it.

## Acceptance criteria

Clock times refer to the controllable clock (`X-Test-Now` / `POST /test/clock`).

- **AC-1** (US-1) Given a class with `spots_left = 0` that has not started, on web, wap and android, the class detail shows a "Join waitlist" control and no "Book" control.
- **AC-2** (US-1) Given AC-1, when the user joins, the API returns `201` with `position` = (previous `waitlist_count` + 1), and the class's `waitlist_count` increases by exactly 1.
- **AC-3** (US-1) Given a class with `spots_left >= 1`, no "Join waitlist" control is shown on any platform.
- **AC-4** (US-2) Given a user on a class's waitlist, "My bookings" lists that entry with status `waitlisted` and its current `position`, separate from confirmed bookings.
- **AC-5** (US-2) Given three users at positions 1, 2, 3, when the user at position 1 leaves, the remaining users report positions 1 and 2 on their next `GET /me/waitlist`.
- **AC-6** (US-3) Given a waitlisted user, when they leave, the API returns `204`, the entry no longer appears in `GET /me/waitlist`, and `waitlist_count` decreases by exactly 1.
- **AC-7** (US-4) Given a full class with a non-empty waitlist, when a booked user cancels, then within the same request the position-1 user has a confirmed booking for that class (visible in `GET /me/bookings`), their waitlist entry is removed, `spots_left` stays `0`, and every remaining entry's position decreases by 1.
- **AC-8** (US-4) Given a full class with an empty waitlist, when a booked user cancels, `spots_left` becomes `1`.
- **AC-9** (US-5) Given a class with `spots_left = 0` on ios, the class detail shows a "Class full" indicator, and no waitlist control or waitlist identifier exists in the view hierarchy.
- **AC-10** (US-5) On ios, "My bookings" shows no waitlist section and no waitlisted entries.
- **AC-11** (US-1) Given a user viewing a class with `spots_left = 1`, when another session takes the last seat and the user then taps "Book", the API returns `409 CLASS_FULL`. On web, wap and android the UI then shows the "Join waitlist" control without a page reload. On ios it shows "Class full".

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Join waitlist when `spots_left >= 1` | `409 CLASS_NOT_FULL` |
| EC-2 | Join waitlist for a class the user has booked | `409 ALREADY_BOOKED` |
| EC-3 | Join waitlist twice for the same class | `409 ALREADY_WAITLISTED`; `waitlist_count` unchanged |
| EC-4 | Join waitlist when clock ≥ class start time | `409 CLASS_STARTED` |
| EC-5 | Join waitlist as the seed user who is at the booking limit | `409 BOOKING_LIMIT_REACHED` |
| EC-6 | Leave a waitlist the user is not on | `404 NOT_WAITLISTED` |
| EC-7 | Any waitlist call for an unknown class ID | `404 CLASS_NOT_FOUND` |
| EC-8 | Any waitlist call with the chaos "expired token" toggle on | `401 TOKEN_EXPIRED`; UI returns to `login.screen` |
| EC-9 | Class starts while users are still waitlisted | Entries remain listed with status `waitlisted` until the class start time; after start, `GET /me/waitlist` no longer returns them |

## API requirements

The request/response shapes below are the contract. `backend-dev` implements
them, and `docs/api/openapi.json` is generated from that code.

| Method | Path | Success | Body / fields |
|---|---|---|---|
| `POST` | `/classes/{class_id}/waitlist` | `201` | `WaitlistEntry` |
| `DELETE` | `/classes/{class_id}/waitlist` | `204` | — |
| `GET` | `/me/waitlist` | `200` | `WaitlistEntry[]`, ordered by class start time |
| `GET` | `/classes/{class_id}` | `200` | existing class fields plus `waitlist_count: int`, `my_waitlist_position: int \| null` |
| `DELETE` | `/bookings/{booking_id}` | `204` | existing cancel; now also performs promotion per AC-7 |

`WaitlistEntry`: `id: str`, `class_id: str`, `user_id: str`,
`position: int` (1-based, contiguous), `created_at: datetime`.

Error body: `{"error": {"code": "<CODE>", "message": "<text>"}}`, using the codes in the table above.

Order: first come, first served by `created_at`, as measured by the controllable clock.

## Test-support needs

- `POST /test/reset` restores waitlists to seed state (empty, apart from any seed entries on the full anchor class).
- `X-Test-Session` namespaces waitlists, so parallel workers each see their own positions.
- Controllable clock for EC-4 and EC-9.
- Anchor classes: **permanently full** (AC-1, AC-2, EC-1–EC-5) and **one seat remaining** (AC-11).
- Seed users: one with existing bookings (to cancel for AC-7), one with none (joins waitlist), one at the booking limit (EC-5).
- Chaos toggle for expired tokens (EC-8).

## Out of scope

- Notifying promoted users (no email or push). The booking appears in "My bookings".
- Offer/accept windows for promoted users. Promotion is immediate.
- A maximum waitlist length.
- Waitlist on ios, including through the policies webview.

## Open questions

These are proposals made while drafting, because the brief does not settle them. Confirm or change each one before running `/design waitlist`.

1. **Auto-promote vs. offer.** Proposed: promotion is automatic and immediate (AC-7). The alternative is a timed offer, which needs a clock-driven expiry.
2. **Booking limit.** Proposed: joining is refused at the limit (EC-5), and waitlist entries do not count toward the limit. Open: if a waitlisted user reaches the limit before promotion, is that user skipped or promoted anyway?
3. **Server-side platform enforcement.** Proposed: the API does not check the platform; the `waitlist` flag hides the UI on ios. Should `POST /classes/{id}/waitlist` reject ios clients (for example with `403 FEATURE_UNAVAILABLE`) so the API test layer can observe the gap too?
4. **Feature-flag endpoint.** No PRD defines how clients read platform flags yet. That needs its own PRD (e.g. `/prd feature-flags`), or a decision to hard-code flags per platform in the clients.
5. **Error body shape.** This is the first PRD, so the `{"error": {code, message}}` shape above becomes the convention for later PRDs unless you change it now.
6. **Seed waitlist.** Should the permanently-full anchor class start with seed entries (for example two other users), so AC-5 and AC-7 can run without first setting up state?
