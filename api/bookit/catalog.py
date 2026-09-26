"""Class lookup across generated classes and anchors, and derived fields."""
import re
from datetime import date, datetime

from .fixtures import STUDIOS_BY_ID
from .localtime import local_date, to_local
from .models import StudioClass
from .schedule import ClassSlot, generate_day
from .sessions import SessionState

GENERATED_ID = re.compile(
    rf"^({'|'.join(STUDIOS_BY_ID)})-(\d{{4}})(\d{{2}})(\d{{2}})-\d{{4}}-[a-z0-9-]+$"
)


def find_slot(session: SessionState, class_id: str) -> ClassSlot | None:
    if class_id in session.anchors:
        return session.anchors[class_id]
    m = GENERATED_ID.match(class_id)
    if not m:
        return None
    try:
        day = date(int(m[2]), int(m[3]), int(m[4]))
    except ValueError:
        return None
    return next((s for s in generate_day(m[1], day) if s.id == class_id), None)


def classes_on(session: SessionState, day: date, studio_id: str | None = None) -> list[ClassSlot]:
    studio_ids = [studio_id] if studio_id else list(STUDIOS_BY_ID)
    slots = [s for sid in studio_ids for s in generate_day(sid, day)]
    slots += [a for a in session.anchors.values()
              if local_date(a.start_at) == day and (studio_id is None or a.studio_id == studio_id)]
    return sorted(slots, key=lambda s: (s.start_at, s.studio_id, s.name))


def bookings_on(session: SessionState, class_id: str):
    return [b for b in session.bookings.values() if b.class_id == class_id]


def waitlist_on(session: SessionState, class_id: str):
    """The class's waitlist entries in queue order."""
    return [e for e in session.waitlist if e.class_id == class_id]


def spots_left(session: SessionState, slot: ClassSlot) -> int:
    filler = session.filler_overrides.get(slot.id, slot.filler)
    return max(0, slot.capacity - filler - len(bookings_on(session, slot.id)))


def to_model(session: SessionState, slot: ClassSlot, now: datetime,
             user_id: str | None = None) -> StudioClass:
    left = spots_left(session, slot)
    mine = next((b.id for b in bookings_on(session, slot.id) if b.user_id == user_id), None)
    queue = waitlist_on(session, slot.id)
    position = next((i for i, e in enumerate(queue, 1) if e.user_id == user_id), None)
    return StudioClass(
        id=slot.id,
        studio_id=slot.studio_id,
        studio_name=STUDIOS_BY_ID[slot.studio_id]["name"],
        studio_neighborhood=STUDIOS_BY_ID[slot.studio_id]["neighborhood"],
        studio_accent=STUDIOS_BY_ID[slot.studio_id]["accent"],
        name=slot.name,
        category=slot.category,
        instructor=slot.instructor,
        start_at=slot.start_at,
        end_at=slot.end_at,
        start_local=to_local(slot.start_at),
        end_local=to_local(slot.end_at),
        duration_min=slot.duration_min,
        capacity=slot.capacity,
        spots_left=left,
        is_full=left == 0,
        has_started=now >= slot.start_at,
        is_outdoor=slot.is_outdoor,
        is_anchor=slot.is_anchor,
        my_booking_id=mine,
        waitlist_count=len(queue),
        my_waitlist_position=position,
    )
