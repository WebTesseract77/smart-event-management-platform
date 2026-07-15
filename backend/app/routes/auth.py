from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    BackgroundTasks,
    Request,
)
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

IST = ZoneInfo("Asia/Kolkata")

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

# Rate limiting
from backend.app.main import limiter


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# =========================
# REGISTER
# =========================

@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("3/hour")
async def register(
    request: Request,
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
        user.verification_otp_expires_at = (
             datetime.now(IST) + timedelta(minutes=10)
        )

        user.is_verified = False

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



# =========================
# LOGIN
# =========================

@router.post(
    "/login",
    response_model=Token,
)
@limiter.limit("5/minute")
def login(
    request: Request,
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


    # block users without OTP verification
    if not user.is_verified:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before login",
        )


    token = create_access_token(
        subject=str(user.id),
        role=user.role,
    )


    return Token(
        access_token=token,
    )



# =========================
# RESEND EMAIL OTP
# =========================

@router.post(
    "/send-verification-otp"
)
@limiter.limit("3 per 10 minutes")
async def send_verification(
    request: Request,
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


    if user.is_verified:

        return {
            "message":
            "Email already verified"
        }


    otp = generate_otp()

    user.verification_otp = otp
    user.verification_otp_expires_at = (
           datetime.now(IST) + timedelta(minutes=10)
)

    db.commit()

    background_tasks.add_task(
        send_verification_otp,
        user.email,
        otp,
    )


    return {
        "message":
        "OTP sent successfully"
    }



# =========================
# VERIFY EMAIL
# =========================

@router.post(
    "/verify-email"
)
@limiter.limit("10 per 10 minutes")
def verify_email(
    request: Request,
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


    if (
        user.verification_otp is None
        or user.verification_otp != otp
    ):

        raise HTTPException(
               status_code=400,
               detail="Invalid OTP",
    )

    if (
        user.verification_otp_expires_at
        and datetime.now(IST)
        > user.verification_otp_expires_at
):

        user.verification_otp = None
        user.verification_otp_expires_at = None

        db.commit()

        raise HTTPException(
           status_code=400,
           detail="Verification OTP has expired. Please request a new OTP.",
    )

    user.is_verified = True

    user.verification_otp = None
    user.verification_otp_expires_at = None

    db.commit()


    return {
        "message":
        "Email verified successfully"
    }



# =========================
# FORGOT PASSWORD
# =========================

@router.post(
    "/forgot-password"
)
@limiter.limit("3 per 10 minutes")
async def forgot_password(
    request: Request,
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
    user.reset_otp_expires_at = (
        datetime.now(IST) + timedelta(minutes=10)
    )


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



# =========================
# RESET PASSWORD
# =========================

@router.post(
    "/reset-password"
)
@limiter.limit("5 per 10 minutes")
def reset_password(
    request: Request,
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


    if (
        user.reset_otp is None
        or user.reset_otp != otp
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP",
        )


    if (
        user.reset_otp_expires_at
        and datetime.now(IST)
        > user.reset_otp_expires_at
    ):

        user.reset_otp = None
        user.reset_otp_expires_at = None

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Reset OTP has expired. Please request a new OTP.",
        )


    user.password_hash = get_password_hash(
        new_password
    )


    user.reset_otp = None
    user.reset_otp_expires_at = None


    db.commit()


    return {
        "message":
        "Password reset successful"
    }