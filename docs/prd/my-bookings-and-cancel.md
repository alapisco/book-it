# PRD: My bookings and cancel

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25

## Summary

A logged-in user sees their upcoming bookings and can cancel one after
confirming. Cancelling is refused inside the final 12 hours before the
class starts. The list shows which bookings can still be cancelled, and
the API enforces the rule even if the list is stale.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Core flow. The list is a table, and confirmation is a modal. |
| wap | yes | Core flow. The list is stacked, and confirmation is a bottom sheet (ADR 0003). |
| android | yes | Core flow. Stacked list and sheet. |
| ios | yes | Core flow. Same as android. |

## User stories

- **US-1** As a user, I want to see my upcoming bookings in time order.
- **US-2** As a user, I want to cancel a booking, with a confirmation step.
- **US-3** As a user, I want to know when a booking can no longer be cancelled.

## Acceptance criteria

- **AC-1** (US-1) "My bookings" lists every booking from
  `GET /me/bookings`: the user's bookings whose class `start_at` is after
  now, in `start_at` order. Each shows the class name, the studio name,
  and `Sat 26 Sep 2026 · 07:00 UTC`.
- **AC-2** (US-1) After a reset, `u-ava` sees exactly 2 bookings: "Late
  Cancel Barre" first, then "Early Cancel Yoga".
- **AC-3** (US-1) `u-ben` after a reset sees "You have no upcoming
  bookings." and a "Browse schedule" link that opens the schedule.
- **AC-4** (US-3) A booking with `can_cancel: true` shows a "Cancel"
  button. A booking with `can_cancel: false` shows "Cancellation closed"
  and no button. After a reset, `u-ava`'s "Late Cancel Barre" shows
  "Cancellation closed".
- **AC-5** (US-2) "Cancel" opens a confirmation showing
  `<name> · <date> · <HH:MM> UTC`, with "Cancel booking" and "Keep
  booking". "Keep booking" closes it without any API call.
- **AC-6** (US-2) "Cancel booking" sends `DELETE /bookings/{id}`. While
  it's in flight, the confirm button is disabled and a loading indicator
  shows.
- **AC-7** (US-2) On `204`, the confirmation closes and the booking is no
  longer listed. The class's `spots_left` goes up by exactly 1.
- **AC-8** (US-2) On an error, the confirmation stays open and shows the
  API `message` verbatim.
- **AC-9** A class that starts while listed drops off the list the next
  time it loads.

## Error and edge cases

Cancel rules are checked in the order below.

| ID | Trigger (from seed state) | Expected |
|---|---|---|
| EC-1 | `DELETE /bookings/bk-cara-open` as `u-ava` (another user's booking) | `404 BOOKING_NOT_FOUND` "Booking not found." |
| EC-2 | Cancel a booking whose class has started | `409 CLASS_STARTED` "This class has already started." |
| EC-3 | `DELETE /bookings/bk-ava-closed` | `409 CANCELLATION_WINDOW_CLOSED` "Bookings can't be cancelled less than 12 hours before the class starts." |
| EC-4 | List loaded with "Cancel" on `anchor-cancel-open`, then `POST /test/clock/advance {"seconds": 324000}` (90 h), then Confirm | `409 CANCELLATION_WINDOW_CLOSED` shown in the confirmation |
| EC-5 | Cancel, then book the same class again | Booking succeeds (`201`) |
| EC-6 | Chaos `error_status: 503` on `/me/bookings` | List shows "Something went wrong." |

## API requirements

| Method | Path | Success |
|---|---|---|
| GET | `/me/bookings` | `200 Booking[]` (upcoming only, `start_at` ascending) |
| DELETE | `/bookings/{booking_id}` | `204` |

`Booking` is as defined in `browse-and-book`. Both need authentication.

## Test-support needs

`u-ava` (with a cancellable and a closed booking), `u-ben` (empty), clock
advance, chaos.

## Out of scope

Past bookings, a history of cancelled bookings, cancellation fees,
rescheduling.

## Decisions taken by default (review)

1. A cancelled booking is deleted, not kept with a status. The list only
   shows active upcoming bookings.
2. The confirmation copy is "Cancel booking" / "Keep booking".
3. The UI hides "Cancel" when `can_cancel` is false, and the API still
   enforces the rule (EC-4). Both paths are testable.
