"""iCalendar rendering for one booking (docs/prd/ics-export.md AC-3)."""
from datetime import datetime

from .schedule import ClassSlot


def _stamp(t: datetime) -> str:
    return t.strftime("%Y%m%dT%H%M%SZ")


def render(session_name: str, booking_id: str, slot: ClassSlot, studio_name: str, now: datetime) -> str:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BookIt SUT//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{session_name}-{booking_id}@bookit.test",
        f"DTSTAMP:{_stamp(now)}",
        f"DTSTART:{_stamp(slot.start_at)}",
        f"DTEND:{_stamp(slot.end_at)}",
        f"SUMMARY:{slot.name}",
        f"LOCATION:{studio_name}",
        f"DESCRIPTION:with {slot.instructor}",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\r\n".join(lines) + "\r\n"
