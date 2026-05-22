from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class TicketHistoryResponse(BaseModel):
    id: str
    ticket_id: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    technical_action: Optional[str] = None
    technical_comment: Optional[str] = None
    change_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChangeHistoryResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: Optional[str] = None
    affected_id: Optional[str] = None
    register_id: Optional[str] = None
    details: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
