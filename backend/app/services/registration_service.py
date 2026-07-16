import asyncio
from datetime import datetime, timezone
from backend.app.models.user import User
from backend.app.services.email_service import (
    send_registration_email,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from backend.app.services.qr_service import generate_qr
from backend.app.core.errors import (
    ConflictError,
    NotFoundError,
    ValidationError,
)
from backend.app.models.event import Event
from backend.app.models.registration import Registration


def register_user_for_event(
    db: Session,
    *,
    user_id: int,
    event_id: int,
    payment_status: str = "pending",
    payment_id: str | None = None,
) -> Registration:
    def _now_like(value: datetime) -> datetime:
        return datetime.now(value.tzinfo) if value.tzinfo else datetime.now()

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .with_for_update()
        .one_or_none()
    )

    if not event:
        raise NotFoundError(
            "Event not found"
        )

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

    if event.end_date < _now_like(event.end_date):
        raise ConflictError(
            "Event has already ended"
        )
    if _now_like(event.registration_deadline) > event.registration_deadline:
        raise ValidationError(
            "Registration deadline has passed"
        )

    if event.is_paid_event and payment_status != "paid":
        raise ValidationError(
            "Payment is required for this event"
        )

    registrations_count = (
        db.query(Registration)
        .filter(Registration.event_id == event_id)
        .count()
    )

    if (
        registrations_count
        >= event.capacity
    ):
        raise ConflictError(
            "Event is full"
        )

    # Only a successfully verified paid registration should ever record an
    # amount. Free events, or any call that doesn't explicitly pass
    # payment_status="paid", keep amount_paid at 0 — same as before.
    amount_paid = (
        event.registration_fee
        if payment_status == "paid"
        else 0
    )

    registration = Registration(
        user_id=user_id,
        event_id=event_id,
        payment_status=payment_status,
        payment_id=payment_id,
        amount_paid=amount_paid,
    )

    db.add(registration)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(
            "Already registered for this event"
        ) from exc

    db.refresh(registration)
    registration.qr_code_path = generate_qr(
           registration_id=registration.id,
           user_id=registration.user_id,
           event_id=registration.event_id,
)

    db.commit()
    db.refresh(registration)
    
    user = db.get(User, user_id)

    if user:
        try:
            import threading

            threading.Thread(
                target=lambda: asyncio.run(
                    send_registration_email(
                         email=user.email,
                         participant_name=user.name,
                         event_name=event.title,
                         registration_id=registration.id,
                         user_id=user.id,
                         event_id=event.id,
)
                ),
                daemon=True,
            ).start()

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
