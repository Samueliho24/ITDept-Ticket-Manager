import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.users import Users
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.core.security import hash_password
from BackEnd.app.schemas.user import UserCreate, UserUpdate


def _register_audit(db: Session, current_user: Users, action: str, user: Users, extra: dict = None):
    details = {
        "user_id": user.id,
        "username": user.username,
        **(extra or {}),
    }
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action=action,
        affected_table="users",
        record_id=user.id,
        details=details,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_user(db: Session, data: UserCreate, current_user: Users) -> Users:
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
        phone=data.phone,
        active=1,
        department_id=data.department_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    _register_audit(db, current_user, "CREATE_USER", user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: str, data: UserUpdate, current_user: Users) -> Users:
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
        _register_audit(db, current_user, "UPDATE_USER", user, {"changes": changed})
    db.commit()
    db.refresh(user)
    return user


def toggle_user_status(db: Session, user_id: str, active: int, current_user: Users) -> Users:
    if active not in (0, 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valor de estado inválido. Use 0 (Inactivo) o 1 (Activo).",
        )
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    if user.active == -1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cambiar el estado de un usuario eliminado.",
        )
    old_status = user.active
    user.active = active
    _register_audit(db, current_user, "TOGGLE_USER_STATUS", user, {
        "from_active": old_status,
        "to_active": active,
    })
    db.commit()
    db.refresh(user)
    return user


def soft_delete_user(db: Session, user_id: str, current_user: Users) -> dict:
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario.",
        )
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    if user.active == -1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya fue eliminado.",
        )
    old_status = user.active
    user.active = -1
    _register_audit(db, current_user, "SOFT_DELETE_USER", user, {
        "from_active": old_status,
        "to_active": -1,
    })
    db.commit()
    return {"detail": "Usuario eliminado permanentemente."}


def change_user_password(db: Session, user_id: str, new_password: str, current_user: Users) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    user.password = hash_password(new_password)
    _register_audit(db, current_user, "CHANGE_USER_PASSWORD", user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, limit: int = 10, offset: int = 0) -> tuple[list[Users], int]:
    query = db.query(Users).filter(Users.active >= 0).order_by(Users.created_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def get_user(db: Session, user_id: str) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return user
