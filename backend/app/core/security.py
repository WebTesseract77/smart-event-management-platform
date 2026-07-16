from datetime import datetime, timedelta, timezone
from typing import Any

import hashlib
import hmac

from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.app.core.config import get_settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    role: str,
    token_version: int,
    expires_delta: timedelta | None = None,
) -> str:
    settings = get_settings()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(
            minutes=settings.access_token_expire_minutes
        )
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "token_version": token_version,
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    settings = get_settings()

    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )

    except JWTError as exc:
        raise ValueError(
            "Invalid token"
        ) from exc


# =====================================================
# QR CODE SECURITY
# =====================================================

def create_qr_signature(
    
    registration_id: int,
    user_id: int,
    event_id: int,
    issued_at: int,
) -> str:
    """
    Create an HMAC-SHA256 signature for QR payloads.
    """

    settings = get_settings()

    payload = (
        f"{registration_id}:"
        f"{user_id}:"
        f"{event_id}:"
        f"{issued_at}"
    )

    return hmac.new(
        settings.qr_secret_key.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()


def verify_qr_signature(
    registration_id: int,
    user_id: int,
    event_id: int,
    issued_at: int,
    signature: str,
) -> bool:
    """
    Verify a QR code signature.
    """

    expected_signature = create_qr_signature(
        registration_id=registration_id,
        user_id=user_id,
        event_id=event_id,
        issued_at=issued_at,
    )

    return hmac.compare_digest(
        expected_signature,
        signature,
    )