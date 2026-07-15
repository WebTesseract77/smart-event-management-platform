import asyncio
import threading

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_current_admin,
    get_current_user,
    get_db,
)

from backend.app.core.errors import (
    ConflictError,
    ForbiddenError,
    ValidationError,
)

from backend.app.models.user import User
from backend.app.models.organizer_request import OrganizerRequest

from backend.app.schemas.organizer_request import (
    OrganizerRequestCreate,
    OrganizerRequestRead,
    OrganizerRequestReview,
)

from backend.app.services.organizer_request_service import (
    approve_request,
    create_organizer_request,
    get_my_request,
    list_requests,
    reject_request,
)
from backend.app.services.organizer_email_service import (
    send_organizer_application_received_email,
    send_organizer_approved_email,
    send_organizer_rejected_email,
)

router = APIRouter(
    prefix="/organizer-request",
    tags=["Organizer Requests"],
)


# -------------------------------------------------------
# Helpers
# -------------------------------------------------------

def _cooldown_until(request: OrganizerRequest) -> datetime | None:
    """
    Only populated for rejected requests. Mirrors the 48-hour window
    enforced server-side in create_organizer_request(); this is purely
    a read-side projection for the client to render a countdown from.
    """
    if request.status == "rejected" and request.reviewed_at:
        return request.reviewed_at + timedelta(hours=48)
    return None


def _to_read_model(request: OrganizerRequest) -> OrganizerRequestRead:
    return OrganizerRequestRead(
        id=request.id,
        user_id=request.user_id,

        name=request.applicant.name,
        email=request.applicant.email,

        organization=request.organization,
        experience=request.experience,
        event_categories=request.event_categories,
        events_per_year=request.events_per_year,
        portfolio_url=request.portfolio_url,
        reason=request.reason,

        status=request.status,
        admin_remark=request.admin_remark,

        reviewed_by=request.reviewed_by,
        created_at=request.created_at,
        reviewed_at=request.reviewed_at,

        cooldown_until=_cooldown_until(request),
    )


# -------------------------------------------------------
# Participant - Create Organizer Request
# -------------------------------------------------------

@router.post(
    "",
    response_model=OrganizerRequestRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_request(
    payload: OrganizerRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:

        request = create_organizer_request(
            db=db,
            current_user=current_user,
            organization=payload.organization,
            experience=payload.experience,
            event_categories=payload.event_categories,
            events_per_year=payload.events_per_year,
            portfolio_url=str(payload.portfolio_url)
            if payload.portfolio_url
            else None,
            reason=payload.reason,
        )

        try:
            threading.Thread(
                target=lambda: asyncio.run(
                    send_organizer_application_received_email(
                        email=request.applicant.email,
                        name=request.applicant.name,
                    )
                ),
                daemon=True,
            ).start()
        except Exception as exc:
            print(f"Organizer application email sending failed: {exc}")

        return _to_read_model(request)

    except ForbiddenError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# -------------------------------------------------------
# Participant - My Request
# -------------------------------------------------------

@router.get(
    "/me",
    response_model=OrganizerRequestRead | None,
)
def my_request(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    request = get_my_request(
        db,
        current_user.id,
    )

    if not request:
        return None

    return _to_read_model(request)


# -------------------------------------------------------
# Admin - List Requests
# -------------------------------------------------------

@router.get(
    "",
    response_model=list[OrganizerRequestRead],
)
def all_requests(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):

    requests = list_requests(db)

    return [_to_read_model(x) for x in requests]


# -------------------------------------------------------
# Admin - Review Request
# -------------------------------------------------------

@router.patch(
    "/{request_id}",
    response_model=OrganizerRequestRead,
)
def review_request(
    request_id: int,
    payload: OrganizerRequestReview,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):

    try:

        if payload.status == "approved":

            request = approve_request(
                db=db,
                request_id=request_id,
                admin_id=current_admin.id,
            )

        else:

            request = reject_request(
                db=db,
                request_id=request_id,
                admin_id=current_admin.id,
                remark=payload.admin_remark or "",
            )

        try:
            if request.status == "approved":
                notification = send_organizer_approved_email(
                    email=request.applicant.email,
                    name=request.applicant.name,
                )
            else:
                notification = send_organizer_rejected_email(
                    email=request.applicant.email,
                    name=request.applicant.name,
                    admin_remark=request.admin_remark or "",
                    cooldown_until=(
                        request.reviewed_at + timedelta(hours=48)
                        if request.reviewed_at
                        else None
                    ),
                )

            threading.Thread(
                target=lambda: asyncio.run(notification),
                daemon=True,
            ).start()
        except Exception as exc:
            print(f"Organizer review email sending failed: {exc}")

        return _to_read_model(request)

    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )