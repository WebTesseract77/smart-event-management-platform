from backend.app.models.registration import Registration
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_current_user,
    get_current_organizer_or_admin,
    get_db,
)

from backend.app.core.errors import (
    ConflictError,
    NotFoundError,
)

from backend.app.models.user import User

from backend.app.schemas.participant import (
    ParticipantRead,
)

from backend.app.schemas.registrations import (
    RegistrationRead,
)

from backend.app.schemas.team import (
    TeamSummary,
)

from backend.app.services.event_service import (
    get_event,
)

from backend.app.services.registration_service import (
    cancel_registration,
    my_registrations,
    register_user_for_event,
    get_event_participants,
)

from backend.app.services.team_service import (
    get_my_team_registrations,
)

router = APIRouter(
    prefix="",
    tags=["Registrations"],
)


@router.post(
    "/events/{event_id}/register",
    response_model=RegistrationRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        get_event(db, event_id)

        return register_user_for_event(
            db,
            user_id=current_user.id,
            event_id=event_id,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.delete(
    "/events/{event_id}/register",
    status_code=status.HTTP_204_NO_CONTENT,
)
def unregister(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        cancel_registration(
            db,
            user_id=current_user.id,
            event_id=event_id,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get(
    "/me/registrations",
    response_model=list[RegistrationRead],
)
def list_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return my_registrations(
        db,
        current_user.id,
    )


@router.get(
    "/me/team-registrations",
    response_model=list[TeamSummary],
)
def list_my_team_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_team_registrations(
        db,
        current_user.id,
    )


@router.get(
    "/events/{event_id}/participants",
    response_model=list[ParticipantRead],
)
def participants(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_organizer_or_admin
    ),
):
    try:
        return get_event_participants(
            db,
            event_id,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.get(
    "/registrations/{registration_id}"
)
def get_registration_details(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    registration = db.get(
        Registration,
        registration_id,
    )

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found",
        )

    if (
        current_user.role
        not in ["admin", "organizer"]
        and registration.user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized",
        )

    return {
        "registration_id": registration.id,
        "participant_name": registration.user.name,
        "participant_email": registration.user.email,
        "event_name": registration.event.title,
        "event_id": registration.event_id,
        "user_id": registration.user_id,
    }
