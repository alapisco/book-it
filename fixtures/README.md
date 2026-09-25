# Fixtures

Seed data shared by `api/`, `web/` and `app/`. Owned by `backend-dev`.
Specified in `docs/prd/domain-and-seed-data.md` and `docs/prd/feature-flags.md`.

| File | Contents |
|---|---|
| `studios.json` | Studios and their class templates (weekdays: 0 = Monday; hours are UTC) |
| `schedule-rules.json` | Seasonal rules for the schedule generator |
| `anchors.json` | Anchor classes; `offset_hours` from the session clock floored to the hour at seed time |
| `users.json` | Seed users (all passwords `bookit123`) |
| `bookings.json` | Seed bookings |
| `feature-flags.json` | Platform support matrix |
