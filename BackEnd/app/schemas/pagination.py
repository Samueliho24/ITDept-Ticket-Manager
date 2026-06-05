from pydantic import BaseModel
from BackEnd.app.schemas.equipment import EquipmentResponse
from BackEnd.app.schemas.ticket import TicketResponse
from BackEnd.app.schemas.user import UserResponse
from BackEnd.app.schemas.department import DepartmentResponse
from BackEnd.app.schemas.audit_log import AuditLogResponse
from BackEnd.app.schemas.notification import NotificationResponse


class EquipmentPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[EquipmentResponse]


class TicketPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[TicketResponse]


class UserPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[UserResponse]


class DepartmentPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[DepartmentResponse]


class AuditLogPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[AuditLogResponse]


class NotificationPaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[NotificationResponse]
