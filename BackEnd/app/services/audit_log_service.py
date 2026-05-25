from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.models.users import Users


def get_audit_logs_paginated(
    db: Session,
    limit: int = 10,
    offset: int = 0,
    start_date: str = None,
    end_date: str = None,
    username_query: str = None,
    action_filter: str = None,
):
    if limit < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El límite debe ser mayor o igual a 1.")
    if offset < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El offset debe ser mayor o igual a 0.")

    query = db.query(AuditLog).join(Users, AuditLog.user_id == Users.id)

    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(AuditLog.timestamp >= start)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de start_date inválido. Use ISO 8601.")

    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(AuditLog.timestamp <= end)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de end_date inválido. Use ISO 8601.")

    if username_query:
        fullname = func.concat(Users.name, " ", Users.lastname)
        query = query.filter(fullname.ilike(f"%{username_query}%"))

    if action_filter:
        query = query.filter(AuditLog.action == action_filter)

    total = query.count()

    logs = (
        query.order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = []
    for log in logs:
        items.append(
            {
                "id": log.id,
                "user_id": log.user_id,
                "user_full_name": f"{log.user.name} {log.user.lastname}",
                "user_username": log.user.username,
                "action": log.action,
                "affected_table": log.affected_table,
                "record_id": log.record_id,
                "details": log.details,
                "timestamp": log.timestamp,
            }
        )

    return items, total
