# Design: Waitlist

- Version: 2
- Status: draft (M4, awaiting review)
- Date: 2026-09-27
- Implements: docs/prd/waitlist.md v3; uses docs/design/visual-language.md

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| yes | yes | yes | **no**: no waitlist component renders, and no waitlist identifier exists |

Every component below renders only where the `waitlist` flag is true.

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| JoinWaitlistButton | class | "Join waitlist", under the "Class full" badge | web, wap, android | `POST /classes/{id}/waitlist` |
| WaitlistPosition | class | "You're #N on the waitlist", under the "Class full" badge | web, wap, android | `StudioClass.my_waitlist_position` |
| WaitlistSection | bookings | "Waitlist" heading and entries, below the confirmed bookings | web, wap, android | `GET /me/waitlist` |
| WaitlistTable | bookings | `<table>` with Class / When / Position / (action) columns | web | `GET /me/waitlist` |
| WaitlistList | bookings | Stacked cards | wap, android | `GET /me/waitlist` |
| WaitlistItem | bookings | Name, when, "#N on the waitlist", "Leave waitlist" | web, wap, android | `WaitlistEntry` |

## States

**Class detail action area.** This extends `browse-and-book`. The first
match wins:
1. booked
2. started
3. **full**: `class.full.badge`, plus:
   - `class.waitlist.position` if `my_waitlist_position` is set,
   - otherwise `class.waitlist.join`, where the flag is true
4. Book

| JoinWaitlistButton state | Visible | Identifiers |
|---|---|---|
| idle | "Join waitlist" | `class.waitlist.join` |
| loading | spinner inside the button; button disabled | + `class.waitlist.loading` |
| error | API `message` under the button, which stays enabled | + `class.waitlist.error` |
| success | the class reloads and the position text replaces the button | `class.waitlist.position` |

"Empty" doesn't apply to the join button. `WaitlistPosition` isn't
fetched on its own; it renders with class detail's own states.

**WaitlistSection.** It is loaded together with the bookings, so it
shares their loading state (`bookings.loading`) and error state
(`bookings.error`) (`my-bookings-and-cancel`).

| State | Visible | Identifiers |
|---|---|---|
| loading / error | covered by the bookings screen states | — |
| empty (no entries) | the section is not rendered | none of `waitlist.*` |
| populated | heading "Waitlist" and the entries | `waitlist.section`, `waitlist.table` or `waitlist.list`, `waitlist.item` × N |

A waitlist item contains:
- `waitlist.item.name`
- `waitlist.item.time` (`Sat 26 Sep 2026 · 07:00`, studio local time)
- `waitlist.item.position` ("#2 on the waitlist")
- `waitlist.item.leave` ("Leave waitlist")

Leaving calls the API directly, without a confirmation dialog:
- **loading:** `waitlist.leave.loading` shows inside that item's button,
  and the button is disabled.
- **error:** `waitlist.leave.error` shows the API message at the top of
  the section.
- **success:** the section reloads.

## Breakpoint behaviour (web vs wap)

| Component | web (≥ 768 px) | wap (< 768 px) |
|---|---|---|
| Waitlist container | `<table>` as `waitlist.table`, where each `<tr>` is `waitlist.item` | `<ul>` as `waitlist.list`, where each `<li>` card is `waitlist.item` |
| Join / position on class detail | shared component | shared component |

## Native behaviour (android / ios)

- **android:** the class screen action area and the bookings screen
  render as above. The container is `waitlist.list`.
- **ios:** guarded by `flags.waitlist === false`:
  - A full class shows `class.full.badge` only.
  - The bookings screen renders no waitlist section and never calls
    `/me/waitlist`.
- Both OSes share one codebase, and the guard is the flag, not a separate
  file.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-1, AC-4 | `class.full.badge`, `class.waitlist.join`, absence of `class.book.button` |
| AC-2, AC-3 | `class.waitlist.join`, `class.waitlist.loading`, `class.waitlist.position` |
| AC-5, AC-7 | `waitlist.section`, `waitlist.item`, `waitlist.item.name`, `waitlist.item.time`, `waitlist.item.position` |
| AC-6 | `waitlist.item.leave`, `waitlist.leave.loading`, `waitlist.leave.error` |
| AC-8, AC-9, EC-10, EC-11 | API; `bookings.item` for the promoted user |
| AC-10, AC-11 | ios: `class.full.badge` present, every `class.waitlist.*` and `waitlist.*` absent |
| AC-12 | `booking.confirm.error`, `booking.confirm.dismiss`, `class.full.badge`, `class.waitlist.join` |
| EC-2–EC-7 | `class.waitlist.error` |
| EC-8 | `waitlist.leave.error` |
| EC-9 | `login.screen`, `login.error.message` |

## Open questions

None.

## Changelog

- v2 (M4): local times; the Join waitlist button uses the `ListOrdered` icon and lives in the class detail sticky action area on wap/android.
