from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

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

    team = get_team_by_id(
        db,
        team_id,
    )


    # admin can view all teams
    if current_user.role == ROLE_ADMIN:
        return team


    if (
        current_user.role == ROLE_ORGANIZER
        and team.event.created_by == current_user.id
    ):
        return team

    if team.leader_user_id == current_user.id:
        return team

    if any(
        member.email.lower()
        == current_user.email.lower()
        for member in team.members
    ):
        return team


    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized",
    )