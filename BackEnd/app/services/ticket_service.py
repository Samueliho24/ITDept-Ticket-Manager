import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from sqlalchemy.exc import IntegrityError
from BackEnd.app.models.tickets import Tickets
from BackEnd.app.models.history_tickets import TicketHistory
from BackEnd.app.models.ticket_ratings import TicketRating
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.models.equipment import Equipment
from BackEnd.app.models.users import Users
from BackEnd.app.models.departments import Departments
from BackEnd.app.schemas.ticket import (
    TicketCreate, TicketAssign, TicketStatusUpdate, TicketResolve, TicketCancel, TicketCategoryUpdate,
)
from BackEnd.app.schemas.rating import RateRequest, RatingResponse
from BackEnd.app.services.notification_service import create_notification

def _enrich_tickets_with_names(db: Session, tickets: list[Tickets]):
    user_ids = set()
    dept_ids = set()
    for t in tickets:
        if t.requester_id:
            user_ids.add(t.requester_id)
        if t.assigned_technician_id:
            user_ids.add(t.assigned_technician_id)
        if t.department_id:
            dept_ids.add(t.department_id)
    if user_ids:
        users = {u.id: u for u in db.query(Users).filter(Users.id.in_(user_ids)).all()}
        for t in tickets:
            req = users.get(t.requester_id)
            t.requester_name = f"{req.name} {req.lastname}" if req else None
            tech = users.get(t.assigned_technician_id)
            t.assigned_to_name = f"{tech.name} {tech.lastname}" if tech else None
    if dept_ids:
        depts = {d.id: d for d in db.query(Departments).filter(Departments.id.in_(dept_ids)).all()}
        for t in tickets:
            d = depts.get(t.department_id)
            t.department_name = d.name if d else None
            if t.ticket_number is None:
                t.ticket_number = (
                    f"{d.code}-{t.opened_at.strftime('%d%m%y')}-{t.daily_sequence:02d}"
                    if d and t.opened_at and t.daily_sequence is not None
                    else None
                )


ALLOWED_TRANSITIONS = {
    "En Proceso": True,
    "Pendiente": True,
}

VALID_TICKET_STATUSES = {"Abierto", "Asignado", "En Proceso", "Pendiente", "Resuelto", "Cerrado", "Anulado"}
VALID_PRIORITIES = {"Baja", "Media", "Alta", "Crítica"}


def _resolve_ticket_identifier(db: Session, identifier: str) -> Optional[Tickets]:
    ticket = db.query(Tickets).filter(Tickets.id == identifier).first()
    if not ticket:
        ticket = db.query(Tickets).filter(Tickets.ticket_number == identifier).first()
    return ticket


def _register_ticket_history(db: Session, ticket: Tickets, previous_status: str, new_status: str, comment: str = None, action: str = None, reason: str = None):
    history = TicketHistory(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        previous_status=previous_status,
        new_status=new_status,
        technical_comment=comment,
        technical_action=action,
        reason=reason,
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
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action=action,
        affected_table="tickets",
        record_id=ticket.id,
        details=details,
        timestamp=datetime.now(timezone.utc),
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
    now = datetime.now(timezone.utc)
    if data.department_id:
        max_seq = (
            db.query(func.max(Tickets.daily_sequence))
            .filter(
                Tickets.department_id == data.department_id,
                func.date(Tickets.opened_at) == now.date(),
            )
            .with_for_update()
            .scalar()
        )
        daily_sequence = (max_seq or 0) + 1
        dept = db.query(Departments).filter(Departments.id == data.department_id).first()
        ticket_number = f"{dept.code}-{now.strftime('%d%m%y')}-{daily_sequence:02d}" if dept else None
    else:
        daily_sequence = 1
        ticket_number = None
    ticket = Tickets(
        id=str(uuid.uuid4()),
        ticket_number=ticket_number,
        title=data.title,
        description=data.description,
        priority=data.priority,
        status="Abierto",
        category=data.category,
        requester_id=current_user.id,
        equipment_id=data.equipment_id,
        department_id=data.department_id,
        daily_sequence=daily_sequence,
        opened_at=now,
    )
    db.add(ticket)
    db.flush()
    _register_ticket_history(db, ticket, None, "Abierto")
    _register_audit(db, current_user, "create_ticket", ticket)
    ticket.requester_name = f"{current_user.name} {current_user.lastname}" if current_user.name else current_user.username
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Error de concurrencia al crear el ticket. Intente nuevamente.",
        )
    db.refresh(ticket)
    return ticket


