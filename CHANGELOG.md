# Changelog

User-visible changes to the BookIt SUT, by milestone. The automation
framework pins against these versions.

## v1.1

Tagged `v1.1`: M4 (below) plus these changes. The first release with
installable apps attached: an Android APK and an iOS simulator build
(Apple Silicon).

### Added
- **Apps on GitHub Releases:** testers install the APK and the iOS
  simulator build without building them (`app/README.md` §7).
- **License:** 0BSD.
- **README** rewritten for testers: what the app is, who it's for, test
  hooks, the specs you can test against, and a quick start.

### Changed
- **My bookings opens the class** (`my-bookings-and-cancel` v3) on every
  platform: tapping a booking (outside its buttons) opens class detail, so
  android and ios reach "Show check-in code" from there. Back returns to
  My bookings; on web the link reads "‹ My bookings". Registry:
  `bookings.item` is now a `link`; no identifiers added or removed.

### Fixed
- **wap: Back from a class opened in the week** now returns to that week
  (`week-calendar` AC-7); it went to the schedule. android and ios were
  already correct.
- **Back returns to where you were** (`browse-and-book` v4 AC-8,
  `week-calendar` v3 AC-7), even when pressed before class detail has
  loaded (it used to fall back to today's schedule or the current week):
  - web/wap: links into class detail carry `?back=<origin path and query>`,
    replacing `?from=bookings` / `?from=week`; only `/schedule`, `/week`
    and `/bookings` are honoured.
  - wap, android and ios: the week also comes back on the opened class's
    day, selected and scrolled to (`/week?week=…&day=…` on wap); it used
    to reset to today or Monday. No identifiers changed.

## M4: polish

### Added
- **API contract v1.1.0:**
  - studio local time fields, `YYYY-MM-DDTHH:MM:SS` with no zone
    (ADR 0007): `StudioClass.start_local` and `end_local`;
    `CheckinPass.window_opens_local`, `window_closes_local` and
    `checked_in_local`. Every `*_at` field stays UTC.
  - `Studio.neighborhood`, `accent` and `timezone` (`Europe/Madrid`);
    `StudioClass.studio_neighborhood` and `studio_accent`;
    `StudioPolicies.neighborhood` and `accent`.
  - `ScheduleWeek.today`, the studio's local date.
- **Week view** (`week-calendar` v2) on wap, android and ios:
  - a Week tab with a day strip (class counts, today marker, booked dots)
    and a list of day sections
  - tapping a day scrolls the list to it; it doesn't filter
- **Bottom tabs on wap** (ADR 0008): an app bar and Schedule · Week ·
  Bookings · Policies tabs replace the hamburger and drawer.
- **Visual language** (`docs/design/visual-language.md`) on every
  platform: availability colours, studio accents and neighbourhoods on
  cards, lucide icons, a branded login.
- **Identifiers:** `nav.tabs`, `nav.week.link`, and `week.screen`,
  `week.range.prev`, `week.range.text`, `week.range.next`,
  `week.loading`, `week.error`, `week.empty`, `week.strip`,
  `week.day.pill`, `week.day.name`, `week.day.number`, `week.day.count`,
  `week.day.booked`, `week.list`, `week.section`, `week.section.header`,
  `week.class.card`, `week.class.time`, `week.class.name`,
  `week.class.studio`, `week.class.spots`, `week.class.booked`.

### Changed
- Times shown to users are studio local time (Europe/Madrid) with no
  `" UTC"` suffix: "07:00–08:00", "Checked in at HH:MM".
- `date` and the default "today" on `GET /schedule` and
  `GET /schedule/week` are the studio's local date. Class templates are
  local times, so a class's UTC `start_at` moves by an hour when daylight
  saving changes. Class ids use the local date and time.
- `GET /schedule/week` serves wap, android and ios, and returns
  `403 FEATURE_UNAVAILABLE` for `X-Platform: web` (`week_calendar` flag).
- **Seed data renamed:**
  - anchors: `anchor-full` is Sunset Spin, `anchor-last-seat` Reformer
    Pilates, `anchor-cancel-closed` Barre Sculpt, `anchor-cancel-open`
    Slow Flow
  - Beach Yoga is Park Yoga (ids end in `-park-yoga`)
  - waitlist guests: Lucía Ortega (`lucia.ortega@bookit.test`) and Marco
    Silva (`marco.silva@bookit.test`)
- The `.ics` `LOCATION` includes the neighbourhood, e.g.
  "Harbor Yoga, Chamberí".
- `policies.studio.name` renders on web only; on wap the toggle already
  names the studio.

### Removed
- The web-only week grid. `/calendar` and `/week` on web redirect to
  `/schedule`.
- **Retired identifiers**, now rejected by the validator:
  `nav.menu.toggle`, `nav.menu.drawer`, `nav.menu.close`,
  `nav.calendar.link`, and `calendar.screen`, `calendar.week.prev`,
  `calendar.week.text`, `calendar.week.next`, `calendar.loading`,
  `calendar.empty`, `calendar.error`, `calendar.grid`,
  `calendar.day.column`, `calendar.day.header`, `calendar.class.block`,
  `calendar.class.time`, `calendar.class.name`, `calendar.class.booked`.

### Fixed
- Tapping a Week day pill scrolls the list to that day on ios and
  android.

## Developer experience

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
