from collections.abc import Generator
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.core.security import decode_access_token
from backend.app.core.roles import ROLE_ADMIN, ROLE_ORGANIZER
from backend.app.database.session import get_db
from backend.app.models.user import User

security = HTTPBearer()
def get_settings_dependency():
    return get_settings()


def db_session(db: Session = Depends(get_db)) -> Generator[Session, None, None]:
    yield db


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
) -> User:

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
        token_version = int(payload["token_version"])

    except (ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if token_version != user.token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired",
        )

    return user

def get_current_admin(
    current_user: User = Depends(
        get_current_user
    )
) -> User:
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )

    return current_user


def get_current_organizer_or_admin(
    current_user: User = Depends(
        get_current_user
    ),
) -> User:
    if current_user.role not in [
        ROLE_ADMIN,
        ROLE_ORGANIZER,
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer privileges required",
        )

    return current_user


def get_current_organizer(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != ROLE_ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer privileges required",
        )

    return current_user
