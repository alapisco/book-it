# ADR 0008: wap follows the native apps; desktop web is the outlier

- Status: accepted
- Date: 2026-09-27
- Amends: [ADR 0003](0003-wap-component-tree.md). wap is still a separate component tree; this ADR decides which patterns that tree uses.

## Context

ADR 0003 gave wap its own tree but chose desktop-flavoured mobile
patterns, a hamburger and a drawer, while the native apps use bottom
tabs. Real products converge their mobile web and native apps, and mobile
is where most users are. Two divergent mobile surfaces also give the
framework more to abstract with no benefit.

## Decision

- **wap uses the native apps' patterns and visual language:**
  - a purple app bar at the top and a bottom tab bar
  - card lists and bottom sheets
  - the same icons (lucide)
  - the same tab order: Schedule · Week · Bookings · Policies
- **Desktop web is the outlier:** a top nav bar, grids, tables, modals and
  a wide layout.
- **Tree swaps from ADR 0003 that still hold:**

  | | web | wap |
  |---|---|---|
  | Navigation | nav bar | bottom tabs, instead of the hamburger |
  | Lists | grid or table | card list |
  | Dialogs | modal | bottom sheet |
  | Policies | tabs | accordion |

- **Retired:** the hamburger and drawer (`nav.menu.toggle`,
  `nav.menu.drawer`, `nav.menu.close`).
- **Shared identifiers:** wap and native share the tab identifiers
  `nav.<tab>.link`, so one navigation step serves wap, android and ios.
- **One visual language,** specified in `docs/design/visual-language.md`:
  - colours and the availability scale
  - studio accents
  - icons, spacing and card style

  Web follows the same colours and icons at desktop density.

## Consequences

- One navigation test body covers wap, android and ios. Web keeps its own.
- The drawer's open/close interaction is gone as a test surface.
- Features can now diverge *between web and wap in the same build* in
  both directions: `.ics` export on web only, week view on wap only. That
  sharpens the "wap is a platform, not a viewport" test.
