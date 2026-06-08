from pydantic import BaseModel
from typing import Optional


class MonthlyResolved(BaseModel):
    month: str
    count: int


class DepartmentBreakdown(BaseModel):
    department: str
    count: int
    percentage: float


class MetricsResponse(BaseModel):
    avg_resolution_time_hours: float
    tickets_created_month: int
    critical_alerts: int
    tickets_pending: int
    resolved_by_month: list[MonthlyResolved]
    department_breakdown: list[DepartmentBreakdown]
