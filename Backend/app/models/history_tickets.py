from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd import Base

class TicketHistory(Base):
    __tablename__ = "history_tickets"
    
    id = Column(String, primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String, ForeignKey("tickets.id"))
    previous_status = Column(String)
    new_status = Column(String)
    technical_comment = Column(String)
    technical_action = Column(String)
    change_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    ticket = relationship("Tickets", foreign_keys=[ticket_id], back_populates="history")