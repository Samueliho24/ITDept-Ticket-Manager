from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.audit_log import AuditLogPaginated
from BackEnd.app.services.audit_log_service import get_audit_logs_paginated

router = APIRouter()


@router.get("/audit-logs", response_model=AuditLogPaginated)
def list_audit_logs_endpoint(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(20, ge=1, le=100, description="Registros por página"),
    start_date: str = Query(None, description="Filtro desde fecha (ISO 8601)"),
    end_date: str = Query(None, description="Filtro hasta fecha (ISO 8601)"),
    username_query: str = Query(None, description="Búsqueda parcial por nombre de usuario"),
    action_filter: str = Query(None, description="Filtrar por tipo de acción exacta"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    items, total_records, page, pages, size = get_audit_logs_paginated(
        db, page, size, start_date, end_date, username_query, action_filter,
    )
    return AuditLogPaginated(
        items=items,
        total_records=total_records,
        page=page,
        pages=pages,
        size=size,
    )
