from datetime import date, timedelta

from fastapi import APIRouter, Depends

from ..auth import current_user
from ..catalog import classes_on, find_slot, to_model
from ..errors import ERROR_RESPONSES, ApiError
from ..fixtures import STUDIOS, STUDIOS_BY_ID
from ..flags import require_flag
from ..models import ScheduleDay, ScheduleWeek, Studio, StudioClass

router = APIRouter(tags=["catalog"], responses=ERROR_RESPONSES)


@router.get("/studios", response_model=list[Studio])
async def studios(_=Depends(current_user)):
    return [Studio(id=s["id"], name=s["name"], description=s["description"]) for s in STUDIOS]


@router.get("/schedule", response_model=ScheduleDay)
async def schedule(date: date | None = None, studio_id: str | None = None,
                   auth=Depends(current_user)):
    c, user = auth
    if studio_id is not None and studio_id not in STUDIOS_BY_ID:
        raise ApiError(404, "NOT_FOUND")
    return schedule_day(c, user, date or c.now.date(), studio_id)


@router.get("/schedule/week", response_model=ScheduleWeek,
            dependencies=[Depends(require_flag("week_calendar"))])
async def schedule_week(date: date | None = None, auth=Depends(current_user)):
    c, user = auth
    day = date or c.now.date()
    start = day - timedelta(days=day.weekday())
    return ScheduleWeek(
        week_start=start,
        week_end=start + timedelta(days=6),
        previous_week=start - timedelta(days=7),
        next_week=start + timedelta(days=7),
        now=c.now,
        days=[schedule_day(c, user, start + timedelta(days=i)) for i in range(7)],
    )


def schedule_day(c, user, day, studio_id=None) -> ScheduleDay:
    return ScheduleDay(
        date=day,
        previous_date=day - timedelta(days=1),
        next_date=day + timedelta(days=1),
        now=c.now,
        classes=[to_model(c.session, s, c.now, user["id"])
                 for s in classes_on(c.session, day, studio_id)],
    )


@router.get("/classes/{class_id}", response_model=StudioClass)
async def get_class(class_id: str, auth=Depends(current_user)):
    c, user = auth
    slot = find_slot(c.session, class_id)
    if slot is None:
        raise ApiError(404, "CLASS_NOT_FOUND")
    return to_model(c.session, slot, c.now, user["id"])
