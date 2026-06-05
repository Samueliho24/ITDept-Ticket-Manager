from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.department import DepartmentCreate, DepartmentResponse
from BackEnd.app.schemas.pagination import DepartmentPaginated
from BackEnd.app.services.department_service import (
    create_department, delete_department, list_departments, get_department,
)

router = APIRouter()


@router.post("/", response_model=DepartmentResponse, status_code=201)
def create_department_endpoint(
    data: DepartmentCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return create_department(db, data.name, current_user)


@router.get("/", response_model=DepartmentPaginated)
def list_departments_endpoint(
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
    offset: int = Query(0, ge=0, description="Desplazamiento"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician", "resquestor"])),
):
    items, total = list_departments(db, limit, offset)
    return DepartmentPaginated(total=total, limit=limit, offset=offset, items=items)


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department_endpoint(
    department_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return get_department(db, department_id)


@router.delete("/{department_id}")
def delete_department_endpoint(
    department_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return delete_department(db, department_id, current_user)
