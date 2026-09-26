"""Check-in codes and window (docs/tech/qr-check-in.md)."""
import hashlib
from datetime import datetime, timedelta

from .catalog import find_slot
from .localtime import to_local
from .models import CheckinPass
from .sessions import Booking, SessionState

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I/L
OPENS_BEFORE = timedelta(minutes=30)
CLOSES_AFTER = timedelta(minutes=15)


def code_for(session: SessionState, booking_id: str) -> str:
    """Static per booking: derived from the session and booking id, no stored state."""
    digest = hashlib.sha256(f"{session.name}:{booking_id}".encode()).digest()
    raw = "".join(ALPHABET[b % len(ALPHABET)] for b in digest[:8])
    return f"{raw[:4]}-{raw[4:]}"


def normalise(code: str) -> str:
    raw = code.strip().upper().replace("-", "")
    return f"{raw[:4]}-{raw[4:]}"


def window(start_at: datetime) -> tuple[datetime, datetime]:
    return start_at - OPENS_BEFORE, start_at + CLOSES_AFTER


def pass_model(session: SessionState, booking: Booking, now: datetime) -> CheckinPass:
    opens, closes = window(find_slot(session, booking.class_id).start_at)
    checked_in_at = session.checkins.get(booking.id)
    if checked_in_at:
        status = "checked_in"
    elif now < opens:
        status = "not_open"
    elif now >= closes:
        status = "closed"
    else:
        status = "open"
    code = code_for(session, booking.id)
    return CheckinPass(
        booking_id=booking.id,
        class_id=booking.class_id,
        code=code,
        qr_payload=f"bookit:checkin:{code}",
        window_opens_at=opens,
        window_closes_at=closes,
        window_opens_local=to_local(opens),
        window_closes_local=to_local(closes),
        status=status,
        checked_in_at=checked_in_at,
        checked_in_local=to_local(checked_in_at) if checked_in_at else None,
    )
