from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.department import DepartmentCreate, DepartmentResponse

from BackEnd.app.services.department_service import (
    create_department, delete_department,
)

router = APIRouter()

@router.post("/departments", response_model=DepartmentResponse, status_code=201)
def create_department_endpoint(
    data: DepartmentCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return create_department(db, data.name, current_user.id)


@router.delete("/departments/{department_id}")
def delete_department_endpoint(
    department_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return delete_department(db, department_id, current_user.id)
