# Design: Login

- Version: 2
- Status: approved
- Date: 2026-09-27
- Implements: docs/prd/login.md v1; uses docs/design/visual-language.md

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes | yes | yes | yes |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| LoginScreen | login | Root, without the app shell | all | — |
| Brand | login | `primary` block: the `Dumbbell` icon + "BookIt" wordmark (`on-primary`), then "Log in to book your classes" | all | — |
| EmailField | login | Label "Email", keyboard type email, no autocapitalize | all | — |
| PasswordField | login | Label "Password", masked | all | — |
| SubmitButton | login | "Log in" | all | `POST /auth/login` |
| ErrorMessage | login | Red text under the button | all | error `message` |

## States

The SubmitButton is the only data-bound component.

| State | Visible | Interactive | Identifiers |
|---|---|---|---|
| idle, a field empty | form | fields; submit disabled | `login.screen`, `login.email.input`, `login.password.input`, `login.submit` |
| idle, both filled | form | fields, submit | same |
| loading | form, spinner inside submit | submit disabled | + `login.submit.loading` |
| error | form + message | fields, submit | + `login.error.message` |
| populated (success) | navigates to schedule | — | `schedule.screen` |

The session-expired message uses `login.error.message` in the idle state.
The next submit clears it.

## Breakpoint behaviour (web vs wap)

One shared tree: the brand block above a white form card.
- **web:** the card is centred, max 400 px wide.
- **wap:** the brand block is full-bleed, with the card overlapping its
  lower edge.

There's no modal, grid or nav on this screen, so ADR 0003 requires no
swap. The root still carries `data-platform`.

## Native behaviour (android / ios)

Same components. The keyboard's return key on password submits.
android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1 | `login.submit` (disabled) |
| AC-2, AC-3 | `login.email.input`, `login.password.input`, `login.submit` → `schedule.screen` |
| AC-4 | `login.submit.loading` |
| AC-5, AC-6, EC-1, EC-5, EC-6 | `login.error.message` |
| AC-7–AC-9, EC-2–EC-4 | API only |

## Open questions

None.

## Changelog

- v2 (M4): branded login: the wordmark, icon and `primary` colour; the form is unchanged, with the same identifiers.
