# PRD: Studio policies

- Version: 1
- Status: approved
- Date: 2026-09-26

## Summary

A public page lists each studio's house rules: cancellation, booking
limit, waitlist, check-in, and one studio-specific rule. Web and wap
render it as a page. The native apps embed the same page in a webview
instead of reimplementing it.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | page | Parity matrix. Studios are shown as tabs. |
| wap | page | Parity matrix. Studios are shown as an accordion (a different tree, ADR 0003). |
| android | webview | Parity matrix. The native app embeds the wap page, so the framework has to switch from the native context to the webview context to assert its content. |
| ios | webview | Same as android. |

Flag: `studio_policies` is `"page"` on web and wap, and `"webview"` on
android and ios.

## User stories

- **US-1** As a user, I want to read each studio's rules before booking.
- **US-2** As a native app user, I want the same rules inside the app, without opening a browser.

## Acceptance criteria

- **AC-1** (US-1) `GET /policies` returns `200` without authentication:
  the three studios in fixture order, each with its rules.
  - Harbor Yoga has 5 rules. Summit Strength has 5. Ember Dance has 5.
  - Every studio's first four rules are titled "Cancellation", "Booking
    limit", "Waitlist" and "Check-in", with the same text as in
    `fixtures/policies.json`.
  - The fifth rule is studio-specific.
- **AC-2** (US-1) The page is at `/policies` and is reachable without
  logging in. For a logged-in user it shows the normal navigation, with a
  "Policies" link on every platform.
- **AC-3** (US-1) On web, the page shows one tab per studio. Harbor Yoga
  is selected initially, and selecting a tab shows that studio's rules.
- **AC-4** (US-1) On wap, the page shows one collapsed toggle per studio.
  Tapping a toggle expands that studio's rules and collapses any other.
  Tapping it again collapses it.
- **AC-5** (US-1) Each rule shows its title and text.
- **AC-6** (US-2) On android and ios, the "Policies" tab shows a webview
  that loads `<web URL>/policies?embed=1`. Inside the webview the wap page
  renders (the viewport is under 768 px), without the app's navigation.
- **AC-7** (US-2) Inside the webview, the identifiers are the wap
  identifiers. The webview is debuggable, so Appium can switch to its
  context on both OSes.
- **AC-8** `?embed=1` hides the navigation on web and wap too.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Chaos `error_status: 500` on `/policies` | Page shows "Something went wrong." |
| EC-2 | Native webview can't reach the web app | "Could not load the policies page." |
| EC-3 | Chaos `latency_ms` | The page's loading state stays visible for at least the latency |

## API requirements

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/policies` | none | `200 StudioPolicies[]` |

- `StudioPolicies`: `studio_id`, `studio_name: str`, `rules: PolicyRule[]`.
- `PolicyRule`: `id`, `title`, `text: str`.

## Test-support needs

Chaos (EC-1, EC-3). The web app must be running for the native webview.

## Out of scope

Editing policies, per-user acknowledgement, policy versions.

## Decisions taken by default (review)

1. The page is public, because policies are read before signing up.
2. The native web URL comes from `EXPO_PUBLIC_WEB_URL`. If unset, android
   uses `http://10.0.2.2:5173` and ios uses `http://localhost:5173`.
3. There's no native fallback when the webview fails, just an error
   message.
