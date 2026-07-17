import hmac
import json
import time
from io import BytesIO

import qrcode
from fastapi.responses import StreamingResponse

from backend.app.core.security import create_qr_signature


def create_qr_payload(
    registration_id: int,
    user_id: int,
    event_id: int,
) -> str:
    """
    Create a cryptographically signed QR payload.
    Returns the JSON string that will be encoded into the QR code.
    """

    issued_at = int(time.time())

    signature = create_qr_signature(
        registration_id=registration_id,
        user_id=user_id,
        event_id=event_id,
        issued_at=issued_at,
    )

    payload = {
        "registration_id": registration_id,
        "user_id": user_id,
        "event_id": event_id,
        "issued_at": issued_at,
        "signature": signature,
    }

    return json.dumps(
        payload,
        separators=(",", ":"),
    )


def generate_qr_image(
    registration_id: int,
    user_id: int,
    event_id: int,
) -> StreamingResponse:
    """
    Generate a QR code PNG completely in memory.

    Nothing is written to disk.
    """

    qr_data = create_qr_payload(
        registration_id=registration_id,
        user_id=user_id,
        event_id=event_id,
    )

    img = qrcode.make(qr_data)

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="image/png",
    )


def verify_qr(qr_text: str) -> dict:
    """
    Verify QR signature and return payload.
    Raises ValueError if QR is invalid or tampered.
    """

    try:
        payload = json.loads(qr_text)
    except Exception:
        raise ValueError("Invalid QR format")

    required = (
        "registration_id",
        "user_id",
        "event_id",
        "issued_at",
        "signature",
    )

    for field in required:
        if field not in payload:
            raise ValueError("Invalid QR payload")

    try:
        payload["registration_id"] = int(payload["registration_id"])
        payload["user_id"] = int(payload["user_id"])
        payload["event_id"] = int(payload["event_id"])
        payload["issued_at"] = int(payload["issued_at"])
    except (TypeError, ValueError):
        raise ValueError("Invalid QR payload")

    expected_signature = create_qr_signature(
        registration_id=payload["registration_id"],
        user_id=payload["user_id"],
        event_id=payload["event_id"],
        issued_at=payload["issued_at"],
    )

    if not hmac.compare_digest(
        payload["signature"],
        expected_signature,
    ):
        raise ValueError("QR signature is invalid")

    return payload