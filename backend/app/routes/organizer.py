from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_current_organizer,
    get_db,
)
from backend.app.core.errors import ForbiddenError, NotFoundError
from backend.app.models.user import User
from backend.app.schemas.organizer import OrganizerAnalyticsRead
from backend.app.schemas.attendance import AttendanceRead
from backend.app.schemas.event import EventRead
from backend.app.schemas.participant import ParticipantRead
from backend.app.services.attendance_service import (
    get_event_attendance,
    mark_attendance,
)
from backend.app.services.event_service import (
    get_event_by_creator,
    list_events_by_creator,
)
from backend.app.services.organizer_service import (
    get_organizer_analytics,
)
from backend.app.services.registration_service import (
    get_event_participants,
)

router = APIRouter(prefix="/organizer", tags=["Organizer"])


def _get_owned_event(
    db: Session,
    event_id: int,
    organizer_id: int,
):
    return get_event_by_creator(
        db,
        event_id,
        organizer_id,
    )


@router.get("/events", response_model=list[EventRead])
def read_organizer_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    events = list_events_by_creator(
        db,
        current_user.id,
    )

    result = []

    for event in events:
        event_data = EventRead.model_validate(event)
        event_data.registered_count = len(event.registrations)
        result.append(event_data)

    return result


@router.get("/events/{event_id}", response_model=EventRead)
def read_organizer_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    try:
        event = _get_owned_event(db, event_id, current_user.id)
        event_data = EventRead.model_validate(event)
        event_data.registered_count = len(event.registrations)
        return event_data
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "/events/{event_id}/participants",
    response_model=list[ParticipantRead],
)
def read_organizer_participants(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    try:
        _get_owned_event(db, event_id, current_user.id)
        return get_event_participants(db, event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "/events/{event_id}/attendance",
    response_model=list[AttendanceRead],
)
def read_organizer_attendance(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    try:
        _get_owned_event(db, event_id, current_user.id)
        return get_event_attendance(db, event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.post(
    "/events/{event_id}/attendance/{user_id}",
    response_model=AttendanceRead,
)
def mark_organizer_attendance(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    try:
        _get_owned_event(db, event_id, current_user.id)
        return mark_attendance(db, event_id, user_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get("/analytics", response_model=OrganizerAnalyticsRead)
def read_organizer_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    return get_organizer_analytics(db, current_user.id)
