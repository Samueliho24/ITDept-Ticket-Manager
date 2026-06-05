from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from BackEnd.app.core.db import Base
import datetime, uuid

class TicketRating(Base):
    __tablename__ = "ticket_ratings"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
