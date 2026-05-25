from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import get_current_active_user, RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.ticket import (
    TicketCreate, TicketAssign, TicketStatusUpdate, TicketResolve, TicketResponse,
)
from BackEnd.app.schemas.pagination import TicketPaginated
from BackEnd.app.services.ticket_service import (
    create_ticket, list_tickets, get_ticket,
    assign_ticket, update_ticket_status, resolve_ticket,
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
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    items, total = list_tickets(db, current_user, limit, offset)
    return TicketPaginated(total=total, limit=limit, offset=offset, items=items)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket_endpoint(
    ticket_id: str,
    db: Session = Depends(getDb),
    current_user: Users = Depends(get_current_active_user),
):
    return get_ticket(db, ticket_id, current_user)


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
