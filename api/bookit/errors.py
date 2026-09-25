"""Error body shared by every non-2xx response (ADR 0004)."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .models import ErrorBody

MESSAGES = {
    "VALIDATION_ERROR": "The request is invalid.",
    "NOT_FOUND": "Not found.",
    "METHOD_NOT_ALLOWED": "Method not allowed.",
    "INVALID_TEST_SESSION": "X-Test-Session must match [A-Za-z0-9_-]{1,64}.",
    "INVALID_TEST_NOW": "X-Test-Now must be an ISO 8601 datetime.",
    "CHAOS_ERROR": "Something went wrong.",
    "TIMEOUT": "The server took too long to respond.",
    "UNKNOWN_PLATFORM": "Unknown platform.",
    "CLASS_NOT_FOUND": "Class not found.",
    "UNAUTHORIZED": "Please log in.",
    "TOKEN_EXPIRED": "Your session has expired. Please log in again.",
    "INVALID_CREDENTIALS": "Email or password is incorrect.",
    "CLASS_STARTED": "This class has already started.",
    "ALREADY_BOOKED": "You have already booked this class.",
    "BOOKING_LIMIT_REACHED": "You have reached the limit of 3 upcoming bookings.",
    "CLASS_FULL": "This class is full.",
    "BOOKING_NOT_FOUND": "Booking not found.",
    "CANCELLATION_WINDOW_CLOSED": "Bookings can't be cancelled less than 12 hours before the class starts.",
}

# Declared on routers so the generated OpenAPI documents the error body.
ERROR_RESPONSES = {status: {"model": ErrorBody} for status in (400, 401, 404, 409, 422)}


class ApiError(Exception):
    def __init__(self, status: int, code: str):
        self.status = status
        self.code = code


def error_response(status: int, code: str, message: str | None = None) -> JSONResponse:
    body = {"error": {"code": code, "message": message or MESSAGES[code]}}
    return JSONResponse(status_code=status, content=body)


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error(_: Request, exc: ApiError):
        return error_response(exc.status, exc.code)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        first = exc.errors()[0]
        where = ".".join(str(p) for p in first["loc"])
        return error_response(422, "VALIDATION_ERROR", f"{where}: {first['msg']}")

    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException):
        code = "METHOD_NOT_ALLOWED" if exc.status_code == 405 else "NOT_FOUND"
        return error_response(exc.status_code, code)
