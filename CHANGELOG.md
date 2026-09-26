# Changelog

User-visible changes to the BookIt SUT, by milestone. The automation
framework pins against these versions.

## Unreleased (developer experience)

### Added
- `app/`: `npm run build:android`, `build:android:debug` and `build:ios`
  produce self-contained APK and `.app` files for automation.
- `app/.env.example` for the `EXPO_PUBLIC_*` settings.
- `app/README.md`: machine setup (JDK 17, `ANDROID_HOME`, user-level
  Gradle config), Appium capabilities, troubleshooting.

### Fixed
- The web app derives the API host from the page's host, so the Android
  policies webview reaches the API.

## M3: all features

### Added
- **Studio policies:**
  - a public `/policies` page, with tabs on web and an accordion on wap
  - a Policies webview tab on android and ios
  - `GET /policies`
- **Week calendar** (web only):
  - `/calendar`, a 7-column week grid
  - `GET /schedule/week`, which returns `403` for other platforms
- **.ics export** (web only):
  - an "Export .ics" button per booking
  - `GET /bookings/{id}/ics`
- **QR check-in** (android and ios):
  - a check-in screen with a QR, a backup code and a polled status
  - a scanner API, `POST /checkins`, with a per-studio `X-Studio-Key`
  - `scripts/simulate_scan.py` for manual demos
- **API contract v1.0.0.**

## Waitlist

### Added
- **Waitlist** (`docs/prd/waitlist.md` v2) on web, wap and android; absent on ios.
  - Join from class detail, and see and leave entries in My bookings.
  - Cancelling promotes the first eligible entry automatically; users at
    the booking limit are skipped.
  - Seed: two guest users on the `anchor-full` waitlist.
- **`X-Platform` request header** (`feature-flags` v2). Waitlist
  endpoints return `403 FEATURE_UNAVAILABLE` for ios, and an unknown
  value gives `400 INVALID_PLATFORM`.
- **API contract v0.3.0:** `StudioClass.waitlist_count` and
  `my_waitlist_position`, and the `WaitlistEntry` model.

### Changed
- Both clients bundle `fixtures/feature-flags.json`. The web Docker build
  context is now the repository root.

## M0–M2

### Added
- **M0 documents:** ADRs 0001–0006; PRD and tech spec for `domain-and-seed-data`,
  `test-support`, `feature-flags` and `app-shell`; design for `app-shell`.
- **M1 walking skeleton:**
  - the API: schedule generator, per-session state, clock, chaos, fill,
    flags, health
  - the web shell with separate web and wap trees
  - the Expo app with prebuilt ios/ and android/
  - `docker compose up` for the API and web
- **M2 core flow** on web, wap, android and ios: `login`,
  `browse-and-book`, `my-bookings-and-cancel`, with their PRDs, designs and
  tech specs, and 68 registered identifiers.
- **API contract v0.2.0:** `docs/api/openapi.json`.

### Process
- Added the tech-spec stage (`/techspec`, `docs/tech/`) and ADRs (`docs/adr/`).
- Added `docs/ROADMAP.md` and this changelog.
- The identifier validator also checks `tabBarButtonTestID` option keys.

## 0.0.1 — scaffolding
- Conventions (`CLAUDE.md`), roles, `/prd` and `/design` commands, identifier registry and validator.
- `docs/prd/waitlist.md` v1 draft.
