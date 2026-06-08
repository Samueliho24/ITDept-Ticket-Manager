import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.categories import Categories
from BackEnd.app.models.users import Users
from BackEnd.app.models.audit_log import AuditLog


def _register_audit(db: Session, current_user: Users, action: str, category: Categories, extra: dict = None):
    details = {
        "category_id": category.id,
        "category_name": category.name,
        **(extra or {}),
    }
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action=action,
        affected_table="categories",
        record_id=category.id,
        details=details,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_category(db: Session, name: str, current_user: Users) -> Categories:
    existing = db.query(Categories).filter(Categories.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre.",
        )
    category = Categories(
        id=str(uuid.uuid4()),
        name=name,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(category)
    db.flush()
    _register_audit(db, current_user, "CREATE_CATEGORY", category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: str, data, current_user: Users) -> Categories:
    category = db.query(Categories).filter(Categories.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada.",
        )
    update_data = data.model_dump(exclude_unset=True)
    changed = {}
    for field, value in update_data.items():
        old_value = getattr(category, field)
        if old_value != value:
            changed[field] = {"from": str(old_value), "to": str(value)}
        setattr(category, field, value)
    if changed:
        _register_audit(db, current_user, "UPDATE_CATEGORY", category, {"changes": changed})
    db.commit()
    db.refresh(category)
    return category


def deactivate_category(db: Session, category_id: str, current_user: Users) -> dict:
    category = db.query(Categories).filter(Categories.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada.",
        )
    category.is_active = not category.is_active
    action = "DEACTIVATE_CATEGORY" if not category.is_active else "ACTIVATE_CATEGORY"
    _register_audit(db, current_user, action, category)
    db.commit()
    msg = "desactivada" if not category.is_active else "activada"
    return {"detail": f"Categoría {msg} exitosamente."}


def list_categories(db: Session, limit: int = 10, offset: int = 0) -> tuple[list[Categories], int]:
    query = db.query(Categories).order_by(Categories.created_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def get_category(db: Session, category_id: str) -> Categories:
    category = db.query(Categories).filter(Categories.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada.",
        )
    return category
