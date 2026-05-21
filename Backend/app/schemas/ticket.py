from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Media"
    category: Optional[str] = None
    equipment_id: Optional[str] = None


class TicketAssign(BaseModel):
    technician_id: str


class TicketStatusUpdate(BaseModel):
    status: str


class TicketResolve(BaseModel):
    technical_notes: str
    equipment_status: str
    spare_parts_used: Optional[str] = None


class TicketResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    category: Optional[str] = None
    requester_id: str
    assigned_technician_id: Optional[str] = None
    equipment_id: Optional[str] = None
    opened_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
