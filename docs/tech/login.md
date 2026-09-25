# Tech spec: Login

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25
- Implements: docs/prd/login.md v1, docs/design/login.md v1

## Overview

- **api:** `routes/auth.py` provides `POST /auth/login` and `GET /me`.
  `auth.py` provides the `current_user` dependency used by every product
  endpoint.
- **web:** `pages/LoginPage.tsx`; the token goes in
  `localStorage["bookit.token"]`, with a gate in `shell/Layout.tsx`.
- **android/ios:** `src/app/login.tsx`; the token is a module variable in
  `src/api.ts`, with a gate in `(tabs)/_layout.tsx`.

## API contract

| Model | Fields |
|---|---|
| `LoginRequest` | `email: str`, `password: str` |
| `LoginResponse` | `token: str`, `user: User` |
| `User` | `id`, `email`, `name: str`, `booking_limit: int`, `upcoming_booking_count: int` |

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `POST /auth/login` | none | `200 LoginResponse` | `401 INVALID_CREDENTIALS`, `422 VALIDATION_ERROR` |
| `GET /me` | bearer | `200 User` | `401 UNAUTHORIZED`, `401 TOKEN_EXPIRED` |

## State and rules

**Login:**
- The email is normalised with `strip().lower()` and matched against
  `session.users`. The password must match exactly.
- On success: `token = "tok_" + secrets.token_hex(12)`, and
  `session.tokens[token] = user_id`.

**`current_user` order:**
1. If chaos `expire_tokens` is on → `401 TOKEN_EXPIRED`.
2. If the `Authorization: Bearer <t>` header is missing, or `t` is not in
   `session.tokens` → `401 UNAUTHORIZED`.

**Derived fields:** `upcoming_booking_count` counts the user's bookings
whose class `start_at > now`.

## Implementation by platform

**api:** `bookit/auth.py` holds the `current_user` dependency, which
returns `(Ctx, user)`. `bookit/routes/auth.py` holds the routes.

**web/wap:**
- `api.ts` gains `getToken`, `setToken` and `clearToken`, and attaches
  `Authorization`.
- On a `401` outside `/auth/login`, it clears the token and does
  `location.assign('/login' + (code === 'TOKEN_EXPIRED' ? '?reason=expired' : ''))`.
- `LoginPage` holds `email`, `password`, `submitting` and `error` in
  `useState`. On success it calls `setToken` and then navigates to
  `/schedule` with `replace`.
- `Layout` renders `<Navigate to="/login">` when `getToken()` is null.

**android/ios:**
- `api.ts` gains the same token functions, and on a `401` calls
  `router.replace({pathname: '/login', params: reason ? {reason} : {}})`.
- `login.tsx` mirrors the web page, using `TextInput`
  (`autoCapitalize="none"`, `keyboardType="email-address"`,
  `secureTextEntry`) and `Pressable`.
- `(tabs)/_layout.tsx` renders `<Redirect href="/login">` when there's no
  token.

## Identifiers

`docs/design/testids.md` § login (`login.*`).

## Test-support hooks

Seed users (`domain-and-seed-data` AC-9), reset, and chaos `expire_tokens`.

## Traceability

| PRD | Where |
|---|---|
| AC-1–AC-6, EC-5, EC-6 | `LoginPage.tsx`, `login.tsx` |
| AC-7, AC-9, EC-1, EC-2 | `routes/auth.py` |
| AC-8, EC-3, EC-4 | `auth.current_user` |

## Open questions

None.
