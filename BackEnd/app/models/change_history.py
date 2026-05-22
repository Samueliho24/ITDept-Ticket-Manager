from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from BackEnd.app.core.db import Base
import datetime, uuid

class ChangeHistory(Base):
    __tablename__ = "changehistory"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    action = Column(String(100))
    affected_id = Column(String(36))
    register_id = Column(String(36))
    details = Column(String(500))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("Users", foreign_keys=[user_id], back_populates="change_history")
