# Tech spec: Feature flags

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/feature-flags.md v1 (no design spec: no UI)

## Overview

- **Fixture:** `fixtures/feature-flags.json` holds the matrix from PRD AC-1.
- **api:** `GET /flags` and `GET /flags/{platform}` serve it, validated
  through the `PlatformFlags` model.
- **Clients:** they bundle the same JSON file. The web app picks `web` or
  `wap` using the same `useMediaQuery` that selects the tree. The native
  app indexes by `Platform.OS`.
- **Client wiring lands with the first flagged feature (M3).** Until then
  every M2 flag is `true` everywhere, so there is nothing to guard. This
  avoids an unused abstraction.

## API contract

- **`PlatformFlags`:** `login`, `browse_and_book`, `my_bookings`,
  `week_calendar`, `ics_export`, `waitlist`, `qr_check_in: bool`;
  `studio_policies: "page" | "webview"`.
- **`FlagMatrix`:** `web`, `wap`, `android`, `ios: PlatformFlags`.
- **Errors:** `404 UNKNOWN_PLATFORM`.

## State and rules

Flags are static: loaded at startup and independent of the session.

## Implementation by platform

- **api:** `bookit/routes/flags.py`.
- **web / wap (from M3):** `import flags from '../../fixtures/feature-flags.json'`,
  with Vite `server.fs.allow` extended to the repo root.
- **android / ios (from M3):** the same import, with `metro.config.js`
  `watchFolders` set to include `../fixtures`.

## Identifiers

None.

## Test-support hooks

None.

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-4, EC-1 | `routes/flags.py`, `fixtures/feature-flags.json` |
| AC-5 | M3 feature tech specs |

## Open questions

None.
