from pydantic import BaseModel


class AnalyticsRead(BaseModel):
    total_events: int
    total_registrations: int
    attendance_marked: int
    upcoming_events: int
    attendance_rate: float
    most_popular_event: str