"""Booking limit, cancellation cutoff and the Booking/User response shapes."""
from datetime import datetime, timedelta

from .catalog import find_slot, to_model
from .models import Booking, User
from .sessions import Booking as StoredBooking
from .sessions import SessionState

BOOKING_LIMIT = 3
CANCEL_CUTOFF = timedelta(hours=12)


def upcoming_bookings(session: SessionState, user_id: str, now: datetime):
    """The user's bookings whose class hasn't started, in start order, with their slots."""
    pairs = [(b, find_slot(session, b.class_id)) for b in session.bookings.values()
             if b.user_id == user_id]
    return sorted(((b, s) for b, s in pairs if s.start_at > now), key=lambda p: p[1].start_at)


def booking_model(session: SessionState, booking: StoredBooking, now: datetime) -> Booking:
    slot = find_slot(session, booking.class_id)
    deadline = slot.start_at - CANCEL_CUTOFF
    return Booking(
        id=booking.id,
        class_id=booking.class_id,
        user_id=booking.user_id,
        created_at=booking.created_at,
        can_cancel=now < deadline,
        cancel_deadline=deadline,
        studio_class=to_model(session, slot, now, booking.user_id),
    )


def user_model(session: SessionState, user: dict, now: datetime) -> User:
    return User(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        booking_limit=BOOKING_LIMIT,
        upcoming_booking_count=len(upcoming_bookings(session, user["id"], now)),
    )
