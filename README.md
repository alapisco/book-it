# BookIt

BookIt is a class-booking app for three fictional fitness studios in
Madrid. Members browse the daily class schedule, book a seat, and manage
their bookings: they can cancel, join a waitlist when a class is full,
check in at the door with a QR code, add a booking to their calendar, and
read each studio's policies. Real business rules come built in: seats are
limited, a member can hold at most 3 upcoming bookings, and cancelling is
refused in the last 12 hours before a class.

It is a **System Under Test (SUT)**: an app that exists to be tested.
It runs on four platforms from one backend, so you can build, practise
and demonstrate test automation that runs **one test on web, mobile web,
Android and iOS**.

![role: system under test](https://img.shields.io/badge/role-system%20under%20test-5b3fd6)
![platforms: web | wap | android | ios](https://img.shields.io/badge/platforms-web%20%7C%20wap%20%7C%20android%20%7C%20ios-2f6fdb)
[![latest release](https://img.shields.io/github/v/release/alapisco/book-it?label=apps)](https://github.com/alapisco/book-it/releases/latest)
[![license: 0BSD](https://img.shields.io/badge/license-0BSD-green)](LICENSE)
<br>
![api: FastAPI](https://img.shields.io/badge/api-FastAPI-009688?logo=fastapi&logoColor=white)
![web: React + Vite](https://img.shields.io/badge/web-React%20%2B%20Vite-61dafb?logo=react&logoColor=black)
![mobile: Expo / React Native](https://img.shields.io/badge/mobile-Expo%20%2F%20React%20Native-000020?logo=expo&logoColor=white)

<p align="center">
  <img src="docs/images/web-vs-android.png" alt="The same day in BookIt on desktop web and on Android" width="900">
  <br>
  <em>The same day on desktop web (a day view with no week view, by design)
  and on Android (week view with a day strip and bottom tabs).</em>
</p>

> [!IMPORTANT]
> **The platforms differ on purpose.** Some features exist on only some
> platforms, and every difference is listed in the
> [parity matrix](#features-and-platforms). A feature missing on one
> platform is intended, not a bug.

## Why use it

Real apps are poor practice targets for test automation: their data
changes, time moves on, you can't make the server fail on demand, and
nobody tells you which differences between platforms are intended.
BookIt removes those obstacles. It is useful if you are:

- **building a test automation framework**, especially one that runs the
  same tests across web and mobile (Playwright, Selenium, Appium, or your
  own), and need a realistic target to build it against
- **practising or teaching** UI, API and mobile test automation on
  something richer than a to-do app
- **demonstrating** cross-platform techniques: shared locators, feature
  gating per platform, skipping a test where a feature doesn't exist

What it gives you:

| | |
|---|---|
| **One identifier per element, on every platform** | The Book button is `class.book.button` on web, mobile web, Android and iOS, so one page object can serve all four. |
| **Deliberate, documented divergence** | Features missing on some platforms, in both directions, to practise per-platform gating and skips. |
| **Deterministic data** | Any date has a schedule, and the same date always produces the same classes. |
| **Control over time** | Set or advance the server's clock to reach states like "too late to cancel". |
| **Isolated test sessions** | Parallel tests don't see each other's bookings. |
| **Fault injection** | Add latency, server errors or timeouts on demand. |
| **Written specifications** | Every feature has requirements, a UI spec and a tech spec to test against. See [below](#specs-you-can-test-against). |

## Features and platforms

| Platform | What it is |
|---|---|
| `web` | Desktop browser, 768 px wide or more. Top navigation bar. |
| `wap` | Mobile browser, below 768 px. A **different component tree** from `web` (bottom sheet instead of modal, bottom tabs instead of a nav bar), not just a narrower layout. |
| `android` | Native app |
| `ios` | Native app |

`wap`, `android` and `ios` share the same bottom tabs: Schedule · Week ·
Bookings · Policies. Desktop web is the outlier.

| Feature | web | wap | android | ios |
|---|:-:|:-:|:-:|:-:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Browse the schedule and book a class | ✅ | ✅ | ✅ | ✅ |
| My bookings, and cancel | ✅ | ✅ | ✅ | ✅ |
| Week view (day strip and list) | ❌ | ✅ | ✅ | ✅ |
| Export a booking to a calendar (.ics) | ✅ | ❌ | ❌ | ❌ |
| Join a waitlist when a class is full | ✅ | ✅ | ✅ | ❌ |
| QR check-in at the studio | ❌ | ❌ | ✅ | ✅ |
| Studio policies page | ✅ | ✅ | 🌐 | 🌐 |

🌐 = webview: the native app embeds the same HTML page that `wap`
renders, so a test switches to the webview context and uses the `wap`
identifiers.

Every feature in the matrix is implemented and tested on all four
platforms. See the [roadmap](docs/ROADMAP.md) and the
[changelog](CHANGELOG.md).

## Built for testing

**Seed users** (password `bookit123` for all):

| User | Starts with |
|---|---|
| `ava@bookit.test` | upcoming bookings |
| `ben@bookit.test` | no bookings |
| `cara@bookit.test` | 3 bookings, the limit |

**Test hooks** on the API ([full spec](docs/prd/test-support.md)):

| Hook | What you use it for |
|---|---|
| `X-Test-Session: <id>` header | Isolate a test's state from other tests running in parallel |
| `POST /test/reset` | Return your session to the seed state before a test |
| `X-Test-Now` header, `POST /test/clock`, `POST /test/clock/advance` | Set or move the clock, e.g. to cross the 12-hour cancellation cutoff |
| `PUT /test/chaos` | Inject latency, 5xx errors, timeouts or expired tokens |
| `POST /test/classes/{id}/fill` | Fill a class, e.g. "the class filled while I was booking" |
| Anchor classes `anchor-full`, `anchor-last-seat`, `anchor-cancel-closed`, `anchor-cancel-open` | Fixed ids with guaranteed state; `anchor-full` starts with two guests on its waitlist |
| `GET /flags` | Which features each platform has |
| `X-Platform` header | Server-side gating, e.g. joining a waitlist returns `403` for `ios` |
| `POST /checkins` with `X-Studio-Key: scan-<studio>` | Play the studio's QR scanner. By hand: `python3 scripts/simulate_scan.py <code> --studio harbor` |

The UIs join a test session with `?testSession=<id>` on web and wap, or
the deep link `bookit://login?testSession=<id>` on android and ios.

## Specs you can test against

BookIt is documented like a real product, so you can test it at every
level: review the requirements, test the API and its contract, and test
the UI on each platform.

| Document | What you get from it |
|---|---|
| [Requirements (PRDs)](docs/prd/) | One per feature: user stories, numbered acceptance criteria (AC-n) and edge cases (EC-n) with exact status codes and messages, e.g. `409 CANCELLATION_WINDOW_CLOSED`. Trace each test back to a requirement. |
| [UI specs](docs/design/) and the [identifier registry](docs/design/testids.md) | Every screen, state and message, and every element's identifier: your locators. |
| [Tech specs](docs/tech/) | Endpoints, the order in which rules are checked, and how each platform implements the feature. |
| [API contract](docs/api/openapi.json) | OpenAPI, generated from the backend. Use it for API and contract tests. Interactive docs at http://localhost:8000/docs when running. |
| [Architecture decisions (ADRs)](docs/adr/) | Why things behave as they do: time zones, session isolation, why `wap` is its own tree. |

## Quick start for testers

You need Docker, and an Android emulator or iOS simulator (macOS) for the
native apps.

1. **Start the backend and web app** at the tag that matches the apps you
   download:
   ```sh
   git clone https://github.com/alapisco/book-it.git && cd book-it
   git checkout v1.1          # the release's tag
   docker compose up --build  # API on :8000, web/wap on :5173
   ```
2. **Install the apps** from [Releases](https://github.com/alapisco/book-it/releases/latest):
   ```sh
   adb install -r bookit-v1.1.apk                   # running Android emulator
   unzip bookit-v1.1-ios-simulator.zip              # contains BookIt.app
   xcrun simctl install booted BookIt.app           # booted iOS simulator
   ```
   They need no configuration: they reach the API on your machine
   (`10.0.2.2` from the emulator, `localhost` from the simulator). The
   iOS build runs on simulators only, not physical iPhones; the APK is
   debug-signed, for emulators.
3. **Open web or wap** at http://localhost:5173. Resize the window below
   768 px to get `wap`.
4. **Log in** as `ava@bookit.test`, password `bookit123`.

For Appium capabilities, see
[app/README.md](app/README.md#3-build-installable-files-for-automation).

---

## For contributors

Only needed if you change BookIt itself. To run and test it, the quick
start above is enough.

### Layout

| Path | What |
|---|---|
| `api/` | FastAPI + pydantic backend, in-memory store, test-support endpoints |
| `web/` | Vite + React + TS + Tailwind SPA serving `web` and `wap` |
| `app/` | Expo + React Native app (`expo prebuild`) serving `android` and `ios` ([app/README.md](app/README.md)) |
| `fixtures/` | Seed data shared by backend, web and mobile ([fixtures/README.md](fixtures/README.md)) |
| `docs/` | The [specs above](#specs-you-can-test-against), plus the [roadmap](docs/ROADMAP.md) and [workflow](docs/WORKFLOW.md) |
| `scripts/check_testids.py` | Identifier validator |
| `CLAUDE.md`, `.claude/` | Conventions, roles, commands and hooks for Claude Code |

### Running from source

**API + web/wap:** `docker compose up --build`. Without Docker, run the
two pieces separately:
- API: `cd api && pip install -r requirements.txt && uvicorn bookit.main:app --port 8000`
- Web: `cd web && npm ci && npm run dev`

**android / ios:** [app/README.md](app/README.md) covers machine setup
(JDK 17, Android SDK, Xcode), running for development, building the
release `.apk` / `.app`, and [cutting a release](app/README.md#7-cutting-a-release).

### Contributor setup (once per clone)

BookIt's main promise to testers is that every element has the **same
identifier on all four platforms**, and that every identifier is listed
in the [registry](docs/design/testids.md). A check enforces this. Turn it
on once after cloning:

```sh
git config core.hooksPath .githooks
python3 scripts/check_testids.py --all
```

- The first line tells git to run the repository's own hooks from
  `.githooks/`. Git never does this by default, for security. From then
  on, every commit is checked, and a commit that adds an identifier that
  is malformed or missing from the registry is rejected.
- The second line checks the whole codebase once, so you know your clone
  starts clean.

BookIt is developed with Claude Code, using roles and commands defined in
`.claude/`. If you use it too, open the repo in Claude Code once and
accept the folder-trust prompt: the roles' own checks only run in
trusted folders.

### How work gets done here

Each feature goes from requirements to UI spec, tech spec, implementation
and verification. See **[docs/WORKFLOW.md](docs/WORKFLOW.md)** for the
loop, the commands and roles, and what to do when something breaks.

## License

[0BSD](LICENSE): use, copy, modify and distribute freely, with no
attribution required.
