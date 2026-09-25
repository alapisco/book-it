---
description: Write the engineering tech spec for a BookIt feature to docs/tech/<feature>.md
argument-hint: <feature>
allowed-tools: Read, Write, Edit, Glob, Grep
---

Write the technical specification for the BookIt feature **$ARGUMENTS** to
`docs/tech/$ARGUMENTS.md`. The tech spec translates the approved PRD and UI
design into an implementation plan the three roles (`backend-dev`,
`web-dev`, `mobile-dev`) can follow without making product decisions.

## Before writing

1. Read `docs/prd/$ARGUMENTS.md`. If it does not exist, stop and tell the
   user to run `/prd $ARGUMENTS` first.
2. Read `docs/design/$ARGUMENTS.md` if the feature has UI. If it has UI and
   no design spec exists, stop and tell the user to run
   `/design $ARGUMENTS` first. Cross-cutting features with no UI (seed
   data, test support) need no design spec.
3. Read `CLAUDE.md`, every ADR in `docs/adr/`, and every existing file in
   `docs/tech/`. Reuse models, error codes and patterns they define. A new
   cross-cutting decision gets a new ADR proposal under **Open questions**
   rather than being decided silently here.
4. Read `docs/api/openapi.json` and the code in `api/`, `web/` and `app/`
   that the feature touches, so the plan extends what exists.
5. Anything the PRD or design leaves undecided goes under **Open
   questions**. Don't resolve product questions here.

## Write only `docs/tech/$ARGUMENTS.md`, with these sections

1. **Header**: feature, `Version: 1`, `Status: draft`, date, and
   `Implements: docs/prd/$ARGUMENTS.md v<N>, docs/design/$ARGUMENTS.md v<N>`.
2. **Overview**: what changes in each deployable, in 3–6 bullets.
3. **API contract**: every endpoint (method, path, auth, request model,
   response model, status codes, error codes) and every pydantic model
   (field, type, meaning). This is what `backend-dev` implements;
   `docs/api/openapi.json` is regenerated from the code afterwards.
4. **State and rules**: what the in-memory store holds per test session,
   and the order in which validation rules run (this decides which error a
   test sees when several apply).
5. **Implementation by platform**: `api`, `web`, `wap`, `android`, `ios`.
   For each: files or modules touched, component tree (web vs wap must
   differ per ADR 0003), and `Platform.OS` or feature-flag guards.
6. **Identifiers**: the registry entries this feature uses, by reference
   to `docs/design/testids.md` (don't redefine them).
7. **Test-support hooks**: which anchors, seed users, clock controls and
   chaos toggles the PRD acceptance criteria rely on, and how a test puts
   the SUT into each state.
8. **Traceability**: each PRD `AC-n` / `EC-n` → endpoint(s) and component(s).
9. **Open questions**

No code listings beyond short signatures. Touch no other file. Finish by
listing the open questions for the user.
