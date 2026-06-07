from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    lastname: str
    username: str
    password: str
    role: str = "requestor"
    department_id: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    lastname: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[str] = None


class UserStatusToggle(BaseModel):
    active: bool


class UserPasswordChange(BaseModel):
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    lastname: str
    username: str
    role: str
    active: bool
    department_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
