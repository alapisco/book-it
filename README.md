# BookIt — System Under Test

BookIt is a studio class booking app. It exists to be **tested**, not
used. It is the System Under Test for a separate multi-platform test
automation framework (Python, pytest, pydantic, requests,
Selenium/Playwright, Appium). It is a **test fixture, not a product**.

The main thing the framework shows is a **platform parity model**. It
declares which platforms support which features, runs one test body on
every supporting platform, auto-skips the others with a stated reason,
and publishes a parity matrix. To show that, the SUT needs deliberate,
documented divergence between platforms. Providing that divergence is
the most important job of this repo.

**Domain:** Studios → Classes (capacity, start time, instructor) → Bookings → Users.

**Core flow, present on every platform:** log in → browse schedule →
select a class → confirm → see it in "My bookings" → cancel.

**Platforms:** `web` (desktop browser), `wap` (mobile browser, with a
genuinely different component tree), `android` and `ios` (native).

## Platform parity matrix

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

Divergence runs deliberately in both directions: some features are
web-only, some are mobile-only, and one is missing only on iOS. The last
row is a webview that renders the same HTML page as `wap`, embedded in both
native apps.

## Layout

| Path | What |
|---|---|
| `api/` | FastAPI + pydantic backend, in-memory store, test-support endpoints |
| `web/` | Vite + React + TS + Tailwind SPA serving `web` and `wap` |
| `app/` | Expo + React Native app (`expo prebuild`) serving `android` and `ios` |
| `fixtures/` | Seed data shared by backend, web and mobile |
| `docs/prd/` | Feature specs (versioned) |
| `docs/design/` | Written UI specs; `testids.md` is the identifier registry |
| `docs/api/openapi.json` | Generated from the FastAPI app. Never hand-edited |
| `scripts/check_testids.py` | Identifier validator |
| `CLAUDE.md`, `.claude/` | Conventions, roles, commands and hooks for Claude Code |

## Running it

> Status: **scaffolding only.** No application code exists yet, so
> nothing below runs until the features are implemented.

- **API + web:** `docker compose up` (from the repo root)
- **Mobile:** built locally from `app/` against the iOS simulator and
  Android emulator, via `expo prebuild` and a native run
- **Test-support API:** `POST /test/reset`, `X-Test-Session`,
  `X-Test-Now` / `POST /test/clock`, and chaos toggles (see `CLAUDE.md`)

## One-time setup per clone

```sh
git config core.hooksPath .githooks        # turn on the identifier pre-commit hook
python3 scripts/check_testids.py --all     # validate every identifier in web/ and app/
```

Open the repo in Claude Code once and accept the folder-trust prompt.
Claude Code skips the per-role hooks defined in `.claude/agents/*.md`
frontmatter for folders that haven't been trusted.

## How work gets done here

See **[docs/WORKFLOW.md](docs/WORKFLOW.md)** for the per-feature loop
(specify → design → implement → verify), the commands and roles, and what
to do when something breaks.
