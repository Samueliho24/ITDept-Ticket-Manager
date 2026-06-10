from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class Users(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    lastname = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    department_id = Column(String(36), ForeignKey("departments.id"))

    department = relationship("Departments", foreign_keys=[department_id], back_populates="user")

    tickets_assigned = relationship("Tickets", foreign_keys="Tickets.assigned_technician_id", back_populates="assigned_technician")

    tickets_requested = relationship("Tickets", foreign_keys="Tickets.requester_id", back_populates="requester")

    audit_logs = relationship("AuditLog", back_populates="user")
