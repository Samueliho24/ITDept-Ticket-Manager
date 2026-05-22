import json
import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.models.tickets import Tickets
from BackEnd.app.models.history_tickets import TicketHistory
from BackEnd.app.models.change_history import ChangeHistory
from BackEnd.app.models.equipment import Equipment
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.ticket import (
    TicketCreate, TicketAssign, TicketStatusUpdate, TicketResolve,
)

ALLOWED_TRANSITIONS = {
    "En Proceso": True,
    "Pendiente": True,
}

VALID_TICKET_STATUSES = {"Abierto", "Asignado", "En Proceso", "Pendiente", "Resuelto", "Cerrado"}
VALID_PRIORITIES = {"Baja", "Media", "Alta", "Crítica"}


def _register_ticket_history(db: Session, ticket: Tickets, previous_status: str, new_status: str, comment: str = None, action: str = None):
    history = TicketHistory(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        previous_status=previous_status,
        new_status=new_status,
        technical_comment=comment,
        technical_action=action,
        change_date=datetime.now(timezone.utc),
    )
    db.add(history)


def _register_audit(db: Session, user: Users, action: str, ticket: Tickets, extra: dict = None):
    details = {
        "ticket_id": ticket.id,
        "title": ticket.title,
        "status": ticket.status,
        **(extra or {}),
    }
    audit = ChangeHistory(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action=action,
        affected_id=ticket.id,
        register_id=ticket.id,
        details=json.dumps(details, default=str),
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit)


def create_ticket(db: Session, data: TicketCreate, current_user: Users) -> Tickets:
    if data.priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prioridad inválida. Permitidas: {', '.join(sorted(VALID_PRIORITIES))}.",
        )
    if data.equipment_id:
        equipment = db.query(Equipment).filter(Equipment.id == data.equipment_id).first()
        if not equipment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipo no encontrado.")
    ticket = Tickets(
        id=str(uuid.uuid4()),
        title=data.title,
        description=data.description,
        priority=data.priority,
        status="Abierto",
        category=data.category,
        requester_id=current_user.id,
        equipment_id=data.equipment_id,
        opened_at=datetime.now(timezone.utc),
    )
    db.add(ticket)
    db.flush()
    _register_ticket_history(db, ticket, None, "Abierto")
    _register_audit(db, current_user, "create_ticket", ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def list_tickets(db: Session, current_user: Users) -> list[Tickets]:
    query = db.query(Tickets)
    if current_user.role == "resquestor":
        query = query.filter(Tickets.requester_id == current_user.id)
    return query.order_by(Tickets.opened_at.desc()).all()


def get_ticket(db: Session, ticket_id: str, current_user: Users) -> Tickets:
    ticket = db.query(Tickets).filter(Tickets.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    if current_user.role == "resquestor" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para ver este ticket.",
        )
    return ticket


def assign_ticket(db: Session, ticket_id: str, data: TicketAssign, current_user: Users) -> Tickets:
    ticket = db.query(Tickets).filter(Tickets.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    technician = db.query(Users).filter(Users.id == data.technician_id, Users.role.in_(["technician", "admin"])).first()
    if not technician:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Técnico no encontrado o no válido.")
    previous_status = ticket.status
    ticket.assigned_technician_id = data.technician_id
    ticket.status = "Asignado"
    _register_ticket_history(db, ticket, previous_status, "Asignado", action=f"Asignado a {technician.name} {technician.lastname}")
    _register_audit(db, current_user, "assign_ticket", ticket, {
        "technician_id": data.technician_id,
        "previous_status": previous_status,
    })
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket_status(db: Session, ticket_id: str, data: TicketStatusUpdate, current_user: Users) -> Tickets:
    if data.status not in ALLOWED_TRANSITIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transición de estado no permitida. Solo: {', '.join(ALLOWED_TRANSITIONS)}.",
        )
    ticket = db.query(Tickets).filter(Tickets.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    previous_status = ticket.status
    ticket.status = data.status
    _register_ticket_history(db, ticket, previous_status, data.status, action=f"Estado cambiado por {current_user.name} {current_user.lastname}")
    _register_audit(db, current_user, "update_ticket_status", ticket, {
        "previous_status": previous_status,
        "new_status": data.status,
    })
    db.commit()
    db.refresh(ticket)
    return ticket


def resolve_ticket(db: Session, ticket_id: str, data: TicketResolve, current_user: Users) -> Tickets:
    ticket = db.query(Tickets).filter(Tickets.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    previous_status = ticket.status
    ticket.status = "Resuelto"
    ticket.closed_at = datetime.now(timezone.utc)
    if data.equipment_status and ticket.equipment_id:
        equipment = db.query(Equipment).filter(Equipment.id == ticket.equipment_id).first()
        if equipment:
            old_equipment_status = equipment.status
            equipment.status = data.equipment_status
            extra_details = {
                "previous_status": previous_status,
                "new_status": "Resuelto",
                "equipment_status": data.equipment_status,
                "spare_parts_used": data.spare_parts_used,
                "old_equipment_status": old_equipment_status,
            }
        else:
            extra_details = {
                "previous_status": previous_status,
                "new_status": "Resuelto",
                "equipment_status": data.equipment_status,
                "spare_parts_used": data.spare_parts_used,
            }
    else:
        extra_details = {
            "previous_status": previous_status,
            "new_status": "Resuelto",
            "spare_parts_used": data.spare_parts_used,
        }
    _register_ticket_history(
        db, ticket, previous_status, "Resuelto",
        comment=data.technical_notes,
        action=data.spare_parts_used or "Resolución sin repuestos",
    )
    _register_audit(db, current_user, "resolve_ticket", ticket, extra_details)
    db.commit()
    db.refresh(ticket)
    return ticket
