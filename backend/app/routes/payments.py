import logging

import razorpay
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
   get_db,
)
from backend.app.core.errors import (
    ConflictError,
    NotFoundError,
    ValidationError,
)
from backend.app.models.event import Event

from backend.app.schemas.payment import (
    CreateOrderRequest,
    VerifyPaymentRequest,
)
from backend.app.services.payment_service import (
    create_order,
)
from backend.app.core.dependencies import (
    get_db,
    get_current_user,
)

from backend.app.models.user import User

from backend.app.schemas.payment import (
    CreateOrderRequest,
    VerifyPaymentRequest,
)

from backend.app.services.payment_service import (
    create_order,
    verify_payment,
)

from backend.app.services.registration_service import (
    register_user_for_event,
)
from backend.app.services.team_service import (
    create_team_registration,
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)

logger = logging.getLogger(__name__)


@router.post("/create-order")
def create_payment_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.get(Event, payload.event_id)

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    if not event.is_paid_event:
        raise HTTPException(
            status_code=400,
            detail="This event is free",
        )

    order = create_order(
        amount=event.registration_fee,
        user_id=current_user.id,
        event_id=event.id,
    )

    return {
        "order": order,
        "event_title": event.title,
        "amount": event.registration_fee,
    }
@router.post(
    "/verify",
)
def verify_payment_and_register(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        verify_payment(
            razorpay_order_id=payload.razorpay_order_id,
            razorpay_payment_id=payload.razorpay_payment_id,
            razorpay_signature=payload.razorpay_signature,
            user_id=current_user.id,
            event_id=payload.event_id,
        )

        if payload.registration_type == "team":
            if not payload.team_name or not payload.members:
                raise HTTPException(
                    status_code=400,
                    detail="Team details are required",
                )

            team = create_team_registration(
                db,
                event_id=payload.event_id,
                leader_user_id=current_user.id,
                team_name=payload.team_name,
                members=payload.members,
                payment_verified=True,
            )

            return team

        registration = register_user_for_event(
            db,
            user_id=current_user.id,
            event_id=payload.event_id,
            payment_status="paid",
            payment_id=payload.razorpay_payment_id,
        )

        return registration

    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature",
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except ConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        logger.exception(
            "Payment verification failed for user_id=%s event_id=%s",
            current_user.id,
            payload.event_id,
        )
        raise HTTPException(
            status_code=500,
            detail="Payment verification failed",
        )