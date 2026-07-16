import hmac
import json
import re
import time
from pathlib import Path

import qrcode

from backend.app.core.security import create_qr_signature


def generate_qr(
    registration_id: int,
    user_id: int,
    event_id: int,
) -> str:
    """
    Generate a cryptographically signed QR code.
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

    qr_data = json.dumps(
        payload,
        separators=(",", ":"),
    )

    safe_name = re.sub(
        r"[^A-Za-z0-9_.-]",
        "_",
        f"registration_{registration_id}",
    )

    output_dir = Path("generated_qr")
    output_dir.mkdir(exist_ok=True)

    file_path = output_dir / f"{safe_name}.png"

    qrcode.make(qr_data).save(file_path)

    return str(file_path)


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