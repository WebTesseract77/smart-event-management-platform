from datetime import datetime, timezone

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from backend.app.models.attendance import Attendance
from backend.app.models.event import Event
from backend.app.models.registration import Registration


def get_organizer_analytics(db: Session, organizer_id: int):
    now = datetime.now(timezone.utc)

    events = list(
        db.execute(
            select(Event)
            .where(Event.created_by == organizer_id)
            .order_by(Event.start_date.desc())
        )
        .scalars()
        .all()
    )

    event_ids = [event.id for event in events]

    registrations_by_event = {}
    attendance_by_event = {}
    revenue_by_event = {}

    if event_ids:
        registrations_by_event = {
            row.event_id: row.count
            for row in db.execute(
                select(
                    Registration.event_id.label("event_id"),
                    func.count(Registration.id).label("count"),
                )
                .where(Registration.event_id.in_(event_ids))
                .group_by(Registration.event_id)
            ).all()
        }

        attendance_by_event = {
            row.event_id: row.count
            for row in db.execute(
                select(
                    Attendance.event_id.label("event_id"),
                    func.count(Attendance.id).label("count"),
                )
                .where(Attendance.event_id.in_(event_ids))
                .group_by(Attendance.event_id)
            ).all()
        }

        revenue_by_event = {
            row.event_id: float(row.revenue or 0)
            for row in db.execute(
                select(
                    Registration.event_id.label("event_id"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Registration.payment_status == "paid",
                                    Registration.amount_paid,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("revenue"),
                )
                .where(Registration.event_id.in_(event_ids))
                .group_by(Registration.event_id)
            ).all()
        }

    total_events = len(events)
    total_registrations = sum(registrations_by_event.get(event.id, 0) for event in events)
    total_attendance = sum(attendance_by_event.get(event.id, 0) for event in events)
    total_revenue = float(sum(revenue_by_event.get(event.id, 0) for event in events))
    upcoming_events = sum(1 for event in events if event.start_date > now)
    completed_events = sum(1 for event in events if event.end_date < now)
    active_events = total_events - upcoming_events - completed_events
    attendance_rate = round((total_attendance / total_registrations) * 100, 1) if total_registrations else 0

    event_summaries = []
    for event in events:
        registered_count = int(registrations_by_event.get(event.id, 0))
        attendance_count = int(attendance_by_event.get(event.id, 0))
        revenue = float(revenue_by_event.get(event.id, 0))
        summary_rate = round((attendance_count / registered_count) * 100, 1) if registered_count else 0

        event_summaries.append(
            {
                "id": event.id,
                "title": event.title,
                "location": event.location,
                "image_url": event.image_url,
                "start_date": event.start_date,
                "end_date": event.end_date,
                "registration_deadline": event.registration_deadline,
                "capacity": event.capacity,
                "is_team_event": event.is_team_event,
                "is_paid_event": event.is_paid_event,
                "registration_fee": event.registration_fee,
                "registered_count": registered_count,
                "attendance_count": attendance_count,
                "attendance_rate": summary_rate,
                "revenue": revenue,
                "status": "Ended"
                if event.end_date < now
                else "Live"
                if event.start_date <= now <= event.end_date
                else "Upcoming",
            }
        )

    recent_registrations = list(
        db.execute(
            select(
                Registration.id.label("id"),
                Registration.registered_at.label("registered_at"),
                Registration.event_id.label("event_id"),
                Event.title.label("event_title"),
                Event.location.label("location"),
                Registration.user_id.label("user_id"),
            )
            .join(Event, Event.id == Registration.event_id)
            .where(Event.created_by == organizer_id)
            .order_by(Registration.registered_at.desc())
            .limit(6)
        ).mappings().all()
    )

    recent_attendance = list(
        db.execute(
            select(
                Attendance.id.label("id"),
                Attendance.recorded_at.label("recorded_at"),
                Attendance.event_id.label("event_id"),
                Event.title.label("event_title"),
                Event.location.label("location"),
                Attendance.user_id.label("user_id"),
            )
            .join(Event, Event.id == Attendance.event_id)
            .where(Event.created_by == organizer_id)
            .order_by(Attendance.recorded_at.desc())
            .limit(6)
        ).mappings().all()
    )

    return {
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_attendance": total_attendance,
        "attendance_rate": attendance_rate,
        "total_revenue": total_revenue,
        "upcoming_events": upcoming_events,
        "completed_events": completed_events,
        "active_events": active_events,
        "event_summaries": event_summaries,
        "recent_registrations": recent_registrations,
        "recent_attendance": recent_attendance,
    }
