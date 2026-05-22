from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.department import DepartmentCreate, DepartmentResponse
from BackEnd.app.schemas.user import (
    UserCreate, UserUpdate, UserStatusToggle,
    UserPasswordChange, UserResponse,
)
from BackEnd.app.services.department_service import (
    create_department, delete_department,
)
from BackEnd.app.services.user_service import (
    create_user, update_user, toggle_user_status, change_user_password,
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


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user_endpoint(
    data: UserCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return create_user(db, data, current_user.id)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_endpoint(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return update_user(db, user_id, data, current_user.id)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_status_endpoint(
    user_id: str,
    data: UserStatusToggle,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return toggle_user_status(db, user_id, data.active, current_user.id)


@router.patch("/users/{user_id}/password", response_model=UserResponse)
def change_user_password_endpoint(
    user_id: str,
    data: UserPasswordChange,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return change_user_password(db, user_id, data.password, current_user.id)
