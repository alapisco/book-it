# Design: My bookings and cancel

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/my-bookings-and-cancel.md v1

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes | yes | yes | yes |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| BookingsScreen | bookings | Root, titled "My bookings" | all | — |
| BookingsTable | bookings | `<table>` with Class / Studio / When / (action) columns | web | `GET /me/bookings` |
| BookingsList | bookings | Stacked cards | wap, android, ios | `GET /me/bookings` |
| BookingItem | bookings | One booking: name, studio, when, and the Cancel button or "Cancellation closed" | all | `Booking` |
| CancelConfirm (modal) | bookings | Centred dialog | web | `DELETE /bookings/{id}` |
| CancelConfirm (sheet) | bookings | Bottom sheet | wap, android, ios | `DELETE /bookings/{id}` |

## States

**Bookings (BookingsTable / BookingsList)**

| State | Visible | Identifiers |
|---|---|---|
| loading | "Loading bookings…" | `bookings.loading` |
| empty | "You have no upcoming bookings." and a "Browse schedule" link | `bookings.empty`, `bookings.empty.browse` |
| error | the API `message` | `bookings.error` |
| populated | table (web) or list (others) | `bookings.table` or `bookings.list`, `bookings.item` × N |

A booking item contains:
- `bookings.item.name`
- `bookings.item.studio`
- `bookings.item.time` (`Sat 26 Sep 2026 · 07:00 UTC`)
- one of `bookings.item.cancel` ("Cancel") or
  `bookings.item.cancel-closed` ("Cancellation closed")

**CancelConfirm.** The container is `booking.cancel.modal` on web and
`booking.cancel.sheet` elsewhere.

| State | Visible | Interactive | Identifiers |
|---|---|---|---|
| idle | summary, both buttons | both | `booking.cancel.summary`, `booking.cancel.confirm`, `booking.cancel.dismiss` |
| loading | spinner in confirm | dismiss only | + `booking.cancel.loading` |
| error | API `message` above the buttons | both | + `booking.cancel.error` |
| success | closes; the list reloads without the item | — | — |

## Breakpoint behaviour (web vs wap)

| Component | web (≥ 768 px) | wap (< 768 px) |
|---|---|---|
| Container | `<table>` as `bookings.table`, where each `<tr>` is `bookings.item` | `<ul>` as `bookings.list`, where each `<li>` card is `bookings.item` |
| Cancel confirmation | `Modal`, as `booking.cancel.modal` | `BottomSheet`, as `booking.cancel.sheet` |

The item's inner identifiers and the confirmation's inner identifiers are
shared.

## Native behaviour (android / ios)

- **List:** a `ScrollView` with every item rendered.
- **Confirmation:** an RN `Modal` sheet, with content view
  `booking.cancel.sheet`.
- **Refresh:** the list reloads each time the tab gains focus.
- android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1, AC-2, AC-9 | `bookings.item`, `bookings.item.name`, `bookings.item.studio`, `bookings.item.time` |
| AC-3 | `bookings.empty`, `bookings.empty.browse` |
| AC-4 | `bookings.item.cancel`, `bookings.item.cancel-closed` |
| AC-5 | `booking.cancel.modal` / `booking.cancel.sheet`, `booking.cancel.summary`, `booking.cancel.dismiss` |
| AC-6 | `booking.cancel.confirm`, `booking.cancel.loading` |
| AC-7 | `bookings.item` count |
| AC-8, EC-2–EC-4 | `booking.cancel.error` |
| EC-6 | `bookings.error` |

## Open questions

None.
