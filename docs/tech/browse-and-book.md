# Tech spec: Browse and book

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/browse-and-book.md v1, docs/design/browse-and-book.md v1

## Overview

- **api:**
  - `routes/catalog.py`: `GET /studios`, `/schedule`, `/classes/{id}`.
  - `routes/bookings.py`: `POST /bookings`.
- **web:**
  - `pages/SchedulePage.tsx` uses `ScheduleGrid` or `ScheduleList`.
  - `pages/ClassPage.tsx` uses `BookingConfirm` inside `ui/Modal` or
    `ui/BottomSheet`.
- **android/ios:**
  - `(tabs)/schedule.tsx`
  - `classes/[id].tsx`, with `src/Sheet.tsx`
- **Formatting:** `format.ts` in each client. Dates come out as
  `Sat 26 Sep 2026`, times as `07:00` / `07:00–08:00 UTC`, and seat
  labels as in the PRD.

## API contract

| Model | Fields |
|---|---|
| `ScheduleDay` | `date`, `previous_date`, `next_date: date`, `now: datetime`, `classes: StudioClass[]` |
| `BookingCreate` | `class_id: str` |
| `Booking` | `id`, `class_id`, `user_id: str`, `created_at: datetime`, `can_cancel: bool`, `cancel_deadline: datetime`, `studio_class: StudioClass` |

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /studios` | bearer | `200 Studio[]` | 401 |
| `GET /schedule?date=&studio_id=` | bearer | `200 ScheduleDay` | 401, `422 VALIDATION_ERROR`, `404 NOT_FOUND` (unknown studio_id) |
| `GET /classes/{class_id}` | bearer | `200 StudioClass` | 401, `404 CLASS_NOT_FOUND` |
| `POST /bookings` | bearer | `201 Booking` | 401, 422, `404 CLASS_NOT_FOUND`, `409 CLASS_STARTED / ALREADY_BOOKED / BOOKING_LIMIT_REACHED / CLASS_FULL` |

## State and rules

**`POST /bookings` rules,** in this order:
1. Look up the class (`catalog.find_slot`).
2. `has_started`.
3. Already booked by the caller.
4. Caller's upcoming bookings ≥ `booking_limit` (3).
5. `spots_left == 0`.

On success: `Booking(id=f"bk-{seq}", ...)` with `seq` from
`session.next_booking_seq`.

**Derived booking fields:**
- `cancel_deadline = start_at - 12h`
- `can_cancel = now < cancel_deadline`

**Concurrency:** the handler is `async def` with no `await` between check
and insert, so the rules and the insert are atomic (`test-support` tech
spec).

## Implementation by platform

**api:**
- `bookit/routes/catalog.py` and `bookit/routes/bookings.py`.
- `bookit/booking_rules.py` holds `booking_model(session, booking, now)`
  and the constants `BOOKING_LIMIT = 3` and `CANCEL_CUTOFF = 12h`.

**web (≥ 768 px) and wap (< 768 px),** using `useMediaQuery(WAP_QUERY)`:
- **`SchedulePage`:**
  - `date` comes from `useSearchParams`, and state is
    `{status: 'loading' | 'error' | 'ready', data | error}`.
  - It renders `ScheduleGrid` (web) or `ScheduleList` (wap), both from
    `components/Schedule.tsx`.
- **`ClassPage`:**
  - It loads the class, renders the action area, and holds `confirmOpen`
    in state.
  - `BookingConfirm` (`components/BookingConfirm.tsx`) is the body. It is
    wrapped as `<Modal><div data-testid="booking.confirm.modal">…` on web
    or `<BottomSheet><div data-testid="booking.confirm.sheet">…` on wap.
    `ui/Modal` and `ui/BottomSheet` carry no identifiers (ADR 0002).
  - On success or dismiss, it reloads the class.

**android / ios:**
- **`(tabs)/schedule.tsx`:** `useLocalSearchParams().date`, a
  `ScrollView` list, and `router.push('/classes/<id>')`.
- **`classes/[id].tsx`:**
  - It shows the same states and actions as web.
  - The confirmation is `src/Sheet.tsx`: an RN `Modal` wrapper without an
    identifier. The screen puts `testID="booking.confirm.sheet"` on the
    content view.
  - `class.back.link` calls
    `router.replace('/schedule?date=<class date>')`.
- **Refresh:** `useFocusEffect` reloads data when the screen regains
  focus, e.g. after cancelling in My bookings.

## Identifiers

`docs/design/testids.md` § schedule, § class, § booking (`booking.confirm.*`).

## Test-support hooks

| State | How |
|---|---|
| Full class | `anchor-full`, or `POST /test/classes/{id}/fill` |
| One seat | `anchor-last-seat` |
| Already booked | `u-ava` on `anchor-cancel-open` |
| At limit | `u-cara` |
| Started | `POST /test/clock/advance`, or `X-Test-Now` |
| Error / slow | chaos |

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-5, EC-8–EC-10 | `GET /schedule`, `SchedulePage` / `schedule.tsx` |
| AC-6–AC-8 | `GET /classes/{id}`, `ClassPage` / `classes/[id].tsx` |
| AC-9–AC-13, EC-1–EC-7 | `POST /bookings` rules, `BookingConfirm` |

## Open questions

None.
