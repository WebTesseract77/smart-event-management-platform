from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_current_user,
    get_current_organizer,
    get_current_organizer_or_admin,
    get_db,
)
from backend.app.core.errors import (
    ForbiddenError,
    NotFoundError,
)
from backend.app.models.user import User
from backend.app.schemas.event import (
    EventCreate,
    EventRead,
    EventUpdate,
)
from backend.app.services.event_service import (
    create_event,
    delete_event,
    get_event,
    list_events,
    update_event,
)

router = APIRouter(
    prefix="/events",
    tags=["Events"],
)


@router.get(
    "",
    response_model=list[EventRead],
)
def read_events(
    db: Session = Depends(get_db),
):
    events = list_events(db)

    result = []

    for event in events:
        event_data = EventRead.model_validate(
            event
        )

        event_data.registered_count = len(
            event.registrations
        )

        result.append(
            event_data
        )

    return result


@router.get(
    "/{event_id}",
    response_model=EventRead,
)
def read_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    try:
        event = get_event(
            db,
            event_id,
        )

        event_data = EventRead.model_validate(
            event
        )

        event_data.registered_count = len(
            event.registrations
        )

        return event_data

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post(
    "",
    response_model=EventRead,
    status_code=status.HTTP_201_CREATED,
)
def add_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_organizer
    ),
):
    event = create_event(
    db,
    title=payload.title,
    description=payload.description,
    location=payload.location,
    image_url=payload.image_url,
    capacity=payload.capacity,
    is_team_event=payload.is_team_event,
    min_team_size=payload.min_team_size,
    max_team_size=payload.max_team_size,
    is_paid_event=payload.is_paid_event,
registration_fee=payload.registration_fee,
    max_teams=payload.max_teams,
    start_date=payload.start_date,
    end_date=payload.end_date,
    registration_deadline=
        payload.registration_deadline,
    created_by=current_user.id,
)

    event_data = EventRead.model_validate(
        event
    )

    event_data.registered_count = 0

    return event_data


@router.patch(
    "/{event_id}",
    response_model=EventRead,
)
def edit_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        event = update_event(
            db,
            event_id,
            updater_role=current_user.role,
            updater_id=current_user.id,
            **payload.model_dump(
                exclude_unset=True
            ),
        )

        event_data = EventRead.model_validate(
            event
        )

        event_data.registered_count = len(
            event.registrations
        )

        return event_data

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except ForbiddenError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        delete_event(
            db,
            event_id,
            deleter_role=current_user.role,
            deleter_id=current_user.id,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except ForbiddenError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )