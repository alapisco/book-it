# PRD: Export booking to .ics

- Version: 2
- Status: approved
- Date: 2026-09-27

## Summary

On desktop web, each upcoming booking in My bookings can be downloaded as
an iCalendar (`.ics`) file for import into a calendar app. This feature
exists on web only.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Parity matrix. Desktop users import files into calendar clients. |
| wap | **no** | Parity matrix. The file download is omitted from the mobile tree. |
| android | **no** | Parity matrix. |
| ios | **no** | Parity matrix. |

Flag: `ics_export` is true on web only. The API returns
`403 FEATURE_UNAVAILABLE` for `X-Platform` values `wap`, `android` and
`ios`.

## User stories

- **US-1** As a desktop user, I want to add a booking to my calendar, so that I don't forget it.

## Acceptance criteria

- **AC-1** On web, every row in the bookings table has an "Export .ics"
  button. Wap, android and ios render none.
- **AC-2** Clicking it downloads a file named `bookit-<booking_id>.ics`,
  without navigating away.
- **AC-3** `GET /bookings/{id}/ics` returns `200`, with
  `Content-Type: text/calendar; charset=utf-8` and
  `Content-Disposition: attachment; filename="bookit-<booking_id>.ics"`.
  The body is one `VCALENDAR` (`VERSION:2.0`,
  `PRODID:-//BookIt SUT//EN`) containing one `VEVENT` with these fields:

  | Field | Value |
  |---|---|
  | `UID` | `<session>-<booking_id>@bookit.test` |
  | `DTSTAMP` | the session clock, `YYYYMMDDTHHMMSSZ` |
  | `DTSTART` / `DTEND` | the class `start_at` / `end_at`, UTC, `YYYYMMDDTHHMMSSZ` |
  | `SUMMARY` | the class name |
  | `LOCATION` | `<studio name>, <neighbourhood>` |
  | `DESCRIPTION` | `with <instructor>` |

  Lines end with CRLF.
- **AC-4** After a reset, exporting `bk-ava-open` as `u-ava` gives
  `SUMMARY:Slow Flow` and `LOCATION:Harbor Yoga, Chamberí`.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | With `X-Platform: wap`, `android` or `ios` | `403 FEATURE_UNAVAILABLE` |
| EC-2 | Another user's booking, or an unknown id | `404 BOOKING_NOT_FOUND` |
| EC-3 | Chaos `error_status: 500` on `/bookings/` while exporting | "Something went wrong." shown above the table; no download |

## API requirements

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/bookings/{booking_id}/ics` | bearer | `200 text/calendar` |

## Test-support needs

Seed bookings (`bk-ava-open`), the session clock (`DTSTAMP`), chaos.

## Out of scope

Exporting all bookings at once, calendar subscription feeds, alarms.

## Decisions taken by default (review)

1. One event per file.
2. The download is fetched with the bearer token and saved from a blob.
   A plain link can't carry the `Authorization` header.

## Changelog

- v2 (M4): renamed anchor; `LOCATION` includes the neighbourhood. `DTSTART`/`DTEND` stay UTC (`Z`), which calendar apps convert (ADR 0007).
