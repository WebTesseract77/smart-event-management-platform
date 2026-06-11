from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_db,
    get_current_admin,
)

from backend.app.core.errors import (
    ConflictError,
)

from backend.app.models.user import User

from backend.app.schemas.user import (
    UserCreate,
    UserRead,
)

from backend.app.services.user_service import (
    create_user,
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





