# Tech spec: QR check-in

- Version: 2
- Status: approved
- Date: 2026-09-27
- Implements: docs/prd/qr-check-in.md v2, docs/design/qr-check-in.md v2; ADR 0007

## Overview

- **fixtures:** each studio in `studios.json` gains a `scanner_key`
  (`scan-harbor`, `scan-summit`, `scan-ember`).
- **api:**
  - `bookit/checkin.py` handles codes, the window and the pass.
  - `routes/checkin.py` serves `GET /bookings/{id}/checkin`
    (`require_flag("qr_check_in")`) and `POST /checkins`
    (`X-Studio-Key`, no flag).
  - `session.checkins: dict[booking_id, datetime]`.
  - `Booking.checked_in_at`.
- **app:**
  - `class.checkin.link` on class detail.
  - `src/app/checkin/[bookingId].tsx` shows `react-native-qrcode-svg`
    (on `react-native-svg`) and polls.
  - The booking item gets a badge.
- **scripts:** `simulate_scan.py`, standard library only.
- **web / wap:** nothing; the API refuses them.

## API contract

| Model | Fields |
|---|---|
| `CheckinPass` | `booking_id`, `class_id`, `code`, `qr_payload: str`; `window_opens_at`, `window_closes_at: datetime`; `status: "not_open" \| "open" \| "closed" \| "checked_in"`; `checked_in_at: datetime \| null` |
| `CheckinRequest` | `code: str` |
| `CheckinResult` | `booking_id`, `class_id`, `class_name`, `user_name: str`, `checked_in_at: datetime` |
| `Booking` (+) | `checked_in_at: datetime \| null` |

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /bookings/{id}/checkin` | bearer | `200 CheckinPass` | 401, 403, 404 `BOOKING_NOT_FOUND` |
| `POST /checkins` | `X-Studio-Key` | `201 CheckinResult` | 401 `INVALID_STUDIO_KEY`, 404 `CODE_NOT_FOUND`, 409 `WRONG_STUDIO` / `ALREADY_CHECKED_IN` / `CHECKIN_NOT_OPEN` / `CHECKIN_CLOSED`, 422 |

## State and rules

**Code derivation:**
- `digest = sha256(f"{session}:{booking_id}")`.
- The code is 8 characters, each `ALPHABET[byte % 31]` for the first 8
  bytes, formatted as `XXXX-XXXX`.
- It's deterministic per session and booking. That keeps it static
  (AC-3) and needs no extra state.
- **Normalisation before lookup:** upper-case, strip the `-`.
- **Lookup:** scan the session's current bookings. Cancelled bookings no
  longer exist, which gives `CODE_NOT_FOUND`.

**Window:**
- `opens = start_at - 30 min`, `closes = start_at + 15 min`.
- The status is `checked_in` if checked in, `not_open` if `now < opens`,
  `closed` if `now >= closes`, and `open` otherwise.

**Scanner rule order:** the PRD EC-1 to EC-6 order. On success, set
`session.checkins[booking_id] = now`.

**Reset** clears the check-ins.

## Implementation by platform

**api:** as above. `booking_rules.booking_model` fills `checked_in_at`
from `session.checkins`.

**android / ios:**
- `classes/[id].tsx`, booked branch: `{flags.qr_check_in && <Pressable testID="class.checkin.link" …>}`,
  which pushes `/checkin/<my_booking_id>`.
- `checkin/[bookingId].tsx`:
  - `useEffect` loads the pass, then runs `setInterval(2000)` while the
    status is `not_open` or `open`, and clears it on unmount or once
    final.
  - `QRCode value={qr_payload}` sits inside
    `<View testID="checkin.qr.image">`.
  - The back link calls `router.dismiss()` if possible, and otherwise
    `router.replace('/bookings')`.
- `(tabs)/bookings.tsx`: `{flags.qr_check_in && b.checked_in_at && <Text testID="bookings.item.checked-in">Checked in</Text>}`.
- `react-native-svg` has native code, so `npm run prebuild` must be
  re-run and the native projects rebuilt.

**scripts:**
- `simulate_scan.py CODE --studio ID [--session default] [--api http://localhost:8000]`.
- It reads the scanner key from `fixtures/studios.json`.

## Identifiers

`docs/design/testids.md` § checkin, plus `class.checkin.link` and
`bookings.item.checked-in`.

## Test-support hooks

| State | How |
|---|---|
| Window open | `POST /test/clock {"now": start_at - 10 min}` |
| Not open | `start_at - 31 min` |
| Closed | `start_at + 15 min` |
| Scan | `POST /checkins` with `X-Studio-Key: scan-<studio>` and the same `X-Test-Session` |
| Read the code | `checkin.code.text`, or `GET /bookings/{id}/checkin` |

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-4, AC-6, AC-7 | `classes/[id].tsx`, `checkin/[bookingId].tsx`, `bookings.tsx` |
| AC-5, AC-8, AC-9, EC-1–EC-9 | `checkin.py`, `routes/checkin.py`, `booking_rules` |
| AC-10 | `scripts/simulate_scan.py` |

## Open questions

None.

## Changelog

- v2 (M4): `CheckinPass` gains `window_opens_local`, `window_closes_local` and
  `checked_in_local` (null until checked in). The status text formats
  these and drops the "UTC" suffix. The check-in screen uses the pushed
  `AppBar`, and `class.checkin.link` gets the `QrCode` icon.
