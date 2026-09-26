# PRD: QR check-in

- Version: 2
- Status: draft (M4, awaiting review)
- Date: 2026-09-27

## Summary

A booked user opens a check-in code in the native app: a QR image plus a
short backup code. At the studio, the gym's scanner reads it and calls
the check-in API. The app notices within seconds and shows the user as
checked in. The scanner is an API client, not a screen in BookIt. The
automation framework plays the scanner, and `scripts/simulate_scan.py`
plays it for manual demos.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | **no** | Parity matrix. A code is shown at the front desk on a phone, not a desktop. |
| wap | **no** | Parity matrix. Deliberately native-only, the mirror image of `week-calendar`. |
| android | yes | Parity matrix. |
| ios | yes | Parity matrix. |

Flag: `qr_check_in` is true on android and ios. Reading a code returns
`403 FEATURE_UNAVAILABLE` for `X-Platform` values `web` and `wap`. The
scanner endpoint ignores `X-Platform`, because the gym's device isn't one
of the four platforms.

## User stories

- **US-1** As a booked user, I want to show a check-in code at the studio, so that the front desk can admit me.
- **US-2** As a booked user, I want the app to confirm I'm checked in, so that I know the scan worked.
- **US-3** As a studio (scanner device), I want to check a code in and be told exactly why a code is refused.

## Acceptance criteria

**Check-in window:** it opens 30 minutes before the class `start_at` and
closes 15 minutes after it (inclusive at the open, exclusive at the
close).

- **AC-1** (US-1) On android and ios, class detail in the booked state
  shows "Show check-in code". Web and wap never show it.
- **AC-2** (US-1) It opens the check-in screen, showing:
  - the class name
  - a QR image encoding `bookit:checkin:<code>`
  - the code as text, `XXXX-XXXX`: 8 characters from
    `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
  - a status line
- **AC-3** (US-1) The code is static per booking. Opening the screen
  again shows the same code.
- **AC-4** (US-1) The status line is one of the following (times are the
  studio local `HH:MM`, from the pass's `*_local` fields):
  - "Check-in opens at 06:30" before the window
  - "Show this code at the front desk" during the window
  - "Check-in closed at 07:15" after it
  - "Checked in at 06:41", once checked in; this overrides the others
- **AC-5** (US-3) `POST /checkins {code}` with a valid `X-Studio-Key`,
  during the window, returns `201`. The body has `booking_id`,
  `class_id`, `class_name`, `user_name` and `checked_in_at` (= now).
- **AC-6** (US-2) While the check-in screen is open with status
  "not open" or "open", it re-reads the status every 2 seconds. Within
  4 seconds of a successful scan, it shows "Checked in at HH:MM".
- **AC-7** (US-2) On android and ios, My bookings shows "Checked in" on a
  checked-in booking that is still listed.
- **AC-8** `GET /bookings/{id}/checkin` returns the pass:
  - `booking_id`, `class_id`, `code`, `qr_payload`
  - `window_opens_at`, `window_closes_at`
  - `status` (`not_open` | `open` | `closed` | `checked_in`)
  - `checked_in_at`
- **AC-9** `Booking.checked_in_at` is set once checked in, on every
  platform's API responses.
- **AC-10** `python scripts/simulate_scan.py <code> --studio <id>` checks
  the code in against a running API. It prints the response and exits
  `0` on `201`, `1` otherwise.

## Error and edge cases

Scanner rules are checked in this order:

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Missing or unknown `X-Studio-Key` | `401 INVALID_STUDIO_KEY` "Unknown studio scanner." |
| EC-2 | Code matches no booking in the session (including cancelled bookings) | `404 CODE_NOT_FOUND` "Check-in code not recognised." |
| EC-3 | Code belongs to another studio's class | `409 WRONG_STUDIO` "This booking is for a different studio." |
| EC-4 | Already checked in | `409 ALREADY_CHECKED_IN` "Already checked in." |
| EC-5 | Before the window | `409 CHECKIN_NOT_OPEN` "Check-in is not open yet." |
| EC-6 | At or after the close | `409 CHECKIN_CLOSED` "Check-in has closed." |
| EC-7 | `GET /bookings/{id}/checkin` with `X-Platform: web` or `wap` | `403 FEATURE_UNAVAILABLE` |
| EC-8 | `GET /bookings/{id}/checkin` for another user's booking | `404 BOOKING_NOT_FOUND` |
| EC-9 | Code typed in lower case, or without the dash | Accepted |

## API requirements

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/bookings/{booking_id}/checkin` | bearer | `200 CheckinPass` |
| POST | `/checkins` | `X-Studio-Key` (no bearer) | `201 CheckinResult` |

Scanner keys are per studio, in `fixtures/studios.json` (`scanner_key`).
Both endpoints honour `X-Test-Session`.

## Test-support needs

- **Clock:** set it inside, before or after the window:
  `POST /test/clock {"now": <start_at - 10 min>}`.
- **Seed bookings:** `bk-ava-open`, `bk-ava-closed`.
- **Scanner keys:** from `fixtures/studios.json`.
- **Chaos.**

## Out of scope

- A scanner UI.
- Rotating codes.
- Check-out.
- No-show penalties.

## Decisions taken by default (review)

1. The window is −30 to +15 minutes around the start.
2. Codes are static per booking.
3. The app polls every 2 seconds.
4. There's a "Checked in" badge in native My bookings.
5. The entry point is class detail (booked state), not My bookings. Class
   detail stays reachable from the schedule after the class starts, which
   the check-in window needs; My bookings drops a booking at `start_at`.

## Changelog

- v2 (M4): status times in studio local time; `CheckinPass` gains `window_opens_local`, `window_closes_local`, `checked_in_local` (ADR 0007).
