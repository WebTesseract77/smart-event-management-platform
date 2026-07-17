from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class TeamMemberCreate(BaseModel):
    name: str
    email: EmailStr
    college: str
    branch: str
    year: str
    semester: str
    is_leader: bool = False


class TeamCreate(BaseModel):
    event_id: int
    team_name: str
    members: list[TeamMemberCreate]


class TeamMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    college: str
    branch: str
    year: str
    semester: str
    is_leader: bool

    # NEW
    qr_endpoint: str | None = None


class TeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str

    event_id: int
    leader_user_id: int

    # Event Information
    event_title: str
    event_date: datetime
    event_location: str
    organizer_name: str
    is_paid_event: bool

    members: list[TeamMemberRead]


class TeamSummary(BaseModel):
    team_id: int
    team_name: str
    event_id: int
    event_title: str