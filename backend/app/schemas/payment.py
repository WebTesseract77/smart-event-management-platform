from typing import Literal

from pydantic import BaseModel

from backend.app.schemas.team import TeamMemberCreate


class CreateOrderRequest(BaseModel):
    event_id: int


class VerifyPaymentRequest(BaseModel):
    event_id: int

    razorpay_order_id: str

    razorpay_payment_id: str

    razorpay_signature: str

    registration_type: Literal["individual", "team"] = "individual"
    team_name: str | None = None
    members: list[TeamMemberCreate] | None = None
