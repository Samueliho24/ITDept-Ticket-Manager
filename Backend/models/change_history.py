from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd import Base

class ChangeHistory(Base):
    __tablename__ = "changehistory"
    
    id = Column(String, primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String)
    affected_id = Column(String)
    register_id = Column(String)    
    details = Column(String)
    dateChanged = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("Users", foreign_keys=[user_id], back_populates="change_history")