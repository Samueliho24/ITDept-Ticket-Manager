import uuid
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import verify_password, create_access_token
from BackEnd.app.models.users import Users
from BackEnd.app.models.audit_log import AuditLog
from BackEnd.app.schemas.auth import LoginRequest, TokenResponse

def authenticate_user(db: Session, username: str, password: str) -> Users:
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas.",
        )
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas.",
        )
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta de usuario inactiva. Contacte al administrador.",
        )
    return user

def register_login_audit(db: Session, user: Users):
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="login",
        affected_table="users",
        record_id=user.id,
        details={"message": "Inicio de sesión exitoso"},
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()

def login_service(db: Session, login_data: LoginRequest) -> TokenResponse:
    user = authenticate_user(db, login_data.username, login_data.password)
    token_payload = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "active": user.active,
    }
    access_token = create_access_token(data=token_payload)
    register_login_audit(db, user)
    return TokenResponse(access_token=access_token)
