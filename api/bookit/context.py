"""Request context set by the middleware in main.py: the test session and "now"."""
from dataclasses import dataclass
from datetime import datetime

from fastapi import Request

from .sessions import SessionState


@dataclass
class Ctx:
    session: SessionState
    now: datetime


def ctx(request: Request) -> Ctx:
    return Ctx(request.state.session, request.state.now)
