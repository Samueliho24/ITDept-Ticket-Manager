import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWTError as JWTError
import bcrypt
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.models.users import Users

load_dotenv()

SECRET_KEY = os.getenv("SECRET", "fallback-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
SESSION_MAX_HOURS = int(os.getenv("SESSION_MAX_HOURS", "8"))

security_scheme = HTTPBearer(auto_error=False)

COOKIE_NAME = "access_token"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if "session_start" not in to_encode:
        to_encode["session_start"] = datetime.now(timezone.utc).isoformat()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def clear_auth_cookie(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
        secure=False,
    )


def _extract_token(request: Request, credentials: Optional[HTTPAuthorizationCredentials]) -> str | None:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        return token
    if credentials:
        return credentials.credentials
    return None


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(getDb),
) -> Users:
    token = _extract_token(request, credentials)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación requerida.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: falta identificador de usuario.",
        )
    session_start_str = payload.get("session_start")
    if session_start_str:
        try:
            session_start = datetime.fromisoformat(session_start_str)
            if datetime.now(timezone.utc) - session_start > timedelta(hours=SESSION_MAX_HOURS):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Sesión expirada. Inicie sesión nuevamente.",
                )
        except ValueError:
            pass
    user = db.query(Users).filter(Users.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
        )
    return user

def get_current_active_user(current_user: Users = Depends(get_current_user)) -> Users:
    if not current_user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta de usuario inactiva.",
        )
    return current_user

def get_current_admin(current_user: Users = Depends(get_current_active_user)) -> Users:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador.",
        )
    return current_user

def require_roles(allowed_roles: list):
    def role_checker(current_user: Users = Depends(get_current_active_user)) -> Users:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Roles permitidos: {', '.join(allowed_roles)}.",
            )
        return current_user
    return role_checker


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: Users = Depends(get_current_active_user)) -> Users:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere rol: {', '.join(self.allowed_roles)}.",
            )
        return current_user
