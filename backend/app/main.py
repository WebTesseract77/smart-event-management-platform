import os

# Rate limiting (defined before the route imports below so that
# route modules can safely import `limiter` from this module without
# triggering a circular-import error).
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from backend.app.routes.organizer_requests import (
    router as organizer_request_router,
)
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import get_settings
from backend.app.core.errors import (
    AuthenticationError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)

from backend.app.database.base import Base
from backend.app.database.session import engine

from backend.app.models import (
    Event,
    Registration,
    User,
    Team,
    TeamMember,
    OrganizerRequest,
)

from backend.app.routes.auth import router as auth_router
from backend.app.routes.events import router as events_router
from backend.app.routes.registrations import router as registrations_router
from backend.app.routes.users import router as users_router
from backend.app.routes.attendance import router as attendance_router
from backend.app.routes.team import router as team_router
from backend.app.routes.organizer import router as organizer_router
from backend.app.routes.payments import router as payment_router
from backend.app.routes import admin
from backend.app.routes.admin_analytics import router as admin_analytics_router

from backend.app.services.seed_service import seed_initial_data


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Backend API for the Smart Event Management Platform.",
)


# -----------------------
# Rate Limiting
# -----------------------

app.state.limiter = limiter


# -----------------------
# Static Files
# -----------------------

os.makedirs(
    "generated_qr",
    exist_ok=True,
)

app.mount(
    "/generated_qr",
    StaticFiles(directory="generated_qr"),
    name="generated_qr",
)


# -----------------------
# Exception Handlers
# -----------------------

def _error_response(
    status_code: int,
    detail: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
    )


@app.exception_handler(NotFoundError)
def not_found_handler(
    _: Request,
    exc: NotFoundError,
):
    return _error_response(
        status.HTTP_404_NOT_FOUND,
        str(exc),
    )


@app.exception_handler(ConflictError)
def conflict_handler(
    _: Request,
    exc: ConflictError,
):
    return _error_response(
        status.HTTP_409_CONFLICT,
        str(exc),
    )


@app.exception_handler(ForbiddenError)
def forbidden_handler(
    _: Request,
    exc: ForbiddenError,
):
    return _error_response(
        status.HTTP_403_FORBIDDEN,
        str(exc),
    )


@app.exception_handler(AuthenticationError)
def auth_handler(
    _: Request,
    exc: AuthenticationError,
):
    return _error_response(
        status.HTTP_401_UNAUTHORIZED,
        str(exc),
    )


@app.exception_handler(ValidationError)
def validation_handler(
    _: Request,
    exc: ValidationError,
):
    return _error_response(
        status.HTTP_400_BAD_REQUEST,
        str(exc),
    )


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(
    _: Request,
    exc: RateLimitExceeded,
):
    return _error_response(
        status.HTTP_429_TOO_MANY_REQUESTS,
        "Too many requests. Please try again later.",
    )


# -----------------------
# CORS
# -----------------------

environment = settings.environment.lower()

if environment != "development" and not settings.frontend_url:
    raise RuntimeError(
        "FRONTEND_URL must be configured outside development"
    )

origins = [settings.frontend_url] if settings.frontend_url else []

if environment == "development":
    origins.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])

# Remove duplicates
origins = list(dict.fromkeys(filter(None, origins)))


print(
    "ALLOWED ORIGINS:",
    origins,
    flush=True,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SlowAPIMiddleware)


# -----------------------
# Startup
# -----------------------

@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(
        bind=engine,
    )

    from backend.app.database.session import SessionLocal

    db = SessionLocal()

    try:
        seed_initial_data(db)
    finally:
        db.close()


# -----------------------
# Routes
# -----------------------

app.include_router(
    auth_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    events_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    registrations_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    users_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    attendance_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    admin.router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    admin_analytics_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    team_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    payment_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    organizer_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    organizer_request_router,
    prefix=settings.api_v1_prefix,
)
