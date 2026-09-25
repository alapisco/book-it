# PRD: Login

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25

## Summary

A user signs in with email and password, receives a fake bearer token, and
lands on the schedule. The token authenticates every product endpoint in
the caller's test session.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Core flow; parity matrix. |
| wap | yes | Core flow. No wap-specific tree: the screen has no modal, grid or nav. |
| android | yes | Core flow. |
| ios | yes | Core flow. |

## User stories

- **US-1** As a user, I want to log in with my email and password, so that I can book classes.
- **US-2** As a user, I want a clear message when my credentials are wrong, so that I can correct them.
- **US-3** As a user whose session expired, I want to be told why I'm back on the login screen.

## Acceptance criteria

- **AC-1** (US-1) The submit button is disabled while the email or password field is empty.
- **AC-2** (US-1) Submitting `ava@bookit.test` / `bookit123` shows the schedule screen.
- **AC-3** (US-1) Email matching is case-insensitive and ignores surrounding whitespace: ` AVA@bookit.test ` logs in as Ava.
- **AC-4** (US-1) While the request is in flight, the submit button is disabled and a loading indicator is shown inside it.
- **AC-5** (US-2) Submitting a wrong password or an unknown email shows "Email or password is incorrect." The fields keep their values, and the user stays on the login screen.
- **AC-6** (US-3) Arriving at login because of `401 TOKEN_EXPIRED` shows "Your session has expired. Please log in again." before any submit.
- **AC-7** `POST /auth/login` returns `200 {token, user}`. `GET /me` with `Authorization: Bearer <token>` returns that user.
- **AC-8** Every product endpoint except `/auth/login`, `/flags*`, `/health` and `/test/*` returns `401 UNAUTHORIZED` without a valid token.
- **AC-9** Logging in twice issues two different tokens, and both stay valid until reset.

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | Wrong password | `401 INVALID_CREDENTIALS`, message "Email or password is incorrect." |
| EC-2 | Missing `password` field | `422 VALIDATION_ERROR` |
| EC-3 | Token from another test session | `401 UNAUTHORIZED` |
| EC-4 | Chaos `expire_tokens: true` | `401 TOKEN_EXPIRED` on product endpoints; `/auth/login` still succeeds, but the new token is also refused |
| EC-5 | API unreachable | "Could not reach the server." under the form |
| EC-6 | Chaos `error_status: 500` | "Something went wrong." under the form |

## API requirements

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/auth/login` | `{email: str, password: str}` | `200 {token: str, user: User}` |
| GET | `/me` | — | `200 User` |

`User`: `id`, `email`, `name: str`; `booking_limit: int` (3);
`upcoming_booking_count: int`.

## Test-support needs

The seed users, reset (which invalidates tokens), and the chaos
`expire_tokens` and `error_status` toggles.

## Out of scope

Logout, registration, password reset, remembering the user across app
restarts on native.

## Decisions taken by default (review)

1. Tokens are opaque random strings, stored per test session.
2. Login is one shared tree on web and wap (per `app-shell`).
