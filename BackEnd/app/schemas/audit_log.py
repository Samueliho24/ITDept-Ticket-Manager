from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    user_full_name: str
    user_username: str
    action: str
    affected_table: Optional[str] = None
    record_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class AuditLogPaginated(BaseModel):
    items: list[AuditLogResponse]
    total_records: int
    page: int
    pages: int
    size: int
