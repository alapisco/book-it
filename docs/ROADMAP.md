# Roadmap

Milestones for building the BookIt SUT. Each feature follows the loop in
[`WORKFLOW.md`](WORKFLOW.md). A milestone closes at its gate.

| Milestone | Scope | Gate | Status |
|---|---|---|---|
| **M0 Foundations** | ADRs 0001–0006; PRDs + tech specs for `domain-and-seed-data`, `test-support`, `feature-flags`, `app-shell` (+ design) | QA lead approves the documents | done: documents approved under defaults, **pending your review** |
| **M1 Walking skeleton** | API with seed data, schedule generator, flags, test-support; web shell with web/wap trees; Expo app prebuilt with tab shell; `docker compose up` | All four platforms build and launch locally | done for api/web/wap (Docker); android/ios native builds done locally and run on emulators, including the webview and svg native modules |
| **M2 Core flow** | `login`, `browse-and-book`, `my-bookings-and-cancel` on all four platforms | One test body passes on all four platforms; tag `v0.2` | done: one test body passes on all four platforms; tagged v0.2 |
| **M3 Divergent features** | `studio-policies`, `waitlist`, `week-calendar`, `ics-export`, `qr-check-in` | Framework's parity matrix artifact equals the matrix in `CLAUDE.md`; tag `v1.0` | done: framework's parity matrix run passed on all four platforms; tagged v1.0 |
| **M4 Polish** | ADRs 0007 (studio local time) and 0008 (wap mirrors native); visual language; week view moves to wap/android/ios; realistic names; bottom tabs on wap; icons | QA lead approves the documents, then all suites pass on all platforms with screenshots | done: documents approved; implemented and tested on web, wap, android and ios; tagged v1.1 |

## Documents by feature

| Feature | PRD | Design | Tech spec | Code |
|---|---|---|---|---|
| domain-and-seed-data | `docs/prd/domain-and-seed-data.md` | n/a (no UI) | `docs/tech/domain-and-seed-data.md` | api, fixtures |
| test-support | `docs/prd/test-support.md` | n/a (no UI) | `docs/tech/test-support.md` | api, web, app |
| feature-flags | `docs/prd/feature-flags.md` | n/a (no UI) | `docs/tech/feature-flags.md` | api, fixtures |
| app-shell | `docs/prd/app-shell.md` | `docs/design/app-shell.md` | `docs/tech/app-shell.md` | web, app |
| login | `docs/prd/login.md` | `docs/design/login.md` | `docs/tech/login.md` | api, web, app |
| browse-and-book | `docs/prd/browse-and-book.md` | `docs/design/browse-and-book.md` | `docs/tech/browse-and-book.md` | api, web, app |
| my-bookings-and-cancel | `docs/prd/my-bookings-and-cancel.md` | `docs/design/my-bookings-and-cancel.md` | `docs/tech/my-bookings-and-cancel.md` | api, web, app |
| waitlist | `docs/prd/waitlist.md` (v2) | `docs/design/waitlist.md` | `docs/tech/waitlist.md` | api, fixtures, web, app |
| studio-policies | `docs/prd/studio-policies.md` | `docs/design/studio-policies.md` | `docs/tech/studio-policies.md` | api, fixtures, web, app |
| week-calendar | `docs/prd/week-calendar.md` (v2) | `docs/design/week-calendar.md` | `docs/tech/week-calendar.md` | api, fixtures, web, app |
| ics-export | `docs/prd/ics-export.md` | `docs/design/ics-export.md` | `docs/tech/ics-export.md` | api, web |
| qr-check-in | `docs/prd/qr-check-in.md` | `docs/design/qr-check-in.md` | `docs/tech/qr-check-in.md` | api, fixtures, app, scripts |
