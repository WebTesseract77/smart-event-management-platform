from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


# -----------------------------
# Participant creates request
# -----------------------------

class OrganizerRequestCreate(BaseModel):
    organization: str = Field(
        min_length=2,
        max_length=255,
    )

    experience: str = Field(
        min_length=2,
        max_length=100,
    )

    event_categories: list[str] = Field(
        min_length=1,
    )

    events_per_year: str = Field(
        min_length=1,
        max_length=30,
    )

    portfolio_url: HttpUrl | None = None

    reason: str = Field(
        min_length=100,
        max_length=1000,
    )


# -----------------------------
# Admin Review
# -----------------------------

class OrganizerRequestReview(BaseModel):
    status: str = Field(
        pattern="^(approved|rejected)$",
    )

    admin_remark: str | None = Field(
        default=None,
        max_length=1000,
    )


# -----------------------------
# API Response
# -----------------------------

class OrganizerRequestRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    user_id: int

    # -------------------------
    # Applicant Information
    # -------------------------
    name: str

    email: str

    # -------------------------
    # Organizer Request
    # -------------------------
    organization: str

    experience: str

    event_categories: str

    events_per_year: str

    portfolio_url: str | None

    reason: str

    # -------------------------
    # Review
    # -------------------------
    status: str

    admin_remark: str | None

    reviewed_by: int | None

    created_at: datetime

    reviewed_at: datetime | None