# Design: Visual language

- Version: 1
- Status: approved
- Date: 2026-09-27
- Implements: ADR 0008

These are the shared tokens and patterns every screen spec refers to. wap,
android and ios use them at mobile density. Web uses the same colours and
icons at desktop density. Nothing here carries an identifier; identifiers
live in the feature specs.

## Colour

| Token | Value | Use |
|---|---|---|
| `primary` | `#4338CA` (indigo 700) | App bar, primary buttons, active tab, selected pill, links |
| `primary-soft` | `#E0E7FF` | Badges ("Booked", "You're booked"), selected-row tint |
| `on-primary` | `#FFFFFF` | Text and icons on `primary` |
| `text` | `#0F172A` | Body text |
| `muted` | `#475569` | Secondary text: studio, time range, meta |
| `border` | `#E2E8F0` | Card borders, dividers |
| `surface` | `#FFFFFF` | Cards, sheets, tab bar |
| `background` | `#F8FAFC` | Screen background |
| `danger` | `#DC2626` | Errors, "Cancel booking" |

## Availability scale

This is used by every seat label on every platform: schedule cards, week
cards and class detail. The text is always present. Colour never carries
meaning on its own.

| Condition (first match) | Label | Colour |
|---|---|---|
| `has_started` | "Started" | `muted` |
| `is_full` | "Full" | `muted` |
| `spots_left` 1–3 | "1 spot left" / "N spots left" | amber `#B45309` |
| `spots_left` ≥ 4 | "N spots left" | green `#047857` |

## Studio accents

Each studio has an accent colour and a neighbourhood in
`fixtures/studios.json`. The API exposes both as `accent` and
`neighborhood` on `Studio`, and as `studio_accent` and
`studio_neighborhood` on `StudioClass`.

| Studio | Accent | Neighbourhood |
|---|---|---|
| Harbor Yoga | teal `#0F766E` | Chamberí |
| Summit Strength | orange `#C2410C` | Salamanca |
| Ember Dance | rose `#BE185D` | Malasaña |

- A class card shows a 4 px accent bar on its left edge, and the studio
  line reads "Harbor Yoga · Chamberí".
- The accent is decoration only: tests never assert it.

## Icons

- **Set:** [lucide](https://lucide.dev), drawn at 20–24 px with stroke 2.
  Web and wap use `lucide-react`; android and ios use `lucide-react-native`
  (on `react-native-svg`). The same glyph appears everywhere.
- **Colour:** icons inherit the current text colour. Icons in the tab bar
  are `primary` when active and `muted` when inactive.
- **Identifiers:** an icon never carries an identifier. Its parent control
  does.

| Where | Icon |
|---|---|
| Schedule tab / web nav | `CalendarDays` |
| Week tab | `CalendarRange` |
| Bookings tab / web nav | `Ticket` |
| Policies tab / web nav | `ScrollText` |
| Back (app bar) | `ChevronLeft` |
| Previous / next (day, week) | `ChevronLeft` / `ChevronRight` |
| Class detail rows | `MapPin` (studio), `User` (instructor), `Clock` (time), `Users` (spots) |
| Check-in link | `QrCode` |
| Waitlist | `ListOrdered` |
| Export .ics (web) | `CalendarPlus` |
| Login wordmark | `Dumbbell` next to "BookIt" |

## Layout patterns (wap, android, ios)

- **App bar:**
  - A 56 px `primary` bar, safe-area aware.
  - On a tab root it shows the wordmark "BookIt" on the left, with the
    screen title after a `·` separator.
  - On pushed screens (class detail, check-in) it shows a `ChevronLeft`
    back control and the screen title.
- **Bottom tab bar:**
  - A `surface` bar with a top border.
  - Four tabs (icon plus label), in this order: Schedule · Week · Bookings ·
    Policies.
  - wap renders it as a fixed `<nav>`; native uses the Expo Router tabs.
- **Cards:**
  - `surface`, 12 px radius, 1 px `border`, 16 px padding, 12 px gap between
    cards.
  - Separated cards, not hairline rows.
- **Sticky action area:** on class detail, the primary action (Book, Join
  waitlist, or the status badges) sits in a `surface` bar pinned above the
  safe area at the bottom.
- **Bottom sheets:** unchanged pattern, with 16 px top radius and a
  drag-handle bar.
- **Typography:** the system font.

  | Role | Size and weight |
  |---|---|
  | Screen title (app bar) | 18 semibold |
  | Section heading | 13 semibold, uppercase, `muted` |
  | Card title | 16 semibold |
  | Meta | 13 regular, `muted` |

## Desktop web

- **Nav:** the top nav bar, with the wordmark and icon + label links for
  Schedule, Bookings and Policies. There is no Week link (see
  `week-calendar`).
- **Density:** grids, tables and modals as today. Cards gain the studio
  accent bar and the availability colours.

## Time and date formats (ADR 0007)

| Where | Format | Source |
|---|---|---|
| Card time range | `07:00–08:00` | `start_local`, `end_local` |
| Single time | `07:00` | `*_local` |
| Date | `Sat 26 Sep 2026` | local date |
| Date + time | `Sat 26 Sep 2026 · 07:00` | local |
| Week range | `21 – 27 Sep 2026` (spanning months: `28 Sep – 4 Oct 2026`) | `week_start`, `week_end` |

There is no zone suffix anywhere.
