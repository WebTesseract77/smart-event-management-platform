from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EventSummary(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    title: str
    location: str

    start_date: datetime
    end_date: datetime

    capacity: int

    image_url: str | None = None

    is_team_event: bool
    is_paid_event: bool


class RegistrationRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int
    event_id: int

    registered_at: datetime

    # NEW
    qr_code_path: str | None = None

    event: EventSummary