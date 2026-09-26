"""Studio local time (ADR 0007). Every studio shares one zone; the API stays
UTC and adds naive local strings so clients never do time-zone maths."""
from datetime import date, datetime
from zoneinfo import ZoneInfo

from .fixtures import STUDIOS

TZ = ZoneInfo(STUDIOS[0]["timezone"])  # all studios share it (fixtures/studios.json)


def to_local(dt: datetime) -> str:
    """UTC instant -> "YYYY-MM-DDTHH:MM:SS" wall-clock time at the studios."""
    return dt.astimezone(TZ).replace(tzinfo=None).isoformat(timespec="seconds")


def local_date(dt: datetime) -> date:
    return dt.astimezone(TZ).date()
