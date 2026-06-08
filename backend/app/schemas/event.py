from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EventBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    location: str = Field(min_length=2, max_length=255)
    start_date: datetime
    end_date: datetime

    @field_validator("end_date")
    @classmethod
    def end_must_follow_start(cls, end_date: datetime, info):
        start_date = info.data.get("start_date")
        if start_date and end_date <= start_date:
            raise ValueError("end_date must be after start_date")
        return end_date


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=10)
    location: str | None = Field(default=None, min_length=2, max_length=255)
    start_date: datetime | None = None
    end_date: datetime | None = None

    @field_validator("end_date")
    @classmethod
    def end_must_follow_start(cls, end_date: datetime | None, info):
        start_date = info.data.get("start_date")
        if start_date and end_date and end_date <= start_date:
            raise ValueError("end_date must be after start_date")
        return end_date


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int

