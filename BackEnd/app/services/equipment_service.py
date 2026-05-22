import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.equipment import Equipment
from BackEnd.app.models.departments import Departments
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.equipment import (
    EquipmentCreate, EquipmentUpdate,
    EquipmentLocationUpdate, EquipmentStatusUpdate,
)

ALLOWED_EQUIPMENT_STATUSES = {"Operativo", "En Mantenimiento", "Dañado", "Desincorporado"}


def _register_audit(db: Session, user: Users, action: str, equipment: Equipment, extra: dict = None):
    details = {
        "equipment_id": equipment.id,
        "inventory_code": equipment.inventory_code,
        **(extra or {}),
    }
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action=action,
        affected_table="equipment",
        record_id=equipment.id,
        details=details,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_equipment(db: Session, data: EquipmentCreate, current_user: Users) -> Equipment:
    existing = db.query(Equipment).filter(Equipment.inventory_code == data.inventory_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un equipo con ese código de inventario.",
        )
    equipment = Equipment(
        id=str(uuid.uuid4()),
        inventory_code=data.inventory_code,
        equipment_type=data.equipment_type,
        brand=data.brand,
        model=data.model,
        technical_specifications=data.technical_specifications,
        department_id=data.department_id,
        status="Operativo",
        entry_date=datetime.now(timezone.utc),
    )
    db.add(equipment)
    db.flush()
    _register_audit(db, current_user, "create_equipment", equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


def update_equipment(db: Session, equipment_id: str, data: EquipmentUpdate, current_user: Users) -> Equipment:
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipo no encontrado.")
    update_data = data.model_dump(exclude_unset=True)
    changed = {}
    for field, value in update_data.items():
        if value is not None:
            old_value = getattr(equipment, field)
            setattr(equipment, field, value)
            if old_value != value:
                changed[field] = {"from": str(old_value), "to": str(value)}
    if changed:
        _register_audit(db, current_user, "update_equipment", equipment, {"changes": changed})
    db.commit()
    db.refresh(equipment)
    return equipment


def transfer_equipment(db: Session, equipment_id: str, data: EquipmentLocationUpdate, current_user: Users) -> Equipment:
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipo no encontrado.")
    department = db.query(Departments).filter(Departments.id == data.department_id).first()
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Departamento no encontrado.")
    old_department_id = equipment.department_id
    equipment.department_id = data.department_id
    _register_audit(db, current_user, "transfer_equipment", equipment, {
        "from_department": old_department_id,
        "to_department": data.department_id,
    })
    db.commit()
    db.refresh(equipment)
    return equipment


def update_equipment_status(db: Session, equipment_id: str, data: EquipmentStatusUpdate, current_user: Users) -> Equipment:
    if data.status not in ALLOWED_EQUIPMENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Permitidos: {', '.join(sorted(ALLOWED_EQUIPMENT_STATUSES))}.",
        )
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipo no encontrado.")
    old_status = equipment.status
    equipment.status = data.status
    _register_audit(db, current_user, "change_equipment_status", equipment, {
        "from_status": old_status,
        "to_status": data.status,
    })
    db.commit()
    db.refresh(equipment)
    return equipment


def list_equipment(db: Session) -> list[Equipment]:
    return db.query(Equipment).order_by(Equipment.entry_date.desc()).all()


def get_equipment(db: Session, equipment_id: str) -> Equipment:
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipo no encontrado.")
    return equipment
