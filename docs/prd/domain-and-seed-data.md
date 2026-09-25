# PRD: Domain and seed data

- Version: 1
- Status: approved (defaults)
- Date: 2026-09-25

## Summary

This PRD defines the BookIt entities (studios, classes, bookings, users)
and the seed state every test session starts from. The schedule is
generated deterministically for any date. A fixed set of anchor classes
and users gives tests guaranteed state.

## Platform support

| Platform | Support | Reason |
|---|---|---|
| web | yes | Every platform shows the same data; divergence is in features, not data. |
| wap | yes | Same as web. |
| android | yes | Same as web. |
| ios | yes | Same as web. |

## Glossary

- **Studio:** a venue with its own class templates.
- **Class:** one scheduled occurrence of a template at a start time, with a capacity.
- **Booking:** one user holding one seat in one class.
- **Upcoming booking:** a booking whose class `start_at` is after now.
- **Now:** the test session's clock (ADR 0005).
- **Cancellation cutoff:** 12 hours before `start_at`. A class is
  *inside the cancellation window* when fewer than 12 hours remain;
  cancelling is refused there.
- **Booking limit:** 3 upcoming bookings per user.

## User stories

- **US-1** As a test author, I want any date to have a schedule, so that tests never run out of classes.
- **US-2** As a test author, I want the same date to always produce the same classes, so that assertions are stable across runs and machines.
- **US-3** As a test author, I want anchor classes with fixed IDs, so that tests needing a full class, a last seat, or a locked or open cancellation have guaranteed state.
- **US-4** As a test author, I want three seed users with known booking states, so that tests need no setup to reach "has bookings", "has none" and "at the limit".
- **US-5** As a test author, I want seasonal variation, so that date-dependent tests have something to find.

## Acceptance criteria

- **AC-1** (US-1) `GET /schedule?date=D` returns `200` for every valid date D from `1970-01-01` to `2999-12-31`.
- **AC-2** (US-2) Two requests for the same date, from different test sessions or after an API restart, return identical `id`, `name`, `instructor`, `start_at` and `capacity` for every generated class. `spots_left` is also identical when neither session has bookings on that date.
- **AC-3** (US-2) A generated class id has the form `<studio_id>-<YYYYMMDD>-<HHMM>-<template_slug>`. `GET /classes/{id}` returns that class for any id the schedule has returned.
- **AC-4** (US-5) Classes of an outdoor template appear only on dates in May–September.
- **AC-5** (US-5) On January dates, every template marked `january_early` also has a 06:00 UTC class on the days it runs.
- **AC-6** (US-5) Over all dates in August 2027, the number of generated classes per studio is less than 70% of the count for July 2027.
- **AC-7** (US-3) After `POST /test/reset`, the four anchors exist. Their start times are relative to the session clock, floored to the hour (`T0`):

  | id | Studio | Name | Start | Capacity | spots_left after reset |
  |---|---|---|---|---|---|
  | `anchor-full` | summit | Full House Spin | T0 + 72h | 10 | 0 |
  | `anchor-last-seat` | harbor | Last Seat Pilates | T0 + 48h | 8 | 1 |
  | `anchor-cancel-closed` | ember | Late Cancel Barre | T0 + 6h | 12 | 6 |
  | `anchor-cancel-open` | harbor | Early Cancel Yoga | T0 + 96h | 12 | 6 |

- **AC-8** (US-3) Anchors appear in `GET /schedule` for the date of their `start_at`, with `is_anchor: true`.
- **AC-9** (US-4) After reset, the seed users hold exactly these bookings. All passwords are `bookit123`.

  | User id | Email | Name | Bookings | Upcoming |
  |---|---|---|---|---|
  | `u-ava` | ava@bookit.test | Ava Lopez | `anchor-cancel-open`, `anchor-cancel-closed` | 2 |
  | `u-ben` | ben@bookit.test | Ben Okafor | none | 0 |
  | `u-cara` | cara@bookit.test | Cara Novak | `anchor-full`, `anchor-cancel-open`, `anchor-cancel-closed` | 3 (at limit) |

- **AC-10** Three studios exist, each with a different class mix:

  | id | Name | Templates |
  |---|---|---|
  | `harbor` | Harbor Yoga | Vinyasa Flow, Yin Yoga, Mat Pilates, Beach Yoga (outdoor) |
  | `summit` | Summit Strength | HIIT Circuit, Power Spin, Barbell Strength, Park Bootcamp (outdoor) |
  | `ember` | Ember Dance | Salsa Basics, Barre Burn, Hip-Hop Cardio, Deep Stretch, Rooftop Salsa (outdoor) |

## Error and edge cases

| ID | Trigger | Expected |
|---|---|---|
| EC-1 | `GET /schedule?date=2026-13-01` | `422 VALIDATION_ERROR` |
| EC-2 | `GET /classes/nonexistent` | `404 CLASS_NOT_FOUND` |
| EC-3 | `GET /classes/harbor-20260926-0655-vinyasa`: well-formed but not generated | `404 CLASS_NOT_FOUND` |
| EC-4 | Clock advanced past an anchor's `start_at` | Anchor still exists, with `has_started: true` |

## API requirements

- `GET /studios` → list of `{id, name, description}`.
- Class fields: `id`, `studio_id`, `studio_name`, `name`, `category`,
  `instructor`, `start_at`, `end_at`, `duration_min`, `capacity`,
  `spots_left`, `is_full`, `has_started`, `is_outdoor`, `is_anchor`,
  `my_booking_id` (the caller's booking id, or `null`).
- The error body follows ADR 0004.
- The schedule, class and booking endpoints themselves are specified in
  `browse-and-book` and `my-bookings-and-cancel`.

## Test-support needs

`POST /test/reset` re-seeds the users, bookings and anchors
(`test-support`). The session clock places the anchors.

## Out of scope

- Studio time zones (everything is UTC, per ADR 0005).
- Creating studios, classes or users through the API.
- Instructor profiles.

## Decisions taken by default (review)

1. Booking limit = 3 upcoming bookings; cancellation cutoff = 12 hours.
2. Anchors are placed at seed time relative to the session clock floored
   to the hour. They don't move when the clock advances later.
3. Seats taken by people other than the seed users are "filler": a
   number, not bookings.
4. A class leaves "upcoming" at `start_at`, not at `end_at`.