def list_tickets(
    db: Session,
    current_user: Users,
    limit: int = 10,
    offset: int = 0,
    status: Optional[str] = None,
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    equipment_id: Optional[str] = None,
) -> tuple[list[Tickets], int]:
    query = db.query(Tickets)
    if current_user.role == "requestor":
        query = query.filter(Tickets.requester_id == current_user.id)
    elif current_user.role == "technician":
        query = query.filter(
            or_(
                Tickets.assigned_technician_id == current_user.id,
                Tickets.requester_id == current_user.id,
            )
        )
    if status:
        query = query.filter(Tickets.status == status)
    if category:
        query = query.filter(Tickets.category == category)
    if date_from:
        query = query.filter(Tickets.opened_at >= date_from)
    if date_to:
        query = query.filter(Tickets.opened_at <= date_to)
    if search:
        query = query.filter(
            or_(
                Tickets.title.ilike(f"%{search}%"),
                Tickets.description.ilike(f"%{search}%"),
                Tickets.ticket_number.ilike(f"%{search}%"),
            )
        )
    if equipment_id:
        query = query.filter(Tickets.equipment_id == equipment_id)
    query = query.order_by(Tickets.opened_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    _enrich_tickets_with_names(db, items)
    return items, total


def get_ticket(db: Session, ticket_id: str, current_user: Users) -> Tickets:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    if current_user.role == "requestor" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para ver este ticket.",
        )
    _enrich_tickets_with_names(db, [ticket])
    return ticket


def get_ticket_history(db: Session, ticket_id: str, current_user: Users) -> list[TicketHistory]:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    if current_user.role == "requestor" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para ver este ticket.",
        )
    history = (
        db.query(TicketHistory)
        .filter(TicketHistory.ticket_id == ticket_id)
        .order_by(TicketHistory.change_date.asc())
        .all()
    )
    return history


def assign_ticket(db: Session, ticket_id: str, data: TicketAssign, current_user: Users) -> Tickets:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    technician = db.query(Users).filter(Users.id == data.technician_id, Users.role.in_(["technician", "admin"]), Users.active == 1).first()
    if not technician:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Técnico no encontrado o no válido.")
    previous_status = ticket.status
    ticket.assigned_technician_id = data.technician_id
    ticket.status = "Asignado"
    if data.priority:
        if data.priority not in VALID_PRIORITIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prioridad inválida. Permitidas: {', '.join(sorted(VALID_PRIORITIES))}.",
            )
        ticket.priority = data.priority
    _register_ticket_history(db, ticket, previous_status, "Asignado", action=f"Asignado a {technician.name} {technician.lastname}")
    _register_audit(db, current_user, "assign_ticket", ticket, {
        "technician_id": data.technician_id,
        "previous_status": previous_status,
    })
    create_notification(
        db, ticket.requester_id, ticket.id,
        f"Tu ticket #{ticket.id[:8]} ha sido asignado a {technician.name} {technician.lastname}.",
    )
    create_notification(
        db, technician.id, ticket.id,
        f"Se te ha asignado un nuevo ticket de soporte.",
    )
    _enrich_tickets_with_names(db, [ticket])
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket_status(db: Session, ticket_id: str, data: TicketStatusUpdate, current_user: Users) -> Tickets:
    if data.status not in ALLOWED_TRANSITIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transición de estado no permitida. Solo: {', '.join(ALLOWED_TRANSITIONS)}.",
        )
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    previous_status = ticket.status
    ticket.status = data.status
    username = f"{current_user.name} {current_user.lastname}" if current_user.name else current_user.username
    _register_ticket_history(db, ticket, previous_status, data.status, action=f"Estado cambiado por {username}")
    _register_audit(db, current_user, "update_ticket_status", ticket, {
        "previous_status": previous_status,
        "new_status": data.status,
    })
    if ticket.requester_id != current_user.id:
        create_notification(
            db, ticket.requester_id, ticket.id,
            f"Tu ticket #{ticket.id[:8]} cambió a '{data.status}'.",
        )
    _enrich_tickets_with_names(db, [ticket])
    db.commit()
    db.refresh(ticket)
    return ticket


