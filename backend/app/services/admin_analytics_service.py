from datetime import datetime, timedelta, timezone

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from backend.app.core.roles import ROLE_ADMIN, ROLE_ORGANIZER
from backend.app.models.attendance import Attendance
from backend.app.models.event import Event
from backend.app.models.organizer_request import OrganizerRequest
from backend.app.models.registration import Registration
from backend.app.models.user import User


def get_admin_analytics(db: Session, start_date: datetime | None, end_date: datetime | None) -> dict:
    now = datetime.utcnow()
    start_date = start_date or now - timedelta(days=30)
    end_date = end_date or now
    event_scope = (Event.start_date >= start_date, Event.start_date <= end_date)
    registration_scope = (Registration.registered_at >= start_date, Registration.registered_at <= end_date)
    attendance_scope = (Attendance.recorded_at >= start_date, Attendance.recorded_at <= end_date)

    total_users = db.scalar(select(func.count(User.id))) or 0
    total_organizers = db.scalar(select(func.count(User.id)).where(User.role == ROLE_ORGANIZER)) or 0
    total_admins = db.scalar(select(func.count(User.id)).where(User.role == ROLE_ADMIN)) or 0
    total_events = db.scalar(select(func.count(Event.id)).where(*event_scope)) or 0
    upcoming_events = db.scalar(select(func.count(Event.id)).where(*event_scope, Event.start_date > now)) or 0
    completed_events = db.scalar(select(func.count(Event.id)).where(*event_scope, Event.end_date < now)) or 0
    total_registrations = db.scalar(select(func.count(Registration.id)).where(*registration_scope)) or 0
    attendance_marked = db.scalar(select(func.count(Attendance.id)).where(*attendance_scope)) or 0
    total_revenue = db.scalar(select(func.coalesce(func.sum(case((Registration.payment_status == "paid", Registration.amount_paid), else_=0)), 0)).where(*registration_scope)) or 0
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    todays_registrations = db.scalar(select(func.count(Registration.id)).where(Registration.registered_at >= today, Registration.registered_at <= now)) or 0

    registration_counts = select(Registration.event_id.label("event_id"), func.count(Registration.id).label("registrations")).where(*registration_scope).group_by(Registration.event_id).subquery()
    attendance_counts = select(Attendance.event_id.label("event_id"), func.count(Attendance.id).label("attendance")).where(*attendance_scope).group_by(Attendance.event_id).subquery()
    top_event_rows = db.execute(
        select(Event.id, Event.title, User.name, Event.start_date, func.coalesce(registration_counts.c.registrations, 0), func.coalesce(attendance_counts.c.attendance, 0))
        .outerjoin(User, User.id == Event.created_by)
        .outerjoin(registration_counts, registration_counts.c.event_id == Event.id)
        .outerjoin(attendance_counts, attendance_counts.c.event_id == Event.id)
        .where(*event_scope).order_by(func.coalesce(registration_counts.c.registrations, 0).desc()).limit(5)
    ).all()
    top_events = [{"id": row[0], "title": row[1], "organizer": row[2], "start_date": row[3], "registrations": int(row[4]), "attendance_rate": round((row[5] / row[4]) * 100, 1) if row[4] else 0} for row in top_event_rows]

    organizer_event_counts = select(Event.created_by.label("organizer_id"), func.count(Event.id).label("events_created")).where(*event_scope).group_by(Event.created_by).subquery()
    organizer_registration_counts = select(Event.created_by.label("organizer_id"), func.count(Registration.id).label("registrations")).join(Registration, Registration.event_id == Event.id).where(*registration_scope).group_by(Event.created_by).subquery()
    organizer_attendance_counts = select(Event.created_by.label("organizer_id"), func.count(Attendance.id).label("attendance")).join(Attendance, Attendance.event_id == Event.id).where(*attendance_scope).group_by(Event.created_by).subquery()
    organizer_rows = db.execute(
        select(User.id, User.name, func.coalesce(organizer_event_counts.c.events_created, 0), func.coalesce(organizer_registration_counts.c.registrations, 0), func.coalesce(organizer_attendance_counts.c.attendance, 0))
        .outerjoin(organizer_event_counts, organizer_event_counts.c.organizer_id == User.id)
        .outerjoin(organizer_registration_counts, organizer_registration_counts.c.organizer_id == User.id)
        .outerjoin(organizer_attendance_counts, organizer_attendance_counts.c.organizer_id == User.id)
        .where(User.role == ROLE_ORGANIZER).order_by(func.coalesce(organizer_registration_counts.c.registrations, 0).desc()).limit(5)
    ).all()
    top_organizers = [{"id": row[0], "name": row[1], "events_created": int(row[2]), "total_registrations": int(row[3]), "average_attendance": round((row[4] / row[3]) * 100, 1) if row[3] else 0} for row in organizer_rows]

    months = [(now.replace(day=1) - timedelta(days=31 * offset)).strftime("%Y-%m") for offset in range(11, -1, -1)]
    def month_expression(column):
        if db.bind and db.bind.dialect.name == "postgresql":
            return func.to_char(column, "YYYY-MM")
        return func.strftime("%Y-%m", column)

    registration_month = month_expression(Registration.registered_at)
    event_month = month_expression(Event.start_date)
    registration_month_rows = db.execute(select(registration_month, func.count(Registration.id), func.coalesce(func.sum(case((Registration.payment_status == "paid", Registration.amount_paid), else_=0)), 0)).where(Registration.registered_at >= now - timedelta(days=365), Registration.registered_at <= now).group_by(registration_month)).all()
    event_month_rows = db.execute(select(event_month, func.count(Event.id)).where(Event.start_date >= now - timedelta(days=365), Event.start_date <= now).group_by(event_month)).all()
    registrations = {row[0]: row[1] for row in registration_month_rows}
    revenue = {row[0]: float(row[2]) for row in registration_month_rows}
    events = {row[0]: row[1] for row in event_month_rows}
    monthly = lambda values: [{"month": month, "value": values.get(month, 0)} for month in months]

    activities = []
    for row in db.execute(select(Registration.id, User.name, Event.title, Registration.registered_at).join(User, User.id == Registration.user_id).join(Event, Event.id == Registration.event_id).where(*registration_scope).order_by(Registration.registered_at.desc()).limit(6)).all():
        activities.append({"id": f"registration-{row[0]}", "type": "registration", "title": "New registration", "description": f"{row[1]} registered for {row[2]}", "occurred_at": row[3]})
    for row in db.execute(select(OrganizerRequest.id, OrganizerRequest.status, User.name, OrganizerRequest.reviewed_at).join(User, User.id == OrganizerRequest.user_id).where(OrganizerRequest.status.in_(["approved", "rejected"]), OrganizerRequest.reviewed_at >= start_date, OrganizerRequest.reviewed_at <= end_date).order_by(OrganizerRequest.reviewed_at.desc()).limit(6)).all():
        activities.append({"id": f"request-{row[0]}", "type": row[1], "title": f"Organizer {row[1]}", "description": f"{row[2]}'s organizer application was {row[1]}", "occurred_at": row[3]})
    activities.sort(
        key=lambda item: (
            item["occurred_at"].replace(tzinfo=timezone.utc)
            if item["occurred_at"].tzinfo is None
            else item["occurred_at"]
        ),
        reverse=True,
    )

    return {"total_users": total_users, "total_organizers": total_organizers, "total_admins": total_admins, "total_events": total_events, "upcoming_events": upcoming_events, "completed_events": completed_events, "cancelled_events": None, "total_registrations": total_registrations, "todays_registrations": todays_registrations, "attendance_marked": attendance_marked, "attendance_rate": round((attendance_marked / total_registrations) * 100, 1) if total_registrations else 0, "total_revenue": float(total_revenue), "organizers_count": total_organizers, "most_popular_event": top_events[0]["title"] if top_events else "N/A", "monthly_events": monthly(events), "monthly_registrations": monthly(registrations), "monthly_revenue": monthly(revenue), "category_distribution": [], "categories_available": False, "top_events": top_events, "top_organizers": top_organizers, "recent_activity": activities[:10]}
