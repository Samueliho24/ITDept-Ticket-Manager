from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import get_current_active_user, RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.equipment import (
    EquipmentCreate, EquipmentUpdate,
    EquipmentLocationUpdate, EquipmentStatusUpdate, EquipmentResponse,
)
from BackEnd.app.schemas.pagination import EquipmentPaginated
from BackEnd.app.services.equipment_service import (
    create_equipment, update_equipment, transfer_equipment,
    update_equipment_status, list_equipment, get_equipment,
)

router = APIRouter()


@router.post("/", response_model=EquipmentResponse, status_code=201)
def create_equipment_endpoint(
    data: EquipmentCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return create_equipment(db, data, current_user)


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment_endpoint(
    equipment_id: str,
    data: EquipmentUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return update_equipment(db, equipment_id, data, current_user)


@router.patch("/{equipment_id}/location", response_model=EquipmentResponse)
def transfer_equipment_endpoint(
    equipment_id: str,
    data: EquipmentLocationUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return transfer_equipment(db, equipment_id, data, current_user)


@router.patch("/{equipment_id}/status", response_model=EquipmentResponse)
def change_equipment_status_endpoint(
    equipment_id: str,
    data: EquipmentStatusUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician"])),
):
    return update_equipment_status(db, equipment_id, data, current_user)


@router.get("/", response_model=EquipmentPaginated)
def list_equipment_endpoint(
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
    offset: int = Query(0, ge=0, description="Desplazamiento"),
    search: Optional[str] = Query(None, description="Búsqueda por código, marca o modelo"),
    equipment_type: Optional[str] = Query(None, description="Filtrar por tipo de equipo"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician"])),
):
    items, total = list_equipment(db, limit, offset, search=search, equipment_type=equipment_type, status=status)
    return EquipmentPaginated(total=total, limit=limit, offset=offset, items=items)


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_endpoint(
    equipment_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician", "resquestor"])),
):
    return get_equipment(db, equipment_id)
