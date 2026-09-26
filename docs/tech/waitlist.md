# Tech spec: Waitlist

- Version: 2
- Status: approved
- Date: 2026-09-27
- Implements: docs/prd/waitlist.md v3, docs/design/waitlist.md v2

## Overview

- **fixtures:**
  - `waitlist.json` holds the seed entries: `u-guest-1` and `u-guest-2`
    on `anchor-full`.
  - `users.json` gains the two guests, flagged `"guest": true`, with no
    password, so they can't log in.
- **api:**
  - `routes/waitlist.py` handles join, leave and list.
  - Cancelling a booking promotes the first eligible entry.
  - `StudioClass` gains `waitlist_count` and `my_waitlist_position`.
  - `require_flag("waitlist")` is applied.
- **web / wap:** a join button or position text on class detail; a
  waitlist section (table or list) on My bookings; `flags.ts`;
  `X-Platform`.
- **android / ios:** the same UI, guarded by `flags.waitlist`, so ios
  renders none of it; `flags.ts`; `metro.config.js`; `X-Platform`.

## API contract

| Model | Fields |
|---|---|
| `WaitlistEntry` | `id`, `class_id`, `user_id: str`; `position: int`; `created_at: datetime`; `studio_class: StudioClass` |
| `StudioClass` (+) | `waitlist_count: int`, `my_waitlist_position: int \| null` |

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `POST /classes/{class_id}/waitlist` | bearer | `201 WaitlistEntry` | 400 `INVALID_PLATFORM`, 401, 403 `FEATURE_UNAVAILABLE`, 404 `CLASS_NOT_FOUND`, 409 `CLASS_STARTED` / `ALREADY_BOOKED` / `ALREADY_WAITLISTED` / `BOOKING_LIMIT_REACHED` / `CLASS_NOT_FULL` |
| `DELETE /classes/{class_id}/waitlist` | bearer | `204` | 401, 403, 404 `CLASS_NOT_FOUND` / `NOT_WAITLISTED` |
| `GET /me/waitlist` | bearer | `200 WaitlistEntry[]` | 401, 403 |

## State and rules

**Session state:** `session.waitlist: list[Entry(id, user_id, class_id, created_at)]`
- It is kept in join order and seeded from `waitlist.json` on reset.
- New ids are `wl-{seq}`.
- An entry's position is its index among the entries for that class,
  plus 1.

**Dependency order,** for every waitlist route:
1. `current_user`, which gives 401.
2. `require_flag("waitlist")`, which gives 403.

Authentication is checked first, so the expired-token chaos still shows
up as `401` on ios.

**Join rules,** in PRD EC order:
1. The class exists.
2. `has_started`.
3. Booked by the user.
4. Already waitlisted.
5. The user has ≥ 3 upcoming bookings.
6. `spots_left > 0` → `CLASS_NOT_FULL`.

**Promotion,** in `DELETE /bookings/{id}`, after deleting the booking:
1. If the class `has_started` or `spots_left == 0`, stop.
2. Otherwise, go through the class's entries in order and pick the first
   whose user has fewer than 3 upcoming bookings.
3. Create `Booking(bk-{seq}, user, class, now)` for that user and remove
   their entry.
4. At most one promotion per cancellation.
5. Skipped users keep their entries, and so keep position 1.

**`GET /me/waitlist`** returns the caller's entries whose class
`start_at > now`, sorted by `start_at`.

**Guests** exist only in `session.users` and have no password, so login
never matches them.

## Implementation by platform

**api:**
- `bookit/flags.py`: `require_flag(name)`.
- `main.py`: validates `X-Platform` (`400 INVALID_PLATFORM`) and sets
  `request.state.platform`.
- `bookit/waitlist.py`: `entries_for(session, class_id)`,
  `entry_model(...)` and `promote(session, slot, now)`.
- `routes/waitlist.py`.
- `catalog.to_model` fills `waitlist_count` and `my_waitlist_position`.
- `routes/bookings.cancel_booking` calls `promote`.

**web / wap:**
- `src/flags.ts`: `flagsFor(isWap)`.
- `api.ts`: sends `X-Platform`.
- `ClassPage`: a `WaitlistAction`, shown inside the full branch, with
  `useState` for `joining` and `error`.
- `BookingsPage`: fetches `/me/bookings` and, where the flag is on,
  `/me/waitlist`, into one `Load`.
- `components/Waitlist.tsx`: `WaitlistTable` (web) and `WaitlistList`
  (wap).
- `vite.config.ts`: `server.fs.allow: ['..']`.
- `tsconfig.app.json`: `resolveJsonModule`.
- Web Docker build context: the repo root.

**android / ios:**
- `src/flags.ts`: `flags` (by `Platform.OS`).
- `api.ts`: `X-Platform`.
- `classes/[id].tsx`: the same action logic, guarded by `flags.waitlist`.
- `(tabs)/bookings.tsx`: the same, with `waitlist.list`.
- `metro.config.js`: `watchFolders: [../fixtures]`.

## Identifiers

`docs/design/testids.md`: the `class.waitlist.*` rows in § class, and § waitlist.

## Test-support hooks

| State | How |
|---|---|
| Waitlist with 2 ahead | reset → `anchor-full` holds guests 1 and 2 |
| Promotion | `u-cara` cancels `bk-cara-full` (AC-8) |
| Not full | `anchor-last-seat` (EC-7) |
| Full during booking | `POST /test/classes/anchor-last-seat/fill` (AC-12) |
| Skip at limit (EC-10) | 1. `u-ava` books a generated class X. 2. Fill X. 3. `u-ben` joins X. 4. `u-ben` books 3 other classes. 5. `u-ava` cancels X. Result: `u-ben` is skipped and `spots_left` = 1. |
| ios refusal | send `X-Platform: ios` |

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-4, AC-12 | `to_model`, `ClassPage` / `classes/[id].tsx` action area |
| AC-5–AC-7 | `GET /me/waitlist`, `DELETE /classes/{id}/waitlist`, `BookingsPage` / `bookings.tsx` |
| AC-8, AC-9, EC-10, EC-11 | `waitlist.promote`, `cancel_booking` |
| AC-10, AC-11 | `flags.waitlist` guards in the clients |
| AC-13, EC-1, EC-12 | `X-Platform` middleware, `require_flag` |
| EC-2–EC-9 | join and leave rules |

## Open questions

None.

## Changelog

- v2 (M4): waitlist items use the local time fields; the Join waitlist button gets the `ListOrdered` icon and renders in the sticky action area on wap/android.
