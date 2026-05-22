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



