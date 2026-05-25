import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.departments import Departments
from BackEnd.app.models.users import Users
from BackEnd.app.models.equipment import Equipment
from BackEnd.app.models.audit_log import AuditLog


def _register_audit(db: Session, current_user: Users, action: str, department: Departments):
    details = {
        "department_id": department.id,
        "department_name": department.name,
    }
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action=action,
        affected_table="departments",
        record_id=department.id,
        details=details,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_department(db: Session, name: str, current_user: Users) -> Departments:
    existing = db.query(Departments).filter(Departments.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un departamento con ese nombre.",
        )
    department = Departments(
        id=str(uuid.uuid4()),
        name=name,
        created_at=datetime.now(timezone.utc),
    )
    db.add(department)
    db.flush()
    _register_audit(db, current_user, "CREATE_DEPARTMENT", department)
    db.commit()
    db.refresh(department)
    return department


def delete_department(db: Session, department_id: str, current_user: Users) -> dict:
    department = db.query(Departments).filter(Departments.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento no encontrado.",
        )
    has_users = db.query(Users).filter(Users.department_id == department_id).first()
    if has_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el departamento: existen usuarios asociados a él.",
        )
    has_equipment = db.query(Equipment).filter(Equipment.department_id == department_id).first()
    if has_equipment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el departamento: existen equipos asociados a él.",
        )
    _register_audit(db, current_user, "DELETE_DEPARTMENT", department)
    db.delete(department)
    db.commit()
    return {"detail": "Departamento eliminado exitosamente."}


def list_departments(db: Session, limit: int = 10, offset: int = 0) -> tuple[list[Departments], int]:
    query = db.query(Departments).order_by(Departments.created_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def get_department(db: Session, department_id: str) -> Departments:
    department = db.query(Departments).filter(Departments.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento no encontrado.",
        )
    return department
