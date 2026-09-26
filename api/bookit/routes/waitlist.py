"""Joining, leaving and listing waitlists. Join rule order decides which error
a test sees: docs/tech/waitlist.md."""
from fastapi import APIRouter, Depends, Response

from ..auth import current_user
from ..booking_rules import BOOKING_LIMIT, upcoming_bookings
from ..catalog import bookings_on, find_slot, spots_left, waitlist_on
from ..errors import ERROR_RESPONSES, ApiError
from ..flags import require_flag
from ..models import WaitlistEntry
from ..sessions import WaitlistEntry as StoredEntry
from ..waitlist import entry_model

# require_flag depends on current_user, so expired tokens are a 401 even on ios.
router = APIRouter(tags=["waitlist"], responses=ERROR_RESPONSES)
gate = [Depends(require_flag("waitlist"))]


@router.post("/classes/{class_id}/waitlist", response_model=WaitlistEntry, status_code=201, dependencies=gate)
async def join_waitlist(class_id: str, auth=Depends(current_user)):
    c, user = auth
    slot = find_slot(c.session, class_id)
    if slot is None:
        raise ApiError(404, "CLASS_NOT_FOUND")
    if c.now >= slot.start_at:
        raise ApiError(409, "CLASS_STARTED")
    if any(b.user_id == user["id"] for b in bookings_on(c.session, slot.id)):
        raise ApiError(409, "ALREADY_BOOKED")
    if any(e.user_id == user["id"] for e in waitlist_on(c.session, slot.id)):
        raise ApiError(409, "ALREADY_WAITLISTED")
    if len(upcoming_bookings(c.session, user["id"], c.now)) >= BOOKING_LIMIT:
        raise ApiError(409, "BOOKING_LIMIT_REACHED")
    if spots_left(c.session, slot) > 0:
        raise ApiError(409, "CLASS_NOT_FULL")

    entry = StoredEntry(f"wl-{c.session.next_waitlist_seq}", user["id"], slot.id, c.now)
    c.session.next_waitlist_seq += 1
    c.session.waitlist.append(entry)
    return entry_model(c.session, entry, c.now)


@router.delete("/classes/{class_id}/waitlist", status_code=204, response_class=Response, dependencies=gate)
async def leave_waitlist(class_id: str, auth=Depends(current_user)):
    c, user = auth
    if find_slot(c.session, class_id) is None:
        raise ApiError(404, "CLASS_NOT_FOUND")
    entry = next((e for e in waitlist_on(c.session, class_id) if e.user_id == user["id"]), None)
    if entry is None:
        raise ApiError(404, "NOT_WAITLISTED")
    c.session.waitlist.remove(entry)
    return Response(status_code=204)


@router.get("/me/waitlist", response_model=list[WaitlistEntry], dependencies=gate)
async def my_waitlist(auth=Depends(current_user)):
    c, user = auth
    mine = [(e, find_slot(c.session, e.class_id)) for e in c.session.waitlist if e.user_id == user["id"]]
    upcoming = sorted((p for p in mine if p[1].start_at > c.now), key=lambda p: p[1].start_at)
    return [entry_model(c.session, e, c.now) for e, _ in upcoming]
