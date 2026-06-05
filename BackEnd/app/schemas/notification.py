from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    ticket_id: str
    message: str
    read_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[NotificationResponse]
