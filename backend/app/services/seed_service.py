from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.models.event import Event
from backend.app.models.user import User
from backend.app.services.event_service import create_event
from backend.app.services.user_service import create_user, get_user_by_email


def seed_initial_data(db: Session) -> None:
    settings = get_settings()
    admin = get_user_by_email(db, settings.admin_email)
    if not admin:
        admin = create_user(
            db,
            name=settings.admin_name,
            email=settings.admin_email,
            password=settings.admin_password,
            role="admin",
        )

    has_events = db.execute(select(Event.id)).first() is not None
    if not has_events:
        create_event(
            db,
            title="Tech Leadership Summit",
            description="A sample event for demonstrating the event platform.",
            location="Main Convention Center",
            start_date=datetime.fromisoformat("2026-07-10T09:00:00+00:00"),
            end_date=datetime.fromisoformat("2026-07-10T17:00:00+00:00"),
            created_by=admin.id,
        )
