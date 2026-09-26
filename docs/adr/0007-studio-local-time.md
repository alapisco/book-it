# ADR 0007: Show studio local time (Europe/Madrid); keep UTC underneath

- Status: accepted
- Date: 2026-09-27
- Supersedes: the display rule of [ADR 0005](0005-time-and-determinism.md). Its clock and schedule rules still stand.

## Context

ADR 0005 made every UI show times as `HH:MM UTC`. That made results
deterministic, but no real booking app shows "UTC", and users attend
classes in person, so the studio's clock is what matters.

Two options were rejected:
- **The device's time zone.** Results would depend on the machine, so
  every browser, emulator and simulator would have to be pinned to a zone.
- **A user-chosen time zone.** That's a new feature outside the parity
  matrix.

## Decision

- **One zone for every studio:** `Europe/Madrid`, declared in
  `fixtures/studios.json` as `timezone`. The city is data only. The UI
  never names it and shows no zone suffix: "07:00", not "07:00 CEST".
- **Class templates are local times.** The 07:00 Vinyasa runs at 07:00
  Madrid time all year, and its UTC time moves by an hour when daylight
  saving changes. A class id keeps its format
  (`<studio>-<YYYYMMDD>-<HHMM>-<slug>`), with the local date and time.
- **`date` means the studio's local date.** That applies to `GET /schedule`,
  `GET /schedule/week` and each client's default "today".
- **The API does the conversion; clients never do time-zone maths:**
  - Every timestamp stays ISO 8601 UTC (`...Z`). That covers `start_at`,
    `end_at`, `now`, the clock, `X-Test-Now` and the `.ics` file.
  - `StudioClass` gains `start_local` and `end_local`: naive local strings,
    `YYYY-MM-DDTHH:MM:SS`.
  - Other time fields shown to users (the check-in window, `checked_in_at`)
    get `_local` twins.
  - Clients format those strings directly, never through `Intl` or the
    device zone.
- **Test hooks are unchanged.** The session clock, anchors placed
  relative to it, and `X-Test-Now` all work in UTC.

## Consequences

- The display is the same on every machine, as ADR 0005 required. The UI
  just stops saying "UTC".
- Madrid observes daylight saving (UTC+1 in winter, UTC+2 in summer,
  switching on the last Sunday of March and of October at 02:00–03:00
  local). Classes run between 06:00 and 21:30, so none falls in a skipped
  or repeated hour. "The day the clocks change" becomes a legitimate test
  case, reachable with the clock hooks.
- A test that asserts a UTC instant must convert it. A test that asserts
  what the user sees compares against `start_local`.
- The `.ics` file stays in UTC, and calendar apps convert it correctly.
