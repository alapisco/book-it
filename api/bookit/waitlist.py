"""Waitlist positions and promotion. Rules: docs/tech/waitlist.md."""
from datetime import datetime

from .booking_rules import BOOKING_LIMIT, upcoming_bookings
from .catalog import find_slot, spots_left, to_model, waitlist_on
from .models import WaitlistEntry as WaitlistEntryModel
from .schedule import ClassSlot
from .sessions import Booking, SessionState, WaitlistEntry


def entry_model(session: SessionState, entry: WaitlistEntry, now: datetime) -> WaitlistEntryModel:
    queue = waitlist_on(session, entry.class_id)
    return WaitlistEntryModel(
        id=entry.id,
        class_id=entry.class_id,
        user_id=entry.user_id,
        position=queue.index(entry) + 1,
        created_at=entry.created_at,
        studio_class=to_model(session, find_slot(session, entry.class_id), now, entry.user_id),
    )


def promote(session: SessionState, slot: ClassSlot, now: datetime) -> None:
    """Book the first eligible waitlisted user into a freed seat. Users at the
    booking limit are skipped and keep their place. At most one per call."""
    if now >= slot.start_at or spots_left(session, slot) == 0:
        return
    for entry in waitlist_on(session, slot.id):
        if len(upcoming_bookings(session, entry.user_id, now)) < BOOKING_LIMIT:
            booking = Booking(f"bk-{session.next_booking_seq}", entry.user_id, slot.id, now)
            session.next_booking_seq += 1
            session.bookings[booking.id] = booking
            session.waitlist.remove(entry)
            return
