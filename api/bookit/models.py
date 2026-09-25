"""Pydantic models. These are the contract: docs/api/openapi.json is generated from them."""
from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorBody(BaseModel):
    error: ErrorDetail


class Health(BaseModel):
    status: Literal["ok"]


# --- domain -----------------------------------------------------------------

class Studio(BaseModel):
    id: str
    name: str
    description: str


class StudioClass(BaseModel):
    id: str
    studio_id: str
    studio_name: str
    name: str
    category: str
    instructor: str
    start_at: datetime
    end_at: datetime
    duration_min: int
    capacity: int
    spots_left: int
    is_full: bool
    has_started: bool
    is_outdoor: bool
    is_anchor: bool
    my_booking_id: str | None = Field(description="The caller's booking on this class, if any")


class ScheduleDay(BaseModel):
    date: date
    previous_date: date
    next_date: date
    now: datetime = Field(description="The session clock at the time of the request")
    classes: list[StudioClass]


class User(BaseModel):
    id: str
    email: str
    name: str
    booking_limit: int
    upcoming_booking_count: int


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: User


class BookingCreate(BaseModel):
    class_id: str


class Booking(BaseModel):
    id: str
    class_id: str
    user_id: str
    created_at: datetime
    can_cancel: bool
    cancel_deadline: datetime
    studio_class: StudioClass


# --- feature flags ----------------------------------------------------------

class PlatformFlags(BaseModel):
    login: bool
    browse_and_book: bool
    my_bookings: bool
    week_calendar: bool
    ics_export: bool
    waitlist: bool
    qr_check_in: bool
    studio_policies: Literal["page", "webview"]


class FlagMatrix(BaseModel):
    web: PlatformFlags
    wap: PlatformFlags
    android: PlatformFlags
    ios: PlatformFlags


# --- test support -----------------------------------------------------------

class AnchorStart(BaseModel):
    id: str
    start_at: datetime


class ResetResult(BaseModel):
    session: str
    now: datetime
    anchors: list[AnchorStart]


class ClockState(BaseModel):
    now: datetime
    frozen: bool


class ClockSet(BaseModel):
    now: datetime = Field(description="A value without an offset is taken as UTC")
    frozen: bool = True

    @field_validator("now")
    @classmethod
    def assume_utc(cls, v: datetime) -> datetime:
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)


class ClockAdvance(BaseModel):
    seconds: int


class ChaosConfig(BaseModel):
    latency_ms: int = Field(0, ge=0)
    error_status: int | None = Field(None, ge=500, le=599)
    error_count: int | None = Field(None, ge=1, description="Fail only the next N requests; null = all")
    timeout_ms: int | None = Field(None, ge=0)
    expire_tokens: bool = False
    path_prefix: str | None = None
