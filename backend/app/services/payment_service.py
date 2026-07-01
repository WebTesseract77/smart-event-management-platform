import razorpay

from backend.app.core.config import get_settings

settings = get_settings()

client = razorpay.Client(
    auth=(
        settings.razorpay_key_id,
        settings.razorpay_key_secret,
    )
)


def create_order(*, amount: float, user_id: int, event_id: int):
    order = client.order.create(
    {
        "amount": int(amount * 100),
        "currency": "INR",
        "receipt": "EVENTSPHERE",
        "notes": {
            "project": "EventSphere",
            "user_id": str(user_id),
            "event_id": str(event_id),
        },
        "payment_capture": 1,
    }
)

    return order


def verify_payment(
    *,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    user_id: int,
    event_id: int,
):
    try:
        order = client.order.fetch(razorpay_order_id)
    except Exception as exc:
        raise ValueError("Invalid Razorpay order") from exc

    notes = order.get("notes") or {}

    if notes.get("user_id") != str(user_id) or notes.get("event_id") != str(event_id):
        raise ValueError(
            "Payment order does not match the authenticated user or event"
        )

    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
    )

    return True
