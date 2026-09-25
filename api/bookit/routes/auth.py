import secrets

from fastapi import APIRouter, Depends

from ..auth import current_user
from ..booking_rules import user_model
from ..context import Ctx, ctx
from ..errors import ERROR_RESPONSES, ApiError
from ..models import LoginRequest, LoginResponse, User

router = APIRouter(tags=["auth"], responses=ERROR_RESPONSES)


@router.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest, c: Ctx = Depends(ctx)):
    email = body.email.strip().lower()
    user = next((u for u in c.session.users.values() if u["email"] == email), None)
    if user is None or user["password"] != body.password:
        raise ApiError(401, "INVALID_CREDENTIALS")
    token = "tok_" + secrets.token_hex(12)
    c.session.tokens[token] = user["id"]
    return LoginResponse(token=token, user=user_model(c.session, user, c.now))


@router.get("/me", response_model=User)
async def me(auth=Depends(current_user)):
    c, user = auth
    return user_model(c.session, user, c.now)
