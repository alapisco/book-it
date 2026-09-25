# Tech spec: My bookings and cancel

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/my-bookings-and-cancel.md v1, docs/design/my-bookings-and-cancel.md v1

## Overview

- **api:** `routes/bookings.py` gains `GET /me/bookings` and
  `DELETE /bookings/{id}`.
- **web:** `pages/BookingsPage.tsx` uses `BookingsTable` or `BookingsList`
  and `CancelConfirm`, inside `ui/Modal` or `ui/BottomSheet`.
- **android/ios:** `(tabs)/bookings.tsx`, with `src/Sheet.tsx`.

## API contract

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /me/bookings` | bearer | `200 Booking[]` | 401 |
| `DELETE /bookings/{booking_id}` | bearer | `204` (no body) | 401, `404 BOOKING_NOT_FOUND`, `409 CLASS_STARTED`, `409 CANCELLATION_WINDOW_CLOSED` |

`Booking` is as defined in `docs/tech/browse-and-book.md`.

## State and rules

**`GET /me/bookings`** returns the caller's bookings whose class
`start_at > now`, sorted by `start_at`.

**`DELETE` rules,** in this order:
1. The booking exists and belongs to the caller.
2. The class `has_started`.
3. `now >= cancel_deadline`.

On success the booking is deleted from `session.bookings`, which frees
the seat.

## Implementation by platform

**api:** `bookit/routes/bookings.py`.

**web (≥ 768 px) and wap (< 768 px):**
- **`BookingsPage`:** state is
  `{status: 'loading' | 'error' | 'ready', data | error}` plus
  `cancelling: Booking | null`.
- **Containers:** `components/Bookings.tsx` exports `BookingsTable` (web)
  and `BookingsList` (wap).
- **Confirmation:** `components/CancelConfirm.tsx` is the body, wrapped
  as `booking.cancel.modal` (web) or `booking.cancel.sheet` (wap). On
  `204` the confirmation closes and the list reloads.

**android / ios:**
- **`(tabs)/bookings.tsx`:** `useFocusEffect` reloads on focus, with a
  `ScrollView` list.
- **Confirmation:** `Sheet`, with content view `booking.cancel.sheet`.
- **`bookings.empty.browse`:** `router.navigate('/schedule')`.

## Identifiers

`docs/design/testids.md` § bookings, § booking (`booking.cancel.*`).

## Test-support hooks

| State | How |
|---|---|
| Cancellable | `u-ava` / `bk-ava-open` (`anchor-cancel-open`, T0 + 96 h) |
| Window closed | `u-ava` / `bk-ava-closed` (`anchor-cancel-closed`, T0 + 6 h) |
| Closed after the list loaded | `POST /test/clock/advance {"seconds": 324000}` |
| Started | `POST /test/clock/advance {"seconds": 25200}`, then `DELETE bk-ava-closed` |
| Empty | `u-ben` |

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-4, AC-9, EC-6 | `GET /me/bookings`, `BookingsPage` / `bookings.tsx` |
| AC-5–AC-8, EC-1–EC-5 | `DELETE /bookings/{id}` rules, `CancelConfirm` |

## Open questions

None.
