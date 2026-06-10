from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import RoleChecker
from BackEnd.app.models.users import Users
from BackEnd.app.schemas.metrics import MetricsResponse
from BackEnd.app.services.metrics_service import get_metrics

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
def metrics_endpoint(
    exclude_cancelled: bool = Query(False, description="Excluir tickets Anulado del desglose por departamento"),
    db: Session = Depends(getDb),
    current_user: Users = Depends(RoleChecker(["admin"])),
):
    return get_metrics(db, exclude_cancelled=exclude_cancelled)
