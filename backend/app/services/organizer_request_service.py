from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import Session

from backend.app.core.roles import (
    ROLE_USER,
    ROLE_ORGANIZER,
)

from backend.app.core.errors import (
    ConflictError,
    ForbiddenError,
    ValidationError,
)

from backend.app.models.user import User
from backend.app.models.organizer_request import OrganizerRequest


def _format_ist(dt: datetime) -> str:
    """
    Formats a naive datetime (already stored/interpreted as IST throughout
    this codebase) into a human-readable string, e.g.
    "17 Jul 2026, 10:30 AM IST". Purely a display helper — does not touch
    the value itself, no tz conversion, no tz-aware objects.
    """
    return dt.strftime("%d %b %Y, %I:%M %p IST")


def create_organizer_request(
    db: Session,
    *,
    current_user: User,
    organization: str,
    experience: str,
    event_categories: list[str],
    events_per_year: str,
    portfolio_url: str | None,
    reason: str,
) -> OrganizerRequest:

    # -------------------------------------------------
    # Only participants can apply
    # -------------------------------------------------

    if current_user.role != ROLE_USER:
        raise ForbiddenError(
            "Only participants can request organizer access."
        )

    # -------------------------------------------------
    # Email must be verified
    # -------------------------------------------------

    if not current_user.is_verified:
        raise ValidationError(
            "Please verify your email first."
        )

    # -------------------------------------------------
    # Basic profile validation
    # -------------------------------------------------

    if not current_user.name.strip():
        raise ValidationError(
            "Complete your profile first."
        )

    # -------------------------------------------------
    # Only one pending request
    # -------------------------------------------------

    pending = db.execute(
        select(OrganizerRequest).where(
            OrganizerRequest.user_id == current_user.id,
            OrganizerRequest.status == "pending",
        )
    ).scalar_one_or_none()

    if pending:
        raise ConflictError(
            "You already have a pending organizer request."
        )

    # -------------------------------------------------
    # 48-hour cooldown after rejection
    # -------------------------------------------------

    latest_rejected = db.execute(
        select(OrganizerRequest)
        .where(
            OrganizerRequest.user_id == current_user.id,
            OrganizerRequest.status == "rejected",
        )
        .order_by(
            OrganizerRequest.reviewed_at.desc()
        )
    ).scalars().first()

    if latest_rejected and latest_rejected.reviewed_at:

        allowed_date = (
            latest_rejected.reviewed_at
            + timedelta(hours=48)
        )

        if datetime.utcnow() < allowed_date:
            raise ConflictError(
                f"You can apply again after {_format_ist(allowed_date)}."
            )

    # -------------------------------------------------
    # Max 3 requests per year
    # -------------------------------------------------

    year_start = datetime(
        datetime.utcnow().year,
        1,
        1,
    )

    requests_this_year = db.execute(
        select(OrganizerRequest).where(
            OrganizerRequest.user_id == current_user.id,
            OrganizerRequest.created_at >= year_start,
        )
    ).scalars().all()

    if len(requests_this_year) >= 3:
        raise ConflictError(
            "Maximum organizer requests reached for this year."
        )

    # -------------------------------------------------
    # Save request
    # -------------------------------------------------

    organizer_request = OrganizerRequest(
        user_id=current_user.id,
        organization=organization,
        experience=experience,
        event_categories=",".join(event_categories),
        events_per_year=events_per_year,
        portfolio_url=portfolio_url,
        reason=reason,
        status="pending",
    )

    db.add(organizer_request)

    db.commit()
    db.refresh(organizer_request)

    organizer_request = (
         db.execute(
                select(OrganizerRequest)
               .options(joinedload(OrganizerRequest.applicant))
               .where(OrganizerRequest.id == organizer_request.id)
    )
    .scalar_one()
)

    return organizer_request

# -------------------------------------------------
# Get my latest organizer request
# -------------------------------------------------

def get_my_request(
    db: Session,
    user_id: int,
) -> OrganizerRequest | None:

    return (
        db.execute(
            select(OrganizerRequest)
            .where(
                OrganizerRequest.user_id == user_id
            )
            .order_by(
                OrganizerRequest.created_at.desc()
            )
        )
        .scalars()
        .first()
    )


# -------------------------------------------------
# Admin - List all requests
# -------------------------------------------------

def list_requests(db: Session) -> list[OrganizerRequest]:
    return (
        db.execute(
            select(OrganizerRequest)
            .options(joinedload(OrganizerRequest.applicant))
            .order_by(OrganizerRequest.created_at.desc())
        )
        .scalars()
        .all()
    )


# -------------------------------------------------
# Admin - Approve Request
# -------------------------------------------------

def approve_request(
    db: Session,
    *,
    request_id: int,
    admin_id: int,
):

    request = db.get(
        OrganizerRequest,
        request_id,
    )

    if not request:
        raise ValidationError(
            "Organizer request not found."
        )

    if request.status != "pending":
        raise ConflictError(
            "Request has already been reviewed."
        )

    user = db.get(
        User,
        request.user_id,
    )

    if not user:
        raise ValidationError(
            "User not found."
        )

    user.role = ROLE_ORGANIZER

    request.status = "approved"
    request.reviewed_by = admin_id
    request.reviewed_at = datetime.utcnow()

    db.commit()

    db.refresh(request)

    request = (
              db.execute(
                  select(OrganizerRequest)
                 .options(joinedload(OrganizerRequest.applicant))
                 .where(OrganizerRequest.id == request.id)
    )
    .scalar_one()
)

    return request


# -------------------------------------------------
# Admin - Reject Request
# -------------------------------------------------

def reject_request(
    db: Session,
    *,
    request_id: int,
    admin_id: int,
    remark: str,
):

    request = db.get(
        OrganizerRequest,
        request_id,
    )

    if not request:
        raise ValidationError(
            "Organizer request not found."
        )

    if request.status != "pending":
        raise ConflictError(
            "Request has already been reviewed."
        )

    if not remark.strip():
        raise ValidationError(
            "Admin remark is required."
        )

    request.status = "rejected"
    request.admin_remark = remark
    request.reviewed_by = admin_id
    request.reviewed_at = datetime.utcnow()

    db.commit()

    db.refresh(request)

    request = (
                  db.execute(
                  select(OrganizerRequest)
                  .options(joinedload(OrganizerRequest.applicant))
                  .where(OrganizerRequest.id == request.id)
    )
    .scalar_one()
)

    return request