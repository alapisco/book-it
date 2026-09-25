# Tech spec: App shell and navigation

- Version: 2
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/app-shell.md v1, docs/design/app-shell.md v1

## Overview

- **web/wap:** `react-router` routes, a `Layout` with an auth gate, and
  `useMediaQuery` choosing `WebNav` or `WapNav`.
- **android/ios:** Expo Router, with a root `Stack` (login, the tabs group,
  class detail) and a `Tabs` group (schedule, bookings).
- **API:** `GET /me` validates the stored token (specified in `login`).

## API contract

No new endpoints.

## State and rules

- **Token storage.** web uses `localStorage["bookit.token"]`. native uses
  a module variable in `src/api.ts`, not persisted, so an app restart
  means logging in again.
- **Auth gate.** A missing token redirects to login. An invalid token is
  caught by the first API call returning `401` (`test-support` tech spec).

## Implementation by platform

**web / wap** (`web/src/`):
- `main.tsx`: `BrowserRouter` wrapping `App`.
- `App.tsx`: the routes `/login`, and `/schedule`, `/classes/:id`,
  `/bookings` inside `Layout`. `*` goes to `/schedule`.
- `useMediaQuery.ts`: `useMediaQuery(query): boolean`, built on
  `matchMedia` and its `change` event. `const isWap = useMediaQuery(WAP_QUERY)`
  with `WAP_QUERY = '(max-width: 767px)'`.
- `shell/Layout.tsx`:
  - `<div data-platform={isWap ? 'wap' : 'web'}>`
  - `{isWap ? <WapNav/> : <WebNav/>}<Outlet/>`
  - Redirects to `/login` when there's no token.
- `shell/WebNav.tsx` and `shell/WapNav.tsx`: different trees (ADR 0003).
  WapNav keeps `open` in `useState`, and the drawer unmounts when closed.
- The login route renders the same `data-platform` wrapper, without a nav.

**android / ios** (`app/src/app/`):
- `_layout.tsx`: a `Stack` with `headerShown: false`. It reads
  `testSession` from the incoming URL.
- `(tabs)/_layout.tsx`: `Tabs`, with
  `tabBarButtonTestID: 'nav.schedule.link'` / `'nav.bookings.link'`.
  It redirects to `/login` when there's no token.
- `(tabs)/schedule.tsx`, `(tabs)/bookings.tsx`, `login.tsx` and
  `classes/[id].tsx`. `index.tsx` redirects to `/schedule`, so the native
  route paths equal the web paths.
- `app.json`: `scheme: "bookit"`, `ios.bundleIdentifier` and
  `android.package` both `com.bookit.sut`.
- `expo-build-properties` sets `android.usesCleartextTraffic: true`, so
  that the emulator can reach `http://10.0.2.2:8000`.
- **API base URL:** `EXPO_PUBLIC_API_URL`. If unset, android uses
  `http://10.0.2.2:8000` and ios uses `http://localhost:8000`.
- **Leaving a pushed screen pops; it never pushes or replaces the tabs
  again.**
  - The class detail back link calls `router.dismiss()`, or
    `router.replace(...)` after a cold-start deep link.
  - The bookings link calls `router.dismissTo('/bookings')`.
  - A `401` calls `router.dismissAll()` before
    `router.replace('/login')`.
  - Reason: duplicate hidden screens leave duplicate identifiers in the
    hierarchy, and on iOS XCUITest can match the off-screen copy first.
- **Nested identifiers on iOS.** A `Pressable` whose children carry
  `testID`s (schedule cards, and submit buttons with a loading indicator)
  sets `accessible={false}`. Otherwise iOS merges the children into one
  accessibility element, and XCUITest can't find the nested identifiers.
  Android (`resource-id`) is unaffected.

## Identifiers

Nav identifiers per `docs/design/testids.md` § nav.

## Test-support hooks

`?testSession=` and the `testSession` deep-link param (`test-support` tech spec).

## Traceability

| PRD | Where |
|---|---|
| AC-1 | `WebNav` |
| AC-2 | `WapNav` |
| AC-3 | `app/src/app/(tabs)/_layout.tsx` |
| AC-4, AC-5 | `Layout` gate, `(tabs)/_layout` gate, `api.ts` 401 handling |
| AC-6, EC-1 | `App.tsx` routes, Expo Router file routes |
| AC-7, EC-2 | `Layout` `data-platform`, `useMediaQuery` |

## Open questions

None.

## Changelog

- v2: added the native navigation rule (pop, don't push) and the iOS nested-identifier rule, both found while implementing M2. Corrected the native route file names.
