from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.orm import relationship
from BackEnd import Base
import datetime , uuid

class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(String, primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    inventory_code = Column(String, unique=True, nullable=False)
    equipment_type = Column(String, nullable=False)
    brand = Column(String)
    model = Column(String)
    technical_specifications = Column(JSON)
    status = Column(String, default="Operativo")
    department_id = Column(String, ForeignKey("departments.id"))
    entry_date = Column(DateTime, default=datetime.datetime.utcnow)
    out_date = Column(DateTime, nullable=True)
    
    department = relationship("Departments", back_populates="equipment")
    tickets = relationship("Tickets", back_populates="equipment")