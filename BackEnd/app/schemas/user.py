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
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    lastname: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[str] = None
    phone: Optional[str] = None


class UserStatusToggle(BaseModel):
    active: int


class UserPasswordChange(BaseModel):
    password: str


class UserDeleteResponse(BaseModel):
    detail: str


class UserResponse(BaseModel):
    id: str
    name: str
    lastname: str
    username: str
    phone: Optional[str] = None
    role: str
    active: int
    department_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
