from datetime import datetime

from pydantic import BaseModel


class AttendanceRead(BaseModel):
    id: int
    event_id: int
    user_id: int

    user_name: str
    user_email: str

    recorded_at: datetime

    model_config = {
        "from_attributes": True,
    }


class QRScanRequest(BaseModel):
    qr_data: str