def resolve_ticket(db: Session, ticket_id: str, data: TicketResolve, current_user: Users) -> Tickets:
    ticket = _resolve_ticket_identifier(db, ticket_id)
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
    create_notification(
        db, ticket.requester_id, ticket.id,
        f"Tu ticket #{ticket.id[:8]} ha sido resuelto. ¡Califica el servicio!",
    )
    _enrich_tickets_with_names(db, [ticket])
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket_category(db: Session, ticket_id: str, data: TicketCategoryUpdate, current_user: Users) -> Tickets:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    old_category = ticket.category
    ticket.category = data.category
    username = f"{current_user.name} {current_user.lastname}" if current_user.name else current_user.username
    action_detail = f"Categoría actualizada por {username}"
    if old_category:
        action_detail += f" de '{old_category}' a '{data.category}'" if data.category else " (sin categoría)"
    elif data.category:
        action_detail += f" a '{data.category}'"
    _register_ticket_history(db, ticket, ticket.status, ticket.status, action=action_detail)
    _register_audit(db, current_user, "update_ticket_category", ticket, {
        "old_category": old_category,
        "new_category": data.category,
    })
    if ticket.requester_id != current_user.id:
        create_notification(
            db, ticket.requester_id, ticket.id,
            f"La categoría de tu ticket #{ticket.id[:8]} ha sido actualizada.",
        )
    _enrich_tickets_with_names(db, [ticket])
    db.commit()
    db.refresh(ticket)
    return ticket


def cancel_ticket(db: Session, ticket_id: str, data: TicketCancel, current_user: Users) -> Tickets:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    if current_user.role == "requestor" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes anular un ticket que no te pertenece.",
        )
    if ticket.status not in ("Abierto", "Asignado"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden anular tickets en estado 'Abierto' o 'Asignado'.",
        )
    previous_status = ticket.status
    ticket.status = "Anulado"
    ticket.closed_at = datetime.now(timezone.utc)
    _register_ticket_history(db, ticket, previous_status, "Anulado", reason=data.reason, action=f"Anulado por {current_user.username}")
    _register_audit(db, current_user, "cancel_ticket", ticket, {
        "previous_status": previous_status,
        "new_status": "Anulado",
        "reason": data.reason,
    })
    _enrich_tickets_with_names(db, [ticket])
    db.commit()
    db.refresh(ticket)
    return ticket


def rate_ticket(db: Session, ticket_id: str, data: RateRequest, current_user: Users) -> TicketRating:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    if current_user.role == "requestor" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes calificar un ticket que no te pertenece.",
        )
    existing = db.query(TicketRating).filter(TicketRating.ticket_id == ticket_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has calificado este ticket.",
        )
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La calificación debe ser entre 1 y 5.",
        )
    rating = TicketRating(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
        created_at=datetime.now(timezone.utc),
    )
    ticket.rated = True
    db.add(rating)
    db.flush()
    _register_audit(db, current_user, "rate_ticket", ticket, {
        "rating": data.rating,
        "has_comment": bool(data.comment),
    })
    db.commit()
    db.refresh(rating)
    return rating


def get_ticket_rating(db: Session, ticket_id: str, current_user: Users) -> Optional[TicketRating]:
    ticket = _resolve_ticket_identifier(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")
    if current_user.role == "requestor" and ticket.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este ticket.",
        )
    rating = db.query(TicketRating).filter(TicketRating.ticket_id == ticket_id).first()
    return rating
