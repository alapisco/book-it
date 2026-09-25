# ADR 0002: One identifier string per element on every platform

- Status: accepted
- Date: 2026-09-25

## Context

The framework runs one test body on all four platforms. It maps a platform
to a locator strategy, but it can only do that if an element's name is the
same on every platform.

## Decision

- **Format:** every interactive or asserted element carries an identifier
  of the form `screen.element.qualifier`. That is 2–3 dot-separated
  segments, each `[a-z][a-z0-9-]*`.
- **Attributes:** web and wap use `data-testid`. React Native uses
  `testID`. React Navigation tab buttons use `tabBarButtonTestID`. The
  string is identical everywhere.
- **Literals only:** identifiers are string literals at the attribute. No
  template strings, computed values or imported constants. Layout
  primitives (modal, sheet) never carry identifiers themselves; the content
  passed into them carries the literal.
- **Repeated elements share an identifier:** list rows all have the same
  one, and tests index them.
- **Registry:** `docs/design/testids.md` is the registry. An entry is
  added by `/design` before any code uses it.
- **Enforcement:** `scripts/check_testids.py` enforces all of this, via a
  Claude Code `PreToolUse` hook and via `.githooks/pre-commit`.

## Consequences

- Shared components can't take an identifier as a prop. This is a
  deliberate cost; it keeps every identifier greppable and checkable.
- An element that exists only on some platforms is registered with those
  platforms. On the others, the identifier is absent, which tests can assert.
