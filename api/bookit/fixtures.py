"""Shared seed data from fixtures/, loaded once at startup."""
import json
import os
from pathlib import Path

FIXTURES_DIR = Path(
    os.environ.get("BOOKIT_FIXTURES_DIR", Path(__file__).resolve().parents[2] / "fixtures")
)


def _load(name):
    return json.loads((FIXTURES_DIR / name).read_text(encoding="utf-8"))


STUDIOS = _load("studios.json")
STUDIOS_BY_ID = {s["id"]: s for s in STUDIOS}
RULES = _load("schedule-rules.json")
ANCHORS = _load("anchors.json")
USERS = _load("users.json")
SEED_BOOKINGS = _load("bookings.json")
FEATURE_FLAGS = _load("feature-flags.json")
