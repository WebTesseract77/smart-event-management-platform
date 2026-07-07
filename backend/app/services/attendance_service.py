from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.attendance import Attendance
from backend.app.models.registration import Registration


def mark_attendance(
    db: Session,
    event_id: int,
    user_id: int,
):
    registration = (
        db.query(Registration)
        .filter(
            Registration.event_id == event_id,
            Registration.user_id == user_id,
        )
        .first()
    )

    if not registration:
        raise HTTPException(
            status_code=400,
            detail="User is not registered for this event",
        )

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.event_id == event_id,
            Attendance.user_id == user_id,
        )
        .first()
    )

    if existing:
          raise HTTPException(
            status_code=409,
            detail="Attendance already recorded",
        )
    attendance = Attendance(
        event_id=event_id,
        user_id=user_id,
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "id": attendance.id,
        "event_id": attendance.event_id,
        "user_id": attendance.user_id,
        "user_name": attendance.user.name,
        "user_email": attendance.user.email,
        "recorded_at": attendance.recorded_at,
    }


def get_event_attendance(
    db: Session,
    event_id: int,
):
    records = (
        db.query(Attendance)
        .filter(
            Attendance.event_id == event_id
        )
        .all()
    )

    result = []

    for record in records:
        result.append(
            {
                "id": record.id,
                "event_id": record.event_id,
                "user_id": record.user_id,
                "user_name": record.user.name,
                "user_email": record.user.email,
                "recorded_at": record.recorded_at,
            }
        )

    return result
