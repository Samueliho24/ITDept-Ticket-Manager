from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DepartmentCreate(BaseModel):
    name: str
    code: str


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
