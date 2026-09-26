# Tech spec: Studio policies

- Version: 1
- Status: approved
- Date: 2026-09-26
- Implements: docs/prd/studio-policies.md v1, docs/design/studio-policies.md v1

## Overview

- **fixtures:** `policies.json` holds the rules per studio.
- **api:** `GET /policies`, public, in `routes/policies.py`.
- **web / wap:**
  - Route `/policies` inside a `Layout` in public mode: nav only when
    logged in and not embedded.
  - `pages/PoliciesPage.tsx` renders `StudioTabs` (web) or
    `StudioAccordion` (wap).
  - A "Policies" link in `WebNav` and `WapNav`.
- **android / ios:** `(tabs)/policies.tsx`, a `WebView` of
  `${WEB_URL}/policies?embed=1`, as the third tab.

## API contract

| Model | Fields |
|---|---|
| `PolicyRule` | `id`, `title`, `text: str` |
| `StudioPolicies` | `studio_id`, `studio_name: str`, `rules: PolicyRule[]` |

`GET /policies` needs no auth and returns `200 StudioPolicies[]`, in
fixture order. The only failures are chaos-induced.

## State and rules

Static fixture data, independent of the session.

## Implementation by platform

**api:** `bookit/routes/policies.py`; `fixtures.POLICIES`.

**web / wap:**
- `Layout` takes `isPublic`. When it is set, the auth gate is skipped,
  and the nav renders only when `getToken()` is set and `embed !== '1'`.
- `App.tsx` adds `<Route element={<Layout isPublic />}><Route path="/policies" …/></Route>`.
- The page state is `Load<StudioPolicies[]>`.
  - Tabs: `useState(selectedIndex = 0)`.
  - Accordion: `useState(expanded: string | null = null)`.

**android / ios:**
- `src/config.ts` exports `WEB_URL`: `EXPO_PUBLIC_WEB_URL`, or
  `http://10.0.2.2:5173` on android and `http://localhost:5173` on ios.
- `(tabs)/policies.tsx`: `<WebView testID="policies.webview" …>` with
  `startInLoadingState`, `renderLoading`, `renderError` and
  `webviewDebuggingEnabled`.
- Tabs layout: a third tab, rendered because
  `flags.studio_policies === 'webview'` on both OSes.

## Identifiers

`docs/design/testids.md` § policies, plus `nav.policies.link`.

## Test-support hooks

Chaos applies to `/policies`, which isn't under `/test`.

## Traceability

| PRD | Where |
|---|---|
| AC-1 | `routes/policies.py`, `fixtures/policies.json` |
| AC-2–AC-5, AC-8, EC-1, EC-3 | `PoliciesPage`, `Layout isPublic` |
| AC-6, AC-7, EC-2 | `app/src/app/(tabs)/policies.tsx` |

## Open questions

None.
