from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.user import (
    UserCreate, UserUpdate, UserStatusToggle,
    UserPasswordChange, UserResponse, UserDeleteResponse,
)
from BackEnd.app.schemas.pagination import UserPaginated
from BackEnd.app.services.user_service import (
    create_user, update_user, toggle_user_status, change_user_password,
    list_users, get_user, soft_delete_user,
)

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=201)
def create_user_endpoint(
    data: UserCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return create_user(db, data, current_user)


@router.get("/", response_model=UserPaginated)
def list_users_endpoint(
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
    offset: int = Query(0, ge=0, description="Desplazamiento"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    items, total = list_users(db, limit, offset)
    return UserPaginated(total=total, limit=limit, offset=offset, items=items)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_endpoint(
    user_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return get_user(db, user_id)


@router.put("/{user_id}", response_model=UserResponse)
def update_user_endpoint(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return update_user(db, user_id, data, current_user)


@router.patch("/{user_id}/status", response_model=UserResponse)
def toggle_user_status_endpoint(
    user_id: str,
    data: UserStatusToggle,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return toggle_user_status(db, user_id, data.active, current_user)


@router.delete("/{user_id}", response_model=UserDeleteResponse)
def soft_delete_user_endpoint(
    user_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return soft_delete_user(db, user_id, current_user)


@router.patch("/{user_id}/password", response_model=UserResponse)
def change_user_password_endpoint(
    user_id: str,
    data: UserPasswordChange,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return change_user_password(db, user_id, data.password, current_user)
