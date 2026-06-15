from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    inventory_code = Column(String(100), unique=True, nullable=False)
    equipment_type = Column(String(50), nullable=False)
    brand = Column(String(100))
    model = Column(String(100))
    serial = Column(String(200), nullable=True)
    technical_specifications = Column(JSON)
    sequence = Column(Integer, default=0)
    status = Column(String(50), default="Operativo")
    department_id = Column(String(36), ForeignKey("departments.id"))
    assigned_person = Column(String(200), nullable=True)
    entry_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    out_date = Column(DateTime, nullable=True)

    department = relationship("Departments", back_populates="equipment")
    tickets = relationship("Tickets", back_populates="equipment")
