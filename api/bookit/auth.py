"""Fake bearer tokens, stored per test session. See docs/tech/login.md."""
from fastapi import Depends, Request

from .context import Ctx, ctx
from .errors import ApiError


def current_user(request: Request, c: Ctx = Depends(ctx)) -> tuple[Ctx, dict]:
    if c.session.chaos.expire_tokens:
        raise ApiError(401, "TOKEN_EXPIRED")
    scheme, _, token = request.headers.get("authorization", "").partition(" ")
    user_id = c.session.tokens.get(token) if scheme.lower() == "bearer" else None
    if user_id is None:
        raise ApiError(401, "UNAUTHORIZED")
    return c, c.session.users[user_id]
