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
| `app/` | Expo + React Native app (`expo prebuild`) serving `android` and `ios` ([app/README.md](app/README.md)) |
| `fixtures/` | Seed data shared by backend, web and mobile ([fixtures/README.md](fixtures/README.md)) |
| `docs/prd/` | Feature specs (versioned) |
| `docs/design/` | Written UI specs; `testids.md` is the identifier registry |
| `docs/tech/` | Tech specs: contract, rule order, per-platform implementation |
| `docs/adr/` | Architecture decision records |
| `docs/api/openapi.json` | Generated from the FastAPI app. Never hand-edited |
| `docs/ROADMAP.md` | Milestones and document status |
| `scripts/check_testids.py` | Identifier validator |
| `CLAUDE.md`, `.claude/` | Conventions, roles, commands and hooks for Claude Code |

## Running it

Status: **every feature in the parity matrix is implemented.**
- web and wap are verified end to end in a browser.
- The android/ios code typechecks and bundles for both OSes, and its
  screens have been exercised via react-native-web. It hasn't yet been
  built on an emulator or simulator, and the policies webview can only be
  checked on a device.
- See [`docs/ROADMAP.md`](docs/ROADMAP.md).

**API + web/wap**

```sh
docker compose up --build
```

- API at http://localhost:8000. The interactive docs are at `/docs`, and
  the contract at `docs/api/openapi.json`.
- Web at http://localhost:5173. It renders `web` at 768 px wide or more,
  and `wap` below 768 px.

Without Docker, run the two pieces separately:
- API: `cd api && pip install -r requirements.txt && uvicorn bookit.main:app --port 8000`
- Web: `cd web && npm ci && npm run dev`

**android / ios:** built locally against the emulator and simulator.
[app/README.md](app/README.md) covers:
- one-time machine setup: JDK 17, `ANDROID_HOME`, Xcode
- running for development
- building the release `.apk` / `.app` that Appium uses
  (`npm run build:android`, `npm run build:ios`)

**Seed users** (password `bookit123`):
- `ava@bookit.test`: has bookings
- `ben@bookit.test`: has none
- `cara@bookit.test`: at the booking limit

**Test support** (`docs/prd/test-support.md`):
- `POST /test/reset`
- the `X-Test-Session` header
- the clock: the `X-Test-Now` header, or `POST /test/clock` and
  `POST /test/clock/advance`
- chaos: `PUT /test/chaos`
- `POST /test/classes/{id}/fill`
- anchor classes: `anchor-full`, `anchor-last-seat`,
  `anchor-cancel-closed`, `anchor-cancel-open`
- the platform matrix: `GET /flags`
- the `X-Platform` header: server-side feature gating, e.g. waitlist
  returns `403` for `ios`
- the seed waitlist: two guests on `anchor-full`
- the QR scanner: `POST /checkins` with `X-Studio-Key: scan-<studio>`.
  For manual demos, run `python3 scripts/simulate_scan.py <code> --studio harbor`.

A UI joins a test session with `?testSession=<id>` on web, or
`bookit://login?testSession=<id>` on native.

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
