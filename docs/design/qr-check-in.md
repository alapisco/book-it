# Design: QR check-in

- Version: 1
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/qr-check-in.md v1

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| no | no | yes | yes |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| CheckinLink | class | "Show check-in code", next to the booked badge | android, ios | `StudioClass.my_booking_id` |
| CheckinScreen | checkin | Full screen over the tabs | android, ios | `GET /bookings/{id}/checkin`, polled |
| BackLink | checkin | "← Back" | android, ios | — |
| QrImage | checkin | 220 × 220 QR of `qr_payload` | android, ios | `CheckinPass` |
| CodeText | checkin | The code in large monospace | android, ios | `CheckinPass` |
| StatusText | checkin | One status sentence | android, ios | `CheckinPass` |
| CheckedInBadge | bookings | "Checked in" on a booking item | android, ios | `Booking.checked_in_at` |

## States

**CheckinScreen.** `checkin.back.link` is present in every state.

| State | Visible | Identifiers |
|---|---|---|
| loading | "Loading check-in code…" | `checkin.screen`, `checkin.loading` |
| empty | Impossible: every booking has a code | — |
| error | API `message` (e.g. "Booking not found.") | `checkin.error` |
| populated | class name, QR, code, status | `checkin.class.name`, `checkin.qr.image`, `checkin.code.text`, `checkin.status.text` |

A background re-read (polling) never shows the loading state again. It
updates the status in place. A failed re-read keeps the last good
content.

**CheckinLink:** static, with no data states. It is shown only inside
the booked state on native.

**CheckedInBadge:** part of the bookings item's populated state.

## Breakpoint behaviour (web vs wap)

Not applicable. Neither web nor wap renders any check-in component or
identifier.

## Native behaviour (android / ios)

- **Entry:** class detail, booked state: `class.booked.badge`,
  `class.bookings.link`, and `class.checkin.link`, the last one guarded
  by `flags.qr_check_in`.
- **Route:** `/checkin/[bookingId]`, pushed onto the stack. The back link
  pops.
- **Code text:** selectable, so that testers can copy it into
  `simulate_scan.py`.
- android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `class.checkin.link` (android, ios; absent on web and wap) |
| AC-2, AC-3 | `checkin.class.name`, `checkin.qr.image`, `checkin.code.text` |
| AC-4, AC-6 | `checkin.status.text` |
| AC-7 | `bookings.item.checked-in` |
| EC-8 | `checkin.error` |

## Open questions

None.
