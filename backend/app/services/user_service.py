from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.errors import AuthenticationError, ConflictError
from backend.app.core.security import get_password_hash, verify_password
from backend.app.models.user import User


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
    role: str = "participant"
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

def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User:

    

    user = get_user_by_email(
        db,
        email,
    )

    print("USER:", user)

    if user:
        print("DB EMAIL:", user.email)
        print(
            "PASSWORD MATCH:",
            verify_password(
                password,
                user.password_hash,
            )
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
