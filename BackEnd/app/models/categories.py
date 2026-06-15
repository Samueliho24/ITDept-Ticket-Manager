from sqlalchemy import Column, String, DateTime, Boolean
from BackEnd.app.core.db import Base
import datetime, uuid

class Categories(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
