from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from BackEnd.app.core.db import getDb
from BackEnd.app.core.security import (
    get_current_active_user, create_access_token,
    set_auth_cookie, clear_auth_cookie, decode_token, COOKIE_NAME,
)
from BackEnd.app.schemas.auth import LoginRequest
from BackEnd.app.models.users import Users
from BackEnd.app.services.auth_service import login_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, login_data: LoginRequest, response: Response, db: Session = Depends(getDb)):
    user, token = login_service(db, login_data)
    set_auth_cookie(response, token)
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "active": user.active,
        "name": user.name,
        "lastname": user.lastname,
    }


@router.get("/me")
def auth_me(current_user: Users = Depends(get_current_active_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "active": current_user.active,
        "name": current_user.name,
        "lastname": current_user.lastname,
    }


@router.post("/refresh")
def refresh_token(
    request: Request,
    response: Response,
    current_user: Users = Depends(get_current_active_user),
):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No hay sesión activa.")
    payload = decode_token(token)
    session_start = payload.get("session_start")
    new_payload = {
        "sub": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "active": current_user.active,
        "session_start": session_start,
    }
    new_token = create_access_token(data=new_payload)
    set_auth_cookie(response, new_token)
    return {"message": "ok"}


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Sesión cerrada."}
