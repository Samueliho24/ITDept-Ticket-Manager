from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RateRequest(BaseModel):
    rating: int
    comment: Optional[str] = None


class RatingResponse(BaseModel):
    id: str
    ticket_id: str
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
