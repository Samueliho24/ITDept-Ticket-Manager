from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Media"
    category: Optional[str] = None
    equipment_id: Optional[str] = None
    department_id: Optional[str] = None


class TicketAssign(BaseModel):
    technician_id: str
    priority: Optional[str] = None


class TicketStatusUpdate(BaseModel):
    status: str


class TicketResolve(BaseModel):
    technical_notes: str
    equipment_status: str
    spare_parts_used: Optional[str] = None


class TicketCategoryUpdate(BaseModel):
    category: Optional[str] = None


class TicketCancel(BaseModel):
    reason: str


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
    department_id: Optional[str] = None
    rated: bool = False
    requester_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    department_name: Optional[str] = None
    ticket_number: Optional[str] = None
    opened_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
