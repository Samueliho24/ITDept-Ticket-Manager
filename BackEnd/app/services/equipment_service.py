import uuid
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from sqlalchemy.exc import IntegrityError
from BackEnd.app.models.equipment import Equipment
from BackEnd.app.models.departments import Departments
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.equipment import (
    EquipmentCreate, EquipmentUpdate,
    EquipmentLocationUpdate, EquipmentStatusUpdate,
)

ALLOWED_EQUIPMENT_STATUSES = {"Operativo", "En Mantenimiento", "Dañado", "Desincorporado"}

EQUIPMENT_PREFIXES = {
    "PC": "COM",
    "Laptop": "LAP",
    "Impresora": "IMP",
    "Switch": "SWI",
    "Router": "ROU",
    "UPS": "UPS",
    "Server": "SER",
    "Otro": "OTR",
}


def _generate_inventory_code(db: Session, equipment_type: str) -> tuple[str, int]:
    prefix = EQUIPMENT_PREFIXES.get(equipment_type, "OTR")
    max_seq = db.query(func.max(Equipment.sequence)).filter(
        Equipment.equipment_type == equipment_type
    ).scalar()
    sequence = (max_seq or 0) + 1
    code = f"{prefix}-{sequence:06d}"
    return code, sequence


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
        timestamp=datetime.utcnow(),
    )
    db.add(audit)


def create_equipment(db: Session, data: EquipmentCreate, current_user: Users) -> Equipment:
    inventory_code, sequence = _generate_inventory_code(db, data.equipment_type)
    equipment = Equipment(
        id=str(uuid.uuid4()),
        inventory_code=inventory_code,
        sequence=sequence,
        equipment_type=data.equipment_type,
        brand=data.brand,
        model=data.model,
        serial=data.serial,
        technical_specifications=data.technical_specifications,
        department_id=data.department_id,
        status="Operativo",
        entry_date=datetime.utcnow(),
    )
    db.add(equipment)
    db.flush()
    _register_audit(db, current_user, "create_equipment", equipment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad al crear el equipo. Verifique que el código de inventario no esté duplicado.",
        )
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
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad al actualizar el equipo. Verifique los datos únicos.",
        )
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
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad al trasladar el equipo.",
        )
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
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad al cambiar el estado del equipo.",
        )
    db.refresh(equipment)
    return equipment


def _enrich_equipment_with_department(db: Session, items: list[Equipment]):
    dept_ids = {e.department_id for e in items if e.department_id}
    if dept_ids:
        depts = {d.id: d for d in db.query(Departments).filter(Departments.id.in_(dept_ids)).all()}
        for e in items:
            d = depts.get(e.department_id)
            e.department_name = d.name if d else None


def list_equipment(
    db: Session,
    limit: int = 10,
    offset: int = 0,
    search: Optional[str] = None,
    equipment_type: Optional[str] = None,
    status: Optional[str] = None,
) -> tuple[list[Equipment], int]:
    query = db.query(Equipment)
    if search:
        query = query.filter(
            or_(
                Equipment.inventory_code.ilike(f"%{search}%"),
                Equipment.brand.ilike(f"%{search}%"),
                Equipment.model.ilike(f"%{search}%"),
            )
        )
    if equipment_type:
        query = query.filter(Equipment.equipment_type == equipment_type)
    if status:
        query = query.filter(Equipment.status == status)
    query = query.order_by(Equipment.entry_date.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    _enrich_equipment_with_department(db, items)
    return items, total


def get_equipment(db: Session, equipment_id: str) -> Equipment:
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipo no encontrado.")
    _enrich_equipment_with_department(db, [equipment])
    return equipment
