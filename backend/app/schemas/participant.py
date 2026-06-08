from pydantic import BaseModel


class ParticipantRead(BaseModel):
    id: int
    name: str
    email: str