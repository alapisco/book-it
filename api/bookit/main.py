"""BookIt SUT API. Run: uvicorn bookit.main:app --port 8000 (from api/)."""
import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .errors import error_response, install_error_handlers
from .models import Health
from .routes import flags, testsupport
from .sessions import SESSION_ID, get_session

app = FastAPI(
    title="BookIt SUT API",
    version="0.1.0",
    description=(
        "System Under Test for the BookIt automation framework. "
        "All state is namespaced by the X-Test-Session header; "
        "X-Test-Now overrides the clock for one request."
    ),
)
install_error_handlers(app)

NO_CHAOS = ("/test", "/health", "/docs", "/openapi.json")


@app.middleware("http")
async def test_context(request: Request, call_next):
    name = request.headers.get("x-test-session", "default")
    if not SESSION_ID.match(name):
        return error_response(400, "INVALID_TEST_SESSION")

    header_now = None
    if raw := request.headers.get("x-test-now"):
        try:
            header_now = datetime.fromisoformat(raw)
        except ValueError:
            return error_response(400, "INVALID_TEST_NOW")
        if header_now.tzinfo is None:
            header_now = header_now.replace(tzinfo=timezone.utc)

    session = get_session(name, header_now or datetime.now(timezone.utc))
    request.state.session = session
    request.state.now = header_now or session.now()

    path = request.url.path
    chaos = session.chaos
    if not path.startswith(NO_CHAOS) and path.startswith(chaos.path_prefix or "/"):
        if chaos.latency_ms:
            await asyncio.sleep(chaos.latency_ms / 1000)
        if chaos.timeout_ms is not None:
            await asyncio.sleep(chaos.timeout_ms / 1000)
            return error_response(504, "TIMEOUT")
        if chaos.error_status is not None:
            status = chaos.error_status
            if chaos.error_count is not None:
                chaos.error_count -= 1
                if chaos.error_count == 0:
                    chaos.error_status = chaos.error_count = None
            return error_response(status, "CHAOS_ERROR")

    return await call_next(request)


# Added after the middleware above so it wraps it: error responses get CORS headers too.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(flags.router)
app.include_router(testsupport.router)


@app.get("/health", response_model=Health, tags=["test-support"])
async def health():
    return Health(status="ok")
