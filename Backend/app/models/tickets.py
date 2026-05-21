from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class Tickets(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(String(500))
    priority = Column(Enum('Baja', 'Media', 'Alta', 'Crítica'), default='Media')
    status = Column(Enum('Abierto', 'En Proceso', 'Resuelto', 'Cerrado'), default='Abierto')
    category = Column(String(100))
    requester_id = Column(String(36), ForeignKey("users.id"))
    assigned_technician_id = Column(String(36), ForeignKey("users.id"))
    equipment_id = Column(String(36), ForeignKey("equipment.id"))
    opened_at = Column(DateTime, default=datetime.datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    requester = relationship("Users", foreign_keys=[requester_id], back_populates="tickets_requested")

    assigned_technician = relationship("Users", foreign_keys=[assigned_technician_id], back_populates="tickets_assigned")

    equipment = relationship("Equipment", foreign_keys=[equipment_id], back_populates="tickets")

    history = relationship("TicketHistory", back_populates="ticket")
