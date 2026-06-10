from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PublicTicketCreate(BaseModel):
    reporter_name: str
    reporter_phone: Optional[str] = None
    department_id: Optional[str] = None
    description: str


class PublicTicketResponse(BaseModel):
    id: str
    ticket_number: Optional[str] = None
    description: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    status: str
    department_name: Optional[str] = None
    opened_at: Optional[datetime] = None

    class Config:
        from_attributes = True
