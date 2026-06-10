from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from BackEnd.app.models.tickets import Tickets
from BackEnd.app.models.departments import Departments
from BackEnd.app.schemas.metrics import MetricsResponse, MonthlyResolved, DepartmentBreakdown


def get_resolution_hours(closed_at, opened_at):
    if closed_at and opened_at:
        delta = closed_at - opened_at
        return delta.total_seconds() / 3600
    return None


def get_metrics(db: Session, exclude_cancelled: bool = False) -> MetricsResponse:
    now = func.now()

    # --- 1. MTTR: Average resolution time (hours) for resolved tickets ---
    resolved_tickets = db.query(Tickets).filter(
        Tickets.status == 'Resuelto',
        Tickets.closed_at.isnot(None),
    ).all()

    hours_list = [
        hrs for t in resolved_tickets
        if (hrs := get_resolution_hours(t.closed_at, t.opened_at)) is not None
    ]
    avg_resolution = round(sum(hours_list) / len(hours_list), 1) if hours_list else 0.0

    # --- 2. Tickets created this month ---
    tickets_created_month = db.query(func.count(Tickets.id)).filter(
        extract('year', Tickets.opened_at) == extract('year', now),
        extract('month', Tickets.opened_at) == extract('month', now),
    ).scalar() or 0

    # --- 3. Critical alerts ---
    critical_alerts = db.query(func.count(Tickets.id)).filter(
        Tickets.priority == 'Crítica',
        Tickets.status.in_(['Abierto', 'Asignado', 'En Proceso']),
    ).scalar() or 0

    # --- 4. Tickets pending (not Resuelto/Cerrado/Anulado) ---
    tickets_pending = db.query(func.count(Tickets.id)).filter(
        Tickets.status.notin_(['Resuelto', 'Cerrado', 'Anulado']),
    ).scalar() or 0

    # --- 5. Resolved by month (last 6 months) ---
    month_names = {
        1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
        5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
        9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
    }

    resolved_rows = db.query(
        extract('year', Tickets.closed_at).label('year'),
        extract('month', Tickets.closed_at).label('month'),
        func.count(Tickets.id).label('count'),
    ).filter(
        Tickets.status == 'Resuelto',
        Tickets.closed_at.isnot(None),
    ).group_by(
        extract('year', Tickets.closed_at),
        extract('month', Tickets.closed_at),
    ).order_by(
        extract('year', Tickets.closed_at).desc(),
        extract('month', Tickets.closed_at).desc(),
    ).limit(6).all()

    resolved_rows = list(reversed(resolved_rows))

    resolved_by_month = []
    for row in resolved_rows:
        m = int(row.month)
        resolved_by_month.append(MonthlyResolved(
            month=f"{month_names.get(m, str(m))}",
            count=int(row.count),
        ))

    # --- 6. Department breakdown ---
    dept_query = db.query(
        Departments.name.label('dept_name'),
        func.count(Tickets.id).label('count'),
    ).join(
        Tickets, Tickets.department_id == Departments.id, isouter=True
    )
    if exclude_cancelled:
        dept_query = dept_query.filter(Tickets.status != 'Anulado')
    dept_rows = dept_query.group_by(
        Departments.name,
    ).order_by(
        func.count(Tickets.id).desc(),
    ).all()

    total_tickets = sum(row.count for row in dept_rows) or 1
    department_breakdown = []
    for row in dept_rows:
        department_breakdown.append(DepartmentBreakdown(
            department=row.dept_name or 'Sin asignar',
            count=int(row.count),
            percentage=round((int(row.count) / total_tickets) * 100, 1),
        ))

    return MetricsResponse(
        avg_resolution_time_hours=avg_resolution,
        tickets_created_month=tickets_created_month,
        critical_alerts=critical_alerts,
        tickets_pending=tickets_pending,
        resolved_by_month=resolved_by_month,
        department_breakdown=department_breakdown,
    )
