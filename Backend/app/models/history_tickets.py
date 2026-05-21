from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class TicketHistory(Base):
    __tablename__ = "history_tickets"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"))
    previous_status = Column(String(50))
    new_status = Column(String(50))
    technical_comment = Column(String(500))
    technical_action = Column(String(100))
    change_date = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Tickets", foreign_keys=[ticket_id], back_populates="history")
