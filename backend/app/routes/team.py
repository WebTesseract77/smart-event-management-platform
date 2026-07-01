from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session
from backend.app.services.team_service import (
    get_team_by_id,
)
from backend.app.core.dependencies import (
    get_current_user,
    get_db,
)

from backend.app.core.errors import (
    NotFoundError,
    ValidationError,
)

from backend.app.models.user import User
from backend.app.core.roles import ROLE_ADMIN, ROLE_ORGANIZER

from backend.app.schemas.team import (
    TeamCreate,
    TeamRead,
)

from backend.app.services.team_service import (
    create_team_registration,
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
    current_user: User = Depends(
        get_current_user
    ),
):
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
            status_code=404,
            detail=str(exc),
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
@router.get(
    "/{team_id}",
    response_model=TeamRead,
)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    team = get_team_by_id(
        db,
        team_id,
    )

    if current_user.role in [
        ROLE_ADMIN,
        ROLE_ORGANIZER,
    ]:
        return team

    if team.leader_user_id == current_user.id:
        return team

    if any(
        member.email.lower()
        == current_user.email.lower()
        for member in team.members
    ):
        return team

    from fastapi import HTTPException

    raise HTTPException(
        status_code=403,
        detail="Not authorized",
    )
