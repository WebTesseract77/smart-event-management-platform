import asyncio
import threading

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.errors import AuthenticationError, ConflictError, ForbiddenError, NotFoundError, ValidationError
from backend.app.core.security import get_password_hash, verify_password
from backend.app.core.roles import (
    ROLE_ADMIN,
    ROLE_ORGANIZER,
    ROLE_USER,
)
from backend.app.models.user import User
from backend.app.services.organizer_email_service import (
    send_organizer_revoked_email,
)
from sqlalchemy import select


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.lower()
    return db.execute(select(User).where(User.email == normalized_email)).scalar_one_or_none()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def create_user(
    db: Session,
    *,
    name: str,
    email: str,
    password: str,
    role: str = ROLE_USER
) -> User:
    normalized_email = email.lower()

    if get_user_by_email(
        db,
        normalized_email
    ):
        raise ConflictError(
            "Email already registered"
        )

    user = User(
    name=name,
    email=normalized_email,
    password_hash=get_password_hash(password),
    role=role,
    is_verified=True,
)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def list_users(db: Session) -> list[User]:
    return list(db.execute(select(User).order_by(User.id)).scalars().all())


def update_user_role(
    db: Session,
    *,
    current_user: User,
    user_id: int,
    role: str,
) -> User:
    target_user = get_user_by_id(db, user_id)

    if not target_user:
        raise NotFoundError("User not found")

    if target_user.id == current_user.id:
        raise ForbiddenError("You cannot change your own role")

    if target_user.role == ROLE_ADMIN:
        raise ForbiddenError("Admin users cannot be modified")

    if role not in (ROLE_USER, ROLE_ORGANIZER):
        raise ValidationError("Invalid role")

    revoke_organizer_access = (
        target_user.role == ROLE_ORGANIZER
        and role == ROLE_USER
    )

    target_user.role = role
    db.commit()
    db.refresh(target_user)

    if revoke_organizer_access:
        try:
            threading.Thread(
                target=lambda: asyncio.run(
                    send_organizer_revoked_email(
                        email=target_user.email,
                        name=target_user.name,
                    )
                ),
                daemon=True,
            ).start()
        except Exception as exc:
            print(f"Organizer revocation email sending failed: {exc}")

    return target_user

def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User:
    user = get_user_by_email(
        db,
        email,
    )

    if (
        not user
        or not verify_password(
            password,
            user.password_hash,
        )
    ):
        raise AuthenticationError(
            "Invalid email or password"
        )

    if not user.is_verified:
        raise AuthenticationError(
            "Please verify your email first"
        )

    return user
