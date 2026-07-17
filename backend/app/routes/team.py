from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from backend.app.models.team_member import TeamMember
from backend.app.services.qr_service import generate_qr_image
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_current_user,
    get_db,
)

from backend.app.core.errors import (
    NotFoundError,
    ValidationError,
)

from backend.app.core.roles import (
    ROLE_ADMIN,
    ROLE_ORGANIZER,
)

from backend.app.models.user import User

from backend.app.schemas.team import (
    TeamCreate,
    TeamRead,
)

from backend.app.services.team_service import (
    create_team_registration,
    get_team_by_id,
)


router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
)


@router.post(
    "/register",
    response_model=TeamRead,
    status_code=status.HTTP_201_CREATED,
)
def register_team(
    payload: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

  
    if current_user.role in [
        ROLE_ADMIN,
        ROLE_ORGANIZER,
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only participants can register teams",
        )

    try:
        team = create_team_registration(
            db,
            event_id=payload.event_id,
            leader_user_id=current_user.id,
            team_name=payload.team_name,
            members=payload.members,
            payment_verified=False,
        )

        return team

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/{team_id}",
    response_model=TeamRead,
)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    team = get_team_by_id(db, team_id)

    if current_user.role == ROLE_ADMIN:
        pass
    elif (
        current_user.role == ROLE_ORGANIZER
        and team.event.created_by == current_user.id
    ):
        pass
    elif team.leader_user_id == current_user.id:
        pass
    elif any(
        member.email.lower() == current_user.email.lower()
        for member in team.members
    ):
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    organizer_name = (
        team.event.creator.name
        if hasattr(team.event, "creator") and team.event.creator
        else "EventSphere"
    )

    return {
        "id": team.id,
        "name": team.name,
        "event_id": team.event_id,
        "leader_user_id": team.leader_user_id,

        "event_title": team.event.title,
        "event_date": team.event.start_date,
        "event_location": team.event.location,
        "organizer_name": organizer_name,
        "is_paid_event": team.event.is_paid_event,

        "members": [
            {
                "id": member.id,
                "name": member.name,
                "email": member.email,
                "college": member.college,
                "branch": member.branch,
                "year": member.year,
                "semester": member.semester,
                "is_leader": member.is_leader,
                "qr_endpoint": f"/team-members/{member.id}/qr",
            }
            for member in team.members
        ],
    }
@router.get("/team-members/{member_id}/qr")
def get_team_member_qr(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.get(TeamMember, member_id)

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Team member not found",
        )

    team = member.team

    is_owner = (
        current_user.role == ROLE_ORGANIZER
        and team.event.created_by == current_user.id
    )

    if (
        current_user.role != ROLE_ADMIN
        and not is_owner
        and team.leader_user_id != current_user.id
        and member.email.lower() != current_user.email.lower()
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized",
        )

    return generate_qr_image(
        registration_id=member.id,
        user_id=team.leader_user_id,
        event_id=team.event_id,
    )

   