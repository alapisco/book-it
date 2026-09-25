---
description: Write the UI spec for a BookIt feature and register its identifiers
argument-hint: <feature>
allowed-tools: Read, Write, Edit, Glob, Grep
---

Write the written UI specification for the BookIt feature **$ARGUMENTS** to
`docs/design/$ARGUMENTS.md`, and add its identifiers to
`docs/design/testids.md`.

## Before writing

1. Read `docs/prd/$ARGUMENTS.md`. If it does not exist, stop and tell the
   user to run `/prd $ARGUMENTS` first. The design covers exactly what the
   PRD specifies — no extra components, no extra platforms.
2. Read `CLAUDE.md` (identifier convention, wap rule, parity matrix).
3. Read every file in `docs/design/` for consistent component names and
   patterns, and `docs/design/testids.md` in full. **Reuse** existing
   identifiers for elements that already exist; never create a second id
   for the same element.
4. If the PRD is silent or ambiguous about something the UI must decide
   (copy, which states exist, where an element lives), list it under
   **Open questions** — don't invent it. If the PRD contradicts the parity
   matrix or an existing design, stop and report the conflict.

## Write `docs/design/$ARGUMENTS.md`, with these sections

1. **Header** — feature, `Version: 1`, `Status: draft`, date, and the PRD
   version it implements (`Implements: docs/prd/$ARGUMENTS.md v<N>`).
2. **Platforms** — copied from the PRD's platform support table.
3. **Component inventory** — one row per component: name, screen, purpose,
   platforms, data source (endpoint from the PRD).
4. **States** — for **every** data-bound component, all four states:
   loading, empty, error, populated. For each: what is visible, what is
   interactive, which identifiers are present. If a state is impossible,
   say so and why.
5. **Breakpoint behaviour (web vs wap)** — for each component: the web
   component and the wap component. They must be **different component
   trees** (e.g. modal vs bottom sheet, grid vs stacked list, nav bar vs
   hamburger), selected by `useMediaQuery`. Say which identifiers are
   shared and which are tree-specific.
6. **Native behaviour (android / ios)** — including any `Platform.OS`
   divergence and what renders when a feature is absent on a platform
   (normally: nothing, and no identifier).
7. **Acceptance criteria mapping** — each PRD `AC-n` → the identifiers a
   test would use to verify it.
8. **Open questions**

No visual mockups, colours or pixel values. Written specification only.

## Then append to `docs/design/testids.md`

Add a `## Screen: <screen>` section per new screen (or rows to an existing
screen section) using the registry's table format exactly:
`| \`id\` | element | platforms | $ARGUMENTS.md | notes |`.
Identifiers must be `screen.element.qualifier`, 2–3 segments of
`[a-z][a-z0-9-]*`, and identical across platforms. Don't edit or remove
existing rows except to set the `spec` column of an `(example)` row this
spec now covers.

Touch no other files. Finish by listing the identifiers added and the open
questions.
