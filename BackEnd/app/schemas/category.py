from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
