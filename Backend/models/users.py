from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd import Base
import datetime , uuid

class Users(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    department_id = Column(String, ForeignKey("departments.id"))
    
    department = relationship("Departments", foreign_keys=[department_id], back_populates="user")

    tickets_assigned = relationship("Tickets", back_populates="assigned_technician")

    tickets_requested = relationship("Tickets", back_populates="requester")
    
    change_history = relationship("ChangeHistory", back_populates="user")