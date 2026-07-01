from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session
from backend.app.schemas.admin import (
    AnalyticsRead,
)

from backend.app.services.admin_service import (
    get_analytics,
)
from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_db,
    get_current_admin,
)

from backend.app.core.errors import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)

from backend.app.models.user import User

from backend.app.schemas.user import (
    UserRoleUpdate,
    UserCreate,
    UserRead,
)

from backend.app.services.user_service import (
    create_user,
    list_users,
    update_user_role,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.post(
    "/create-organizer",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def create_organizer(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_admin
    ),
):
    try:
        return create_user(
            db,
            name=payload.name,
            email=payload.email,
            password=payload.password,
            role="organizer",
        )

    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "/users",
    response_model=list[UserRead],
)
def users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return list_users(db)


@router.patch(
    "/users/{user_id}/role",
    response_model=UserRead,
)
def update_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        return update_user_role(
            db,
            current_user=current_user,
            user_id=user_id,
            role=payload.role,
        )
    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
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
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
@router.get(
    "/analytics",
    response_model=AnalyticsRead,
)
def analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_admin
    ),
):
    return get_analytics(db)




