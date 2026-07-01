from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class EventBase(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=200,
    )

    description: str = Field(
        min_length=10,
    )

    location: str = Field(
        min_length=2,
        max_length=255,
    )

    image_url: str | None = None

    capacity: int = Field(
        default=100,
        ge=1,
        le=10000,
    )
    is_paid_event: bool = False

    registration_fee: float = Field(
        default=0,
        ge=0,
)

    is_team_event: bool = False

    min_team_size: int = Field(
        default=1,
        ge=1,
        le=20,
    )

    max_team_size: int = Field(
        default=1,
        ge=1,
        le=20,
    )
    max_teams: int | None = Field(
    default=None,
    ge=1,
)
    start_date: datetime
    end_date: datetime
    registration_deadline: datetime

    @field_validator("end_date")
    @classmethod
    def end_must_follow_start(
        cls,
        end_date: datetime,
        info,
    ):
        start_date = info.data.get(
            "start_date"
        )

        if (
            start_date
            and end_date <= start_date
        ):
            raise ValueError(
                "end_date must be after start_date"
            )

        return end_date

    @field_validator("registration_deadline")
    @classmethod
    def registration_must_be_before_start(
        cls,
        registration_deadline: datetime,
        info,
    ):
        start_date = info.data.get(
            "start_date"
        )

        if (
            start_date
            and registration_deadline >= start_date
        ):
            raise ValueError(
                "registration_deadline must be before start_date"
            )

        return registration_deadline

    @field_validator("max_team_size")
    @classmethod
    def validate_team_size(
        cls,
        max_team_size: int,
        info,
    ):
        min_team_size = info.data.get(
            "min_team_size"
        )

        if (
            min_team_size
            and max_team_size < min_team_size
        ):
            raise ValueError(
                "max_team_size must be greater than or equal to min_team_size"
            )

        return max_team_size


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
    )

    location: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    image_url: str | None = None

    capacity: int | None = Field(
        default=None,
        ge=1,
    )
    is_paid_event: bool | None = None

    registration_fee: float | None = Field(
      default=None,
      ge=0,
)
    is_team_event: bool | None = None

    min_team_size: int | None = Field(
        default=None,
        ge=1,
        le=20,
    )

    max_team_size: int | None = Field(
        default=None,
        ge=1,
        le=20,
    )
    max_teams: int | None = Field(
    default=None,
    ge=1,
)
    start_date: datetime | None = None
    end_date: datetime | None = None
    registration_deadline: datetime | None = None

    @field_validator("end_date")
    @classmethod
    def end_must_follow_start(
        cls,
        end_date: datetime | None,
        info,
    ):
        start_date = info.data.get(
            "start_date"
        )

        if (
            start_date
            and end_date
            and end_date <= start_date
        ):
            raise ValueError(
                "end_date must be after start_date"
            )

        return end_date


class EventRead(EventBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    created_by: int | None
    registered_count: int = 0
