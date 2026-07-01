from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class OrganizerEventSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    location: str
    image_url: str | None = None
    start_date: datetime
    end_date: datetime
    registration_deadline: datetime
    capacity: int
    is_team_event: bool
    is_paid_event: bool
    registration_fee: float
    registered_count: int = 0
    attendance_count: int = 0
    attendance_rate: float = 0
    revenue: float = 0
    status: str


class OrganizerAnalyticsRead(BaseModel):
    total_events: int
    total_registrations: int
    total_attendance: int
    attendance_rate: float
    total_revenue: float
    upcoming_events: int
    completed_events: int
    active_events: int
    event_summaries: list[OrganizerEventSummary] = Field(default_factory=list)
    recent_registrations: list[dict] = Field(default_factory=list)
    recent_attendance: list[dict] = Field(default_factory=list)
