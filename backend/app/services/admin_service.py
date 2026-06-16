from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.models.event import Event
from backend.app.models.registration import Registration
from backend.app.models.attendance import Attendance


def get_analytics(
    db: Session,
):
    total_events = (
        db.query(Event)
        .count()
    )

    total_registrations = (
        db.query(Registration)
        .count()
    )

    attendance_marked = (
        db.query(Attendance)
        .count()
    )

    upcoming_events = (
        db.query(Event)
        .filter(
            Event.start_date >
            datetime.now(timezone.utc)
        )
        .count()
    )

    attendance_rate = 0

    if total_registrations > 0:
        attendance_rate = round(
            (
                attendance_marked
                / total_registrations
            )
            * 100,
            1,
        )

    popular = (
        db.query(
            Event.title,
            func.count(
                Registration.id
            ).label("count"),
        )
        .join(
            Registration,
            Registration.event_id
            == Event.id,
        )
        .group_by(
            Event.id
        )
        .order_by(
            func.count(
                Registration.id
            ).desc()
        )
        .first()
    )

    return {
        "total_events":
            total_events,

        "total_registrations":
            total_registrations,

        "attendance_marked":
            attendance_marked,

        "upcoming_events":
            upcoming_events,

        "attendance_rate":
            attendance_rate,

        "most_popular_event":
            popular.title
            if popular
            else "N/A",
    }