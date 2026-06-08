from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.dependencies import get_db
from backend.app.schemas.attendance import AttendanceRead
from backend.app.services.attendance_service import (
    mark_attendance,
    get_event_attendance,
)

router = APIRouter(
    prefix="",
    tags=["Attendance"],
)


@router.post(
    "/events/{event_id}/attendance/{user_id}",
    response_model=AttendanceRead,
)
def mark(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
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
):
    return get_event_attendance(
        db,
        event_id,
    )