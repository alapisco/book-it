# ADR 0001: Three deployables, one repo, in-memory backend

- Status: accepted
- Date: 2026-09-25

## Context

BookIt is a System Under Test for an external automation framework. It must
serve four platforms (web, wap, android, ios) with deliberate divergence
between them, run locally with one command, and reset to a known state
between tests. It will never serve real users.

## Decision

- **One repository, three deployables:**
  - `api/`: Python, FastAPI and pydantic. All state is in memory, seeded from `fixtures/`.
  - `web/`: a Vite + React + TypeScript + Tailwind SPA. It serves both web and wap.
  - `app/`: a single Expo + React Native codebase with `expo prebuild`. It produces the android and ios apps.
- **No database.** State lives for the process lifetime only. Restarting
  the API is a full reset.
- **`fixtures/` holds the data every deployable agrees on:** studios,
  schedule templates, anchors, users, seed bookings and feature flags.
- **`docker compose up` runs `api` and `web`.** Mobile is built locally
  against the simulator and emulator.
- **No state library, SSR framework, data-fetching library or auth
  provider.** Components use `useState` and `fetch`, and tokens are fake.

## Consequences

- Nothing survives a restart. That's acceptable, because tests start from `POST /test/reset`.
- One API process holds all test sessions. There is no horizontal scaling, and none is needed.
- The web and wap platforms share one build. Which tree renders is decided at runtime (ADR 0003).
