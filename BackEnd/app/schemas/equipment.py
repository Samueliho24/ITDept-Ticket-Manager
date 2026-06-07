from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class EquipmentCreate(BaseModel):
    inventory_code: Optional[str] = None
    equipment_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    technical_specifications: Optional[Dict[str, Any]] = None
    department_id: Optional[str] = None
    assigned_person: Optional[str] = None


class EquipmentUpdate(BaseModel):
    inventory_code: Optional[str] = None
    equipment_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    technical_specifications: Optional[Dict[str, Any]] = None
    assigned_person: Optional[str] = None


class EquipmentLocationUpdate(BaseModel):
    department_id: str


class EquipmentStatusUpdate(BaseModel):
    status: str


class EquipmentResponse(BaseModel):
    id: str
    inventory_code: str
    equipment_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    technical_specifications: Optional[Dict[str, Any]] = None
    status: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    assigned_person: Optional[str] = None
    entry_date: Optional[datetime] = None
    out_date: Optional[datetime] = None

    class Config:
        from_attributes = True
