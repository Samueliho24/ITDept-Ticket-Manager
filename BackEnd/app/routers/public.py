from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.models.departments import Departments
from BackEnd.app.schemas.public_ticket import PublicTicketCreate, PublicTicketResponse
from BackEnd.app.schemas.department import DepartmentResponse
from BackEnd.app.services.public_ticket_service import create_public_ticket, get_public_ticket

router = APIRouter()


@router.post("/tickets", response_model=PublicTicketResponse, status_code=201)
def create_public_ticket_endpoint(
    data: PublicTicketCreate,
    db: Session = Depends(getDb),
):
    return create_public_ticket(db, data)


@router.get("/tickets/{ticket_number}", response_model=PublicTicketResponse)
def get_public_ticket_endpoint(
    ticket_number: str,
    db: Session = Depends(getDb),
):
    return get_public_ticket(db, ticket_number)


@router.get("/departments", response_model=list[DepartmentResponse])
def list_public_departments(
    db: Session = Depends(getDb),
):
    departments = (
        db.query(Departments)
        .filter(Departments.deleted_at.is_(None), Departments.is_active == True)
        .order_by(Departments.name)
        .all()
    )
    return departments
