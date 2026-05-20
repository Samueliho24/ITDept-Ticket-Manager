from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from BackEnd import Base
import datatime, uuid
class Departments(Base):
    __tablename__ = "departments"
    
    id = Column(String, primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("Users", back_populates="department")
    equipment = relationship("Equipment", back_populates="department")