from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.errors import ForbiddenError, NotFoundError, ValidationError
from backend.app.models.event import Event


def list_events(db: Session) -> list[Event]:
    return list(db.execute(select(Event).order_by(Event.start_date)).scalars().all())


def get_event(db: Session, event_id: int) -> Event:
    event = db.get(Event, event_id)
    if not event:
        raise NotFoundError("Event not found")
    return event


def create_event(
    db: Session,
    *,
    title: str,
    description: str,
    location: str,
    image_url: str | None = None,
    start_date,
    end_date,
    created_by: int,
) -> Event:
    if end_date <= start_date:
        raise ValidationError("end_date must be after start_date")
    event = Event(
    title=title,
    description=description,
    location=location,
    image_url=image_url,
    start_date=start_date,
    end_date=end_date,
    created_by=created_by,
)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event_id: int, *, updater_role: str, updater_id: int, **changes) -> Event:
    event = get_event(db, event_id)
    if updater_role != "admin" and event.created_by != updater_id:
        raise ForbiddenError("You cannot edit this event")
    start_date = changes.get("start_date", event.start_date)
    end_date = changes.get("end_date", event.end_date)
    if end_date is not None and start_date is not None and end_date <= start_date:
        raise ValidationError("end_date must be after start_date")
    for key, value in changes.items():
        if value is not None:
            setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: int, *, deleter_role: str, deleter_id: int) -> None:
    event = get_event(db, event_id)
    if deleter_role != "admin" and event.created_by != deleter_id:
        raise ForbiddenError("You cannot delete this event")
    db.delete(event)
    db.commit()
