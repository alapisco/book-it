# PRD: Feature flags

- Version: 3
- Status: approved
- Date: 2026-09-27

## Summary

Which features exist on which platform is data. It lives in one fixture,
it matches the parity matrix in `CLAUDE.md` exactly, and it varies by
platform only. The clients read it to decide what to render. The
framework reads it from the API to build its expected parity matrix.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Every platform has a flag set. |
| wap | yes | Separate flag set from web, despite sharing a build (ADR 0003). |
| android | yes | Flag set chosen by `Platform.OS`. |
| ios | yes | Flag set chosen by `Platform.OS`. |

## User stories

- **US-1** As a test author, I want to fetch the platform support matrix from the SUT, so that my framework's skip decisions come from the same source the apps use.
- **US-2** As a developer, I want one place that decides platform support, so that the apps can't drift from the parity matrix.

## Acceptance criteria

- **AC-1** `GET /flags` returns `200` with one object per platform (`web`, `wap`, `android`, `ios`), each with exactly these keys and values:

  | Key | web | wap | android | ios |
  |---|---|---|---|---|
  | `login` | true | true | true | true |
  | `browse_and_book` | true | true | true | true |
  | `my_bookings` | true | true | true | true |
  | `week_calendar` | false | true | true | true |
  | `ics_export` | true | false | false | false |
  | `waitlist` | true | true | true | false |
  | `qr_check_in` | false | false | true | true |
  | `studio_policies` | `"page"` | `"page"` | `"webview"` | `"webview"` |

- **AC-2** `GET /flags/{platform}` returns that platform's object.
- **AC-3** The flags don't depend on the test session, the user or the studio.
- **AC-4** `GET /flags` needs no authentication.
- **AC-5** A client renders a flagged feature's entry points only where
  its flag is `true`. Where the flag is `false`, none of the feature's
  identifiers are present. This applies from M3; every M2 feature is
  `true` on all platforms.
- **AC-6** Every request may carry `X-Platform: web | wap | android | ios`.
  The web app sends `wap` while it renders the wap tree and `web`
  otherwise; the native app sends `Platform.OS`.
- **AC-7** When `X-Platform` names a platform whose flag for a feature is
  `false`, that feature's endpoints return `403 FEATURE_UNAVAILABLE`
  "This feature is not available on this platform." Without
  `X-Platform`, no platform check is made; API tests use this to reach
  every feature.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | `GET /flags/desktop` | `404 UNKNOWN_PLATFORM` |
| EC-2 | Any request with `X-Platform: desktop` | `400 INVALID_PLATFORM` "X-Platform must be one of web, wap, android, ios." |

## API requirements

`GET /flags` → `{web: PlatformFlags, wap: PlatformFlags, android: PlatformFlags, ios: PlatformFlags}`.
`GET /flags/{platform}` → `PlatformFlags`.

## Test-support needs

None. Flags can't be toggled at runtime, because divergence is fixed by
design.

## Out of scope

- Changing flags at runtime, per user, or per studio.
- Remote config services.

## Decisions taken by default (review)

1. The source is `fixtures/feature-flags.json`. The API serves it, and the
   clients bundle it at build time. Clients bundle rather than fetch, so
   that flags never have a loading state.
2. Flag names use snake_case and follow the matrix rows.

## Changelog

- v2 (2026-09-26): added the `X-Platform` request header and server-side enforcement (`403 FEATURE_UNAVAILABLE`), first used by `waitlist` v2.
- v3 (M4): `week_calendar` moves from web-only to wap, android and ios; web is now `false` (`week-calendar` v2). The parity matrix in `CLAUDE.md` and the README changes with it.
