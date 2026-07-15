from datetime import datetime

from pydantic import BaseModel, Field


class MonthlyMetric(BaseModel):
    month: str
    value: float = 0


class TopEvent(BaseModel):
    id: int
    title: str
    organizer: str | None = None
    registrations: int = 0
    attendance_rate: float = 0
    start_date: datetime


class TopOrganizer(BaseModel):
    id: int
    name: str
    events_created: int = 0
    total_registrations: int = 0
    average_attendance: float = 0


class AdminActivity(BaseModel):
    id: str
    type: str
    title: str
    description: str
    occurred_at: datetime


class AdminAnalyticsRead(BaseModel):
    total_users: int
    total_organizers: int
    total_admins: int
    total_events: int
    upcoming_events: int
    completed_events: int
    cancelled_events: int | None = None
    total_registrations: int
    todays_registrations: int
    attendance_marked: int
    attendance_rate: float
    total_revenue: float
    organizers_count: int
    most_popular_event: str
    monthly_events: list[MonthlyMetric] = Field(default_factory=list)
    monthly_registrations: list[MonthlyMetric] = Field(default_factory=list)
    monthly_revenue: list[MonthlyMetric] = Field(default_factory=list)
    category_distribution: list[MonthlyMetric] = Field(default_factory=list)
    categories_available: bool = False
    top_events: list[TopEvent] = Field(default_factory=list)
    top_organizers: list[TopOrganizer] = Field(default_factory=list)
    recent_activity: list[AdminActivity] = Field(default_factory=list)
