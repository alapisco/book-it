# Roadmap

Milestones for building the BookIt SUT. Each feature follows the loop in
[`WORKFLOW.md`](WORKFLOW.md). A milestone closes at its gate.

| Milestone | Scope | Gate | Status |
|---|---|---|---|
| **M0 Foundations** | ADRs 0001–0006; PRDs + tech specs for `domain-and-seed-data`, `test-support`, `feature-flags`, `app-shell` (+ design) | QA lead approves the documents | done: documents approved under defaults, **pending your review** |
| **M1 Walking skeleton** | API with seed data, schedule generator, flags, test-support; web shell with web/wap trees; Expo app prebuilt with tab shell; `docker compose up` | All four platforms build and launch locally | done for api/web/wap (Docker); android/ios bundle with Metro and are prebuilt, **native build pending on your machine** |
| **M2 Core flow** | `login`, `browse-and-book`, `my-bookings-and-cancel` on all four platforms | One test body passes on all four platforms; tag `v0.2` | implemented; **gate open** until the framework runs on android/ios; not tagged |
| **M3 Divergent features** | `studio-policies`, `waitlist`, `week-calendar`, `ics-export`, `qr-check-in` | Framework's parity matrix artifact equals the matrix in `CLAUDE.md`; tag `v1.0` | in progress: `waitlist` done; `studio-policies`, `week-calendar`, `ics-export`, `qr-check-in` not started |

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
| studio-policies, week-calendar, ics-export, qr-check-in | — | — | — | — |

## M3 prerequisites (remaining)

- Decide how QR check-in works (does the user show a code, or scan the studio's?) before `/prd qr-check-in`.
