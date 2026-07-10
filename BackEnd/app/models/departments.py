from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class Departments(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    code = Column(String(3), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("Users", back_populates="department")
    equipment = relationship("Equipment", back_populates="department")
    tickets = relationship("Tickets", back_populates="department")
