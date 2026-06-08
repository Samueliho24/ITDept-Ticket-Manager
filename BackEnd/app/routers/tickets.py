from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import get_current_active_user, RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.ticket import (
    TicketCreate, TicketAssign, TicketStatusUpdate, TicketResolve, TicketCategoryUpdate,
    TicketCancel, TicketResponse,
)
from BackEnd.app.schemas.history import TicketHistoryResponse
from BackEnd.app.schemas.rating import RateRequest, RatingResponse
from BackEnd.app.schemas.pagination import TicketPaginated
from BackEnd.app.services.ticket_service import (
    create_ticket, list_tickets, get_ticket, get_ticket_history,
    assign_ticket, update_ticket_status, resolve_ticket,
    cancel_ticket, rate_ticket, get_ticket_rating, update_ticket_category,
)

router = APIRouter()


@router.post("/", response_model=TicketResponse, status_code=201)
def create_ticket_endpoint(
    data: TicketCreate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    return create_ticket(db, data, current_user)


@router.get("/", response_model=TicketPaginated)
def list_tickets_endpoint(
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
    offset: int = Query(0, ge=0, description="Desplazamiento"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    date_from: Optional[str] = Query(None, description="Fecha inicial (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Fecha final (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Búsqueda por texto en título/descripción"),
    equipment_id: Optional[str] = Query(None, description="Filtrar por equipo"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    items, total = list_tickets(
        db, current_user, limit, offset,
        status=status, category=category,
        date_from=date_from, date_to=date_to,
        search=search, equipment_id=equipment_id,
    )
    return TicketPaginated(total=total, limit=limit, offset=offset, items=items)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket_endpoint(
    ticket_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    return get_ticket(db, ticket_id, current_user)


@router.get("/{ticket_id}/history", response_model=list[TicketHistoryResponse])
def get_ticket_history_endpoint(
    ticket_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    return get_ticket_history(db, ticket_id, current_user)


@router.patch("/{ticket_id}/assign", response_model=TicketResponse)
def assign_ticket_endpoint(
    ticket_id: str,
    data: TicketAssign,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return assign_ticket(db, ticket_id, data, current_user)


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status_endpoint(
    ticket_id: str,
    data: TicketStatusUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician"])),
):
    return update_ticket_status(db, ticket_id, data, current_user)


@router.post("/{ticket_id}/resolve", response_model=TicketResponse)
def resolve_ticket_endpoint(
    ticket_id: str,
    data: TicketResolve,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician"])),
):
    return resolve_ticket(db, ticket_id, data, current_user)


@router.patch("/{ticket_id}/category", response_model=TicketResponse)
def update_ticket_category_endpoint(
    ticket_id: str,
    data: TicketCategoryUpdate,
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin", "technician"])),
):
    return update_ticket_category(db, ticket_id, data, current_user)


@router.patch("/{ticket_id}/cancel", response_model=TicketResponse)
def cancel_ticket_endpoint(
    ticket_id: str,
    data: TicketCancel,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    return cancel_ticket(db, ticket_id, data, current_user)


@router.post("/{ticket_id}/rate", response_model=RatingResponse)
def rate_ticket_endpoint(
    ticket_id: str,
    data: RateRequest,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    return rate_ticket(db, ticket_id, data, current_user)


@router.get("/{ticket_id}/rating", response_model=RatingResponse)
def get_ticket_rating_endpoint(
    ticket_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    rating = get_ticket_rating(db, ticket_id, current_user)
    if not rating:
        raise HTTPException(status_code=404, detail="No hay calificación para este ticket.")
    return rating
