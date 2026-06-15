import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from BackEnd.app.models.tickets import Tickets
from BackEnd.app.models.history_tickets import TicketHistory
from BackEnd.app.models.departments import Departments
from BackEnd.app.schemas.public_ticket import PublicTicketCreate


def _generate_ticket_number(db: Session, department_id: str | None) -> str | None:
    if not department_id:
        return None
    now = datetime.now(timezone.utc)
    dept = db.query(Departments).filter(Departments.id == department_id).first()
    if not dept:
        return None
    max_seq = (
        db.query(func.max(Tickets.daily_sequence))
        .filter(
            Tickets.department_id == department_id,
            func.date(Tickets.opened_at) == now.date(),
        )
        .with_for_update()
        .scalar()
    )
    daily_sequence = (max_seq or 0) + 1
    return f"{dept.code}-{now.strftime('%d%m%y')}-{daily_sequence:02d}"


def create_public_ticket(db: Session, data: PublicTicketCreate) -> Tickets:
    now = datetime.now(timezone.utc)
    title = f"Reporte: {data.reporter_name} - {data.description[:80]}"
    ticket_number = _generate_ticket_number(db, data.department_id)
    daily_sequence = 0
    if data.department_id:
        dept = db.query(Departments).filter(Departments.id == data.department_id).first()
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Departamento no encontrado.",
            )
        daily_sequence = int(ticket_number.split("-")[2]) if ticket_number else 0

    ticket = Tickets(
        id=str(uuid.uuid4()),
        ticket_number=ticket_number,
        title=title,
        description=data.description,
        reporter_name=data.reporter_name,
        reporter_phone=data.reporter_phone,
        priority="Media",
        status="Abierto",
        requester_id=None,
        department_id=data.department_id,
        daily_sequence=daily_sequence,
        opened_at=now,
    )
    db.add(ticket)
    db.flush()

    history = TicketHistory(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        previous_status=None,
        new_status="Abierto",
        change_date=now,
    )
    db.add(history)

    if data.department_id:
        dept = db.query(Departments).filter(Departments.id == data.department_id).first()
        ticket.department_name = dept.name if dept else None
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Error de concurrencia al reportar el ticket. Intente nuevamente.",
        )
    db.refresh(ticket)
    return ticket


def get_public_ticket(db: Session, ticket_number: str) -> Tickets | None:
    ticket = db.query(Tickets).filter(Tickets.ticket_number == ticket_number).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado.",
        )
    if ticket.department_id:
        dept = db.query(Departments).filter(Departments.id == ticket.department_id).first()
        ticket.department_name = dept.name if dept else None
    return ticket
