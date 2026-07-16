import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_db,
    get_current_organizer_or_admin,
)

from backend.app.core.roles import ROLE_ORGANIZER

from backend.app.models.event import Event
from backend.app.models.user import User

from backend.app.schemas.attendance import (
    AttendanceRead,
    QRScanRequest,
)

from backend.app.services.attendance_service import (
    mark_attendance,
    get_event_attendance,
)

from backend.app.services.qr_service import verify_qr


router = APIRouter(
    prefix="",
    tags=["Attendance"],
)


def check_event_access(
    db: Session,
    event_id: int,
    user: User,
):
    event = db.get(Event, event_id)

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    if (
        user.role == ROLE_ORGANIZER
        and event.created_by != user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not your event",
        )

    return event


# --------------------------------------------------
# Secure QR Scan
# --------------------------------------------------

@router.post(
    "/attendance/scan",
    response_model=AttendanceRead,
)
def scan_qr(
    payload: QRScanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_organizer_or_admin),
):
   

    try:
       qr = verify_qr(payload.qr_data)
    except Exception:
      raise HTTPException(
          status_code=400,
          detail="Invalid or tampered QR code",
    )

    event_id = int(qr["event_id"])
    user_id = int(qr["user_id"])

    check_event_access(
        db,
        event_id,
        user,
    )

    return mark_attendance(
        db,
        event_id,
        user_id,
    )

# --------------------------------------------------
# Legacy endpoint
# (keep until frontend migration is complete)
# --------------------------------------------------

@router.post(
    "/events/{event_id}/attendance/{user_id}",
    response_model=AttendanceRead,
)
def mark(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_organizer_or_admin),
):
    check_event_access(
        db,
        event_id,
        user,
    )

    return mark_attendance(
        db,
        event_id,
        user_id,
    )


@router.get(
    "/events/{event_id}/attendance",
    response_model=list[AttendanceRead],
)
def list_attendance(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_organizer_or_admin),
):
    check_event_access(
        db,
        event_id,
        user,
    )

    return get_event_attendance(
        db,
        event_id,
    )