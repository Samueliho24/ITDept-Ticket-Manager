import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.users import Users
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.core.security import hash_password
from BackEnd.app.schemas.user import UserCreate, UserUpdate


def _register_audit(db: Session, admin_id: str, action: str, user: Users, extra: dict = None):
    details = {
        "user_id": user.id,
        "username": user.username,
        **(extra or {}),
    }
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=admin_id,
        action=action,
        affected_table="users",
        record_id=user.id,
        details=details,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_user(db: Session, data: UserCreate, admin_id: str) -> Users:
    existing = db.query(Users).filter(Users.username == data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese nombre de usuario.",
        )
    user = Users(
        id=str(uuid.uuid4()),
        name=data.name,
        lastname=data.lastname,
        username=data.username,
        password=hash_password(data.password),
        role=data.role,
        active=True,
        department_id=data.department_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    _register_audit(db, admin_id, "CREATE_USER", user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: str, data: UserUpdate, admin_id: str) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    update_data = data.model_dump(exclude_unset=True)
    changed = {}
    for field, value in update_data.items():
        old_value = getattr(user, field)
        setattr(user, field, value)
        if old_value != value:
            changed[field] = {"from": str(old_value), "to": str(value)}
    if changed:
        _register_audit(db, admin_id, "UPDATE_USER", user, {"changes": changed})
    db.commit()
    db.refresh(user)
    return user


def toggle_user_status(db: Session, user_id: str, active: bool, admin_id: str) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    old_status = user.active
    user.active = active
    _register_audit(db, admin_id, "TOGGLE_USER_STATUS", user, {
        "from_active": old_status,
        "to_active": active,
    })
    db.commit()
    db.refresh(user)
    return user


def change_user_password(db: Session, user_id: str, new_password: str, admin_id: str) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    user.password = hash_password(new_password)
    _register_audit(db, admin_id, "CHANGE_USER_PASSWORD", user)
    db.commit()
    db.refresh(user)
    return user
