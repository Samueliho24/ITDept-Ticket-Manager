from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from .core.db import engine, Base, SessionLocal
from .core.userDefault import default_admin
from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .routers.equipments import router as equipments_router
from .routers.tickets import router as tickets_router
from .routers.department import router as departments_router
from .routers.audit import router as audit_router
from .routers.notifications import router as notifications_router
from .routers.metrics import router as metrics_router
from .routers.categories import router as categories_router
from .routers.public import router as public_router

def _run_migrations():
    """Run pending DB schema migrations (safe for repeated calls)."""
    inspector = inspect(engine)
    eq_cols = {col["name"] for col in inspector.get_columns("equipment")}
    cat_cols = {col["name"] for col in inspector.get_columns("categories")}
    tk_cols = {col["name"] for col in inspector.get_columns("tickets")}
    with SessionLocal() as db:
        if "assigned_person" not in eq_cols:
            db.execute(text("ALTER TABLE equipment ADD COLUMN assigned_person VARCHAR(200) NULL COMMENT 'Persona asignada'"))
            db.commit()
        if "deleted_at" not in cat_cols:
            db.execute(text("ALTER TABLE categories ADD COLUMN deleted_at DATETIME NULL"))
            db.commit()
        if "reporter_name" not in tk_cols:
            db.execute(text("ALTER TABLE tickets ADD COLUMN reporter_name VARCHAR(200) NULL"))
            db.commit()
        if "reporter_phone" not in tk_cols:
            db.execute(text("ALTER TABLE tickets ADD COLUMN reporter_phone VARCHAR(20) NULL"))
            db.commit()
        if "requester_id" in tk_cols:
            db.execute(text("ALTER TABLE tickets MODIFY requester_id VARCHAR(36) NULL"))
            db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _run_migrations()
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
app.include_router(metrics_router, prefix="/api/v1/admin", tags=["Metrics"])
app.include_router(categories_router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(public_router, prefix="/api/v1/public", tags=["Public"])


@app.get("/")
def health_check():
    return {"message": "TIC Tickets API", "status": "online", "version": "1.0.0"}
