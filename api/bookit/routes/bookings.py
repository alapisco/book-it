"""Booking and cancelling. Rule order decides which error a test sees:
docs/tech/browse-and-book.md and docs/tech/my-bookings-and-cancel.md."""
from fastapi import APIRouter, Depends, Response

from ..auth import current_user
from ..booking_rules import (BOOKING_LIMIT, CANCEL_CUTOFF, booking_model,
                             upcoming_bookings)
from ..catalog import bookings_on, find_slot, spots_left
from ..errors import ERROR_RESPONSES, ApiError
from ..models import Booking, BookingCreate
from ..sessions import Booking as StoredBooking

router = APIRouter(tags=["bookings"], responses=ERROR_RESPONSES)


@router.post("/bookings", response_model=Booking, status_code=201)
async def create_booking(body: BookingCreate, auth=Depends(current_user)):
    c, user = auth
    slot = find_slot(c.session, body.class_id)
    if slot is None:
        raise ApiError(404, "CLASS_NOT_FOUND")
    if c.now >= slot.start_at:
        raise ApiError(409, "CLASS_STARTED")
    if any(b.user_id == user["id"] for b in bookings_on(c.session, slot.id)):
        raise ApiError(409, "ALREADY_BOOKED")
    if len(upcoming_bookings(c.session, user["id"], c.now)) >= BOOKING_LIMIT:
        raise ApiError(409, "BOOKING_LIMIT_REACHED")
    if spots_left(c.session, slot) == 0:
        raise ApiError(409, "CLASS_FULL")

    booking = StoredBooking(f"bk-{c.session.next_booking_seq}", user["id"], slot.id, c.now)
    c.session.next_booking_seq += 1
    c.session.bookings[booking.id] = booking
    return booking_model(c.session, booking, c.now)


@router.get("/me/bookings", response_model=list[Booking])
async def my_bookings(auth=Depends(current_user)):
    c, user = auth
    return [booking_model(c.session, b, c.now)
            for b, _ in upcoming_bookings(c.session, user["id"], c.now)]


@router.delete("/bookings/{booking_id}", status_code=204, response_class=Response)
async def cancel_booking(booking_id: str, auth=Depends(current_user)):
    c, user = auth
    booking = c.session.bookings.get(booking_id)
    if booking is None or booking.user_id != user["id"]:
        raise ApiError(404, "BOOKING_NOT_FOUND")
    slot = find_slot(c.session, booking.class_id)
    if c.now >= slot.start_at:
        raise ApiError(409, "CLASS_STARTED")
    if c.now >= slot.start_at - CANCEL_CUTOFF:
        raise ApiError(409, "CANCELLATION_WINDOW_CLOSED")
    del c.session.bookings[booking_id]
    return Response(status_code=204)
