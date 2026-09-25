"""Test-support endpoints: docs/prd/test-support.md."""
from datetime import timedelta

from fastapi import APIRouter, Depends

from ..catalog import bookings_on, find_slot, to_model
from ..context import Ctx, ctx
from ..errors import ERROR_RESPONSES, ApiError
from ..models import (AnchorStart, ChaosConfig, ClockAdvance, ClockSet, ClockState,
                      ResetResult, StudioClass)
from ..sessions import reset_session, utcnow

router = APIRouter(prefix="/test", tags=["test-support"], responses=ERROR_RESPONSES)


@router.post("/reset", response_model=ResetResult)
async def reset(c: Ctx = Depends(ctx)):
    session = reset_session(c.session, c.now)
    return ResetResult(
        session=session.name,
        now=c.now,
        anchors=[AnchorStart(id=a.id, start_at=a.start_at) for a in session.anchors.values()],
    )


def _clock(c: Ctx) -> ClockState:
    return ClockState(now=c.session.now(), frozen=c.session.clock_frozen_at is not None)


@router.get("/clock", response_model=ClockState)
async def get_clock(c: Ctx = Depends(ctx)):
    return _clock(c)


@router.post("/clock", response_model=ClockState)
async def set_clock(body: ClockSet, c: Ctx = Depends(ctx)):
    if body.frozen:
        c.session.clock_frozen_at = body.now
    else:
        c.session.clock_frozen_at = None
        c.session.clock_offset = body.now - utcnow()
    return _clock(c)


@router.post("/clock/advance", response_model=ClockState)
async def advance_clock(body: ClockAdvance, c: Ctx = Depends(ctx)):
    step = timedelta(seconds=body.seconds)
    if c.session.clock_frozen_at is not None:
        c.session.clock_frozen_at += step
    else:
        c.session.clock_offset += step
    return _clock(c)


@router.delete("/clock", response_model=ClockState)
async def real_clock(c: Ctx = Depends(ctx)):
    c.session.clock_frozen_at = None
    c.session.clock_offset = timedelta(0)
    return _clock(c)


@router.get("/chaos", response_model=ChaosConfig)
async def get_chaos(c: Ctx = Depends(ctx)):
    return c.session.chaos


@router.put("/chaos", response_model=ChaosConfig)
async def set_chaos(body: ChaosConfig, c: Ctx = Depends(ctx)):
    c.session.chaos = body
    return body


@router.delete("/chaos", response_model=ChaosConfig)
async def clear_chaos(c: Ctx = Depends(ctx)):
    c.session.chaos = ChaosConfig()
    return c.session.chaos


@router.post("/classes/{class_id}/fill", response_model=StudioClass)
async def fill_class(class_id: str, c: Ctx = Depends(ctx)):
    slot = find_slot(c.session, class_id)
    if slot is None:
        raise ApiError(404, "CLASS_NOT_FOUND")
    c.session.filler_overrides[slot.id] = slot.capacity - len(bookings_on(c.session, slot.id))
    return to_model(c.session, slot, c.now)
