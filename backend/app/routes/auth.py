from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    BackgroundTasks,
)

from sqlalchemy.orm import Session

from backend.app.core.dependencies import get_db
from backend.app.core.errors import (
    AuthenticationError,
    ConflictError,
)

from backend.app.core.security import (
    create_access_token,
    get_password_hash,
)

from backend.app.schemas.user import (
    Token,
    UserCreate,
    UserLogin,
    UserRead,
)

from backend.app.services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
)

from backend.app.services.otp_service import (
    generate_otp,
    send_verification_otp,
    send_reset_otp,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        user = create_user(
            db,
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )

        otp = generate_otp()

        user.verification_otp = otp

        db.commit()

        background_tasks.add_task(
            send_verification_otp,
            user.email,
            otp,
        )

        return user

    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.post(
    "/login",
    response_model=Token,
)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    try:
        user = authenticate_user(
            db,
            payload.email,
            payload.password,
        )

    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    token = create_access_token(
        subject=str(user.id),
        role=user.role,
    )

    return Token(
        access_token=token,
    )


@router.post("/send-verification-otp")
async def send_verification(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    otp = generate_otp()

    user.verification_otp = otp

    db.commit()

    background_tasks.add_task(
        send_verification_otp,
        user.email,
        otp,
    )

    return {
        "message": "OTP sent successfully"
    }


@router.post("/verify-email")
def verify_email(
    email: str,
    otp: str,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.verification_otp != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP",
        )

    user.is_verified = True
    user.verification_otp = None

    db.commit()

    return {
        "message":
        "Email verified successfully"
    }


@router.post("/forgot-password")
async def forgot_password(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    otp = generate_otp()

    user.reset_otp = otp

    db.commit()

    background_tasks.add_task(
        send_reset_otp,
        user.email,
        otp,
    )

    return {
        "message":
        "Reset OTP sent"
    }


@router.post("/reset-password")
def reset_password(
    email: str,
    otp: str,
    new_password: str,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.reset_otp != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP",
        )

    user.password_hash = get_password_hash(
        new_password
    )

    user.reset_otp = None

    db.commit()

    return {
        "message":
        "Password reset successful"
    }