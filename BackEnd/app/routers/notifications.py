from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import get_current_active_user
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.notification import NotificationPaginated
from BackEnd.app.services.notification_service import (
    list_notifications, mark_as_read,
)

router = APIRouter()


@router.get("/", response_model=NotificationPaginated)
def list_notifications_endpoint(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False, description="Solo no leídas"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    items, total = list_notifications(db, current_user, limit, offset)
    if unread_only:
        items = [n for n in items if n.read_at is None]
    total = len(items)
    return NotificationPaginated(total=total, limit=limit, offset=offset, items=items)


@router.patch("/{notification_id}/read")
def mark_notification_read_endpoint(
    notification_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    try:
        notif = mark_as_read(db, notification_id, current_user)
        return {"ok": True, "id": notif.id}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
