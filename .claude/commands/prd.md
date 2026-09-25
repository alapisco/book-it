---
description: Write the PRD for a BookIt feature to docs/prd/<feature>.md
argument-hint: <feature>
allowed-tools: Read, Write, Edit, Glob, Grep
---

Write the product requirements document for the BookIt feature **$ARGUMENTS**
to `docs/prd/$ARGUMENTS.md`.

## Before writing

1. Read `CLAUDE.md` — especially the parity matrix. The platform support
   decision must match it; if the matrix doesn't cover this feature, stop
   and ask rather than decide.
2. Read every existing file in `docs/prd/` and match their structure,
   terminology, entity names and ID conventions. Reuse existing error
   codes and endpoints rather than inventing parallel ones.
3. Read `docs/api/openapi.json` if it has content, and `fixtures/`, so
   API requirements extend what exists.
4. If `$ARGUMENTS` is empty or the intent is unclear, ask what the feature
   is. If a requirement can't be settled from the matrix, the task
   brief or existing PRDs, list it under **Open questions** — never invent
   an answer.

## Write only `docs/prd/$ARGUMENTS.md`, with these sections

1. **Header** — feature name, `Version: 1`, `Status: draft`, date.
   (When revising, bump the version and add a changelog line at the end.)
2. **Summary** — two or three sentences.
3. **Platform support** — a row for `web`, `wap`, `android`, `ios`, each
   `yes` / `no` / `webview`, each with a stated reason. Divergence is
   deliberate; say why it exists for the test framework.
4. **User stories** — `As a <user>, I want <goal>, so that <benefit>`,
   numbered `US-1`, `US-2`…
5. **Acceptance criteria** — numbered `AC-1`, `AC-2`…, each traced to a
   story, each an **objectively testable** statement (Given/When/Then or a
   single observable assertion). Name exact values: counts, status codes,
   field values, times relative to the controllable clock.
   **Banned words**: fast, quick, easy, intuitive, simple, user-friendly,
   seamless, appropriate, reasonable, properly, clearly, nice, robust,
   graceful(ly), etc. Replace any such adjective with a measurable fact.
6. **Error and edge cases** — numbered `EC-1`…: trigger, expected
   response (status code, error code, visible result).
7. **API requirements** — endpoints, methods, request/response fields and
   types, status codes, error codes. Describe the contract; `backend-dev`
   implements it and the OpenAPI spec is generated from the code.
8. **Test-support needs** — which of `/test/reset`, `X-Test-Session`,
   clock control, chaos toggles, anchor classes, seed users the ACs rely on.
9. **Out of scope**
10. **Open questions** — anything you could not decide from the sources.

Do not write UI layout or identifiers — that is `/design`. Do not touch
any other file. Finish by listing the open questions for the user.
