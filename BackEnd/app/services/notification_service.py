import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from BackEnd.app.models.notification_reads import NotificationRead
from BackEnd.app.models.tickets import Tickets
from BackEnd.app.models.users import Users


def list_notifications(
    db: Session,
    current_user: Users,
    limit: int = 10,
    offset: int = 0,
) -> tuple[list[NotificationRead], int]:
    query = db.query(NotificationRead).filter(
        NotificationRead.user_id == current_user.id
    )
    query = query.order_by(NotificationRead.created_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def mark_as_read(db: Session, notification_id: str, current_user: Users) -> NotificationRead:
    notif = (
        db.query(NotificationRead)
        .filter(
            NotificationRead.id == notification_id,
            NotificationRead.user_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise Exception("Notificación no encontrada.")
    notif.read_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(notif)
    return notif


def create_notification(
    db: Session,
    user_id: str,
    ticket_id: str,
    message: str,
) -> NotificationRead:
    notif = NotificationRead(
        id=str(uuid.uuid4()),
        user_id=user_id,
        ticket_id=ticket_id,
        message=message,
        read_at=None,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notif)
    db.flush()
    return notif
