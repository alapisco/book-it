# Fixtures

Seed data shared by `api/`, `web/` and `app/`. Owned by `backend-dev`.
Specified in `docs/prd/domain-and-seed-data.md`, `docs/prd/feature-flags.md` and `docs/prd/waitlist.md`.

| File | Contents |
|---|---|
| `studios.json` | Studios, their class templates (weekdays: 0 = Monday; hours are UTC) and QR scanner keys |
| `schedule-rules.json` | Seasonal rules for the schedule generator |
| `anchors.json` | Anchor classes; `offset_hours` from the session clock floored to the hour at seed time |
| `users.json` | Seed users (passwords `bookit123`); guests (`"guest": true`) have no password and exist only to hold waitlist places |
| `bookings.json` | Seed bookings |
| `waitlist.json` | Seed waitlist entries, in queue order (`docs/prd/waitlist.md`) |
| `feature-flags.json` | Platform support matrix |
| `policies.json` | Studio policies (`docs/prd/studio-policies.md`) |
