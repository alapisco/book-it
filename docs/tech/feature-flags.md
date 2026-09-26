# Tech spec: Feature flags

- Version: 3
- Status: approved
- Date: 2026-09-27
- Implements: docs/prd/feature-flags.md v3 (no design spec: no UI)

## Overview

- **Fixture:** `fixtures/feature-flags.json` holds the matrix from PRD AC-1.
- **api:** `GET /flags` and `GET /flags/{platform}` serve it, validated
  through the `PlatformFlags` model.
- **Clients:** they bundle the same JSON file. The web app picks `web` or
  `wap` using the same `useMediaQuery` that selects the tree. The native
  app indexes by `Platform.OS`.
- **Client wiring** landed with `waitlist`, the first flagged feature:
  `web/src/flags.ts` and `app/src/flags.ts`.
- **`X-Platform`:**
  - The middleware validates the header and stores it on
    `request.state.platform`.
  - The `require_flag(name)` dependency returns `403 FEATURE_UNAVAILABLE`
    when the platform's flag is false.
  - Both clients send the header on every request.

## API contract

- **`PlatformFlags`:** `login`, `browse_and_book`, `my_bookings`,
  `week_calendar`, `ics_export`, `waitlist`, `qr_check_in: bool`;
  `studio_policies: "page" | "webview"`.
- **`FlagMatrix`:** `web`, `wap`, `android`, `ios: PlatformFlags`.
- **Errors:** `404 UNKNOWN_PLATFORM` (`GET /flags/{platform}`), `400 INVALID_PLATFORM` (bad `X-Platform`), `403 FEATURE_UNAVAILABLE`.

## State and rules

Flags are static: loaded at startup and independent of the session.

## Implementation by platform

- **api:** `bookit/routes/flags.py`.
- **api:** `bookit/flags.py` holds `require_flag(name)`. `main.py`
  validates `X-Platform`.
- **web / wap:**
  - `src/flags.ts` imports `../../fixtures/feature-flags.json`, cast to
    `Schemas['FlagMatrix']`.
  - `flagsFor(isWap)` picks `wap` or `web`.
  - `api.ts` sends `X-Platform` from `matchMedia(WAP_QUERY)` at request
    time, so it always matches the rendered tree.
  - Vite `server.fs.allow` includes the repo root, and the web Docker
    build context is the repo root, so that `fixtures/` is available.
- **android / ios:**
  - `src/flags.ts` imports the same JSON and indexes it by `Platform.OS`.
  - `metro.config.js` adds `../fixtures` to `watchFolders`.
  - `api.ts` sends `X-Platform: Platform.OS`.

## Identifiers

None.

## Test-support hooks

None.

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-4, EC-1 | `routes/flags.py`, `fixtures/feature-flags.json` |
| AC-5 | `waitlist` tech spec (first consumer) |
| AC-6, AC-7, EC-2 | `main.py` middleware, `flags.require_flag`, client `api.ts` |

## Open questions

None.

## Changelog

- v2 (2026-09-26): `X-Platform` validation and `require_flag`; client flag modules; the web Docker context moves to the repo root.
- v3 (M4): `week_calendar` flips to web `false` and wap/android/ios `true` in `fixtures/feature-flags.json`; nothing else changes.
