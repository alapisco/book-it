# Identifier registry

Source of truth for every `data-testid` (web/wap) and `testID` (React
Native) in this repository. `scripts/check_testids.py` parses this file;
an identifier used in `web/` or `app/` that is not listed here is rejected
by the write hook and the pre-commit hook.

## Rules

- Format `screen.element.qualifier`: 2 or 3 dot-separated segments, each
  matching `[a-z][a-z0-9-]*`.
- One identifier = one logical element, identical string on every platform
  that renders it.
- Add the entry **here first** (via `/design <feature>`), then write code.
- Never rename or delete an entry that the automation framework may use
  without updating the feature's design spec in the same commit.

## Format

One table per screen. The validator reads only the first column of rows
whose first cell is a backticked identifier; every other column is for
humans.

| Column | Meaning |
|---|---|
| `id` | The identifier, in backticks |
| `element` | Kind of element: button, input, link, text, list-item, container, sheet, modal |
| `platforms` | Where it renders: any of `web`, `wap`, `android`, `ios` (`all` = all four) |
| `spec` | Design spec that introduced it (`docs/design/<feature>.md`) |
| `notes` | State it belongs to, repetition, anything a test author needs |

## Screen: login (worked example)

Seeded by hand to establish the format; no `docs/design/login.md` exists
yet. Running `/design login` will write that spec and replace `(example)`.

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `login.screen` | container | all | (example) | Root of the login screen; present in every state |
| `login.email.input` | input | all | (example) | Email field |
| `login.password.input` | input | all | (example) | Password field, masked |
| `login.submit` | button | all | (example) | Disabled while either field is empty or request is in flight |
| `login.submit.loading` | container | all | (example) | Spinner shown inside submit while request is in flight |
| `login.error.message` | text | all | (example) | Rendered only after a failed attempt; text comes from the API error |

## Screen: nav

| id | element | platforms | spec | notes |
|---|---|---|---|---|
| `nav.bar` | container | web | app-shell.md | Top navigation bar on every logged-in screen |
| `nav.menu.toggle` | button | wap | app-shell.md | Opens the drawer |
| `nav.menu.drawer` | container | wap | app-shell.md | Present only while open |
| `nav.menu.close` | button | wap | app-shell.md | Closes the drawer |
| `nav.schedule.link` | link | all | app-shell.md | web: in `nav.bar`; wap: in the open drawer; native: tab button |
| `nav.bookings.link` | link | all | app-shell.md | web: in `nav.bar`; wap: in the open drawer; native: tab button |
