# ADR 0003: wap is a separate component tree, not a responsive layout

- Status: accepted; patterns amended by [0008](0008-wap-mirrors-native.md)
- Date: 2026-09-25

## Context

If wap were the web DOM with different CSS, the framework would have
nothing to abstract over. A real mobile web experience uses different
interaction patterns.

## Decision

- **Selection:** the web app picks a tree at runtime with
  `useMediaQuery('(max-width: 767px)')`. A match means wap; otherwise it's web.
- **Pattern swaps** for wap:
  - bottom sheet instead of modal
  - stacked list instead of grid or table
  - hamburger and drawer instead of a nav bar
- **Visibility:** the root element carries `data-platform="web"` or
  `data-platform="wap"`, so a test can assert which tree it got.
- **Tailwind:** responsive classes may style within a tree. They never
  replace a tree swap.
- **Identifiers:** a logical element keeps its identifier in both trees,
  e.g. `schedule.class.card`. The containers differ, e.g. `schedule.grid`
  vs `schedule.list` and `booking.confirm.modal` vs `booking.confirm.sheet`.

## Consequences

- Each design spec has a "Breakpoint behaviour" section that names both trees.
- Resizing across 768px swaps trees and drops the component state inside
  them. Tests must not resize mid-flow.
