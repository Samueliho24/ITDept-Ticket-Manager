from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.schemas.auth import LoginRequest, TokenResponse
from BackEnd.app.services.auth_service import login_service

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(getDb)):
    return login_service(db, login_data)
