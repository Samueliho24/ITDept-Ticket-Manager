import json
import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.departments import Departments
from BackEnd.app.models.users import Users
from BackEnd.app.models.equipment import Equipment
from BackEnd.app.models.change_history import ChangeHistory


def _register_audit(db: Session, admin_id: str, action: str, department: Departments):
    details = {
        "affected_table": "departments",
        "department_id": department.id,
        "department_name": department.name,
    }
    audit = ChangeHistory(
        id=str(uuid.uuid4()),
        user_id=admin_id,
        action=action,
        affected_id=department.id,
        register_id=department.id,
        details=json.dumps(details, default=str),
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_department(db: Session, name: str, admin_id: str) -> Departments:
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
    _register_audit(db, admin_id, "CREATE_DEPARTMENT", department)
    db.commit()
    db.refresh(department)
    return department


def delete_department(db: Session, department_id: str, admin_id: str) -> dict:
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
    _register_audit(db, admin_id, "DELETE_DEPARTMENT", department)
    db.delete(department)
    db.commit()
    return {"detail": "Departamento eliminado exitosamente."}
