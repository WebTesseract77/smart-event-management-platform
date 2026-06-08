import asyncio

from backend.app.models.user import User
from backend.app.services.email_service import (
    send_registration_email,
)

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.core.errors import ConflictError, NotFoundError
from backend.app.models.event import Event
from backend.app.models.registration import Registration


def register_user_for_event(
    db: Session,
    *,
    user_id: int,
    event_id: int,
) -> Registration:
    existing = db.execute(
        select(Registration).where(
            Registration.user_id == user_id,
            Registration.event_id == event_id,
        )
    ).scalar_one_or_none()

    if existing:
        raise ConflictError(
            "Already registered for this event"
        )

    registration = Registration(
        user_id=user_id,
        event_id=event_id,
    )

    db.add(registration)
    db.commit()
    db.refresh(registration)

    user = db.get(User, user_id)
    event = db.get(Event, event_id)

    if user and event:
        try:
            import asyncio

            asyncio.run(
               send_registration_email(
                  email=user.email,
                  participant_name=user.name,
                  event_name=event.title,
                  registration_id=registration.id,
            )
        )
        except Exception as e:
            print(
                f"Email sending failed: {e}"
            )

    return registration

def cancel_registration(
    db: Session,
    *,
    user_id: int,
    event_id: int,
) -> None:
    registration = db.execute(
        select(Registration).where(
            Registration.user_id == user_id,
            Registration.event_id == event_id,
        )
    ).scalar_one_or_none()

    if not registration:
        raise NotFoundError(
            "Registration not found"
        )

    db.delete(registration)
    db.commit()


def my_registrations(
    db: Session,
    user_id: int,
) -> list[Registration]:
    return list(
        db.execute(
            select(Registration)
            .options(
                joinedload(
                    Registration.event
                )
            )
            .where(
                Registration.user_id
                == user_id
            )
        )
        .scalars()
        .all()
    )


def get_event_participants(
    db: Session,
    event_id: int,
):
    event = db.get(
        Event,
        event_id,
    )

    if not event:
        raise NotFoundError(
            "Event not found"
        )

    participants = []

    for registration in event.registrations:
        participants.append(
            {
                "id": registration.user.id,
                "name": registration.user.name,
                "email": registration.user.email,
            }
        )

    return participants