# Design: Export booking to .ics

- Version: 1
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/ics-export.md v1

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes | no | no | no |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| ExportButton | bookings | "Export .ics" in the action cell of each table row, left of Cancel | web | `GET /bookings/{id}/ics` |
| ExportError | bookings | Red text above the table | web | error `message` |

## States

| Component | State | Visible | Identifiers |
|---|---|---|---|
| ExportButton | idle | "Export .ics" | `bookings.item.export` |
| ExportButton | loading | "Exporting…", button disabled | `bookings.item.export` |
| ExportButton | error | the button is re-enabled; `ExportError` shows the API `message` | + `bookings.export.error` |
| ExportButton | success | the browser download starts; any previous error clears | — |

The button has no empty state; it exists only on existing rows.

## Breakpoint behaviour (web vs wap)

| web (≥ 768 px) | wap (< 768 px) |
|---|---|
| Button in every `bookings.table` row | Not rendered in `bookings.list` |

## Native behaviour (android / ios)

None.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `bookings.item.export` (present on web, absent elsewhere) |
| AC-2 | `bookings.item.export` → browser download event |
| EC-3 | `bookings.export.error` |

## Open questions

None.
