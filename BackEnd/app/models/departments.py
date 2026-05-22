from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class Departments(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("Users", back_populates="department")
    equipment = relationship("Equipment", back_populates="department")
