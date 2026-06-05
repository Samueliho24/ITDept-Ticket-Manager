from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.db import engine, Base, SessionLocal
from .core.userDefault import default_admin
from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .routers.equipments import router as equipments_router
from .routers.tickets import router as tickets_router
from .routers.department import router as departments_router
from .routers.audit import router as audit_router
from .routers.notifications import router as notifications_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        default_admin(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="TIC Tickets API",
    description="Sistema de gestión de Tickets para el departamento de TIC",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(equipments_router, prefix="/api/v1/equipments", tags=["Equipment"])
app.include_router(tickets_router, prefix="/api/v1/tickets", tags=["Tickets"])
app.include_router(departments_router, prefix="/api/v1/departments", tags=["Departments"])
app.include_router(audit_router, prefix="/api/v1/admin", tags=["Audit Logs"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Notifications"])


@app.get("/")
def health_check():
    return {"message": "TIC Tickets API", "status": "online", "version": "1.0.0"}
