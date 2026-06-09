from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from BackEnd.app.schemas.pagination import CategoryPaginated
from BackEnd.app.services.category_service import (
    create_category, update_category, toggle_category_status, soft_delete_category, list_categories, get_category,
)

router = APIRouter()


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category_endpoint(
    data: CategoryCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return create_category(db, data.name, current_user)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category_endpoint(
    category_id: str,
    data: CategoryUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return update_category(db, category_id, data, current_user)


@router.get("/", response_model=CategoryPaginated)
def list_categories_endpoint(
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
    offset: int = Query(0, ge=0, description="Desplazamiento"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician", "requestor"])),
):
    items, total = list_categories(db, limit, offset)
    return CategoryPaginated(total=total, limit=limit, offset=offset, items=items)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category_endpoint(
    category_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return get_category(db, category_id)


@router.patch("/{category_id}/status")
def toggle_category_status_endpoint(
    category_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return toggle_category_status(db, category_id, current_user)


@router.delete("/{category_id}")
def delete_category_endpoint(
    category_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return soft_delete_category(db, category_id, current_user)
