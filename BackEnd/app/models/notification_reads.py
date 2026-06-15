from sqlalchemy import Column, String, DateTime, ForeignKey
from BackEnd.app.core.db import Base
import datetime, uuid

class NotificationRead(Base):
    __tablename__ = "notification_reads"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    message = Column(String(255), nullable=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
