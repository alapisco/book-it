"""Per-test-session state (ADR 0006) and the session clock (ADR 0005)."""
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from .fixtures import ANCHORS, SEED_BOOKINGS, USERS
from .models import ChaosConfig
from .schedule import ClassSlot

SESSION_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class Booking:
    id: str
    user_id: str
    class_id: str
    created_at: datetime


class SessionState:
    def __init__(self, name: str, now: datetime,
                 clock_frozen_at: datetime | None = None,
                 clock_offset: timedelta = timedelta(0)):
        self.name = name
        self.clock_frozen_at = clock_frozen_at
        self.clock_offset = clock_offset
        self.users = {u["id"]: u for u in USERS}
        self.tokens: dict[str, str] = {}
        self.bookings = {
            b["id"]: Booking(b["id"], b["user_id"], b["class_id"], now) for b in SEED_BOOKINGS
        }
        self.next_booking_seq = 1
        self.filler_overrides: dict[str, int] = {}
        self.chaos = ChaosConfig()
        t0 = now.replace(minute=0, second=0, microsecond=0)
        self.anchors = {
            a["id"]: ClassSlot(
                id=a["id"],
                studio_id=a["studio_id"],
                name=a["name"],
                category=a["category"],
                instructor=a["instructor"],
                start_at=t0 + timedelta(hours=a["offset_hours"]),
                duration_min=a["duration_min"],
                capacity=a["capacity"],
                filler=a["filler"],
                is_outdoor=False,
                is_anchor=True,
            )
            for a in ANCHORS
        }

    def now(self) -> datetime:
        return self.clock_frozen_at or utcnow() + self.clock_offset


STORE: dict[str, SessionState] = {}


def get_session(name: str, now: datetime) -> SessionState:
    if name not in STORE:
        STORE[name] = SessionState(name, now)
    return STORE[name]


def reset_session(old: SessionState, now: datetime) -> SessionState:
    """Re-seed the session, keeping its clock."""
    STORE[old.name] = SessionState(old.name, now, old.clock_frozen_at, old.clock_offset)
    return STORE[old.name]
