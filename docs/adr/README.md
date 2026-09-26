# Architecture decision records

One file per cross-cutting decision, numbered, never renumbered. Change a
decision by adding a new ADR that supersedes the old one; don't edit the
old one's Decision section.

Statuses: `proposed` → `accepted` → `superseded by NNNN`.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-architecture.md) | Three deployables, one repo, in-memory backend | accepted |
| [0002](0002-identifier-convention.md) | One identifier string per element on every platform | accepted |
| [0003](0003-wap-component-tree.md) | wap is a separate component tree, not a responsive layout | accepted; amended by 0008 |
| [0004](0004-generated-api-contract.md) | The API contract is generated from code and consumed as types | accepted |
| [0005](0005-time-and-determinism.md) | UTC everywhere, a controllable clock, a pure schedule | accepted; display rule superseded by 0007 |
| [0006](0006-test-session-isolation.md) | All state is namespaced by test session | accepted |
| [0007](0007-studio-local-time.md) | Show studio local time (Europe/Madrid); keep UTC underneath | accepted |
| [0008](0008-wap-mirrors-native.md) | wap follows the native apps; desktop web is the outlier | accepted |
