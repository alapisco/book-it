# Tech spec: Export booking to .ics

- Version: 1
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/ics-export.md v1, docs/design/ics-export.md v1

## Overview

- **api:** `GET /bookings/{id}/ics` in `routes/bookings.py`, gated by
  `require_flag("ics_export")`. `bookit/ics.py` renders the calendar text.
- **web:** `BookingsTable` gains the export button. `api.ts` gains
  `download(path, filename)`, which runs `fetch`, then `Blob`, then clicks
  an `<a download>`.
- **wap / android / ios:** nothing.

## API contract

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /bookings/{booking_id}/ics` | bearer | `200 text/calendar; charset=utf-8` with `Content-Disposition` | 401, 403 `FEATURE_UNAVAILABLE`, 404 `BOOKING_NOT_FOUND` |

The OpenAPI response is documented as `text/calendar` content with a
string schema.

## State and rules

**Rule order:**
1. The platform gate (after authentication).
2. The booking exists and belongs to the caller.

**Rendering:** `ics.render(session_name, booking, slot, studio_name, now) -> str`,
following the PRD's field table exactly, with CRLF line endings. No line
folding is needed, because every value is short.

## Implementation by platform

**web:**
- `download()` shares `request()`'s headers and 401 handling, but returns
  the raw text.
- `BookingsTable` gets `onExport`. `BookingsPage` holds `exporting: string | null`
  and `exportError`.

## Identifiers

`bookings.item.export`, `bookings.export.error` (§ bookings).

## Test-support hooks

The seed booking `bk-ava-open`, the clock for `DTSTAMP`, chaos
`error_status` with `path_prefix: "/bookings/"`.

## Traceability

| PRD | Where |
|---|---|
| AC-1, AC-2, EC-3 | `BookingsTable`, `BookingsPage`, `api.download` |
| AC-3, AC-4, EC-1, EC-2 | `routes/bookings.py`, `ics.py` |

## Open questions

None.
