from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict


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


class TeamMemberRead(
    TeamMemberCreate
):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    qr_code_path: str | None = None


class TeamRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    name: str
    event_id: int
    leader_user_id: int

    members: list[TeamMemberRead]


class TeamSummary(BaseModel):
    team_id: int
    team_name: str
    event_id: int
    event_title: str
