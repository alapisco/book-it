# BookIt SUT — project conventions

BookIt is a **System Under Test** for an external multi-platform test
automation framework. It is a fixture, not a product. Its most important
property is **deliberate, documented cross-platform divergence** (see the
parity matrix below). Never "fix" a divergence; it is the point.

Read `docs/WORKFLOW.md` for the per-feature loop (PRD → design → implement → verify).

## Platforms

`web` (desktop browser), `wap` (mobile browser, different component tree),
`android` (native), `ios` (native).

## Platform parity matrix (specification — do not add features beyond it)

| Feature | web | wap | android | ios |
|---|---|---|---|---|
| Login | yes | yes | yes | yes |
| Browse + book | yes | yes | yes | yes |
| My bookings + cancel | yes | yes | yes | yes |
| Week calendar grid | yes | no | no | no |
| Export booking to .ics | yes | no | no | no |
| Waitlist when class full | yes | yes | yes | **no** |
| QR check-in | no | no | yes | yes |
| Studio policies page | yes | yes | webview | webview |

"webview" = the native app embeds the same HTML page `wap` renders.
Feature flags vary by **platform only**, never by studio.

## Ownership

| Path | Owner (role) |
|---|---|
| `api/`, `docs/api/openapi.json`, `fixtures/`, `docker-compose.yml` | `backend-dev` |
| `web/` | `web-dev` |
| `app/` | `mobile-dev` |
| `docs/prd/` | `/prd` command |
| `docs/design/` (incl. `testids.md`) | `/design` command |
| `docs/tech/` | `/techspec` command |
| `docs/adr/` | You (the human) accept; drafted on request, roles only propose |

Documents a role reads before coding: the feature's PRD (`docs/prd/`),
design spec (`docs/design/`), tech spec (`docs/tech/`) and the ADRs
(`docs/adr/`). Precedence when they disagree: PRD on behaviour and
platforms, design on UI and identifiers, tech spec on contract and
structure. ADRs bind all three.

`web-dev` and `mobile-dev` read `fixtures/` but ask before changing it.

## Stack

- **api/** — Python, FastAPI, pydantic. In-memory store seeded from `fixtures/`. No database.
- **web/** — Vite + React + TypeScript + Tailwind. Plain SPA, client-side routing.
  No SSR framework. No state library: `useState` and `fetch` only.
- **app/** — Expo + React Native + TypeScript, `expo prebuild` (real native
  projects), Expo Router. One codebase; divergence via `Platform.OS` guards
  and feature flags, not separate implementations.

## Non-negotiable conventions

### 1. Identifier convention

Every interactive element carries a stable identifier of the form
`screen.element.qualifier` (e.g. `login.submit`, `schedule.class.card`,
`booking.cancel.confirm`).

- Format: 2 or 3 dot-separated segments, each `[a-z][a-z0-9-]*`.
- **The same string on every platform**: `data-testid` on web/wap,
  `testID` in React Native. One test body runs on all four platforms only
  if the string is identical everywhere.
- Identifiers are **string literals** at the attribute. No template
  strings, no computed values, no constants imported from elsewhere — the
  validator must be able to read them. Repeated elements (list rows) share
  one identifier; tests index them.
- `docs/design/testids.md` is the registry and the source of truth.
  **Adding an element means adding it to the registry first.**
- Enforced by `scripts/check_testids.py`: a `PreToolUse` hook
  (`.claude/settings.json`) blocks any write to `web/` or `app/` that
  introduces an unregistered or malformed identifier, and
  `.githooks/pre-commit` blocks commits that do. Never bypass either; fix
  the registry (via `/design`) or the code.

### 2. Contract ownership

`docs/api/openapi.json` is **generated** from the FastAPI app. Never
hand-edited. Web and mobile clients consume it; they do not define their
own request or response shapes.

### 3. wap is a platform, not a viewport

Below the mobile breakpoint the web app renders a **different component
tree** — bottom sheet instead of modal, stacked list instead of grid,
hamburger instead of nav bar — chosen by a `useMediaQuery` hook. Tailwind
responsive classes alone are insufficient: the same DOM with different
styling gives the test framework nothing to abstract over.

## Quality bar (proof of concept)

- Optimise for legibility and testability, not robustness.
- No auth provider (fake tokens), no payments, no email, no persistence
  beyond process lifetime.
- No error boundaries, retry logic or defensive code beyond what the test
  scenarios require.
- **No unit tests in this repo.** It is tested from the outside.
- No abstraction layers "for later". There is no later.
- When a spec is silent, **stop and ask**. Do not invent requirements.
