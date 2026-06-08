from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.routes.attendance import router as attendance_router
from backend.app.core.config import get_settings
from backend.app.core.errors import AuthenticationError, ConflictError, ForbiddenError, NotFoundError, ValidationError
from backend.app.database.session import engine
from backend.app.models import Event, Registration, User  # noqa: F401
from backend.app.database.base import Base
from backend.app.routes.auth import router as auth_router
from backend.app.routes.events import router as events_router
from backend.app.routes.registrations import router as registrations_router
from backend.app.routes.users import router as users_router
from backend.app.services.seed_service import seed_initial_data

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Backend API for the Smart Event Management Platform.",
)


def _error_response(status_code: int, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


@app.exception_handler(NotFoundError)
def not_found_handler(_: Request, exc: NotFoundError):
    return _error_response(status.HTTP_404_NOT_FOUND, str(exc))


@app.exception_handler(ConflictError)
def conflict_handler(_: Request, exc: ConflictError):
    return _error_response(status.HTTP_409_CONFLICT, str(exc))


@app.exception_handler(ForbiddenError)
def forbidden_handler(_: Request, exc: ForbiddenError):
    return _error_response(status.HTTP_403_FORBIDDEN, str(exc))


@app.exception_handler(AuthenticationError)
def auth_handler(_: Request, exc: AuthenticationError):
    return _error_response(status.HTTP_401_UNAUTHORIZED, str(exc))


@app.exception_handler(ValidationError)
def validation_handler(_: Request, exc: ValidationError):
    return _error_response(status.HTTP_400_BAD_REQUEST, str(exc))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    from backend.app.database.session import SessionLocal

    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()


app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(events_router, prefix=settings.api_v1_prefix)
app.include_router(registrations_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)
app.include_router(attendance_router, prefix=settings.api_v1_prefix)