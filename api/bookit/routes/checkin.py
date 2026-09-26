"""QR check-in. The app reads its pass; the gym's scanner (an API client, never
a BookIt screen) posts the code. Rule order: docs/prd/qr-check-in.md."""
from fastapi import APIRouter, Depends, Header

from ..auth import current_user
from ..catalog import find_slot
from ..checkin import code_for, normalise, pass_model, window
from ..context import Ctx, ctx
from ..errors import ERROR_RESPONSES, ApiError
from ..fixtures import STUDIO_BY_SCANNER_KEY
from ..flags import require_flag
from ..models import CheckinPass, CheckinRequest, CheckinResult

router = APIRouter(tags=["check-in"], responses=ERROR_RESPONSES)


@router.get("/bookings/{booking_id}/checkin", response_model=CheckinPass,
            dependencies=[Depends(require_flag("qr_check_in"))])
async def get_pass(booking_id: str, auth=Depends(current_user)):
    c, user = auth
    booking = c.session.bookings.get(booking_id)
    if booking is None or booking.user_id != user["id"]:
        raise ApiError(404, "BOOKING_NOT_FOUND")
    return pass_model(c.session, booking, c.now)


# No X-Platform gate: the scanner is the gym's device, not one of the four platforms.
@router.post("/checkins", response_model=CheckinResult, status_code=201)
async def check_in(body: CheckinRequest, c: Ctx = Depends(ctx),
                   x_studio_key: str | None = Header(default=None)):
    studio = STUDIO_BY_SCANNER_KEY.get(x_studio_key or "")
    if studio is None:
        raise ApiError(401, "INVALID_STUDIO_KEY")
    code = normalise(body.code)
    booking = next((b for b in c.session.bookings.values() if code_for(c.session, b.id) == code), None)
    if booking is None:
        raise ApiError(404, "CODE_NOT_FOUND")
    slot = find_slot(c.session, booking.class_id)
    if slot.studio_id != studio["id"]:
        raise ApiError(409, "WRONG_STUDIO")
    if booking.id in c.session.checkins:
        raise ApiError(409, "ALREADY_CHECKED_IN")
    opens, closes = window(slot.start_at)
    if c.now < opens:
        raise ApiError(409, "CHECKIN_NOT_OPEN")
    if c.now >= closes:
        raise ApiError(409, "CHECKIN_CLOSED")

    c.session.checkins[booking.id] = c.now
    return CheckinResult(
        booking_id=booking.id,
        class_id=slot.id,
        class_name=slot.name,
        user_name=c.session.users[booking.user_id]["name"],
        checked_in_at=c.now,
    )
