# ADR 0004: The API contract is generated from code and consumed as types

- Status: accepted
- Date: 2026-09-25

## Context

Three clients (the web SPA, the native app and the test framework) must
agree on request and response shapes. A hand-written spec drifts from the
code.

## Decision

- **Source:** pydantic models and FastAPI routes in `api/` are the source.
  `python api/export_openapi.py` writes `docs/api/openapi.json`. The file
  is never hand-edited.
- **Clients:** `web/` and `app/` each run `npm run gen:api`, which runs
  `openapi-typescript` to produce `src/api-schema.ts`. Clients use those
  types and plain `fetch`; they never declare their own request or
  response interfaces.
- **Errors:** every non-2xx response has the body
  `{"error": {"code": "<UPPER_SNAKE>", "message": "<human text>"}}`.
  Clients show `message` verbatim, and tests assert on `code`.

## Consequences

- A contract change is a backend change plus two regenerated type files,
  all in the same PR.
- The framework can generate its own pydantic or requests clients from
  the same file.
