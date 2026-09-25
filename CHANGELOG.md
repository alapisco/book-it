# Changelog

User-visible changes to the BookIt SUT, by milestone. The automation
framework pins against these versions.

## Unreleased (M0–M2)

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
